# PC Balance Payment

**Feature ID:** FR-06  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a PC user, I want to use my PC account balance to pay for WiFi packages without re-entering credentials.

**Business Value:**

- **Primary payment method** - 70% of users
- **Zero friction** - Already logged into PC
- **Instant payment** - No external APIs
- **High conversion** - Seamless experience

**Market Share:** 70% of all transactions

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    PC BALANCE PAYMENT FLOW                   │
└─────────────────────────────────────────────────────────────┘

1. User logs into PC
   ↓
2. PC System authenticates user
   ↓
3. User opens browser → WiFi portal
   ↓
4. Portal detects PC login (via session)
   ↓
5. Auto-link PC account to IWAS account
   ↓
6. User selects WiFi package
   ↓
7. PC Balance pre-selected as payment
   ↓
8. User clicks "Purchase"
   ↓
9. IWAS calls PC API to debit balance
   ↓
10. PC API debits balance (idempotent)
    ↓
11. WiFi session activated
    ↓
12. User connected!
```

**Time:** ~500ms (fastest payment method)

---

## Integration with PC System

### PC System API

```typescript
interface PCSystemAPI {
  // Authenticate user
  login(credentials: PCLoginRequest): Promise<PCLoginResponse>;

  // Get user balance
  getBalance(userId: string): Promise<number>;

  // Debit balance (idempotent)
  debit(request: PCDebitRequest): Promise<PCDebitResponse>;

  // Refund balance
  refund(request: PCRefundRequest): Promise<PCRefundResponse>;

  // Get transaction history
  getTransactions(userId: string): Promise<PCTransaction[]>;
}

interface PCDebitRequest {
  user_id: string;
  amount: number;
  description: string;
  idempotency_key: string; // Prevent double billing
}

interface PCDebitResponse {
  success: boolean;
  transaction_id: string;
  new_balance: number;
  error_code?: string;
  message?: string;
}
```

### API Call Example

```typescript
// Debit PC balance
POST https://pc-system.icafe.com/api/debit
Authorization: Bearer {pc_api_key}
Content-Type: application/json

{
  "user_id": "pc_user_12345",
  "amount": 12000,
  "description": "WiFi Package: 3 Hours",
  "idempotency_key": "wifi_user_123_1708077600000_abc-def"
}

// Response (Success)
{
  "success": true,
  "transaction_id": "pc_txn_789",
  "new_balance": 138000,
  "timestamp": "2026-02-16T16:30:00Z"
}

// Response (Insufficient Balance)
{
  "success": false,
  "error_code": "INSUFFICIENT_BALANCE",
  "message": "Insufficient balance. Required: 12,000 VND, Available: 10,000 VND",
  "current_balance": 10000
}
```

---

## Idempotency Protection

**Problem:** User clicks "Purchase" twice → Double billing

**Solution:** Idempotency key

```typescript
class PCBalanceService {
  async debit(request: DebitRequest): Promise<DebitResponse> {
    // Generate idempotency key
    const idempotencyKey = `wifi_${request.user_id}_${Date.now()}_${uuidv4()}`;

    // Call PC API with idempotency key
    const result = await this.pcApiClient.debit({
      user_id: request.pc_user_id,
      amount: request.amount,
      description: request.description,
      idempotency_key: idempotencyKey,
    });

    // PC API guarantees:
    // - Same idempotency_key = Same response
    // - Balance debited only once
    // - Safe to retry

    return result;
  }
}
```

**PC API Behavior:**

```
Request 1: idempotency_key=abc123 → Debit 12,000 VND → Success
Request 2: idempotency_key=abc123 → Return cached response → No debit
Request 3: idempotency_key=def456 → Debit 12,000 VND → Success
```

---

## Auto-Linking PC Account

```typescript
class PCAccountLinkingService {
  async autoLinkFromPCSession(
    user: User,
    pcSessionToken: string,
  ): Promise<void> {
    // 1. Validate PC session token
    const pcUser = await this.pcApiClient.validateSession(pcSessionToken);

    if (!pcUser.valid) {
      throw new UnauthorizedException("Invalid PC session");
    }

    // 2. Check if already linked
    const existing = await this.walletService.findPaymentMethod({
      user_id: user.id,
      type: "pc_balance",
      "credentials.pc_user_id": pcUser.user_id,
    });

    if (existing) {
      // Already linked, just refresh token
      await this.walletService.updateCredentials(existing.id, {
        pc_session_token: pcSessionToken,
      });
      return;
    }

    // 3. Create new payment method
    await this.walletService.createPaymentMethod({
      wallet_id: user.wallet_id,
      user_id: user.id,
      type: "pc_balance",
      display_name: `PC Account (${pcUser.username})`,
      credentials: await this.encryptionService.encrypt({
        pc_user_id: pcUser.user_id,
        pc_session_token: pcSessionToken,
      }),
      is_verified: true,
      is_default: true, // Set as default for PC users
      is_active: true,
    });
  }
}
```

---

## Balance Display

```typescript
// Get user's PC balance
GET /api/wallet/pc-balance
Authorization: Bearer {session_token}

