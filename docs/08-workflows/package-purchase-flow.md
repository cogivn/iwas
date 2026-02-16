# Package Purchase Flow

**Workflow ID:** WF-01  
**Priority:** P0 (Critical)  
**Last Updated:** February 16, 2026

---

## Overview

This document describes the complete end-to-end flow from when a user clicks "Purchase" to when their WiFi session is activated and internet access is granted.

**Total Time:** ~1 second  
**Success Rate Target:** 99%  
**Key Metric:** Time to activation

---

## High-Level Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    PACKAGE PURCHASE FLOW                      │
└──────────────────────────────────────────────────────────────┘

User Action → Payment → Transaction → Session → RADIUS → Network → Connected!
   (~0ms)     (~300ms)   (~100ms)    (~100ms)  (~200ms)  (~150ms)
```

---

## Detailed Sequence Diagram

```
┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐
│  User   │  │ Frontend │  │ Backend │  │ PC API   │  │ RADIUS │  │ MikroTik │
└────┬────┘  └────┬─────┘  └────┬────┘  └────┬─────┘  └────┬───┘  └────┬─────┘
     │            │              │            │             │           │
     │ 1. Click   │              │            │             │           │
     │ "Purchase" │              │            │             │           │
     │───────────>│              │            │             │           │
     │            │              │            │             │           │
     │            │ 2. POST      │            │             │           │
     │            │ /purchase    │            │             │           │
     │            │─────────────>│            │             │           │
     │            │              │            │             │           │
     │            │              │ 3. Validate│             │           │
     │            │              │ Package    │             │           │
     │            │              │ Available  │             │           │
     │            │              │────┐       │             │           │
     │            │              │<───┘       │             │           │
     │            │              │            │             │           │
     │            │              │ 4. Create  │             │           │
     │            │              │ PENDING    │             │           │
     │            │              │ Transaction│             │           │
     │            │              │────┐       │             │           │
     │            │              │<───┘       │             │           │
     │            │              │            │             │           │
     │            │              │ 5. Debit   │             │           │
     │            │              │ Balance    │             │           │
     │            │              │───────────>│             │           │
     │            │              │            │             │           │
     │            │              │ 6. Success │             │           │
     │            │              │<───────────│             │           │
     │            │              │            │             │           │
     │            │              │ 7. Update  │             │           │
     │            │              │ Transaction│             │           │
     │            │              │ SUCCESS    │             │           │
     │            │              │────┐       │             │           │
     │            │              │<───┘       │             │           │
     │            │              │            │             │           │
     │            │              │ 8. Create  │             │           │
     │            │              │ WiFi       │             │           │
     │            │              │ Session    │             │           │
     │            │              │────┐       │             │           │
     │            │              │<───┘       │             │           │
     │            │              │            │             │           │
     │            │              │ 9. RADIUS  │             │           │
     │            │              │ Access-Req │             │           │
     │            │              │────────────────────────>│           │
     │            │              │            │             │           │
     │            │              │10. Access- │             │           │
     │            │              │   Accept   │             │           │
     │            │              │<────────────────────────│           │
     │            │              │            │             │           │
     │            │              │            │             │11. Config │
     │            │              │            │             │   Network │
     │            │              │            │             │──────────>│
     │            │              │            │             │           │
     │            │              │            │             │12. Done   │
     │            │              │            │             │<──────────│
     │            │              │            │             │           │
     │            │              │13. Update  │             │           │
     │            │              │   Session  │             │           │
     │            │              │   ACTIVE   │             │           │
     │            │              │────┐       │             │           │
     │            │              │<───┘       │             │           │
     │            │              │            │             │           │
     │            │14. Response  │            │             │           │
     │            │<─────────────│            │             │           │
     │            │              │            │             │           │
     │15. Show    │              │            │             │           │
     │   Success  │              │            │             │           │
     │<───────────│              │            │             │           │
     │            │              │            │             │           │
     │16. WiFi    │              │            │             │           │
     │   Connected│              │            │             │           │
     │────────────────────────────────────────────────────────────────>│
     │            │              │            │             │           │
```

---

## Step-by-Step Breakdown

### **Step 1: User Clicks "Purchase"**

**Actor:** User  
**Time:** ~0ms

```typescript
// Frontend
<button onClick={handlePurchase}>
  Purchase Selected Package
