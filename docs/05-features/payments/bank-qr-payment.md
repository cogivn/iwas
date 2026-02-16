# Bank QR Payment (VietQR)

**Feature ID:** FR-08  
**Priority:** P1 (High)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a customer, I want to pay via bank transfer using QR code for a secure and familiar payment method.

**Business Value:**

- **Universal coverage:** Works with all Vietnamese banks
- **No registration:** Instant payment without account
- **Zero fees:** No transaction fees for users
- **Trust:** Bank-backed security

**Market Share:** 5% of users (growing)

---

## VietQR Standard

VietQR is Vietnam's national QR code standard for bank transfers, supported by all major banks.

**Supported Banks:**

- Vietcombank (VCB)
- Techcombank (TCB)
- BIDV
- VietinBank (CTG)
- ACB, MB, VP Bank, etc.

**Total:** 40+ banks

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    BANK QR PAYMENT FLOW                      │
└─────────────────────────────────────────────────────────────┘

User selects "Bank QR" payment
    ↓
IWAS generates VietQR code
    ↓
Display QR code to user
    ↓
User opens banking app
    ↓
User scans QR code
    ↓
Banking app pre-fills:
  - Bank account (IWAS merchant)
  - Amount (12,000 VND)
  - Description (Order ID)
    ↓
User confirms transfer
    ↓
Bank processes transfer
    ↓
Bank sends webhook to IWAS
    ↓
IWAS verifies payment
    ↓
WiFi session activated! ✅
```

**Time:** 30-60 seconds (user-dependent)

---

## VietQR Code Generation

### QR Code Format

```
VietQR Format:
000201 (Version)
010212 (Transfer type)
38{bank_info}
  00{bank_bin}
  01{account_number}
  02{account_name}
54{amount}
58VN (Country)
62{additional_data}
  05{order_id}
  08{description}
6304{checksum}
```

### Generate QR Code

```typescript
interface VietQRRequest {
  bank_code: string; // e.g., "VCB", "TCB"
  account_number: string;
  account_name: string;
  amount: number;
  description: string;
  order_id: string;
}

class VietQRService {
  async generate(request: VietQRRequest): Promise<VietQRResponse> {
    // 1. Get bank BIN code
    const bankBIN = this.getBankBIN(request.bank_code);

    // 2. Build QR data
    const qrData = this.buildQRData({
      bank_bin: bankBIN,
      account_number: request.account_number,
      account_name: request.account_name,
      amount: request.amount,
      description: request.description,
      order_id: request.order_id
    });

    // 3. Generate QR code image
    const qrCodeImage = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // 4. Upload to CDN
    const qrCodeUrl = await this.uploadToCDN(qrCodeImage);

    return {
      qr_code_data: qrData,
      qr_code_image: qrCodeImage, // Base64
      qr_code_url: qrCodeUrl,
      expires_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    };
  }

  private buildQRData(params: any): string {
    // Implement VietQR format
    const parts = [
      '000201', // Version
      '010212', // Transfer type
      this.buildBankInfo(params),
      `54${params.amount.toString().padStart(13, '0')}`,
      '5802VN', // Country
      this.buildAdditionalData(params)
    ];

    const data = parts.join('');
    const checksum = this.calculateCRC16(data);

    return `${data}6304${checksum}`;
  }