// Response
{
  "success": true,
  "balance": 150000,
  "currency": "VND",
  "formatted": "150,000 VND",
  "last_updated": "2026-02-16T16:30:00Z"
}
```

**UI Display:**

```
┌─────────────────────────────────────────┐
│ 💰 PC Account Balance                  │
│                                         │
│ 150,000 VND                            │
│ Available                               │
│                                         │
│ [Top Up] [View History]                │
└─────────────────────────────────────────┘
```

---

## Error Handling

```typescript
enum PCBalanceErrorCode {
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  PC_API_TIMEOUT = "PC_API_TIMEOUT",
  PC_API_ERROR = "PC_API_ERROR",
  INVALID_SESSION = "INVALID_SESSION",
  USER_NOT_FOUND = "USER_NOT_FOUND",
}

const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE:
    "Insufficient PC balance. Please top up at the counter.",
  PC_API_TIMEOUT: "PC system is temporarily unavailable. Please try again.",
  PC_API_ERROR: "Unable to process payment. Please contact staff.",
  INVALID_SESSION: "Your PC session has expired. Please log in again.",
  USER_NOT_FOUND: "PC user not found. Please contact staff.",
};
```

---

## Refund Flow

```typescript
async function refundPCBalance(transaction: Transaction): Promise<void> {
  // 1. Call PC API to refund
  const result = await pcApiClient.refund({
    original_transaction_id: transaction.external_transaction_id,
    amount: transaction.amount,
    reason: "WiFi session activation failed",
  });

  if (!result.success) {
    // Alert admin - manual refund needed
    await alertService.critical({
      title: "PC Refund Failed",
      transaction_id: transaction.id,
      amount: transaction.amount,
      error: result.message,
    });
    return;
  }

  // 2. Update transaction
  await transactionService.update(transaction.id, {
    status: "REFUNDED",
    refund_transaction_id: result.refund_id,
    refunded_at: new Date(),
  });

  // 3. Notify user
  await notificationService.send({
    user_id: transaction.user_id,
    type: "REFUND_PROCESSED",
    message: `Your PC balance has been refunded: ${transaction.amount} VND`,
  });
}
```

---

## Testing

```typescript
describe("PC Balance Payment", () => {
  it("should debit PC balance successfully", async () => {
    const result = await pcBalanceService.debit({
      user_id: "user_123",
      pc_user_id: "pc_user_456",
      amount: 12000,
      description: "WiFi Package",
    });

    expect(result.success).toBe(true);
    expect(result.new_balance).toBe(138000);
  });

  it("should handle insufficient balance", async () => {
    mockPCAPI.getBalance.mockResolvedValue(5000);

    await expect(
      pcBalanceService.debit({
        user_id: "user_123",
        amount: 12000,
      }),
    ).rejects.toThrow("INSUFFICIENT_BALANCE");
  });

  it("should be idempotent", async () => {
    const idempotencyKey = "test_key_123";

    // First request
    const result1 = await pcBalanceService.debit({
      amount: 12000,
      idempotency_key: idempotencyKey,
    });

    // Second request with same key
    const result2 = await pcBalanceService.debit({
      amount: 12000,
      idempotency_key: idempotencyKey,
    });

    // Should return same result
    expect(result1.transaction_id).toBe(result2.transaction_id);

    // Balance debited only once
    const balance = await pcApiClient.getBalance("pc_user_456");
    expect(balance).toBe(138000); // Not 126000
  });
});
```

---

## Performance

**Target:** < 500ms  
**Breakdown:**

- Decrypt credentials: 10ms
- PC API call: 300ms
- Update transaction: 50ms
- Response: 10ms

**Total:** ~370ms ✅

---

## Related Documents

- [Multi-Payment Gateway](./multi-payment-gateway.md)
- [Payment Wallet](./payment-wallet.md)
- [Transaction Management](./transaction-management.md)
- [PC System Integration](../../09-integrations/pc-system-api.md)

---

[← Back to Payments](./README.md) | [← Back to Features](../README.md)
