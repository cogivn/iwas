# Transaction Management

**Feature ID:** FR-09  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a system, I need to track all payment transactions with proper state management, idempotency, and audit trail.

**Business Value:**

- **Financial accuracy** - No lost or duplicate transactions
- **Audit compliance** - Complete transaction history
- **Debugging** - Easy troubleshooting
- **Reporting** - Revenue analytics
- **Refunds** - Proper refund handling

---

## Transaction Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                  TRANSACTION STATE MACHINE                   │
└─────────────────────────────────────────────────────────────┘

                    CREATED
                       ↓
                   PENDING
                       ↓
         ┌─────────────┼─────────────┐
         ↓             ↓             ↓
     SUCCESS       FAILED        EXPIRED
         ↓
    REFUNDED (optional)
```

### State Definitions

| State        | Description                | Terminal | Next States              |
| ------------ | -------------------------- | -------- | ------------------------ |
| **CREATED**  | Transaction record created | No       | PENDING                  |
| **PENDING**  | Payment processing         | No       | SUCCESS, FAILED, EXPIRED |
| **SUCCESS**  | Payment completed          | No       | REFUNDED                 |
| **FAILED**   | Payment failed             | Yes      | -                        |
| **EXPIRED**  | Payment timeout (QR code)  | Yes      | -                        |
| **REFUNDED** | Payment refunded           | Yes      | -                        |

---

## Data Model

```typescript
interface Transaction {
  id: string;

  // References
  user_id: string;
  package_id: string;
  session_id?: string; // Linked after session creation

  // Payment Details
  amount: number;
  currency: "VND";
  fee: number; // E-wallet fees
  net_amount: number; // amount - fee

  // Payment Method
  payment_method_id: string;
  payment_method_type: "pc_balance" | "momo" | "zalopay" | "vnpay" | "bank_qr";

  // Status
  status: "CREATED" | "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";

  // Idempotency
  idempotency_key: string; // Unique per transaction
  order_id: string; // For external systems (QR code)

  // External References
  external_transaction_id?: string; // PC API, Momo, etc.
  refund_transaction_id?: string;

  // Error Handling
  error_code?: string;
  error_message?: string;
  retry_count: number;

  // Metadata
  metadata: {
    ip_address: string;
    user_agent: string;
    location_id: string;
    device_mac?: string;
  };

  // Timestamps
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  refunded_at?: Date;
  expires_at?: Date; // For QR codes
}

// Transaction History (Audit Trail)
interface TransactionEvent {
  id: string;
  transaction_id: string;

  event_type: "CREATED" | "STATUS_CHANGED" | "REFUNDED" | "ERROR";
  from_status?: string;
  to_status?: string;

  details: Record<string, any>;

  created_at: Date;
  created_by?: string; // System or admin user
}
```

---

## Idempotency

### Why Idempotency?

**Problem:**

```
User clicks "Purchase" → Request sent
Network timeout → User clicks again
→ Two requests → Double billing! ❌
```

**Solution:**

```typescript
// Generate unique idempotency key
const idempotencyKey = `wifi_${userId}_${Date.now()}_${uuidv4()}`;

// First request
const txn1 = await createTransaction({ idempotency_key: idempotencyKey });
// → Creates new transaction

