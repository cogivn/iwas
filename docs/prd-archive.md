# Product Requirements Document (PRD)

## IWAS – iCafe WiFi Access Service

**Version:** 1.0  
**Last Updated:** February 16, 2026  
**Status:** Draft  
**Document Owner:** Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Overview](#2-product-overview)
3. [Business Objectives](#3-business-objectives)
4. [User Personas](#4-user-personas)
5. [Technical Architecture](#5-technical-architecture)
6. [Functional Requirements](#6-functional-requirements)
7. [Security & Anti-Abuse](#7-security--anti-abuse)
8. [Admin Dashboard](#8-admin-dashboard)
9. [Data Model](#9-data-model)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [MVP Scope & Roadmap](#11-mvp-scope--roadmap)
12. [Success Metrics](#12-success-metrics)
13. [Risks & Mitigation](#13-risks--mitigation)

---

## 1. Executive Summary

The **IWAS (iCafe WiFi Access Service)** is a revenue-generating WiFi service that integrates seamlessly with existing iCafe PC rental systems. It enables customers who are renting PCs to purchase WiFi access for their personal devices (smartphones, tablets, laptops) using their existing PC account balance.

### Key Value Propositions

- **For Customers:** Convenient WiFi access using existing account balance without separate payment
- **For Business:** Additional revenue stream leveraging existing infrastructure with minimal investment
- **For Operations:** Centralized management across multiple locations with automated billing

### Core Capabilities

- Single Sign-On (SSO) with existing PC accounts
- Automated billing integration with PC system
- Multi-tier WiFi packages with bandwidth controls
- Device binding and session management
- Real-time monitoring and analytics dashboard

---

## 2. Product Overview

### 2.1 Product Vision

Create a seamless WiFi monetization platform that integrates with existing iCafe infrastructure, enabling customers to extend their gaming experience to personal devices while generating incremental revenue without impacting core PC gaming performance.

### 2.2 Problem Statement

**Current Situation:**

- iCafe customers want WiFi access for personal devices while using PCs
- Existing infrastructure is underutilized for WiFi services
- No integrated billing solution exists between PC rental and WiFi access
- Manual WiFi management creates operational overhead

**Desired Outcome:**

- Automated WiFi service with integrated billing
- Zero impact on PC gaming network performance
- Scalable solution across multiple locations
- Abuse-resistant system with fair usage controls

### 2.3 Target Market

- **Primary:** iCafe locations with 20-100 PC stations
- **Secondary:** Gaming centers and internet cafes in urban areas
- **Geographic Focus:** Vietnam (initial launch)

---

## 3. Business Objectives

### 3.1 Revenue Goals

| Metric                            | Target           | Timeline |
| --------------------------------- | ---------------- | -------- |
| WiFi ARPU per customer            | 5,000-10,000 VND | Month 3  |
| WiFi adoption rate                | 30% of PC users  | Month 6  |
| Monthly WiFi revenue per location | 5-10M VND        | Month 6  |

### 3.2 Strategic Objectives

1. **Increase Average Revenue Per User (ARPU)**
   - Monetize existing network infrastructure
   - Create upsell opportunities for PC customers

2. **Leverage Existing Infrastructure**
   - Utilize current network capacity
   - Integrate with existing authentication systems
   - Minimize additional hardware requirements

3. **Maintain Service Quality**
   - Ensure zero impact on PC gaming traffic
   - Maintain low latency for gaming applications
   - Separate WiFi and PC network segments

4. **Prevent Abuse**
   - Limit hotspot sharing and tethering
   - Enforce fair usage policies
   - Implement device binding controls

5. **Enable Multi-Location Scalability**
   - Centralized management dashboard
   - Location-specific configurations
   - Consolidated reporting and analytics

---

## 4. User Personas

### 4.1 Primary User: PC Customer

**Profile:**

- Age: 16-30 years old
- Currently renting a PC at iCafe
- Has active account with balance
- Owns smartphone and/or personal laptop
- Gaming session duration: 2-6 hours

**Needs:**

- WiFi access for personal devices during PC session
- Simple authentication process
- Affordable pricing options
- Reliable connection quality

**Pain Points:**

- No WiFi available or requires separate payment
- Complex login procedures
- Expensive standalone WiFi packages
- Connection drops during gaming sessions

**User Journey (First Time):**

1. Arrives at iCafe
2. Connects personal device to WiFi network
3. Redirected to captive portal
4. Clicks "Sign in with Google"
5. Completes Google OAuth (one-time)
6. **Onboarding:** Links preferred payment method (PC account, E-wallet, or Bank)
7. Sets default payment method
8. Browses and selects WiFi package
9. One-click purchase using saved payment method
10. WiFi activated instantly

**User Journey (Returning):**

1. Connects to WiFi
2. Auto-detected and one-tap login with Google
3. Selects WiFi package
4. One-click purchase (default payment auto-selected)
5. WiFi activated instantly

**Benefits:**

- ✅ Login once with Google, use everywhere
- ✅ Link payment methods once, use forever
- ✅ 1-click purchase on return visits
- ✅ Works across all iCafe locations

### 4.2 Secondary User: iCafe Owner/Manager

**Profile:**

- Manages 1-5 iCafe locations
- Responsible for revenue and operations
- Tech-savvy but not a network engineer
- Focused on customer satisfaction and profitability

**Needs:**

- Easy-to-use management dashboard
- Real-time monitoring of WiFi usage
- Revenue reporting and analytics
- Minimal technical maintenance
- Fraud prevention tools

**Pain Points:**

- Limited revenue streams beyond PC rental
- Complex network management
- Difficulty tracking WiFi usage and revenue
- Customer complaints about network quality

---

## 5. Technical Architecture

### 5.1 Technology Stack

#### Backend Services

- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (primary data store)
- **Cache:** Redis (session management, rate limiting)
- **Authentication:** FreeRADIUS (network access control)

#### Frontend Applications

- **Framework:** Next.js 14+ (TypeScript, React)
- **Captive Portal:** Responsive web interface for user authentication
- **Admin Dashboard:** Management console for operators

#### Network Infrastructure

- **Router/Gateway:** MikroTik RouterOS
- **Network Segmentation:** VLAN-based isolation
- **Protocol:** RADIUS for AAA (Authentication, Authorization, Accounting)

### 5.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Personal Devices (Phone, Laptop, Tablet)                   │
│  PC Workstations                                             │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    Network Layer                             │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  VLAN_WIFI   │         │   VLAN_PC    │                  │
│  │  (Guest)     │         │  (Gaming)    │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                           │
│         └────────┬───────────────┘                           │
│                  │                                           │
│         ┌────────▼─────────┐                                 │
│         │  MikroTik Router │                                 │
│         │  - Hotspot       │                                 │
│         │  - RADIUS Client │                                 │
│         │  - QoS/Bandwidth │                                 │
│         └────────┬─────────┘                                 │
└──────────────────┼─────────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────────┐
│                  Application Layer                          │
├────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐      ┌──────────────────┐             │
│  │  FreeRADIUS     │◄─────┤  NestJS Backend  │             │
│  │  - AAA Server   │      │  - API Gateway   │             │
│  │  - Session Mgmt │      │  - Business Logic│             │
│  └─────────────────┘      │  - Integration   │             │
│                            └────────┬─────────┘             │
│                                     │                        │
│  ┌─────────────────┐      ┌────────▼─────────┐             │
│  │  Redis Cache    │◄─────┤   PostgreSQL     │             │
│  │  - Sessions     │      │   - User Data    │             │
│  │  - Rate Limits  │      │   - Transactions │             │
│  └─────────────────┘      │   - Sessions     │             │
│                            └──────────────────┘             │
└────────────────────────────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────────┐
│              External Integration Layer                     │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐                  │
│  │  iCafe PC Management System (3rd)    │                  │
│  │  - Authentication API                │                  │
│  │  - Balance Check API                 │                  │
│  │  - Debit/Payment API                 │                  │
│  │  - Webhook Events                    │                  │
│  └──────────────────────────────────────┘                  │
└────────────────────────────────────────────────────────────┘
```

### 5.3 Data Flow

#### Authentication Flow

```
1. User connects to WiFi SSID
2. MikroTik redirects to Captive Portal (Next.js)
3. User enters PC credentials
4. Backend validates via PC System API
5. On success: Create session, return RADIUS attributes
6. MikroTik grants network access with bandwidth limits
```

#### Billing Flow

```
1. User selects WiFi package
2. Backend checks balance via PC API
3. Create transaction record (status: PENDING)
4. Call PC API debit endpoint with idempotency key
5. On success:
   - Update transaction (status: SUCCESS)
   - Activate RADIUS session
   - Apply bandwidth/time limits
6. On failure:
   - Update transaction (status: FAILED)
   - Return error to user
```

#### Session Termination Flow

```
Triggers:
- Time expiration (RADIUS Session-Timeout)
- PC logout (webhook from PC system)
- Admin force disconnect
- Insufficient balance

Actions:
1. Backend receives termination event
2. Send RADIUS Disconnect-Request
3. Update session record (end_time, status)
4. Release device binding
```

---

## 6. Functional Requirements

### 6.1 Authentication & Authorization

#### FR-01: PC Account Integration

**Priority:** P0 (Critical)  
**User Story:** As a PC customer, I want to log into WiFi using my existing PC account credentials so that I don't need to create a separate account.

**Acceptance Criteria:**

- User can enter PC username and password on captive portal
- System validates credentials via PC System API (`POST /pc-api/login`)
- On successful authentication:
  - Create `wifi_user_session` record
  - Store mapping between PC user ID and WiFi session
  - Redirect to package selection page
- On failed authentication:
  - Display clear error message
  - Allow retry (max 3 attempts per 5 minutes)
- Session persists across device reconnections

**API Contract:**

```typescript
// Request
POST /pc-api/login
{
  "username": "string",
  "password": "string",
  "location_id": "string"
}

// Response (Success)
{
  "success": true,
  "user_id": "string",
  "balance": number,
  "session_token": "string"
}

// Response (Failure)
{
  "success": false,
  "error_code": "INVALID_CREDENTIALS" | "ACCOUNT_SUSPENDED",
  "message": "string"
}
```

#### FR-02: QR Code Quick Login

**Priority:** P2 (Phase 2)  
**User Story:** As a PC customer, I want to scan a QR code from my PC screen to automatically log into WiFi without entering credentials.

**Acceptance Criteria:**

- PC system displays QR code after user logs into PC
- QR code contains encrypted session token with 5-minute expiration
- User scans QR with mobile device
- System validates token and auto-authenticates WiFi session
- No password entry required

**Technical Notes:**

- Requires webhook integration with PC system
- QR payload: `{"token": "jwt_token", "exp": timestamp}`

#### FR-03: Google OAuth Login

**Priority:** P0 (Critical)  
**User Story:** As a guest user without a PC account, I want to log in using my Google account so that I can purchase WiFi access independently.

**Acceptance Criteria:**

- User can click "Sign in with Google" button on captive portal
- OAuth 2.0 flow with Google:
  - Redirect to Google consent screen
  - Request scopes: `email`, `profile`
  - Handle callback with authorization code
- On successful authentication:
  - Create or retrieve `wifi_user` record linked to Google ID
  - Store user profile (email, name, avatar)
  - Generate JWT session token
  - Redirect to package selection page
- On failed authentication:
  - Display error message
  - Allow retry or alternative login methods
- Support account linking (link Google account to PC account later)

**API Contract:**

```typescript
// Initiate OAuth Flow
GET /api/auth/google
// Redirects to Google OAuth consent screen

// OAuth Callback
GET /api/auth/google/callback?code={authorization_code}

// Response (Success)
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar_url": "string",
    "auth_provider": "google"
  },
  "session_token": "string"
}
```

**Security Considerations:**

- Validate OAuth state parameter to prevent CSRF
- Store Google refresh token securely (encrypted)
- Implement token rotation
- Rate limit OAuth attempts

#### FR-04: Role-Based Access Control (RBAC)

**Priority:** P0 (Critical)  
**User Story:** As a system administrator, I want to manage user permissions flexibly so that different staff members have appropriate access levels.

**Roles:**

1. **Super Admin**
   - Full system access
   - Manage all locations
   - Create/delete admin accounts
   - View all reports and analytics
   - System configuration

2. **Location Manager**
   - Manage assigned location(s)
   - Create/edit packages for their location
   - View location-specific reports
   - Monitor sessions for their location
   - Cannot access other locations

3. **Operator**
   - View-only access to assigned location
   - Monitor active sessions
   - Force disconnect sessions
   - Cannot edit packages or configurations

4. **Customer (PC User)**
   - Purchase WiFi packages
   - View own transaction history
   - Manage own devices
   - Cannot access admin features

5. **Guest User (Google OAuth)**
   - Purchase WiFi packages
   - View own transaction history
   - Manage own devices
   - No PC account integration

**Permissions Matrix:**

| Feature           | Super Admin | Location Manager  | Operator          | Customer | Guest |
| ----------------- | ----------- | ----------------- | ----------------- | -------- | ----- |
| Manage Locations  | ✅          | ❌                | ❌                | ❌       | ❌    |
| Manage Packages   | ✅          | ✅ (own location) | ❌                | ❌       | ❌    |
| View All Reports  | ✅          | ✅ (own location) | ❌                | ❌       | ❌    |
| Monitor Sessions  | ✅          | ✅ (own location) | ✅ (own location) | ❌       | ❌    |
| Force Disconnect  | ✅          | ✅                | ✅                | ❌       | ❌    |
| Purchase Packages | ✅          | ✅                | ✅                | ✅       | ✅    |
| View Own History  | ✅          | ✅                | ✅                | ✅       | ✅    |
| Manage Users      | ✅          | ❌                | ❌                | ❌       | ❌    |

**Implementation:**

```typescript
interface Role {
  id: string;
  name: "super_admin" | "location_manager" | "operator" | "customer" | "guest";
  permissions: Permission[];
}

interface Permission {
  resource: string; // 'locations', 'packages', 'sessions', etc.
  actions: ("create" | "read" | "update" | "delete" | "manage")[];
  scope?: "all" | "own" | "location"; // Scope of access
}

interface UserRole {
  user_id: string;
  role_id: string;
  location_id?: string; // For location-scoped roles
  created_at: Date;
}
```

**Acceptance Criteria:**

- Middleware validates permissions on every protected route
- Location managers can only access their assigned locations
- Operators have read-only access with limited actions
- Customers and guests have no admin access
- Permission checks are enforced at both API and UI levels
- Audit log for all admin actions

---

### 6.2 Payment Methods

#### FR-05: Multi-Payment Gateway Support

**Priority:** P0 (Critical)  
**User Story:** As a customer, I want to choose from multiple payment methods so that I can pay for WiFi packages in the most convenient way.

**Supported Payment Methods:**

1. **PC Account Balance** (for PC users only)
2. **E-Wallet** (Momo, ZaloPay, VNPay)
3. **Bank QR Code** (VietQR standard)

**Payment Flow:**

```
1. User selects WiFi package
2. System displays available payment methods based on user type:
   - PC User: All methods (PC Balance, E-Wallet, Bank QR)
   - Guest User: E-Wallet, Bank QR only
3. User selects payment method
4. System processes payment based on selected method
5. On success: Activate WiFi session
6. On failure: Display error and allow retry
```

**Acceptance Criteria:**

- Payment method selection UI with clear icons and descriptions
- Each payment method has its own processing flow
- Transaction records include payment method type
- Support payment method preferences (remember last used)
- Graceful fallback if a payment method is unavailable
- Real-time payment status updates

---

#### FR-06: PC Account Balance Payment

**Priority:** P0 (Critical)  
**User Story:** As a PC user, I want to pay for WiFi using my PC account balance so that I don't need to use external payment methods.

**Acceptance Criteria:**

**Balance Verification:**

- Before displaying packages, check if user is authenticated via PC account
- If yes, fetch current balance via PC API
- Display balance prominently: "PC Balance: 50,000 VND"
- Disable PC payment option for packages exceeding balance
- Show message: "Insufficient balance. Please add funds or choose another payment method."
- Refresh balance on page reload or after transaction

**Debit Transaction Flow:**

- Create transaction record with status `PENDING` and `payment_method: 'pc_balance'`
- Call PC API debit endpoint with idempotency key
- On success (HTTP 200):
  - Update transaction status to `SUCCESS`
  - Store PC transaction ID for reconciliation
  - Activate WiFi session immediately
  - Display success message with new balance
- On failure (HTTP 4xx/5xx):
  - Update transaction status to `FAILED`
  - Log error details for debugging
  - Display user-friendly error message
  - Do NOT activate WiFi session
- Handle timeout scenarios (retry logic with exponential backoff)

**API Contracts:**

```typescript
// Check PC Balance
GET /pc-api/balance
Headers: {
  "Authorization": "Bearer {session_token}"
}

// Response
{
  "user_id": "string",
  "balance": number,
  "currency": "VND"
}

// Debit from PC Balance
POST /pc-api/debit
{
  "user_id": "string",
  "amount": number,
  "description": "WiFi Package: {package_name}",
  "idempotency_key": "uuid",
  "metadata": {
    "package_id": "string",
    "location_id": "string",
    "wifi_transaction_id": "string"
  }
}

// Response (Success)
{
  "success": true,
  "transaction_id": "string",
  "new_balance": number,
  "timestamp": "ISO8601"
}

// Response (Failure)
{
  "success": false,
  "error_code": "INSUFFICIENT_BALANCE" | "ACCOUNT_LOCKED" | "SYSTEM_ERROR",
  "message": "string"
}
```

**Idempotency Protection:**

- Generate unique idempotency key (UUID v4) for each transaction
- Format: `wifi_${userId}_${Date.now()}_${uuidv4()}`
- Store idempotency key in transaction record
- PC API must honor idempotency key for 24 hours
- Retry with same key returns original response (no double charge)

---

#### FR-07: E-Wallet Payment Integration

**Priority:** P0 (Critical)  
**User Story:** As a customer, I want to pay using my e-wallet (Momo, ZaloPay, VNPay) so that I can purchase WiFi without a PC account.

**Supported E-Wallets:**

- **Momo** (MoMo Wallet)
- **ZaloPay** (ZaloPay Wallet)
- **VNPay** (VNPay Gateway)

**Payment Flow:**

```
1. User selects e-wallet payment method
2. User chooses specific wallet (Momo/ZaloPay/VNPay)
3. System creates payment request with wallet provider
4. User redirected to wallet app/web for authorization
5. User confirms payment in wallet app
6. Wallet provider sends callback to our webhook
7. System verifies payment signature
8. On success: Activate WiFi session
9. Redirect user back to success page
```

**Acceptance Criteria:**

- Deep link support for mobile wallet apps
- QR code display for desktop users
- Payment timeout: 10 minutes
- Automatic session activation on successful payment
- Handle payment cancellation gracefully
- Webhook signature verification for security
- Support both app-to-app and web redirect flows

**API Contracts:**

```typescript
// Create E-Wallet Payment
POST /api/payments/ewallet
{
  "package_id": "string",
  "wallet_provider": "momo" | "zalopay" | "vnpay",
  "amount": number,
  "return_url": "string", // URL to redirect after payment
  "cancel_url": "string"
}

// Response
{
  "success": true,
  "payment_id": "string",
  "payment_url": "string", // Redirect URL
  "qr_code": "string", // Base64 QR code image
  "deep_link": "string", // For mobile app
  "expires_at": "ISO8601"
}

// Webhook from Wallet Provider
POST /api/webhooks/payment/{provider}
{
  "transaction_id": "string",
  "payment_id": "string",
  "amount": number,
  "status": "success" | "failed" | "cancelled",
  "signature": "string", // HMAC signature
  "timestamp": "ISO8601"
}

// Webhook Response
{
  "success": true,
  "message": "Payment processed"
}
```

**Security:**

- Validate webhook signature using provider's secret key
- Verify payment amount matches package price
- Check payment_id matches our transaction record
- Prevent replay attacks (check timestamp and nonce)
- Rate limit webhook endpoints

---

#### FR-08: Bank QR Code Payment (VietQR)

**Priority:** P0 (Critical)  
**User Story:** As a customer, I want to pay by scanning a QR code with my banking app so that I can use any bank without pre-registration.

**VietQR Standard:**

- Compliant with Vietnam's VietQR standard
- Works with all major Vietnamese banks
- Automatic payment matching via transaction content

**Payment Flow:**

```
1. User selects "Bank QR" payment method
2. System generates unique payment code
3. Display QR code with payment details:
   - Bank account number
   - Amount
   - Content: "IWAS {payment_code}"
4. User scans QR with banking app
5. User confirms payment in banking app
6. Bank sends transaction to our account
7. System polls bank API or receives webhook
8. Match transaction by payment code in content
9. On match: Activate WiFi session
10. Notify user of successful payment
```

**Acceptance Criteria:**

- Generate unique payment code (6-8 characters, alphanumeric)
- Display QR code with clear instructions
- Show countdown timer (10 minutes)
- Auto-refresh to check payment status every 5 seconds
- Support multiple bank accounts (different locations)
- Automatic payment matching via transaction content
- Handle partial payments (reject and refund)
- Handle overpayments (activate + store credit)

**API Contracts:**

```typescript
// Create Bank QR Payment
POST /api/payments/bank-qr
{
  "package_id": "string",
  "amount": number,
  "location_id": "string"
}

// Response
{
  "success": true,
  "payment_id": "string",
  "payment_code": "string", // Unique code for matching
  "qr_code_data": "string", // VietQR format
  "qr_code_image": "string", // Base64 PNG
  "bank_account": {
    "bank_name": "string",
    "account_number": "string",
    "account_name": "string"
  },
  "amount": number,
  "content": "string", // "IWAS {payment_code}"
  "expires_at": "ISO8601"
}

// Check Payment Status
GET /api/payments/{payment_id}/status

// Response
{
  "payment_id": "string",
  "status": "pending" | "completed" | "expired" | "failed",
  "paid_amount": number | null,
  "paid_at": "ISO8601" | null
}

// Bank Transaction Webhook (from bank API)
POST /api/webhooks/bank-transaction
{
  "transaction_id": "string",
  "account_number": "string",
  "amount": number,
  "content": "string", // Extract payment code from here
  "transaction_date": "ISO8601",
  "signature": "string"
}
```

**Payment Matching Logic:**

```typescript
// Extract payment code from transaction content
const content = "IWAS ABC123 thanh toan wifi";
const paymentCode = extractPaymentCode(content); // "ABC123"

// Find pending payment by code
const payment = await findPaymentByCode(paymentCode);

// Verify amount matches
if (payment.amount === transaction.amount) {
  // Activate WiFi session
  await activateSession(payment.package_id, payment.user_id);
  await updatePaymentStatus(payment.id, "completed");
}
```

**Edge Cases:**

- **Duplicate payments:** Refund or add to user credit
- **Partial payments:** Reject and manual refund
- **Overpayments:** Activate session + store remaining as credit
- **Expired QR:** Generate new QR code
- **Wrong content:** Manual reconciliation dashboard

---

#### FR-09: Payment Transaction Management

**Priority:** P0 (Critical)  
**User Story:** As a system, I need to track all payment transactions with proper status management and reconciliation.

**Transaction States:**

```
PENDING → PROCESSING → SUCCESS
                     → FAILED
                     → EXPIRED
                     → CANCELLED
```

**Transaction Record:**

```typescript
interface PaymentTransaction {
  id: string;
  user_id: string;
  package_id: string;
  amount: number;
  payment_method: "pc_balance" | "momo" | "zalopay" | "vnpay" | "bank_qr";
  status:
    | "pending"
    | "processing"
    | "success"
    | "failed"
    | "expired"
    | "cancelled";

  // Payment method specific data
  pc_transaction_id?: string; // For PC balance
  ewallet_transaction_id?: string; // For e-wallet
  bank_transaction_id?: string; // For bank QR
  payment_code?: string; // For bank QR matching

  // Idempotency
  idempotency_key: string;

  // Metadata
  metadata: {
    location_id: string;
    ip_address: string;
    user_agent: string;
  };

  // Timestamps
  created_at: Date;
  paid_at?: Date;
  expires_at?: Date;

  // Error handling
  error_code?: string;
  error_message?: string;
  retry_count: number;
}
```

**Acceptance Criteria:**

- All transactions logged with complete audit trail
- Idempotency key prevents duplicate charges
- Failed transactions can be retried
- Expired transactions auto-cancelled after timeout
- Reconciliation report for all payment methods
- Support manual refunds for failed payments

**Priority:** P0 (Critical)  
**User Story:** As a system, I need to prevent duplicate charges when users retry failed transactions or experience network issues.

**Acceptance Criteria:**

- Generate unique idempotency key (UUID v4) for each transaction
- Store idempotency key in transaction record
- PC API must honor idempotency key for 24 hours
- Retry with same key returns original response (no double charge)
- Different keys for different transactions

**Implementation:**

```typescript
const idempotencyKey = `wifi_${userId}_${Date.now()}_${uuidv4()}`;
```

---

#### FR-10: Payment Wallet Management

**Priority:** P0 (Critical)  
**User Story:** As a user, I want to link and manage multiple payment methods in one place so that I can pay quickly without re-entering information every time.

**Overview:**

The Payment Wallet is a centralized module that allows users to:

- Link multiple payment methods (PC account, E-wallets, Bank accounts)
- Set a default payment method for quick checkout
- Manage and remove payment methods
- Enable one-click purchases

**User Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│                    FIRST TIME USER                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Connect to WiFi  │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Captive Portal   │
                  │ "Sign in with    │
                  │  Google"         │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Google OAuth     │
                  │ (Email, Profile) │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Create IWAS      │
                  │ Account          │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ 🎯 ONBOARDING:   │
                  │ "Link Payment    │
                  │  Method?"        │
                  └────────┬─────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
         ┌────────┐  ┌─────────┐  ┌─────────┐
         │ PC Acc │  │ E-Wallet│  │ Bank QR │
         │ Link   │  │ Link    │  │ (Save)  │
         └────┬───┘  └────┬────┘  └────┬────┘
              │           │            │
              └───────────┼────────────┘
                          │
                          ▼
                  ┌──────────────────┐
                  │ Set Default      │
                  │ Payment Method   │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Browse Packages  │
                  │ & 1-Click Buy    │
                  └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RETURNING USER                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ Connect to WiFi  │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ One-Tap Login    │
                  │ (Google)         │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Show Packages    │
                  │ Default Payment  │
                  │ Pre-selected     │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ 1-Click Purchase │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ WiFi Activated!  │
                  └──────────────────┘
```

**Data Model:**

```typescript
interface PaymentWallet {
  id: string;
  user_id: string;

  // Settings
  default_payment_method_id: string | null;
  auto_pay_enabled: boolean; // For recurring packages

  created_at: Date;
  updated_at: Date;
}

interface PaymentMethod {
  id: string;
  wallet_id: string;
  user_id: string;

  // Type
  type: "pc_balance" | "momo" | "zalopay" | "vnpay" | "bank_account";

  // Display Information
  display_name: string; // "My PC Account", "Momo ****1234"
  icon_url: string;

  // Method-specific credentials (ENCRYPTED)
  credentials: {
    // PC Balance
    pc_user_id?: string;
    pc_session_token?: string; // Encrypted, refreshable

    // E-Wallet (OAuth tokens)
    wallet_phone?: string; // Masked: 098****567
    wallet_access_token?: string; // Encrypted
    wallet_refresh_token?: string; // Encrypted
    wallet_token_expires_at?: Date;

    // Bank Account (for QR generation)
    bank_code?: string; // e.g., "VCB", "TCB"
    account_number?: string; // Masked: ****1234
    account_name?: string;
  };

  // Status
  is_verified: boolean; // Verified via small transaction or OAuth
  is_active: boolean;
  is_default: boolean;

  // Usage tracking
  last_used_at?: Date;
  total_transactions: number;
  total_amount_spent: number;

  // Metadata
  metadata: {
    linked_at: Date;
    linked_ip: string;
    linked_device: string;
  };

  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // Soft delete
}
```

**Acceptance Criteria:**

**1. Link Payment Methods:**

- User can link multiple payment methods:
  - **PC Account:** OAuth flow with PC system, store session token
  - **E-Wallet:** OAuth flow with Momo/ZaloPay/VNPay, store access/refresh tokens
  - **Bank Account:** Save bank details for QR code generation
- Each payment method must be verified:
  - PC Account: Verify via balance check
  - E-Wallet: Verify via OAuth consent
  - Bank Account: Optional small transaction verification (1,000 VND)
- Support multiple methods of the same type:
  - Multiple bank accounts
  - Multiple e-wallets
  - PC account + e-wallets + banks

**2. Set Default Payment Method:**

- User can set one payment method as default
- Default method is auto-selected at checkout
- User can change default anytime
- If default method fails, prompt to select another

**3. Payment Method Management:**

- **View all linked methods** with:
  - Type icon and name
  - Masked credentials (\*\*\*\*1234)
  - Last used date
  - Status (active/inactive)
- **Edit payment method:**
  - Update display name
  - Re-verify if needed
  - Update credentials (re-authenticate)
- **Remove payment method:**
  - Soft delete (preserve transaction history)
  - Cannot remove if it's the only method
  - Confirm before deletion
- **Reorder methods:**
  - Drag and drop to reorder
  - Most used appears first

**4. One-Click Purchase:**

- At checkout, default payment method is pre-selected
- Show balance/status before purchase:
  - PC Balance: "50,000 VND available"
  - E-Wallet: "Momo \*\*\*\*1234"
  - Bank: "Will generate QR code"
- Click "Pay" button:
  - PC Balance: Instant debit
  - E-Wallet: Use saved OAuth token
  - Bank: Generate QR code
- No need to re-enter credentials
- Session activated immediately on success

**5. Security & Token Management:**

- **Encryption:**
  - All sensitive credentials encrypted at rest (AES-256)
  - Decrypt only when needed for payment
- **Token Refresh:**
  - E-wallet OAuth tokens auto-refresh before expiry
  - PC session tokens refreshed periodically
  - Prompt re-authentication if refresh fails
- **Re-authentication:**
  - Required for:
    - Adding new payment method
    - Removing payment method
    - Large transactions (>100,000 VND)
    - After 24 hours of inactivity
- **Biometric Support (Mobile):**
  - Face ID / Touch ID for quick re-auth
  - PIN code fallback
- **Session Timeout:**
  - Payment wallet session: 24 hours
  - Auto-logout on different device
  - Refresh token rotation

**API Endpoints:**

```typescript
// Get user's payment wallet
GET /api/wallet

// Response
{
  "wallet": {
    "id": "string",
    "default_payment_method_id": "string",
    "payment_methods": [
      {
        "id": "string",
        "type": "pc_balance",
        "display_name": "My PC Account",
        "icon_url": "string",
        "is_default": true,
        "is_verified": true,
        "balance": 50000, // For PC balance only
        "last_used_at": "ISO8601"
      },
      {
        "id": "string",
        "type": "momo",
        "display_name": "Momo ****1234",
        "icon_url": "string",
        "is_default": false,
        "is_verified": true,
        "last_used_at": "ISO8601"
      }
    ]
  }
}

// Link PC Account
POST /api/wallet/link/pc-account
{
  "pc_username": "string",
  "pc_password": "string",
  "location_id": "string"
}

// Response
{
  "success": true,
  "payment_method": {
    "id": "string",
    "type": "pc_balance",
    "display_name": "PC Account (username)",
    "is_verified": true
  }
}

// Link E-Wallet (OAuth)
POST /api/wallet/link/ewallet
{
  "provider": "momo" | "zalopay" | "vnpay",
  "oauth_code": "string", // From OAuth callback
  "redirect_uri": "string"
}

// Response
{
  "success": true,
  "payment_method": {
    "id": "string",
    "type": "momo",
    "display_name": "Momo ****1234",
    "is_verified": true
  }
}

// Save Bank Account
POST /api/wallet/link/bank
{
  "bank_code": "VCB",
  "account_number": "string",
  "account_name": "string"
}

// Response
{
  "success": true,
  "payment_method": {
    "id": "string",
    "type": "bank_account",
    "display_name": "Vietcombank ****1234",
    "is_verified": false // Requires verification
  }
}

// Set Default Payment Method
PUT /api/wallet/default
{
  "payment_method_id": "string"
}

// Remove Payment Method
DELETE /api/wallet/payment-methods/{id}

// Response
{
  "success": true,
  "message": "Payment method removed"
}

// Quick Purchase with Wallet
POST /api/purchases/quick
{
  "package_id": "string",
  "payment_method_id": "string" // Optional, uses default if not provided
}

// Response
{
  "success": true,
  "transaction_id": "string",
  "session_id": "string",
  "message": "WiFi activated"
}
```

**UI/UX Guidelines:**

**1. Onboarding Screen:**

```
┌─────────────────────────────────────┐
│  🎉 Welcome to IWAS WiFi!           │
│                                      │
│  To get started, link a payment     │
│  method for quick purchases:        │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 🖥️  Link PC Account          │   │
│  │    Use your PC balance       │   │
│  │    [Link Now]                │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 💳  Link E-Wallet            │   │
│  │    Momo, ZaloPay, VNPay      │   │
│  │    [Link Now]                │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 🏦  Save Bank Account        │   │
│  │    For QR code payments      │   │
│  │    [Link Now]                │   │
│  └─────────────────────────────┘   │
│                                      │
│  [ Skip for now ]                   │
└─────────────────────────────────────┘
```

**2. Payment Wallet Dashboard:**

```
┌─────────────────────────────────────┐
│  💳 My Payment Methods              │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 🖥️  PC Account               │   │
│  │    Balance: 50,000 VND       │   │
│  │    Last used: 2 hours ago    │   │
│  │    ⭐ DEFAULT                │   │
│  │    [Edit] [Remove]           │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 💳  Momo (****1234)          │   │
│  │    Linked 2 days ago         │   │
│  │    [Set Default] [Remove]    │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ 🏦  Vietcombank (****5678)   │   │
│  │    Saved for QR payments     │   │
│  │    [Set Default] [Remove]    │   │
│  └─────────────────────────────┘   │
│                                      │
│  [ + Add Payment Method ]           │
└─────────────────────────────────────┘
```

**3. Quick Purchase Screen:**

```
┌─────────────────────────────────────┐
│  Select WiFi Package                │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ ⚡ 1 Hour - 5,000 VND        │   │
│  │    2M/10M speed              │   │
│  │    1 device                  │   │
│  │    [SELECT] ✓                │   │
│  └─────────────────────────────┘   │
│                                      │
│  Payment Method:                    │
│  ┌─────────────────────────────┐   │
│  │ 🖥️  PC Account               │   │
│  │    Balance: 50,000 VND       │   │
│  │    ▼ Change                  │   │
│  └─────────────────────────────┘   │
│                                      │
│  ┌─────────────────────────────┐   │
│  │ [ Pay 5,000 VND ]            │   │
│  └─────────────────────────────┘   │
│                                      │
│  ✓ Auto-pay enabled              │
│  🔒 Secure payment                  │
└─────────────────────────────────────┘
```

**Benefits:**

**For Users:**

- ✅ Login once with Google, use everywhere
- ✅ Link payment methods once, use forever
- ✅ 1-click purchase, no re-entering info
- ✅ Manage all payments in one place
- ✅ Works across all iCafe locations

**For Business:**

- ✅ Higher conversion rate (less friction)
- ✅ Increased repeat purchases
- ✅ Better customer retention
- ✅ Cross-location revenue tracking
- ✅ Upsell opportunities

**For Development:**

- ✅ Modular architecture
- ✅ Easy to add new payment providers
- ✅ Centralized payment logic
- ✅ Better security with encryption

---

### 6.3 WiFi Package Management

#### FR-06: Package Configuration

**Priority:** P0 (Critical)  
**User Story:** As an admin, I want to create and manage WiFi packages with different pricing and limits to cater to different customer needs.

**Acceptance Criteria:**

- Admin can create packages with:
  - **Name:** Display name (e.g., "1 Hour Basic", "3 Hours Premium")
  - **Duration:** Time limit in minutes (30, 60, 180, 360, unlimited)
  - **Bandwidth Limit:** Upload/download speed (e.g., "2M/10M")
  - **Device Limit:** Max concurrent devices (1-5)
  - **Price:** Cost in VND
  - **Status:** Active/Inactive
  - **Location:** Specific location or all locations
- Packages can be edited and soft-deleted
- Inactive packages not shown to users but preserved in transaction history
- Package changes don't affect active sessions

**Data Model:**

```typescript
interface Package {
  id: string;
  name: string;
  duration_minutes: number | null; // null = unlimited
  bandwidth_limit: string; // MikroTik format: "2M/10M"
  device_limit: number;
  price: number;
  location_id: string | null; // null = all locations
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

#### FR-07: Package Display & Selection

**Priority:** P0 (Critical)  
**User Story:** As a customer, I want to see available WiFi packages with clear pricing and features so I can choose the best option.

**Acceptance Criteria:**

- Display packages in card format with:
  - Package name
  - Duration (or "Unlimited")
  - Bandwidth limit
  - Device limit
  - Price
  - "Select" button
- Highlight recommended package
- Show "Insufficient Balance" for unaffordable packages
- Responsive design for mobile devices
- Sort by price (ascending)

---

### 6.4 Device & Session Management

#### FR-08: MAC Address Binding

**Priority:** P0 (Critical)  
**User Story:** As a system, I need to bind WiFi sessions to specific devices to prevent package sharing and enforce device limits.

**Acceptance Criteria:**

- Capture MAC address during initial authentication
- Store MAC address in session record
- For single-device packages:
  - New MAC login automatically terminates previous session
  - Display warning: "New device detected. Previous session will be disconnected."
- For multi-device packages:
  - Allow up to N devices (per package limit)
  - Display active devices list
  - User can manually disconnect devices
- MAC address changes trigger re-authentication

**Technical Implementation:**

- MikroTik sends MAC in RADIUS Access-Request
- Store in `Device` table with first_seen timestamp
- Enforce via RADIUS Simultaneous-Use attribute

#### FR-09: Concurrent Session Control

**Priority:** P0 (Critical)  
**User Story:** As a system, I need to prevent users from sharing accounts by enforcing concurrent session limits.

**Acceptance Criteria:**

- Single-device packages: `Simultaneous-Use = 1`
- Multi-device packages: `Simultaneous-Use = N` (per package)
- When limit exceeded:
  - Reject new authentication
  - Return error: "Maximum devices reached. Please disconnect a device first."
- Admin can override limits for troubleshooting

**RADIUS Configuration:**

```
# FreeRADIUS radreply
Simultaneous-Use := 1
```

#### FR-10: Session Lifecycle Management

**Priority:** P0 (Critical)  
**User Story:** As a system, I need to manage WiFi session lifecycle from activation to termination with proper state tracking.

**Session States:**

- `PENDING`: Transaction created, awaiting payment
- `ACTIVE`: Payment confirmed, WiFi access granted
- `EXPIRED`: Time limit reached
- `TERMINATED`: Manually disconnected or PC logout
- `FAILED`: Payment or activation failed

**Activation (Session Start):**

- Triggered after successful payment
- RADIUS returns:
  - `Session-Timeout`: Duration in seconds
  - `Mikrotik-Rate-Limit`: Bandwidth limit
  - `Framed-IP-Address`: Assigned IP (optional)
- Create session record with:
  - `start_time`: Current timestamp
  - `expected_end_time`: start_time + duration
  - `status`: ACTIVE

**Termination (Session End):**
Triggers:

1. **Time Expiration:** RADIUS Session-Timeout reached
2. **PC Logout:** Webhook from PC system
3. **Insufficient Balance:** Balance check fails (for unlimited packages)
4. **Admin Action:** Force disconnect
5. **User Action:** Manual logout

Actions on termination:

- Send RADIUS Disconnect-Request (CoA)
- Update session record:
  - `end_time`: Current timestamp
  - `status`: EXPIRED | TERMINATED
- Release MAC binding
- Log termination reason

#### FR-11: PC Logout Synchronization

**Priority:** P1 (High)  
**User Story:** As a system, I need to automatically terminate WiFi sessions when users log out of their PC to prevent unauthorized access.

**Acceptance Criteria:**

- PC system sends webhook on logout event
- Webhook payload includes:
  - `user_id`: PC user identifier
  - `location_id`: Location identifier
  - `event`: "logout"
  - `timestamp`: Event time
- Backend finds active WiFi sessions for user
- Terminate all active sessions
- Send confirmation response to PC system

**Webhook Contract:**

```typescript
// Request from PC System
POST /api/webhooks/pc-logout
{
  "user_id": "string",
  "location_id": "string",
  "event": "logout",
  "timestamp": "ISO8601",
  "signature": "hmac_sha256" // For verification
}

// Response
{
  "success": true,
  "sessions_terminated": number
}
```

---

### 6.5 Network Segmentation

#### FR-12: VLAN Isolation

**Priority:** P0 (Critical)  
**User Story:** As an iCafe owner, I need WiFi traffic completely separated from PC gaming traffic to prevent performance degradation.

**Acceptance Criteria:**

- Two VLANs configured:
  - `VLAN_PC` (e.g., VLAN 10): Gaming PCs
  - `VLAN_WIFI` (e.g., VLAN 20): Guest WiFi
- No direct routing between VLANs
- Separate DHCP pools
- Separate QoS policies
- WiFi traffic does not impact PC latency/bandwidth
- Firewall rules prevent inter-VLAN communication

**Network Configuration:**

```
VLAN_PC (10):
  - Subnet: 192.168.10.0/24
  - Priority: High (QoS)
  - Bandwidth: Guaranteed

VLAN_WIFI (20):
  - Subnet: 192.168.20.0/24
  - Priority: Normal (QoS)
  - Bandwidth: Shared pool
```

---

## 7. Security & Anti-Abuse

### 7.1 Bandwidth Management

#### FR-13: Per-Session Bandwidth Limits

**Priority:** P0 (Critical)  
**User Story:** As a system, I need to enforce bandwidth limits per package to ensure fair usage and prevent network congestion.

**Acceptance Criteria:**

- Each package defines upload/download limits
- Limits enforced via MikroTik Rate-Limit
- Format: `{upload}M/{download}M` (e.g., "2M/10M")
- Limits apply per session, not per device
- Burst allowance: 20% over limit for 10 seconds
- Monitoring dashboard shows real-time bandwidth usage

**RADIUS Attribute:**

```
Mikrotik-Rate-Limit := "2M/10M"
```

### 7.2 Connection Abuse Prevention

#### FR-14: Connection Rate Limiting

**Priority:** P1 (High)  
**User Story:** As a system, I need to limit concurrent connections per IP to prevent P2P abuse and excessive resource usage.

**Acceptance Criteria:**

- Max 100 concurrent connections per IP
- Exceeding limit triggers warning
- Persistent abuse (3+ warnings) results in temporary ban (30 minutes)
- Admin receives notification for repeat offenders
- Whitelist option for legitimate use cases

**Implementation:**

- MikroTik connection tracking
- Redis-based rate limiting
- Automated ban via RADIUS CoA

#### FR-15: Hotspot Tethering Detection (Phase 2)

**Priority:** P2 (Future)  
**User Story:** As a system, I need to detect when users share WiFi via hotspot to enforce single-device policies.

**Detection Methods:**

- **TTL Analysis:** Detect TTL mismatches indicating NAT
- **User-Agent Fingerprinting:** Identify multiple device types
- **Traffic Pattern Analysis:** Unusual connection patterns

**Actions:**

- Warning notification
- Bandwidth throttling
- Session termination for repeat offenders

---

## 8. Admin Dashboard

### 8.1 Location Management

#### FR-16: Multi-Location Configuration

**Priority:** P0 (Critical)  
**User Story:** As an admin, I want to manage multiple iCafe locations from a single dashboard.

**Features:**

- Create/edit/delete locations
- Configure per-location settings:
  - Location name and address
  - MikroTik router IP
  - RADIUS NAS identifier
  - PC System API endpoint
  - Timezone
- View location status (online/offline)
- Location-specific package assignments

### 8.2 Package Administration

#### FR-17: Package CRUD Operations

**Priority:** P0 (Critical)  
**User Story:** As an admin, I want to create and manage WiFi packages with flexible pricing and limits.

**Features:**

- Create new packages
- Edit existing packages
- Soft-delete packages (preserve transaction history)
- Duplicate packages for quick setup
- Bulk enable/disable packages
- Preview package display (customer view)

### 8.3 Monitoring & Analytics

#### FR-18: Real-Time Session Monitoring

**Priority:** P1 (High)  
**User Story:** As an admin, I want to see all active WiFi sessions in real-time to monitor usage and troubleshoot issues.

**Dashboard Features:**

- Active sessions list with:
  - Username
  - MAC address
  - Package name
  - Start time
  - Time remaining
  - Current bandwidth usage
  - IP address
- Filter by location
- Search by username/MAC
- Force disconnect action
- Refresh every 10 seconds

#### FR-19: Transaction Reports

**Priority:** P1 (High)  
**User Story:** As an admin, I want to view WiFi revenue reports to track business performance.

**Report Types:**

1. **Revenue Summary:**
   - Total revenue (daily/weekly/monthly)
   - Revenue by location
   - Revenue by package
   - Average transaction value

2. **Usage Statistics:**
   - Total sessions
   - Total users
   - Average session duration
   - Peak usage hours

3. **Customer Analytics:**
   - Top customers by spending
   - WiFi adoption rate (% of PC users)
   - Repeat purchase rate

**Export Options:**

- CSV download
- PDF report
- Date range selection
- Location filtering

#### FR-20: System Health Monitoring

**Priority:** P1 (High)  
**User Story:** As an admin, I want to monitor system health to ensure service reliability.

**Metrics:**

- RADIUS server status
- Database connection status
- PC API integration status
- Active sessions count
- Error rate (last 24 hours)
- Average response time

**Alerts:**

- Email notification for critical errors
- Dashboard warning indicators
- Automatic retry for failed integrations

---

## 9. Data Model

### 9.1 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Location   │────────<│   Package    │>───────│ Transaction │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
      │                        │                        │
      ▼                        ▼                        ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  WifiUser   │────────<│ WifiSession  │         │   Device    │
└─────────────┘         └──────────────┘         └─────────────┘
```

### 9.2 Schema Definitions

#### Location

```typescript
interface Location {
  id: string; // UUID
  name: string; // "iCafe Quan 1"
  address: string;
  router_ip: string; // MikroTik IP
  nas_identifier: string; // RADIUS NAS-Identifier
  pc_api_endpoint: string; // PC System API URL
  timezone: string; // "Asia/Ho_Chi_Minh"
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

#### Package

```typescript
interface Package {
  id: string; // UUID
  location_id: string | null; // null = all locations
  name: string; // "1 Hour Basic"
  description: string | null;
  duration_minutes: number | null; // null = unlimited
  bandwidth_limit: string; // "2M/10M"
  device_limit: number; // 1-5
  price: number; // VND
  is_active: boolean;
  display_order: number; // For sorting
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null; // Soft delete
}
```

#### WifiUser

```typescript
interface WifiUser {
  id: string; // UUID
  pc_user_id: string; // From PC system
  location_id: string;
  username: string; // PC username (for display)
  first_login: Date;
  last_login: Date;
  total_sessions: number;
  total_spent: number;
  created_at: Date;
  updated_at: Date;
}
```

#### Device

```typescript
interface Device {
  id: string; // UUID
  wifi_user_id: string;
  mac_address: string; // Normalized format
  device_name: string | null; // User-Agent derived
  first_seen: Date;
  last_seen: Date;
  total_sessions: number;
  is_blocked: boolean;
  created_at: Date;
  updated_at: Date;
}
```

#### WifiTransaction

```typescript
interface WifiTransaction {
  id: string; // UUID
  wifi_user_id: string;
  package_id: string;
  location_id: string;
  amount: number; // VND
  status: "PENDING" | "SUCCESS" | "FAILED";
  pc_transaction_id: string | null; // From PC system
  idempotency_key: string; // UUID
  error_message: string | null;
  metadata: Record<string, any>; // JSON
  created_at: Date;
  updated_at: Date;
}
```

#### WifiSession

```typescript
interface WifiSession {
  id: string; // UUID
  wifi_user_id: string;
  transaction_id: string;
  package_id: string;
  device_id: string;
  mac_address: string;
  ip_address: string | null;
  start_time: Date;
  expected_end_time: Date | null;
  end_time: Date | null;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "TERMINATED" | "FAILED";
  termination_reason: string | null;
  bandwidth_used_mb: number; // Accounting data
  created_at: Date;
  updated_at: Date;
}
```

### 9.3 Indexes

**Performance-Critical Indexes:**

```sql
-- WifiSession
CREATE INDEX idx_wifi_session_status ON wifi_session(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_wifi_session_user ON wifi_session(wifi_user_id, start_time DESC);
CREATE INDEX idx_wifi_session_mac ON wifi_session(mac_address);

-- WifiTransaction
CREATE INDEX idx_wifi_transaction_status ON wifi_transaction(status, created_at DESC);
CREATE INDEX idx_wifi_transaction_user ON wifi_transaction(wifi_user_id, created_at DESC);
CREATE INDEX idx_wifi_transaction_idempotency ON wifi_transaction(idempotency_key);

-- Device
CREATE UNIQUE INDEX idx_device_mac ON device(mac_address);
CREATE INDEX idx_device_user ON device(wifi_user_id);
```

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric                        | Target      | Measurement    |
| ----------------------------- | ----------- | -------------- |
| Concurrent users per location | ≥ 500       | Load testing   |
| Authentication response time  | < 2 seconds | P95 latency    |
| Package purchase flow         | < 3 seconds | End-to-end     |
| Dashboard load time           | < 1 second  | Initial render |
| RADIUS response time          | < 100ms     | P99 latency    |
| Database query time           | < 50ms      | P95 latency    |

### 10.2 Availability

| Component      | Target Uptime | Monitoring |
| -------------- | ------------- | ---------- |
| Overall system | 99.5%         | Monthly    |
| RADIUS server  | 99.9%         | Real-time  |
| Backend API    | 99.5%         | Real-time  |
| Database       | 99.9%         | Real-time  |

**Downtime Budget:**

- Monthly: ~3.6 hours
- Daily: ~7 minutes

**High Availability Strategy:**

- Database replication (primary + standby)
- Redis cluster mode
- Load balancer for API servers
- Automated failover for RADIUS

### 10.3 Security

#### Authentication & Authorization

- **HTTPS Required:** All web traffic encrypted (TLS 1.3)
- **Token-Based Auth:** JWT with 24-hour expiration
- **Password Handling:** Never store PC passwords; use session tokens
- **API Security:** Rate limiting (100 req/min per IP)

#### Data Protection

- **PII Encryption:** Encrypt sensitive user data at rest
- **Audit Logging:** Log all admin actions and transactions
- **Backup:** Daily encrypted backups, 30-day retention
- **Access Control:** Role-based permissions (Admin, Operator, Viewer)

#### Network Security

- **Firewall Rules:** Whitelist PC API endpoints only
- **RADIUS Shared Secret:** Rotate every 90 days
- **SQL Injection Prevention:** Parameterized queries only
- **XSS Protection:** Content Security Policy headers

### 10.4 Scalability

**Horizontal Scaling:**

- Backend API: Stateless design, scale to N instances
- RADIUS: Multi-instance with load balancing
- Database: Read replicas for reporting queries

**Vertical Scaling:**

- Database: Up to 16 vCPU, 64GB RAM
- Redis: Up to 8GB memory

**Capacity Planning:**
| Locations | Concurrent Users | DB Size (1 year) | Bandwidth |
|-----------|------------------|------------------|-----------|
| 10 | 5,000 | ~50GB | 1 Gbps |
| 50 | 25,000 | ~250GB | 5 Gbps |
| 100 | 50,000 | ~500GB | 10 Gbps |

### 10.5 Maintainability

- **Code Quality:** TypeScript strict mode, ESLint, Prettier
- **Testing:** 80% code coverage (unit + integration)
- **Documentation:** API docs (OpenAPI), architecture diagrams
- **Logging:** Structured logging (JSON), centralized aggregation
- **Monitoring:** Prometheus metrics, Grafana dashboards
- **Deployment:** CI/CD pipeline, blue-green deployment

---

## 11. MVP Scope & Roadmap

### 11.1 MVP (Phase 1) - Month 1-2

**Included Features:**
✅ PC account authentication (username/password)  
✅ Balance check and debit integration  
✅ 3 predefined packages (1hr, 3hr, 6hr)  
✅ MAC address binding (single device)  
✅ Concurrent session limit enforcement  
✅ Basic admin dashboard:

- Active session monitoring
- Transaction history
- Package management
  ✅ VLAN network segmentation  
  ✅ Bandwidth limiting per package  
  ✅ Session timeout management  
  ✅ PC logout webhook integration

**Success Criteria:**

- 50+ active sessions during peak hours
- < 2% transaction failure rate
- Zero PC network performance impact
- 20% WiFi adoption rate among PC users

### 11.2 Phase 2 - Month 3-4

**Additional Features:**
🔲 QR code quick login  
🔲 Multi-device packages (2-5 devices)  
🔲 Device management UI (disconnect devices)  
🔲 Enhanced analytics dashboard:

- Revenue charts
- Usage heatmaps
- Customer segmentation
  🔲 Email/SMS notifications  
  🔲 Loyalty points integration  
  🔲 Promotional packages (discounts)

### 11.3 Phase 3 - Month 5-6

**Advanced Features:**
🔲 TTL-based tethering detection  
🔲 Advanced traffic shaping (QoS)  
🔲 Mobile app (iOS/Android)  
🔲 Self-service portal for customers  
🔲 API for third-party integrations  
🔲 Machine learning fraud detection  
🔲 Multi-language support

---

## 12. Success Metrics

### 12.1 Business Metrics

| KPI                               | Target    | Timeline | Measurement       |
| --------------------------------- | --------- | -------- | ----------------- |
| WiFi ARPU per customer            | 7,500 VND | Month 3  | Monthly average   |
| WiFi adoption rate                | 30%       | Month 6  | % of PC users     |
| Monthly WiFi revenue per location | 7.5M VND  | Month 6  | Total revenue     |
| Customer satisfaction (NPS)       | ≥ 40      | Month 3  | Survey            |
| Repeat purchase rate              | ≥ 50%     | Month 6  | % returning users |

### 12.2 Technical Metrics

| KPI                         | Target           | Measurement |
| --------------------------- | ---------------- | ----------- |
| System uptime               | 99.5%            | Monthly     |
| Authentication success rate | ≥ 98%            | Daily       |
| Payment success rate        | ≥ 95%            | Daily       |
| Average session duration    | ≥ 2 hours        | Weekly      |
| Abuse incident rate         | < 5%             | Monthly     |
| Support ticket rate         | < 2% of sessions | Monthly     |

### 12.3 Operational Metrics

| KPI                            | Target             | Measurement  |
| ------------------------------ | ------------------ | ------------ |
| Average resolution time        | < 30 minutes       | Per incident |
| False positive abuse detection | < 1%               | Monthly      |
| Admin dashboard usage          | ≥ 80% of locations | Weekly       |
| API error rate                 | < 0.5%             | Daily        |

---

## 13. Risks & Mitigation

### 13.1 Technical Risks

| Risk                             | Impact   | Probability | Mitigation                                                      |
| -------------------------------- | -------- | ----------- | --------------------------------------------------------------- |
| PC API downtime                  | High     | Medium      | Implement retry logic, cache user data, fallback authentication |
| RADIUS server failure            | Critical | Low         | Deploy redundant RADIUS servers, automated failover             |
| Database performance degradation | High     | Medium      | Implement read replicas, query optimization, caching            |
| Network congestion               | Medium   | Medium      | QoS policies, bandwidth monitoring, capacity planning           |
| Double billing due to retry      | High     | Low         | Idempotency keys, transaction logging, reconciliation process   |

### 13.2 Business Risks

| Risk                            | Impact | Probability | Mitigation                                                           |
| ------------------------------- | ------ | ----------- | -------------------------------------------------------------------- |
| Low adoption rate               | High   | Medium      | User education, promotional pricing, QR quick login                  |
| Customer complaints about speed | Medium | Medium      | Clear package descriptions, bandwidth guarantees, SLA                |
| Abuse/hotspot sharing           | Medium | High        | Device binding, tethering detection, usage monitoring                |
| PC system integration issues    | High   | Low         | Comprehensive API documentation, sandbox testing, SLA with PC vendor |
| Regulatory compliance           | Medium | Low         | Legal review, data privacy compliance, terms of service              |

### 13.3 Operational Risks

| Risk                        | Impact   | Probability | Mitigation                                                         |
| --------------------------- | -------- | ----------- | ------------------------------------------------------------------ |
| Insufficient staff training | Medium   | Medium      | Training materials, admin documentation, support hotline           |
| Configuration errors        | Medium   | Medium      | Configuration validation, staging environment, rollback procedures |
| Data loss                   | Critical | Low         | Daily backups, disaster recovery plan, backup testing              |
| Security breach             | Critical | Low         | Security audits, penetration testing, incident response plan       |

---

## Appendix

### A. Glossary

- **ARPU:** Average Revenue Per User
- **AAA:** Authentication, Authorization, Accounting
- **RADIUS:** Remote Authentication Dial-In User Service
- **CoA:** Change of Authorization (RADIUS dynamic updates)
- **NAS:** Network Access Server
- **VLAN:** Virtual Local Area Network
- **QoS:** Quality of Service
- **MAC:** Media Access Control (hardware address)
- **TTL:** Time To Live (IP packet header field)
- **SSO:** Single Sign-On
- **Captive Portal:** Web page displayed before network access

### B. References

- [RFC 2865: RADIUS Protocol](https://tools.ietf.org/html/rfc2865)
- [RFC 3576: RADIUS Dynamic Authorization](https://tools.ietf.org/html/rfc3576)
- [MikroTik RouterOS Documentation](https://wiki.mikrotik.com/)
- [FreeRADIUS Documentation](https://freeradius.org/documentation/)

### C. Change Log

| Version | Date       | Author       | Changes                  |
| ------- | ---------- | ------------ | ------------------------ |
| 1.0     | 2026-02-16 | Product Team | Initial professional PRD |

---

**Document Status:** Draft  
**Next Review Date:** 2026-03-01  
**Approval Required From:** Product Manager, Engineering Lead, Business Owner
