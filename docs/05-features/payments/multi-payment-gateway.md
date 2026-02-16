# Multi-Payment Gateway Integration

**Feature ID:** FR-05  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a customer, I want to pay using my preferred payment method (PC balance, e-wallet, or bank transfer) so that I have flexibility in how I purchase WiFi packages.

**Business Value:**

- **Maximize conversion** - Support all popular payment methods
- **Reduce friction** - Users pay with what they already have
- **Market coverage** - PC users (70%), E-wallet users (25%), Bank users (5%)
- **Competitive advantage** - More options than competitors

**Supported Payment Methods:**

| Method         | Market Share | Priority | Integration     |
| -------------- | ------------ | -------- | --------------- |
| **PC Balance** | 70%          | P0       | PC System API   |
| **Momo**       | 15%          | P0       | OAuth + API     |
| **ZaloPay**    | 7%           | P1       | OAuth + API     |
| **VNPay**      | 3%           | P1       | OAuth + API     |
| **Bank QR**    | 5%           | P1       | VietQR Standard |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PAYMENT GATEWAY LAYER                     │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
                ┌────────────────────────┐
                │  Payment Router        │
                │  (Strategy Pattern)    │
                └────────┬───────────────┘
                         │
        ┌────────────────┼────────────────┬──────────────┐
        ▼                ▼                ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────┐
│ PC Balance   │ │ E-Wallet     │ │ Bank QR      │ │ Future   │
│ Gateway      │ │ Gateway      │ │ Gateway      │ │ Gateways │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └──────────┘
       │                │                │
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PC System    │ │ Momo/ZaloPay │ │ VietQR       │
│ API          │ │ /VNPay APIs  │ │ Banks        │
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## Payment Flow

### Unified Payment Interface

```typescript
interface PaymentGateway {
  // Charge customer
  charge(request: ChargeRequest): Promise<ChargeResponse>;

  // Verify payment (for async methods)
  verify(transactionId: string): Promise<VerifyResponse>;

  // Refund payment
  refund(transactionId: string, amount: number): Promise<RefundResponse>;

  // Get payment status
  getStatus(transactionId: string): Promise<PaymentStatus>;
}

interface ChargeRequest {
  amount: number;
  currency: "VND";
  description: string;
  customer_id: string;
  payment_method: PaymentMethod;
  idempotency_key: string;
  metadata?: Record<string, any>;
}

interface ChargeResponse {
  success: boolean;
  transaction_id: string;
  status: "SUCCESS" | "PENDING" | "FAILED";

  // For async payments (QR code)
  qr_code?: string;
  qr_code_url?: string;
  expires_at?: Date;

  // Payment details
  amount: number;
  fee?: number;
  net_amount: number;

  // Error handling
  error_code?: string;
  error_message?: string;
}
```

---

## Gateway Implementations

### 1. PC Balance Gateway

```typescript
class PCBalanceGateway implements PaymentGateway {
  constructor(private pcApiService: PcApiService) {}

  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    try {
      // Decrypt PC credentials
      const credentials = await this.decryptCredentials(
        request.payment_method.credentials,
      );

      // Call PC API to debit balance
      const result = await this.pcApiService.debit({
        user_id: credentials.pc_user_id,
        amount: request.amount,
        description: request.description,
        idempotency_key: request.idempotency_key,
      });

      if (!result.success) {
        return {
          success: false,
          transaction_id: null,
          status: "FAILED",
          error_code: result.error_code,
          error_message: result.message,
          amount: request.amount,
          net_amount: 0,
        };
      }

      return {
        success: true,
        transaction_id: result.transaction_id,
        status: "SUCCESS",
        amount: request.amount,
        fee: 0, // No fee for PC balance
        net_amount: request.amount,
      };
    } catch (error) {
      return {
        success: false,
        transaction_id: null,
        status: "FAILED",
        error_code: "PC_API_ERROR",
        error_message: error.message,
        amount: request.amount,
        net_amount: 0,
      };
    }
  }

  async refund(transactionId: string, amount: number): Promise<RefundResponse> {
    const result = await this.pcApiService.refund({
      transaction_id: transactionId,
      amount,
    });

    return {
      success: result.success,
      refund_id: result.refund_id,
      amount: amount,
    };
  }
}
```

### 2. E-Wallet Gateway (Momo/ZaloPay/VNPay)

```typescript
class EWalletGateway implements PaymentGateway {
  constructor(
    private provider: "momo" | "zalopay" | "vnpay",
    private ewalletService: EWalletService,
  ) {}

  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    try {
      // Decrypt OAuth tokens
      const credentials = await this.decryptCredentials(
        request.payment_method.credentials,
      );

      // Refresh token if needed
      await this.refreshTokenIfNeeded(credentials);

      // Call e-wallet API
      const result = await this.ewalletService.charge({
        provider: this.provider,
        access_token: credentials.wallet_access_token,
        amount: request.amount,
        description: request.description,
        order_id: request.idempotency_key,
      });

      if (!result.success) {
        return {
          success: false,
          transaction_id: null,
          status: "FAILED",
          error_code: result.error_code,
          error_message: result.message,
          amount: request.amount,
          net_amount: 0,
        };
      }

      // Calculate fee (e-wallets typically charge 1-2%)
      const fee = Math.ceil(request.amount * 0.015); // 1.5%

      return {
        success: true,
        transaction_id: result.transaction_id,
        status: "SUCCESS",
        amount: request.amount,
        fee: fee,
        net_amount: request.amount - fee,
      };
    } catch (error) {
      return {
        success: false,
        transaction_id: null,
        status: "FAILED",
        error_code: "EWALLET_ERROR",
        error_message: error.message,
        amount: request.amount,
        net_amount: 0,
      };
    }
  }
}
```