  private getBankBIN(bankCode: string): string {
    const bankBINs = {
      'VCB': '970436',
      'TCB': '970407',
      'BIDV': '970418',
      'CTG': '970415',
      'ACB': '970416',
      'MB': '970422',
      'VPB': '970432'
      // ... more banks
    };

    return bankBINs[bankCode] || throw new Error('Unsupported bank');
  }
}
```

---

## Payment Verification

### Webhook from Bank

```typescript
@Controller("webhooks/bank")
export class BankWebhookController {
  @Post("transfer-received")
  async handleTransferReceived(@Body() payload: BankWebhookPayload) {
    // 1. Verify webhook signature
    const isValid = this.verifySignature(payload);
    if (!isValid) {
      throw new UnauthorizedException("Invalid signature");
    }

    // 2. Extract transaction details
    const {
      bank_transaction_id,
      order_id,
      amount,
      sender_account,
      sender_name,
      description,
      timestamp,
    } = payload;

    // 3. Find pending transaction
    const transaction = await this.transactionService.findByOrderId(order_id);

    if (!transaction) {
      // Log unknown payment
      await this.logUnknownPayment(payload);
      return { success: false, message: "Transaction not found" };
    }

    if (transaction.status !== "PENDING") {
      // Already processed
      return { success: true, message: "Already processed" };
    }

    // 4. Verify amount
    if (amount !== transaction.amount) {
      await this.transactionService.updateStatus(transaction.id, "FAILED", {
        error: "Amount mismatch",
        expected: transaction.amount,
        received: amount,
      });

      // Alert admin for manual review
      await this.alertService.warning({
        title: "Bank Transfer Amount Mismatch",
        transaction_id: transaction.id,
        expected: transaction.amount,
        received: amount,
      });

      return { success: false, message: "Amount mismatch" };
    }

    // 5. Update transaction to SUCCESS
    await this.transactionService.updateStatus(transaction.id, "SUCCESS", {
      external_transaction_id: bank_transaction_id,
      sender_account,
      sender_name,
      received_at: new Date(timestamp),
    });

    // 6. Activate WiFi session
    const session = await this.sessionService.findByTransactionId(
      transaction.id,
    );
    if (session && session.status === "PENDING") {
      await this.sessionService.activate(session.id);
    }

    // 7. Notify user
    await this.notificationService.send({
      user_id: transaction.user_id,
      type: "PAYMENT_RECEIVED",
      message: "Payment received! Your WiFi is now active.",
    });

    return { success: true, message: "Payment processed" };
  }

  private verifySignature(payload: BankWebhookPayload): boolean {
    const signature = crypto
      .createHmac("sha256", process.env.BANK_WEBHOOK_SECRET)
      .update(JSON.stringify(payload.data))
      .digest("hex");

    return signature === payload.signature;
  }
}
```

### Polling (Fallback)

```typescript
// If webhook fails, poll bank API
class BankPaymentPollingService {
  async pollPayment(transactionId: string): Promise<void> {
    const transaction = await this.transactionService.findById(transactionId);

    if (transaction.status !== "PENDING") {
      return; // Already processed
    }

    // Check if expired (15 minutes)
    const expiresAt = transaction.created_at.getTime() + 15 * 60 * 1000;
    if (Date.now() > expiresAt) {
      await this.transactionService.updateStatus(transactionId, "EXPIRED");
      return;
    }

    // Poll bank API (if available)
    const payment = await this.bankApiService.checkPayment({
      order_id: transaction.order_id,
      amount: transaction.amount,
    });

    if (payment.received) {
      // Process payment
      await this.processPayment(transaction, payment);
    } else {
      // Schedule next poll (every 10 seconds)
      setTimeout(() => this.pollPayment(transactionId), 10000);
    }
  }
}
```

---

## UI/UX

### QR Code Display

```
┌─────────────────────────────────────────────────────────┐
│ Scan QR Code to Pay                              [✕]   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  ┌─────────────┐                        │
│                  │             │                        │
│                  │   QR CODE   │                        │
│                  │             │                        │
│                  │   [IMAGE]   │                        │
│                  │             │                        │
│                  └─────────────┘                        │
│                                                         │
│ Amount: 12,000 VND                                     │
│                                                         │
│ Instructions:                                          │
│ 1. Open your banking app                              │
│ 2. Scan this QR code                                  │
│ 3. Confirm the transfer                               │
│                                                         │
│ ⏱️ Expires in: 14:32                                   │
│                                                         │
│ ⏳ Waiting for payment...                              │
│                                                         │
│ [Cancel]                                               │
└─────────────────────────────────────────────────────────┘
```

### Payment Received

```
┌─────────────────────────────────────────────────────────┐
│                  ✅ Payment Received!                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Your bank transfer has been confirmed                  │
│                                                         │
│ Amount: 12,000 VND                                     │
│ From: Vietcombank ****1234                             │
│                                                         │
│ Your WiFi session is now active!                       │
│                                                         │
│ [Continue]                                             │
└─────────────────────────────────────────────────────────┘
```

---

## API Contracts

### Generate QR Code

```typescript
POST /api/payments/bank-qr/generate
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "package_id": "pkg_456",
  "amount": 12000
}