</button>
```

**User sees:** Loading spinner

---

### **Step 2: Frontend Sends Request**

**Actor:** Frontend  
**Time:** ~10ms

```typescript
POST /api/packages/purchase
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "package_id": "pkg_456",
  "payment_method_id": "pm_123",
  "device_mac": "00:11:22:33:44:55",
  "location_id": "loc_123"
}
```

---

### **Step 3: Backend Validates Package**

**Actor:** Backend  
**Time:** ~50-100ms  
**Database Queries:** 3

```typescript
// 3.1 Check package exists and enabled
const package = await db.packages.findOne({
  id: dto.package_id,
  enabled: true,
});

if (!package) {
  throw new BadRequestException("Package not available");
}

// 3.2 Check concurrent user limit
const activeUsers = await db.sessions.count({
  package_id: dto.package_id,
  status: "ACTIVE",
});

if (activeUsers >= package.max_concurrent_users) {
  throw new BadRequestException("Package at capacity");
}

// 3.3 Check device not already active
const existingSession = await db.sessions.findOne({
  device_mac: dto.device_mac,
  status: "ACTIVE",
});

if (existingSession) {
  throw new BadRequestException("Device already has active session");
}
```

**Possible Errors:**

- `PACKAGE_NOT_AVAILABLE` - Package disabled or deleted
- `PACKAGE_AT_CAPACITY` - Max concurrent users reached
- `DEVICE_ALREADY_ACTIVE` - Device has active session

---

### **Step 4: Create PENDING Transaction**

**Actor:** Backend  
**Time:** ~50ms  
**Database Writes:** 1

```typescript
const transaction = await db.transactions.create({
  id: generateId(),
  user_id: user.id,
  package_id: package.id,
  amount: package.price,
  payment_method_id: dto.payment_method_id,
  status: "PENDING",
  idempotency_key: `wifi_${user.id}_${Date.now()}_${uuidv4()}`,
  created_at: new Date(),
});
```

**Purpose:** Idempotency protection - prevents double billing if request is retried

---

### **Step 5-6: Process Payment (PC Balance)**

**Actor:** Backend → PC API  
**Time:** ~200-500ms  
**External API:** PC System

```typescript
// 5. Call PC API
const pcResult = await pcApiService.debit({
  user_id: user.pc_user_id,
  amount: package.price,
  description: `WiFi Package: ${package.name}`,
  idempotency_key: transaction.idempotency_key,
});

// 6. Handle response
if (!pcResult.success) {
  // Update transaction to FAILED
  await db.transactions.update(transaction.id, {
    status: "FAILED",
    error_code: pcResult.error_code,
    error_message: pcResult.message,
  });

  throw new BadRequestException(pcResult.message);
}
```

**PC API Request:**

```json
POST /pc-api/debit
{
  "user_id": "pc_user_123",
  "amount": 12000,
  "description": "WiFi Package: 3 Hours WiFi",
  "idempotency_key": "wifi_user_123_1708077600000_abc-def-ghi"
}
```

**PC API Response (Success):**

```json
{
  "success": true,
  "transaction_id": "pc_txn_789",
  "new_balance": 138000
}
```

**Possible Errors:**

- `INSUFFICIENT_BALANCE` - Not enough balance
- `PC_API_TIMEOUT` - PC system not responding
- `PC_API_ERROR` - PC system error

---

### **Step 7: Update Transaction to SUCCESS**

**Actor:** Backend  
**Time:** ~50ms  
**Database Writes:** 1

```typescript
await db.transactions.update(transaction.id, {
  status: "SUCCESS",
  external_transaction_id: pcResult.transaction_id,
  new_balance: pcResult.new_balance,
  completed_at: new Date(),
});
```

**Critical:** Payment is now confirmed, cannot rollback

---

### **Step 8: Create WiFi Session**

**Actor:** Backend  
**Time:** ~100ms  
**Database Writes:** 2

```typescript
const session = await db.sessions.create({
  id: generateId(),
  user_id: user.id,
  package_id: package.id,
  transaction_id: transaction.id,
  location_id: dto.location_id,
  device_mac: dto.device_mac,

  // Session details
  duration_minutes: package.duration_minutes,
  bandwidth_limit_mbps: package.bandwidth_limit_mbps,

  // Timestamps
  started_at: new Date(),
  expires_at: new Date(Date.now() + package.duration_minutes * 60 * 1000),

  // Status
  status: "PENDING", // Will be ACTIVE after RADIUS
});

// Generate credentials
const credentials = {
  username: `wifi_${session.id}`,
  password: generateSecurePassword(32),
  session_timeout: package.duration_minutes * 60,
};