### 3. Bank QR Gateway

```typescript
class BankQRGateway implements PaymentGateway {
  constructor(private vietQRService: VietQRService) {}

  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    try {
      // Generate VietQR code
      const qrCode = await this.vietQRService.generate({
        bank_code: request.payment_method.credentials.bank_code,
        account_number: process.env.MERCHANT_ACCOUNT_NUMBER,
        account_name: process.env.MERCHANT_ACCOUNT_NAME,
        amount: request.amount,
        description: request.description,
        transaction_id: request.idempotency_key,
      });

      return {
        success: true,
        transaction_id: request.idempotency_key,
        status: "PENDING", // Wait for webhook
        qr_code: qrCode.data,
        qr_code_url: qrCode.url,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        amount: request.amount,
        fee: 0, // No fee for bank transfer
        net_amount: request.amount,
      };
    } catch (error) {
      return {
        success: false,
        transaction_id: null,
        status: "FAILED",
        error_code: "QR_GENERATION_FAILED",
        error_message: error.message,
        amount: request.amount,
        net_amount: 0,
      };
    }
  }

  async verify(transactionId: string): Promise<VerifyResponse> {
    // Check if payment received via webhook or bank API
    const payment = await this.vietQRService.checkPayment(transactionId);

    return {
      success: payment.received,
      status: payment.received ? "SUCCESS" : "PENDING",
      amount: payment.amount,
    };
  }
}
```

---

## Payment Router (Strategy Pattern)

```typescript
class PaymentRouter {
  private gateways: Map<string, PaymentGateway> = new Map();

  constructor(
    pcGateway: PCBalanceGateway,
    momoGateway: EWalletGateway,
    zalopayGateway: EWalletGateway,
    vnpayGateway: EWalletGateway,
    bankQRGateway: BankQRGateway,
  ) {
    this.gateways.set("pc_balance", pcGateway);
    this.gateways.set("momo", momoGateway);
    this.gateways.set("zalopay", zalopayGateway);
    this.gateways.set("vnpay", vnpayGateway);
    this.gateways.set("bank_qr", bankQRGateway);
  }

  async charge(request: ChargeRequest): Promise<ChargeResponse> {
    const gateway = this.gateways.get(request.payment_method.type);

    if (!gateway) {
      throw new Error(
        `Unsupported payment method: ${request.payment_method.type}`,
      );
    }

    // Log payment attempt
    await this.logPaymentAttempt(request);

    // Execute payment
    const response = await gateway.charge(request);

    // Log payment result
    await this.logPaymentResult(request, response);

    return response;
  }

  async refund(
    paymentMethodType: string,
    transactionId: string,
    amount: number,
  ): Promise<RefundResponse> {
    const gateway = this.gateways.get(paymentMethodType);

    if (!gateway) {
      throw new Error(`Unsupported payment method: ${paymentMethodType}`);
    }

    return await gateway.refund(transactionId, amount);
  }
}
```

---

## Error Handling

### Error Codes

```typescript
enum PaymentErrorCode {
  // PC Balance
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  PC_API_TIMEOUT = "PC_API_TIMEOUT",
  PC_API_ERROR = "PC_API_ERROR",
  INVALID_PC_CREDENTIALS = "INVALID_PC_CREDENTIALS",

  // E-Wallet
  EWALLET_INSUFFICIENT_BALANCE = "EWALLET_INSUFFICIENT_BALANCE",
  EWALLET_TOKEN_EXPIRED = "EWALLET_TOKEN_EXPIRED",
  EWALLET_API_ERROR = "EWALLET_API_ERROR",
  EWALLET_DECLINED = "EWALLET_DECLINED",

  // Bank QR
  QR_GENERATION_FAILED = "QR_GENERATION_FAILED",
  QR_EXPIRED = "QR_EXPIRED",
  BANK_TRANSFER_TIMEOUT = "BANK_TRANSFER_TIMEOUT",

  // General
  PAYMENT_METHOD_INACTIVE = "PAYMENT_METHOD_INACTIVE",
  PAYMENT_METHOD_EXPIRED = "PAYMENT_METHOD_EXPIRED",
  INVALID_AMOUNT = "INVALID_AMOUNT",
  DUPLICATE_TRANSACTION = "DUPLICATE_TRANSACTION",
}

const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE: "Insufficient balance. Please top up your account.",
  PC_API_TIMEOUT: "PC system is temporarily unavailable. Please try again.",
  EWALLET_TOKEN_EXPIRED:
    "Your e-wallet connection has expired. Please re-link.",
  QR_EXPIRED: "QR code has expired. Please generate a new one.",
  // ... more messages
};
```

