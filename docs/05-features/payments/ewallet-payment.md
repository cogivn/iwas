# E-Wallet Payment (Momo, ZaloPay, VNPay)

**Feature ID:** FR-07  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a customer without PC account, I want to pay using my e-wallet (Momo/ZaloPay/VNPay) for convenient cashless payment.

**Business Value:**

- **Market coverage:** 25% of users
- **Modern payment:** Appeal to younger users
- **No cash handling:** Fully digital
- **Brand trust:** Leverage popular e-wallets

**Supported E-Wallets:**

| E-Wallet    | Market Share | Users | Integration     |
| ----------- | ------------ | ----- | --------------- |
| **Momo**    | 15%          | ~30M  | OAuth 2.0 + API |
| **ZaloPay** | 7%           | ~15M  | OAuth 2.0 + API |
| **VNPay**   | 3%           | ~10M  | OAuth 2.0 + API |

---

## OAuth Flow

### Link E-Wallet to Payment Wallet

```
┌─────────────────────────────────────────────────────────────┐
│                    E-WALLET OAUTH FLOW                       │
└─────────────────────────────────────────────────────────────┘

User clicks "Link Momo"
    ↓
IWAS redirects to Momo OAuth
    ↓
┌──────────────────────────────────┐
│ Momo OAuth Consent Screen        │
│                                  │
│ IWAS wants to:                   │
│ ✓ View your profile              │
│ ✓ Check your balance             │
│ ✓ Make payments on your behalf   │
│                                  │
│ [Cancel] [Allow]                 │
└──────────────────────────────────┘
    ↓
User clicks "Allow"
    ↓
Momo redirects back with code
    ↓
IWAS exchanges code for tokens
    ↓
Store encrypted tokens
    ↓
E-Wallet linked! ✅
```

---

## API Integration

### 1. Initiate OAuth

```typescript
GET /api/wallet/link/ewallet/momo/oauth
  ?redirect_uri=https://wifi.icafe.com/wallet/callback

// Redirects to Momo OAuth
https://oauth.momo.vn/authorize
  ?client_id={client_id}
  &redirect_uri=https://wifi.icafe.com/wallet/callback
  &response_type=code
  &scope=profile,balance,payment
  &state={random_state}
```

### 2. OAuth Callback

```typescript
// Momo redirects back
GET /api/wallet/link/ewallet/callback
  ?code=AUTH_CODE_123
  &state=RANDOM_STATE

// Exchange code for tokens
POST https://oauth.momo.vn/token
{
  "grant_type": "authorization_code",
  "code": "AUTH_CODE_123",
  "client_id": "{client_id}",
  "client_secret": "{client_secret}",
  "redirect_uri": "https://wifi.icafe.com/wallet/callback"
}

// Response
{
  "access_token": "ACCESS_TOKEN_ABC",
  "refresh_token": "REFRESH_TOKEN_XYZ",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "profile,balance,payment"
}
```

### 3. Get User Profile

```typescript
GET https://api.momo.vn/v1/user/profile
Authorization: Bearer {access_token}

// Response
{
  "user_id": "momo_user_123",
  "phone": "0987654321",
  "name": "Nguyen Van A",
  "avatar": "https://cdn.momo.vn/avatar/123.jpg"
}
```

### 4. Charge E-Wallet

```typescript
POST https://api.momo.vn/v1/payments/charge
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "amount": 12000,
  "currency": "VND",
  "description": "WiFi Package: 3 Hours",
  "order_id": "wifi_order_123",
  "return_url": "https://wifi.icafe.com/payment/success"
}

// Response (Success)
{
  "success": true,
  "transaction_id": "momo_txn_789",
  "status": "SUCCESS",
  "amount": 12000,
  "fee": 180, // 1.5% fee
  "net_amount": 11820
}

// Response (Insufficient Balance)
{
  "success": false,
  "error_code": "INSUFFICIENT_BALANCE",
  "message": "Số dư không đủ"
}
```

---

## Token Management

### Token Refresh