// Response
HTTP 200 OK
{
  "success": true,
  "transaction_id": "txn_abc123",
  "qr_code": {
    "data": "00020101021238...", // VietQR data
    "image": "data:image/png;base64,...", // Base64 image
    "url": "https://cdn.iwas.com/qr/txn_abc123.png",
    "expires_at": "2026-02-16T16:45:00Z"
  },
  "payment_details": {
    "bank": "Vietcombank",
    "account_number": "****1234",
    "account_name": "CONG TY IWAS",
    "amount": 12000,
    "description": "WiFi Package - Order #abc123"
  }
}
```

### Check Payment Status

```typescript
GET /api/payments/bank-qr/{transaction_id}/status
Authorization: Bearer {session_token}

// Response (Pending)
{
  "success": true,
  "status": "PENDING",
  "expires_at": "2026-02-16T16:45:00Z",
  "time_remaining": 850 // seconds
}

// Response (Success)
{
  "success": true,
  "status": "SUCCESS",
  "received_at": "2026-02-16T16:32:15Z",
  "sender_account": "****5678",
  "sender_name": "NGUYEN VAN A"
}

// Response (Expired)
{
  "success": false,
  "status": "EXPIRED",
  "message": "QR code has expired. Please generate a new one."
}
```

---

## Error Handling

```typescript
enum BankQRErrorCode {
  QR_GENERATION_FAILED = "QR_GENERATION_FAILED",
  QR_EXPIRED = "QR_EXPIRED",
  AMOUNT_MISMATCH = "AMOUNT_MISMATCH",
  WEBHOOK_VERIFICATION_FAILED = "WEBHOOK_VERIFICATION_FAILED",
  PAYMENT_TIMEOUT = "PAYMENT_TIMEOUT",
}

const ERROR_MESSAGES = {
  QR_GENERATION_FAILED: "Unable to generate QR code. Please try again.",
  QR_EXPIRED: "QR code has expired. Please generate a new one.",
  AMOUNT_MISMATCH: "Transfer amount does not match. Please contact support.",
  WEBHOOK_VERIFICATION_FAILED: "Invalid webhook signature.",
  PAYMENT_TIMEOUT: "Payment not received within 15 minutes.",
};
```

---

## Testing

```typescript
describe("Bank QR Payment", () => {
  it("should generate VietQR code", async () => {
    const result = await vietQRService.generate({
      bank_code: "VCB",
      account_number: "1234567890",
      account_name: "CONG TY IWAS",
      amount: 12000,
      description: "WiFi Package",
      order_id: "order_123",
    });

    expect(result.qr_code_data).toMatch(/^000201/);
    expect(result.qr_code_url).toBeDefined();
    expect(result.expires_at).toBeDefined();
  });

  it("should verify webhook signature", async () => {
    const payload = {
      data: {
        /* ... */
      },
      signature: "valid_signature",
    };

    const isValid = webhookController.verifySignature(payload);
    expect(isValid).toBe(true);
  });

  it("should handle amount mismatch", async () => {
    const webhook = {
      order_id: "order_123",
      amount: 10000, // Wrong amount
      // ...
    };

    await webhookController.handleTransferReceived(webhook);

    const transaction = await transactionService.findByOrderId("order_123");
    expect(transaction.status).toBe("FAILED");
  });
});
```

---

## Performance

**QR Generation:** < 500ms  
**Webhook Processing:** < 200ms  
**Payment Verification:** Real-time (webhook) or 10s (polling)

---

## Security

```typescript
// 1. Webhook signature verification
// 2. HTTPS only
// 3. QR code expiration (15 minutes)
// 4. Amount verification
// 5. Order ID uniqueness
// 6. Rate limiting on QR generation
// 7. Log all webhook events
```

---

## Related Documents

- [Multi-Payment Gateway](./multi-payment-gateway.md)
- [Payment Wallet](./payment-wallet.md)
- [Transaction Management](./transaction-management.md)

---

[← Back to Payments](./README.md) | [← Back to Features](../README.md)