### Retry Logic

```typescript
class PaymentRetryService {
  async executeWithRetry(
    paymentFn: () => Promise<ChargeResponse>,
    maxRetries: number = 3,
  ): Promise<ChargeResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await paymentFn();

        // Don't retry if payment succeeded or failed with business error
        if (result.success || this.isBusinessError(result.error_code)) {
          return result;
        }

        // Retry on network/timeout errors
        if (attempt < maxRetries) {
          await this.delay(attempt * 1000); // Exponential backoff
          continue;
        }

        return result;
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          await this.delay(attempt * 1000);
          continue;
        }
      }
    }

    throw lastError;
  }

  private isBusinessError(errorCode: string): boolean {
    return [
      "INSUFFICIENT_BALANCE",
      "EWALLET_INSUFFICIENT_BALANCE",
      "INVALID_AMOUNT",
    ].includes(errorCode);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
```

---

## Webhook Handling (Bank QR)

```typescript
@Controller("webhooks/bank")
export class BankWebhookController {
  constructor(
    private transactionService: TransactionService,
    private sessionService: SessionService,
  ) {}

  @Post("payment-received")
  async handlePaymentReceived(@Body() payload: BankWebhookPayload) {
    // 1. Verify webhook signature
    if (!this.verifySignature(payload)) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    // 2. Find pending transaction
    const transaction = await this.transactionService.findByIdempotencyKey(
      payload.transaction_id,
    );

    if (!transaction) {
      throw new NotFoundException("Transaction not found");
    }

    if (transaction.status !== "PENDING") {
      return { success: true, message: "Already processed" };
    }

    // 3. Verify amount matches
    if (payload.amount !== transaction.amount) {
      await this.transactionService.updateStatus(transaction.id, "FAILED", {
        error: "Amount mismatch",
      });
      return { success: false, message: "Amount mismatch" };
    }

    // 4. Update transaction to SUCCESS
    await this.transactionService.updateStatus(transaction.id, "SUCCESS", {
      external_transaction_id: payload.bank_transaction_id,
      received_at: new Date(),
    });

    // 5. Activate WiFi session
    const session = await this.sessionService.findByTransactionId(
      transaction.id,
    );
    if (session) {
      await this.sessionService.activate(session.id);
    }

    return { success: true, message: "Payment processed" };
  }

  private verifySignature(payload: BankWebhookPayload): boolean {
    const signature = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET)
      .update(JSON.stringify(payload.data))
      .digest("hex");

    return signature === payload.signature;
  }
}
```

---

## Testing

```typescript
describe('Payment Gateway', () => {
  describe('PC Balance Gateway', () => {
    it('should charge PC balance successfully', async () => {
      const result = await pcGateway.charge({
        amount: 12000,
        currency: 'VND',
        description: 'WiFi Package',
        customer_id: 'user_123',
        payment_method: pcPaymentMethod,
        idempotency_key: 'unique_key_123'
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('SUCCESS');
      expect(result.fee).toBe(0);
    });
  });

  describe('E-Wallet Gateway', () => {
    it('should charge Momo successfully', async () => {
      const result = await momoGateway.charge({
        amount: 12000,
        currency: 'VND',
        description: 'WiFi Package',
        customer_id: 'user_123',
        payment_method: momoPaymentMethod,
        idempotency_key: 'unique_key_123'
      });

      expect(result.success).toBe(true);
      expect(result.fee).toBeGreaterThan(0);
    });
  });

  describe('Payment Router', () => {
    it('should route to correct gateway', async () => {
      const result = await paymentRouter.charge({
        amount: 12000,
        payment_method: { type: 'momo', ... }
      });

      expect(result.success).toBe(true);
    });
  });
});
```

---

## Performance & Monitoring

### Metrics to Track

```typescript
// Payment success rate by method
metrics.gauge("payment.success_rate", successRate, {
  method: "pc_balance" | "momo" | "zalopay" | "vnpay" | "bank_qr",
});

// Payment processing time
metrics.histogram("payment.processing_time", duration, {
  method: paymentMethod,
});

// Payment failures
metrics.counter("payment.failures", 1, {
  method: paymentMethod,
  error_code: errorCode,
});

// Refund rate
metrics.gauge("payment.refund_rate", refundRate);
```

### Alerts

**Critical:**

- Payment success rate < 95% for any method
- PC API timeout rate > 5%
- E-wallet token refresh failures > 10/hour

**High:**

- Average payment processing time > 2 seconds
- Refund rate > 5%

---

## Related Documents

- [Payment Wallet](./payment-wallet.md)
- [PC Balance Payment](./pc-balance-payment.md)
- [E-Wallet Payment](./ewallet-payment.md)
- [Bank QR Payment](./bank-qr-payment.md)
- [Transaction Management](./transaction-management.md)

---

[← Back to Payments](./README.md) | [← Back to Features](../README.md)