await db.session_credentials.create({
  session_id: session.id,
  username: credentials.username,
  password_hash: await bcrypt.hash(credentials.password, 10),
});
```

---

### **Step 9-10: RADIUS Authorization**

**Actor:** Backend → RADIUS Server  
**Time:** ~100-200ms  
**Protocol:** RADIUS (UDP port 1812)

```typescript
// 9. Send RADIUS Access-Request
const radiusResponse = await radiusClient.accessRequest({
  username: credentials.username,
  password: credentials.password,
  calling_station_id: dto.device_mac, // MAC address
  nas_ip_address: location.nas_ip,
  nas_port: location.nas_port,
  service_type: "Login-User",
  framed_protocol: "PPP",
});

// 10. Receive Access-Accept
if (radiusResponse.code !== "Access-Accept") {
  // RADIUS rejected - critical error
  await db.sessions.update(session.id, { status: "FAILED" });

  // TODO: Refund payment
  throw new InternalServerErrorException("RADIUS activation failed");
}
```

**RADIUS Access-Accept Attributes:**

```
Session-Timeout: 10800          # 3 hours in seconds
Mikrotik-Rate-Limit: 20M/20M    # 20 Mbps up/down
Framed-IP-Address: 192.168.20.10
Acct-Interim-Interval: 300      # Accounting updates every 5 min
```

---

### **Step 11-12: MikroTik Network Configuration**

**Actor:** RADIUS → MikroTik  
**Time:** ~100-200ms  
**Protocol:** RADIUS CoA (Change of Authorization)

```bash
# MikroTik receives RADIUS Access-Accept and configures:

# 11.1 Assign IP address
/ip dhcp-server lease add \
  mac-address=00:11:22:33:44:55 \
  address=192.168.20.10 \
  server=wifi-dhcp \
  comment="Session: sess_xyz789"

# 11.2 Create firewall rule
/ip firewall filter add \
  chain=forward \
  src-mac-address=00:11:22:33:44:55 \
  action=accept \
  comment="WiFi Session: sess_xyz789"

# 11.3 Create bandwidth queue
/queue simple add \
  name=wifi-sess_xyz789 \
  target=192.168.20.10/32 \
  max-limit=20M/20M \
  priority=2/2 \
  comment="3 Hours WiFi - expires 19:30"

# 11.4 Start session timer
/system scheduler add \
  name=expire-sess_xyz789 \
  start-time=19:30:00 \
  on-event="/queue simple remove wifi-sess_xyz789"

# 12. Configuration complete
```

**Result:** Device can now access internet

---

### **Step 13: Update Session to ACTIVE**

**Actor:** Backend  
**Time:** ~50ms  
**Database Writes:** 3

```typescript
// 13.1 Update session status
await db.sessions.update(session.id, {
  status: "ACTIVE",
  radius_session_id: radiusResponse.session_id,
  assigned_ip: radiusResponse.attributes["Framed-IP-Address"],
  activated_at: new Date(),
});

// 13.2 Increment package active users
await db.packages.increment(package.id, "current_active_users", 1);

// 13.3 Log activation
await db.audit_logs.create({
  event: "SESSION_ACTIVATED",
  user_id: user.id,
  session_id: session.id,
  metadata: {
    package_id: package.id,
    device_mac: dto.device_mac,
    assigned_ip: radiusResponse.attributes["Framed-IP-Address"],
  },
});
```

---

### **Step 14: Return Success Response**

**Actor:** Backend → Frontend  
**Time:** ~10ms

```typescript
return {
  success: true,
  transaction_id: transaction.id,
  session: {
    id: session.id,
    package_name: package.name,
    duration_minutes: package.duration_minutes,
    started_at: session.started_at,
    expires_at: session.expires_at,
    bandwidth_limit_mbps: package.bandwidth_limit_mbps,
    device_mac: session.device_mac,
    assigned_ip: radiusResponse.attributes["Framed-IP-Address"],
  },
  payment: {
    amount: transaction.amount,
    method: "pc_balance",
    new_balance: pcResult.new_balance,
  },
};
```

---

### **Step 15: Show Success to User**

**Actor:** Frontend  
**Time:** ~50ms

```typescript
// Hide loading
setLoading(false);

// Show success modal
showSuccessModal({
  title: "✅ WiFi Activated!",
  message: "Your WiFi session is now active",
  session: data.session,
});

// Track analytics
analytics.track("Purchase Completed", {
  package_id: package.id,
  transaction_id: data.transaction_id,
  time_to_activate: Date.now() - purchaseStartTime,
});

// Redirect to session page
setTimeout(() => {
  router.push(`/session/${data.session.id}`);
}, 2000);
```

---

### **Step 16: User Connected to WiFi**

**Actor:** User's Device  
**Time:** Immediate

```
Device receives IP: 192.168.20.10
Gateway: 192.168.20.1
DNS: 8.8.8.8, 8.8.4.4