```typescript
class EWalletTokenService {
  async refreshToken(paymentMethod: PaymentMethod): Promise<void> {
    const credentials = await this.decrypt(paymentMethod.credentials);

    // Check if token expires soon (within 1 hour)
    const expiresIn = credentials.wallet_token_expires_at - Date.now();
    if (expiresIn > 3600000) {
      return; // Still valid
    }

    // Refresh token
    const response = await this.httpClient.post(
      `https://oauth.${paymentMethod.type}.vn/token`,
      {
        grant_type: "refresh_token",
        refresh_token: credentials.wallet_refresh_token,
        client_id: process.env[`${paymentMethod.type.toUpperCase()}_CLIENT_ID`],
        client_secret:
          process.env[`${paymentMethod.type.toUpperCase()}_CLIENT_SECRET`],
      },
    );

    // Update credentials
    await this.walletService.updateCredentials(paymentMethod.id, {
      wallet_access_token: response.access_token,
      wallet_refresh_token: response.refresh_token,
      wallet_token_expires_at: new Date(
        Date.now() + response.expires_in * 1000,
      ),
    });
  }
}
```

### Token Expiry Handling

```typescript
async function chargeEWallet(request: ChargeRequest): Promise<ChargeResponse> {
  try {
    // Try to charge
    return await ewalletAPI.charge(request);
  } catch (error) {
    if (error.code === "TOKEN_EXPIRED") {
      // Refresh token and retry
      await tokenService.refreshToken(request.payment_method);
      return await ewalletAPI.charge(request);
    }

    if (error.code === "REFRESH_TOKEN_EXPIRED") {
      // Need user to re-authorize
      await walletService.markAsExpired(request.payment_method.id);
      throw new UnauthorizedException(
        "E-wallet authorization expired. Please re-link.",
      );
    }

    throw error;
  }
}
```

---

## Fee Structure

```typescript
interface EWalletFees {
  momo: {
    percentage: 1.5; // 1.5%
    min: 100; // Minimum 100 VND
    max: 5000; // Maximum 5,000 VND
  };
  zalopay: {
    percentage: 1.8;
    min: 100;
    max: 5000;
  };
  vnpay: {
    percentage: 2.0;
    min: 100;
    max: 5000;
  };
}

function calculateFee(amount: number, provider: string): number {
  const config = EWalletFees[provider];
  const fee = Math.ceil(amount * (config.percentage / 100));

  return Math.max(config.min, Math.min(fee, config.max));
}

// Examples:
calculateFee(12000, "momo"); // 180 VND (1.5%)
calculateFee(5000, "momo"); // 100 VND (min)
calculateFee(500000, "momo"); // 5000 VND (max)
```

---

## Implementation

```typescript
@Injectable()
export class EWalletService {
  private providers = {
    momo: {
      oauth_url: "https://oauth.momo.vn",
      api_url: "https://api.momo.vn/v1",
      client_id: process.env.MOMO_CLIENT_ID,
      client_secret: process.env.MOMO_CLIENT_SECRET,
    },
    zalopay: {
      oauth_url: "https://oauth.zalopay.vn",
      api_url: "https://api.zalopay.vn/v1",
      client_id: process.env.ZALOPAY_CLIENT_ID,
      client_secret: process.env.ZALOPAY_CLIENT_SECRET,
    },
    vnpay: {
      oauth_url: "https://oauth.vnpay.vn",
      api_url: "https://api.vnpay.vn/v1",
      client_id: process.env.VNPAY_CLIENT_ID,
      client_secret: process.env.VNPAY_CLIENT_SECRET,
    },
  };