// Second request (same key)
const txn2 = await createTransaction({ idempotency_key: idempotencyKey });
// → Returns existing transaction (no duplicate)
```

### Implementation

```typescript
class TransactionService {
  async create(request: CreateTransactionRequest): Promise<Transaction> {
    // Check if transaction with this idempotency key exists
    const existing = await this.findByIdempotencyKey(request.idempotency_key);

    if (existing) {
      // Return existing transaction (idempotent)
      return existing;
    }

    // Create new transaction
    const transaction = await this.db.transactions.create({
      id: generateId(),
      user_id: request.user_id,
      package_id: request.package_id,
      amount: request.amount,
      currency: "VND",
      fee: request.fee || 0,
      net_amount: request.amount - (request.fee || 0),
      payment_method_id: request.payment_method_id,
      payment_method_type: request.payment_method_type,
      status: "CREATED",
      idempotency_key: request.idempotency_key,
      order_id: generateOrderId(),
      retry_count: 0,
      metadata: request.metadata,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Log event
    await this.logEvent(transaction.id, "CREATED", {
      initial_status: "CREATED",
    });

    return transaction;
  }
}
```

---

## State Transitions

```typescript
class TransactionStateMachine {
  private allowedTransitions = {
    CREATED: ["PENDING"],
    PENDING: ["SUCCESS", "FAILED", "EXPIRED"],
    SUCCESS: ["REFUNDED"],
    FAILED: [],
    EXPIRED: [],
    REFUNDED: [],
  };

  async updateStatus(
    transactionId: string,
    newStatus: TransactionStatus,
    details?: Record<string, any>,
  ): Promise<Transaction> {
    const transaction = await this.transactionService.findById(transactionId);

    // Validate transition
    if (!this.canTransition(transaction.status, newStatus)) {
      throw new BadRequestException(
        `Invalid state transition: ${transaction.status} → ${newStatus}`,
      );
    }

    // Update transaction
    const updated = await this.db.transactions.update(transactionId, {
      status: newStatus,
      updated_at: new Date(),
      completed_at: this.isTerminalState(newStatus) ? new Date() : undefined,
      ...details,
    });

    // Log event
    await this.logEvent(transactionId, "STATUS_CHANGED", {
      from_status: transaction.status,
      to_status: newStatus,
      ...details,
    });

    // Emit event for other services
    await this.eventBus.emit("transaction.status_changed", {
      transaction_id: transactionId,
      old_status: transaction.status,
      new_status: newStatus,
    });

    return updated;
  }

  private canTransition(from: string, to: string): boolean {
    return this.allowedTransitions[from]?.includes(to) || false;
  }

  private isTerminalState(status: string): boolean {
    return ["SUCCESS", "FAILED", "EXPIRED", "REFUNDED"].includes(status);
  }
}
```

---

## Refund Handling

```typescript
class RefundService {
  async refund(
    transactionId: string,
    reason: string,
    initiatedBy?: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionService.findById(transactionId);

    // Validate can refund
    if (transaction.status !== "SUCCESS") {
      throw new BadRequestException("Can only refund successful transactions");
    }

    if (transaction.status === "REFUNDED") {
      throw new BadRequestException("Transaction already refunded");
    }

    // Call payment gateway to refund
    let refundResult;

    switch (transaction.payment_method_type) {
      case "pc_balance":
        refundResult = await this.pcApiService.refund({
          transaction_id: transaction.external_transaction_id,
          amount: transaction.amount,
        });
        break;

      case "momo":
      case "zalopay":
      case "vnpay":
        refundResult = await this.ewalletService.refund({
          provider: transaction.payment_method_type,
          transaction_id: transaction.external_transaction_id,
          amount: transaction.amount,
        });
        break;

      case "bank_qr":
        // Manual refund required
        await this.alertService.critical({
          title: "Manual Refund Required",
          transaction_id: transactionId,
          amount: transaction.amount,
          reason: "Bank QR refund requires manual processing",
        });
        throw new BadRequestException(
          "Bank QR refunds require manual processing",
        );
    }

    if (!refundResult.success) {
      throw new InternalServerErrorException(
        "Refund failed: " + refundResult.message,
      );
    }

    // Update transaction
    const refunded = await this.transactionStateMachine.updateStatus(
      transactionId,
      "REFUNDED",
      {
        refund_transaction_id: refundResult.refund_id,
        refunded_at: new Date(),
        refund_reason: reason,
        refunded_by: initiatedBy,
      },
    );

    // Notify user
    await this.notificationService.send({
      user_id: transaction.user_id,
      type: "REFUND_PROCESSED",
      message: `Your payment of ${transaction.amount} VND has been refunded.`,
    });

    return refunded;
  }
}
```

---

## Transaction History & Audit Trail

```typescript
class TransactionAuditService {
  async logEvent(
    transactionId: string,
    eventType: string,
    details: Record<string, any>,
  ): Promise<void> {
    await this.db.transaction_events.create({
      id: generateId(),
      transaction_id: transactionId,
      event_type: eventType,
      details: details,
      created_at: new Date(),
      created_by: details.user_id || "SYSTEM",
    });
  }

  async getHistory(transactionId: string): Promise<TransactionEvent[]> {
    return await this.db.transaction_events
      .find({
        transaction_id: transactionId,
      })
      .sort({ created_at: 1 });
  }
}
```

### Audit Trail Example

```json
[
  {
    "id": "evt_1",
    "transaction_id": "txn_abc123",
    "event_type": "CREATED",
    "details": {
      "initial_status": "CREATED",
      "amount": 12000,
      "payment_method": "pc_balance"
    },
    "created_at": "2026-02-16T16:30:00.000Z",
    "created_by": "SYSTEM"
  },
  {
    "id": "evt_2",
    "transaction_id": "txn_abc123",
    "event_type": "STATUS_CHANGED",
    "from_status": "CREATED",
    "to_status": "PENDING",
    "details": {},
    "created_at": "2026-02-16T16:30:00.100Z",
    "created_by": "SYSTEM"
  },
  {
    "id": "evt_3",
    "transaction_id": "txn_abc123",
    "event_type": "STATUS_CHANGED",
    "from_status": "PENDING",
    "to_status": "SUCCESS",
    "details": {
      "external_transaction_id": "pc_txn_789",
      "new_balance": 138000
    },
    "created_at": "2026-02-16T16:30:00.500Z",
    "created_by": "SYSTEM"
  }
]
```

---

## API Contracts

### Get Transaction

```typescript
GET /api/transactions/{transaction_id}
Authorization: Bearer {session_token}

// Response
{
  "success": true,
  "transaction": {
    "id": "txn_abc123",
    "amount": 12000,
    "currency": "VND",
    "fee": 0,
    "net_amount": 12000,
    "status": "SUCCESS",
    "payment_method": {
      "type": "pc_balance",
      "display_name": "PC Account"
    },
    "package": {
      "id": "pkg_456",
      "name": "3 Hours WiFi"
    },
    "created_at": "2026-02-16T16:30:00Z",
    "completed_at": "2026-02-16T16:30:00.500Z"
  }
}
```

### Get Transaction History

```typescript
GET /api/transactions/{transaction_id}/history
Authorization: Bearer {session_token}

// Response
{
  "success": true,
  "events": [
    {
      "event_type": "CREATED",
      "timestamp": "2026-02-16T16:30:00.000Z",
      "details": { "initial_status": "CREATED" }
    },
    {
      "event_type": "STATUS_CHANGED",
      "from_status": "CREATED",
      "to_status": "PENDING",
      "timestamp": "2026-02-16T16:30:00.100Z"
    },
    {
      "event_type": "STATUS_CHANGED",
      "from_status": "PENDING",
      "to_status": "SUCCESS",
      "timestamp": "2026-02-16T16:30:00.500Z",
      "details": {
        "external_transaction_id": "pc_txn_789"
      }
    }
  ]
}
```

### List User Transactions

```typescript
GET /api/transactions
  ?user_id={user_id}
  &status=SUCCESS
  &limit=20
  &offset=0
Authorization: Bearer {session_token}

// Response
{
  "success": true,
  "transactions": [
    {
      "id": "txn_abc123",
      "amount": 12000,
      "status": "SUCCESS",
      "payment_method_type": "pc_balance",
      "package_name": "3 Hours WiFi",
      "created_at": "2026-02-16T16:30:00Z"
    }
    // ... more transactions
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

---

## Reporting & Analytics

```typescript
class TransactionReportingService {
  async getDailyRevenue(date: Date): Promise<DailyRevenue> {
    const transactions = await this.db.transactions.find({
      status: "SUCCESS",
      created_at: {
        $gte: startOfDay(date),
        $lt: endOfDay(date),
      },
    });

    return {
      date: date,
      total_transactions: transactions.length,
      total_revenue: transactions.reduce((sum, t) => sum + t.net_amount, 0),
      by_payment_method: this.groupByPaymentMethod(transactions),
      by_package: this.groupByPackage(transactions),
    };
  }

  async getRevenueByPaymentMethod(
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueBreakdown> {
    const result = await this.db.transactions.aggregate([
      {
        $match: {
          status: "SUCCESS",
          created_at: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$payment_method_type",
          count: { $sum: 1 },
          total_revenue: { $sum: "$net_amount" },
          avg_transaction: { $avg: "$net_amount" },
        },
      },
    ]);

    return result;
  }
}
```

---

## Error Handling & Retry

```typescript
class TransactionRetryService {
  async retryFailedTransaction(transactionId: string): Promise<Transaction> {
    const transaction = await this.transactionService.findById(transactionId);

    // Check if retryable
    if (transaction.status !== "FAILED") {
      throw new BadRequestException("Can only retry failed transactions");
    }

    if (transaction.retry_count >= 3) {
      throw new BadRequestException("Maximum retry attempts reached");
    }

    // Check if error is retryable
    const retryableErrors = [
      "PC_API_TIMEOUT",
      "EWALLET_API_ERROR",
      "NETWORK_ERROR",
    ];

    if (!retryableErrors.includes(transaction.error_code)) {
      throw new BadRequestException("Error is not retryable");
    }

    // Increment retry count
    await this.db.transactions.update(transactionId, {
      retry_count: transaction.retry_count + 1,
      status: "PENDING",
    });

    // Retry payment
    const result = await this.paymentGateway.charge({
      transaction_id: transactionId,
      amount: transaction.amount,
      payment_method: transaction.payment_method_id,
    });

    // Update status
    if (result.success) {
      await this.transactionStateMachine.updateStatus(transactionId, "SUCCESS");
    } else {
      await this.transactionStateMachine.updateStatus(transactionId, "FAILED", {
        error_code: result.error_code,
        error_message: result.error_message,
      });
    }

    return await this.transactionService.findById(transactionId);
  }
}
```

---

## Testing

```typescript
describe("Transaction Management", () => {
  describe("State Machine", () => {
    it("should allow valid transitions", async () => {
      const txn = await createTransaction({ status: "CREATED" });

      await stateMachine.updateStatus(txn.id, "PENDING");
      await stateMachine.updateStatus(txn.id, "SUCCESS");

      const updated = await transactionService.findById(txn.id);
      expect(updated.status).toBe("SUCCESS");
    });

    it("should reject invalid transitions", async () => {
      const txn = await createTransaction({ status: "SUCCESS" });

      await expect(
        stateMachine.updateStatus(txn.id, "PENDING"),
      ).rejects.toThrow("Invalid state transition");
    });
  });

  describe("Idempotency", () => {
    it("should return same transaction for same key", async () => {
      const key = "test_key_123";

      const txn1 = await transactionService.create({
        idempotency_key: key,
        amount: 12000,
      });

      const txn2 = await transactionService.create({
        idempotency_key: key,
        amount: 12000,
      });

      expect(txn1.id).toBe(txn2.id);
    });
  });

  describe("Refund", () => {
    it("should refund successful transaction", async () => {
      const txn = await createTransaction({ status: "SUCCESS" });

      const refunded = await refundService.refund(txn.id, "Test refund");

      expect(refunded.status).toBe("REFUNDED");
      expect(refunded.refund_transaction_id).toBeDefined();
    });
  });
});
```

---

## Performance

**Transaction Creation:** < 100ms  
**Status Update:** < 50ms  
**Query Performance:** < 200ms (indexed)

**Indexes:**

```sql
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_idempotency_key ON transactions(idempotency_key);
CREATE UNIQUE INDEX idx_transactions_order_id ON transactions(order_id);
```

---

## Related Documents

- [Multi-Payment Gateway](./multi-payment-gateway.md)
- [Payment Wallet](./payment-wallet.md)
- [PC Balance Payment](./pc-balance-payment.md)
- [E-Wallet Payment](./ewallet-payment.md)
- [Bank QR Payment](./bank-qr-payment.md)

---

[← Back to Payments](./README.md) | [← Back to Features](../README.md)