Internet access: ✅ ACTIVE
Speed limit: 20 Mbps
Session expires: 19:30:00
```

---

## Error Handling

### Payment Failures

```
┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐
│  User   │  │ Frontend │  │ Backend │  │ PC API   │
└────┬────┘  └────┬─────┘  └────┬────┘  └────┬─────┘
     │            │              │            │
     │            │ POST         │            │
     │            │ /purchase    │            │
     │            │─────────────>│            │
     │            │              │            │
     │            │              │ Debit      │
     │            │              │───────────>│
     │            │              │            │
     │            │              │ FAIL       │
     │            │              │ Insufficient│
     │            │              │<───────────│
     │            │              │            │
     │            │              │ Update Txn │
     │            │              │ FAILED     │
     │            │              │────┐       │
     │            │              │<───┘       │
     │            │              │            │
     │            │ Error 400    │            │
     │            │<─────────────│            │
     │            │              │            │
     │ Show Error │              │            │
     │<───────────│              │            │
     │            │              │            │
```

**Error Response:**

```json
{
  "success": false,
  "error_code": "INSUFFICIENT_BALANCE",
  "message": "Insufficient balance. Required: 12,000 VND, Available: 10,000 VND",
  "required_amount": 12000,
  "available_balance": 10000
}
```

---

### RADIUS Failures (Critical)

```
If RADIUS fails after payment:
1. Mark session as FAILED
2. Initiate refund process
3. Alert admin immediately
4. Show error to user with support contact
```

**Refund Process:**

```typescript
async function handleRADIUSFailure(session, transaction) {
  // 1. Update session
  await db.sessions.update(session.id, {
    status: "FAILED",
    error: "RADIUS_ACTIVATION_FAILED",
  });

  // 2. Initiate refund
  const refund = await pcApiService.refund({
    original_transaction_id: transaction.external_transaction_id,
    amount: transaction.amount,
    reason: "RADIUS activation failed",
  });

  // 3. Update transaction
  await db.transactions.update(transaction.id, {
    status: "REFUNDED",
    refund_transaction_id: refund.transaction_id,
  });

  // 4. Alert admin
  await alertService.critical({
    title: "RADIUS Activation Failed",
    session_id: session.id,
    user_id: session.user_id,
    package_id: session.package_id,
  });

  // 5. Notify user
  await notificationService.sendRefundNotification({
    user_id: session.user_id,
    amount: transaction.amount,
  });
}
```

---

## Performance Metrics

### Target Timings

| Step               | Target     | Max Acceptable |
| ------------------ | ---------- | -------------- |
| **Total Flow**     | **1000ms** | **2000ms**     |
| Validation         | 100ms      | 200ms          |
| Payment Processing | 300ms      | 1000ms         |
| Session Creation   | 100ms      | 200ms          |
| RADIUS Activation  | 200ms      | 500ms          |
| Network Config     | 150ms      | 300ms          |
| Response           | 50ms       | 100ms          |

### Success Rates

| Metric                 | Target | Current |
| ---------------------- | ------ | ------- |
| Overall Success        | 99%    | TBD     |
| Payment Success        | 99.5%  | TBD     |
| RADIUS Success         | 99.9%  | TBD     |
| Network Config Success | 99.9%  | TBD     |

---

## Monitoring & Alerts

### Key Metrics to Track

```typescript
// Purchase funnel
metrics.track("purchase.started", { package_id, user_id });
metrics.track("purchase.payment_success", { transaction_id });
metrics.track("purchase.session_created", { session_id });
metrics.track("purchase.radius_success", { session_id });
metrics.track("purchase.completed", { session_id, duration_ms });

// Failures
metrics.track("purchase.payment_failed", { error_code });
metrics.track("purchase.radius_failed", { session_id });
```

### Alerts

**Critical (Immediate):**

- RADIUS activation failure rate > 1%
- Payment processing failure rate > 5%
- Average activation time > 3 seconds

**High (15 minutes):**

- PC API timeout rate > 2%
- Session creation errors > 10/hour

**Medium (1 hour):**

- Average activation time > 1.5 seconds
- Package at capacity events > 50/hour

---

## Related Documents

- [Package Selection Feature](../05-features/packages/package-selection.md)
- [Payment Processing Workflow](./payment-processing.md)
- [Session Lifecycle Workflow](./session-lifecycle.md)
- [RADIUS Integration](./radius-integration.md)

---

[← Back to Workflows](./README.md) | [← Back to Hub](../README.md)