  async charge(request: EWalletChargeRequest): Promise<ChargeResponse> {
    const provider = this.providers[request.provider];

    // Refresh token if needed
    await this.refreshTokenIfNeeded(request.payment_method);

    // Get fresh credentials
    const credentials = await this.decrypt(request.payment_method.credentials);

    // Call e-wallet API
    const response = await this.httpClient.post(
      `${provider.api_url}/payments/charge`,
      {
        amount: request.amount,
        currency: "VND",
        description: request.description,
        order_id: request.idempotency_key,
      },
      {
        headers: {
          Authorization: `Bearer ${credentials.wallet_access_token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.success) {
      return {
        success: false,
        transaction_id: null,
        status: "FAILED",
        error_code: response.error_code,
        error_message: response.message,
        amount: request.amount,
        net_amount: 0,
      };
    }

    // Calculate fee
    const fee = this.calculateFee(request.amount, request.provider);

    return {
      success: true,
      transaction_id: response.transaction_id,
      status: "SUCCESS",
      amount: request.amount,
      fee: fee,
      net_amount: request.amount - fee,
    };
  }
}
```

---

## UI/UX

### Link E-Wallet Screen

```
┌─────────────────────────────────────────────────────────┐
│ Link E-Wallet                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Choose your e-wallet:                                  │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📱 Momo                                    [Link]│   │
│ │ Most popular • 30M users                        │   │
│ │ Fee: 1.5%                                       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 💙 ZaloPay                                 [Link]│   │
│ │ Integrated with Zalo • 15M users                │   │
│ │ Fee: 1.8%                                       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🏦 VNPay                                   [Link]│   │
│ │ Bank integration • 10M users                    │   │
│ │ Fee: 2.0%                                       │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Payment with E-Wallet

```
┌─────────────────────────────────────────────────────────┐
│ Payment Summary                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Package: 3 Hours WiFi                                  │
│ Price: 12,000 VND                                      │
│                                                         │
│ Payment Method:                                        │
│ 📱 Momo (****4567)                                     │
│                                                         │
│ ─────────────────────────────────                      │
│ Subtotal:        12,000 VND                            │
│ Fee (1.5%):         180 VND                            │
│ ─────────────────────────────────                      │
│ Total:           12,180 VND                            │
│                                                         │
│ [Cancel]  [Confirm Payment]                            │
└─────────────────────────────────────────────────────────┘
```

---

## Error Handling

```typescript
enum EWalletErrorCode {
  INSUFFICIENT_BALANCE = "EWALLET_INSUFFICIENT_BALANCE",
  TOKEN_EXPIRED = "EWALLET_TOKEN_EXPIRED",
  REFRESH_TOKEN_EXPIRED = "EWALLET_REFRESH_TOKEN_EXPIRED",
  PAYMENT_DECLINED = "EWALLET_PAYMENT_DECLINED",
  API_ERROR = "EWALLET_API_ERROR",
  RATE_LIMIT = "EWALLET_RATE_LIMIT",
}

const ERROR_MESSAGES = {
  EWALLET_INSUFFICIENT_BALANCE: "E-wallet balance insufficient. Please top up.",
  EWALLET_TOKEN_EXPIRED: "E-wallet connection expired. Re-linking...",
  EWALLET_REFRESH_TOKEN_EXPIRED: "Please re-link your e-wallet.",
  EWALLET_PAYMENT_DECLINED:
    "Payment declined by e-wallet. Please try another method.",
  EWALLET_API_ERROR: "E-wallet service temporarily unavailable.",
  EWALLET_RATE_LIMIT: "Too many requests. Please wait a moment.",
};
```

---

## Testing

```typescript
describe("E-Wallet Payment", () => {
  describe("Momo", () => {
    it("should charge Momo successfully", async () => {
      const result = await ewalletService.charge({
        provider: "momo",
        amount: 12000,
        payment_method: momoPaymentMethod,
      });

      expect(result.success).toBe(true);
      expect(result.fee).toBe(180); // 1.5%
      expect(result.net_amount).toBe(11820);
    });

    it("should refresh expired token", async () => {
      // Mock expired token
      mockTokenService.isExpired.mockReturnValue(true);

      const result = await ewalletService.charge({
        provider: "momo",
        amount: 12000,
        payment_method: momoPaymentMethod,
      });

      expect(mockTokenService.refresh).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
```

---

## Security

### OAuth Best Practices

```typescript
// 1. Use state parameter to prevent CSRF
const state = crypto.randomBytes(32).toString("hex");
await redis.set(`oauth_state:${state}`, user.id, "EX", 600); // 10 min

// 2. Validate state on callback
const userId = await redis.get(`oauth_state:${state}`);
if (!userId) {
  throw new UnauthorizedException("Invalid OAuth state");
}

// 3. Encrypt tokens at rest
const encryptedTokens = await encryptionService.encrypt({
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token,
});

// 4. Use HTTPS only
// 5. Implement token rotation
// 6. Log all OAuth events
```

---

## Performance

**Target:** < 1 second  
**Breakdown:**

- Token refresh (if needed): 300ms
- E-wallet API call: 500ms
- Update database: 100ms
- Response: 50ms

**Total:** ~950ms ✅

---

## Related Documents

- [Multi-Payment Gateway](./multi-payment-gateway.md)
- [Payment Wallet](./payment-wallet.md)
- [Transaction Management](./transaction-management.md)

---

[← Back to Payments](./README.md) | [← Back to Features](../README.md)
