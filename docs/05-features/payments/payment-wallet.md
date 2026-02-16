# Payment Wallet Management

**Feature ID:** FR-10  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a customer, I want to save my payment methods for one-click purchases on future visits.

**Business Value:**

- **🎯 Killer Feature** - One-click purchase experience
- **⚡ Speed:** 15 seconds vs 1 minute (4x faster)
- **📈 Conversion:** 85% vs 60% (42% increase)
- **💰 Revenue:** Higher ARPU from repeat purchases
- **🔄 Retention:** Users return more often

**Impact:**

```
Without Wallet:
- First purchase: 60 seconds
- Return purchase: 60 seconds
- Conversion: 60%

With Wallet:
- First purchase: 60 seconds (one-time setup)
- Return purchase: 15 seconds ⚡
- Conversion: 85% 📈
- Repeat purchase rate: +300% 🚀
```

---

## User Flows

### First-Time User (Onboarding)

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
```

### Returning User (One-Click)

```
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
                   │ Pre-selected ✅  │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ 1-Click Purchase │
                   │ ⚡ 15 seconds    │
                   └────────┬─────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │ WiFi Activated!  │
                   └──────────────────┘
```

**Time Comparison:**

- First-time: ~60 seconds (includes payment setup)
- Returning: ~15 seconds (one-click!)
- **Improvement: 4x faster** ⚡

---

## Acceptance Criteria

### Link Payment Methods

- ✅ Link multiple payment methods:
  - **PC Account:** OAuth with PC system, store session token
  - **E-Wallet:** OAuth with Momo/ZaloPay/VNPay, store tokens
  - **Bank Account:** Save bank details for QR generation
- ✅ Each method must be verified:
  - PC Account: Balance check
  - E-Wallet: OAuth consent
  - Bank: Optional small transaction (1,000 VND)
- ✅ Support multiple methods of same type:
  - Multiple bank accounts
  - Multiple e-wallets
  - PC account + e-wallets + banks
- ✅ Display friendly names (user can customize)

### Set Default Payment Method

- ✅ User can set one method as default
- ✅ Default auto-selected at checkout
- ✅ User can change default anytime
- ✅ If default fails, prompt to select another
- ✅ Smart default selection (most used)

### Payment Method Management

- ✅ **View all linked methods** with:
  - Type icon and name
  - Masked credentials (\*\*\*\*1234)
  - Last used date
  - Status (active/inactive/expired)
  - Usage stats (total transactions, amount)
- ✅ **Edit payment method:**
  - Update display name
  - Re-verify if needed
  - Update credentials (re-authenticate)
- ✅ **Remove payment method:**
  - Soft delete (preserve history)
  - Cannot remove if only method
  - Confirm before deletion
  - Auto-select new default if removing current default
- ✅ **Reorder methods:**
  - Drag and drop
  - Most used appears first

### One-Click Purchase

- ✅ Default payment pre-selected
- ✅ Show balance/status:
  - PC Balance: "50,000 VND available"
  - E-Wallet: "Momo \*\*\*\*1234"
  - Bank: "Will generate QR code"
- ✅ Click "Pay" button:
  - PC Balance: Instant debit
  - E-Wallet: Use saved OAuth token
  - Bank: Generate QR code
- ✅ No credential re-entry
- ✅ Session activated immediately

### Security & Token Management

- ✅ **Encryption:**
  - All credentials encrypted at rest (AES-256)
  - Decrypt only when needed
  - Never log decrypted values
- ✅ **Token Refresh:**
  - E-wallet OAuth tokens auto-refresh
  - PC session tokens refreshed periodically
  - Prompt re-auth if refresh fails
- ✅ **Re-authentication:**
  - Required for:
    - Adding new payment method
    - Removing payment method
    - Large transactions (>100,000 VND)
    - After 24 hours inactivity
- ✅ **Biometric Support (Mobile):**
  - Face ID / Touch ID for quick re-auth
  - PIN code fallback
- ✅ **Session Timeout:**
  - Payment wallet session: 24 hours
  - Auto-logout on different device
  - Token rotation

---

## Data Model

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

---

## API Contracts

### Get Payment Wallet

```typescript
GET /api/wallet
Authorization: Bearer {session_token}

// Response
HTTP 200 OK
{
  "success": true,
  "wallet": {
    "id": "wallet_123",
    "default_payment_method_id": "pm_456",
    "payment_methods": [
      {
        "id": "pm_123",
        "type": "pc_balance",
        "display_name": "My PC Account",
        "icon_url": "https://cdn.iwas.com/icons/pc.png",
        "is_default": false,
        "is_verified": true,
        "is_active": true,
        "balance": 150000, // Only for PC balance
        "last_used_at": "2026-02-15T10:30:00Z",
        "total_transactions": 15,
        "total_amount_spent": 180000
      },
      {
        "id": "pm_456",
        "type": "momo",
        "display_name": "Momo (****4567)",
        "icon_url": "https://cdn.iwas.com/icons/momo.png",
        "is_default": true,
        "is_verified": true,
        "is_active": true,
        "last_used_at": "2026-02-16T14:20:00Z",
        "total_transactions": 8,
        "total_amount_spent": 96000
      },
      {
        "id": "pm_789",
        "type": "bank_account",
        "display_name": "Vietcombank (****1234)",
        "icon_url": "https://cdn.iwas.com/icons/vcb.png",
        "is_default": false,
        "is_verified": true,
        "is_active": true,
        "last_used_at": null,
        "total_transactions": 0,
        "total_amount_spent": 0
      }
    ]
  }
}
```

### Link PC Account

```typescript
POST /api/wallet/link/pc-account
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "pc_username": "user123",
  "pc_password": "password",
  "location_id": "loc_123"
}

// Response (Success)
HTTP 201 Created
{
  "success": true,
  "payment_method": {
    "id": "pm_new_123",
    "type": "pc_balance",
    "display_name": "PC Account (user123)",
    "is_verified": true,
    "balance": 150000
  }
}

// Response (Invalid Credentials)
HTTP 401 Unauthorized
{
  "success": false,
  "error_code": "INVALID_PC_CREDENTIALS",
  "message": "Invalid PC account credentials"
}

// Response (Already Linked)
HTTP 400 Bad Request
{
  "success": false,
  "error_code": "PC_ACCOUNT_ALREADY_LINKED",
  "message": "This PC account is already linked to your wallet"
}
```

### Link E-Wallet (OAuth Flow)

```typescript
// Step 1: Initiate OAuth
GET /api/wallet/link/ewallet/{provider}/oauth
  ?provider=momo|zalopay|vnpay
  &redirect_uri=https://wifi.icafe.com/wallet/callback

// Redirects to e-wallet OAuth consent screen

// Step 2: OAuth Callback
GET /api/wallet/link/ewallet/callback
  ?code={authorization_code}
  &state={state}
  &provider=momo

// Response
HTTP 201 Created
{
  "success": true,
  "payment_method": {
    "id": "pm_new_456",
    "type": "momo",
    "display_name": "Momo (****4567)",
    "is_verified": true,
    "phone": "098****567"
  }
}
```

### Link Bank Account

```typescript
POST /api/wallet/link/bank
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "bank_code": "VCB",
  "account_number": "1234567890",
  "account_name": "NGUYEN VAN A"
}

// Response
HTTP 201 Created
{
  "success": true,
  "payment_method": {
    "id": "pm_new_789",
    "type": "bank_account",
    "display_name": "Vietcombank (****7890)",
    "is_verified": false, // Requires verification
    "verification_required": true,
    "verification_amount": 1000 // VND
  },
  "message": "Please make a 1,000 VND transfer to verify your bank account"
}
```

### Set Default Payment Method

```typescript
PUT /api/wallet/default
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "payment_method_id": "pm_456"
}

// Response
HTTP 200 OK
{
  "success": true,
  "message": "Default payment method updated",
  "default_payment_method_id": "pm_456"
}
```

### Update Payment Method

```typescript
PUT /api/wallet/payment-methods/{payment_method_id}
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "display_name": "My Momo Wallet"
}

// Response
HTTP 200 OK
{
  "success": true,
  "payment_method": {
    "id": "pm_456",
    "display_name": "My Momo Wallet",
    "updated_at": "2026-02-16T16:00:00Z"
  }
}
```

### Remove Payment Method

```typescript
DELETE /api/wallet/payment-methods/{payment_method_id}
Authorization: Bearer {session_token}

// Response
HTTP 200 OK
{
  "success": true,
  "message": "Payment method removed successfully"
}

// Response (Cannot Remove Only Method)
HTTP 400 Bad Request
{
  "success": false,
  "error_code": "CANNOT_REMOVE_ONLY_METHOD",
  "message": "Cannot remove the only payment method. Please add another method first."
}

// Response (Cannot Remove Default)
HTTP 400 Bad Request
{
  "success": false,
  "error_code": "CANNOT_REMOVE_DEFAULT",
  "message": "Cannot remove default payment method. Please set another method as default first.",
  "default_payment_method_id": "pm_456"
}
```

---

## Implementation

### Backend (NestJS)

```typescript
@Controller("wallet")
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly pcApiService: PcApiService,
    private readonly ewalletService: EWalletService,
    private readonly encryptionService: EncryptionService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getWallet(@User() user) {
    const wallet = await this.walletService.findByUserId(user.id);
    const paymentMethods = await this.walletService.getPaymentMethods(
      wallet.id,
    );

    // Decrypt and format payment methods
    const formattedMethods = await Promise.all(
      paymentMethods.map(async (pm) => {
        const formatted = {
          id: pm.id,
          type: pm.type,
          display_name: pm.display_name,
          icon_url: pm.icon_url,
          is_default: pm.is_default,
          is_verified: pm.is_verified,
          is_active: pm.is_active,
          last_used_at: pm.last_used_at,
          total_transactions: pm.total_transactions,
          total_amount_spent: pm.total_amount_spent,
        };

        // Add balance for PC account
        if (pm.type === "pc_balance") {
          const credentials = await this.encryptionService.decrypt(
            pm.credentials,
          );
          const balance = await this.pcApiService.getBalance(
            credentials.pc_user_id,
          );
          formatted.balance = balance;
        }

        return formatted;
      }),
    );

    return {
      success: true,
      wallet: {
        id: wallet.id,
        default_payment_method_id: wallet.default_payment_method_id,
        payment_methods: formattedMethods,
      },
    };
  }

  @Post("link/pc-account")
  @UseGuards(AuthGuard)
  async linkPCAccount(@Body() dto: LinkPCAccountDto, @User() user) {
    // 1. Validate PC credentials
    const pcUser = await this.pcApiService.login({
      username: dto.pc_username,
      password: dto.pc_password,
      location_id: dto.location_id,
    });

    if (!pcUser.success) {
      throw new UnauthorizedException("Invalid PC account credentials");
    }

    // 2. Check if already linked
    const existing = await this.walletService.findPaymentMethod({
      user_id: user.id,
      type: "pc_balance",
      "credentials.pc_user_id": pcUser.user_id,
    });

    if (existing) {
      throw new BadRequestException("PC account already linked");
    }

    // 3. Encrypt credentials
    const encryptedCredentials = await this.encryptionService.encrypt({
      pc_user_id: pcUser.user_id,
      pc_session_token: pcUser.session_token,
    });

    // 4. Create payment method
    const paymentMethod = await this.walletService.createPaymentMethod({
      wallet_id: user.wallet_id,
      user_id: user.id,
      type: "pc_balance",
      display_name: `PC Account (${dto.pc_username})`,
      icon_url: "https://cdn.iwas.com/icons/pc.png",
      credentials: encryptedCredentials,
      is_verified: true,
      is_active: true,
      is_default: await this.walletService.isFirstMethod(user.wallet_id),
      metadata: {
        linked_at: new Date(),
        linked_ip: dto.ip_address,
        linked_device: dto.user_agent,
      },
    });

    // 5. Set as default if first method
    if (paymentMethod.is_default) {
      await this.walletService.setDefault(user.wallet_id, paymentMethod.id);
    }

    return {
      success: true,
      payment_method: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        display_name: paymentMethod.display_name,
        is_verified: paymentMethod.is_verified,
        balance: pcUser.balance,
      },
    };
  }

  @Put("default")
  @UseGuards(AuthGuard)
  async setDefault(@Body() dto: SetDefaultDto, @User() user) {
    // Validate payment method belongs to user
    const paymentMethod = await this.walletService.getPaymentMethod(
      dto.payment_method_id,
    );

    if (!paymentMethod || paymentMethod.user_id !== user.id) {
      throw new NotFoundException("Payment method not found");
    }

    if (!paymentMethod.is_active) {
      throw new BadRequestException(
        "Cannot set inactive payment method as default",
      );
    }

    // Update default
    await this.walletService.setDefault(user.wallet_id, dto.payment_method_id);

    return {
      success: true,
      message: "Default payment method updated",
      default_payment_method_id: dto.payment_method_id,
    };
  }

  @Delete("payment-methods/:id")
  @UseGuards(AuthGuard)
  async removePaymentMethod(@Param("id") id: string, @User() user) {
    const paymentMethod = await this.walletService.getPaymentMethod(id);

    if (!paymentMethod || paymentMethod.user_id !== user.id) {
      throw new NotFoundException("Payment method not found");
    }

    // Check if only method
    const methodCount = await this.walletService.countActiveMethods(
      user.wallet_id,
    );
    if (methodCount === 1) {
      throw new BadRequestException("Cannot remove the only payment method");
    }

    // Check if default
    if (paymentMethod.is_default) {
      throw new BadRequestException(
        "Cannot remove default payment method. Set another as default first.",
      );
    }

    // Soft delete
    await this.walletService.softDeletePaymentMethod(id);

    return {
      success: true,
      message: "Payment method removed successfully",
    };
  }
}
```

---

## Security Considerations

### Encryption

```typescript
class EncryptionService {
  private algorithm = "aes-256-gcm";
  private key = process.env.ENCRYPTION_KEY; // 32 bytes

  async encrypt(data: any): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return JSON.stringify({
      iv: iv.toString("hex"),
      encrypted,
      authTag: authTag.toString("hex"),
    });
  }

  async decrypt(encryptedData: string): Promise<any> {
    const { iv, encrypted, authTag } = JSON.parse(encryptedData);

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, "hex"),
    );

    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return JSON.parse(decrypted);
  }
}
```

### Token Refresh

```typescript
class TokenRefreshService {
  async refreshEWalletToken(paymentMethod: PaymentMethod): Promise<void> {
    const credentials = await this.encryptionService.decrypt(
      paymentMethod.credentials,
    );

    // Check if token expires soon (within 1 hour)
    const expiresIn = credentials.wallet_token_expires_at - Date.now();
    if (expiresIn > 3600000) {
      return; // Token still valid
    }

    // Refresh token
    const newTokens = await this.ewalletService.refreshToken({
      provider: paymentMethod.type,
      refresh_token: credentials.wallet_refresh_token,
    });

    // Update credentials
    const updatedCredentials = {
      ...credentials,
      wallet_access_token: newTokens.access_token,
      wallet_refresh_token: newTokens.refresh_token,
      wallet_token_expires_at: new Date(
        Date.now() + newTokens.expires_in * 1000,
      ),
    };

    await this.walletService.updateCredentials(
      paymentMethod.id,
      await this.encryptionService.encrypt(updatedCredentials),
    );
  }
}
```

---

## UI/UX Design

### Payment Wallet Screen

```
┌─────────────────────────────────────────────────────────┐
│ 💳 Payment Wallet                                 [+]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 💰 PC Account (user123)                    ⭐   │   │
│ │ Balance: 150,000 VND                             │   │
│ │ Last used: 2 hours ago                           │   │
│ │ 15 transactions • 180,000 VND total              │   │
│ │                                      [Edit] [✕]  │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 📱 Momo (****4567)                         ✓    │   │
│ │ Last used: Yesterday                             │   │
│ │ 8 transactions • 96,000 VND total                │   │
│ │                                      [Edit] [✕]  │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ ┌─────────────────────────────────────────────────┐   │
│ │ 🏦 Vietcombank (****1234)                       │   │
│ │ Never used                                       │   │
│ │ 0 transactions                                   │   │
│ │                                      [Edit] [✕]  │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ [+ Add Payment Method]                                 │
└─────────────────────────────────────────────────────────┘

Legend:
⭐ = Default payment method
✓ = Verified
```

---

## Testing

```typescript
describe("Payment Wallet", () => {
  describe("Link PC Account", () => {
    it("should link PC account successfully", async () => {
      const result = await request(app)
        .post("/api/wallet/link/pc-account")
        .send({
          pc_username: "user123",
          pc_password: "password",
          location_id: "loc_123",
        });

      expect(result.status).toBe(201);
      expect(result.body.payment_method.type).toBe("pc_balance");
      expect(result.body.payment_method.is_verified).toBe(true);
    });
  });

  describe("Set Default", () => {
    it("should set payment method as default", async () => {
      const result = await request(app)
        .put("/api/wallet/default")
        .send({ payment_method_id: "pm_456" });

      expect(result.status).toBe(200);
      expect(result.body.default_payment_method_id).toBe("pm_456");
    });
  });

  describe("Remove Payment Method", () => {
    it("should not allow removing only method", async () => {
      const result = await request(app).delete(
        "/api/wallet/payment-methods/pm_only",
      );

      expect(result.status).toBe(400);
      expect(result.body.error_code).toBe("CANNOT_REMOVE_ONLY_METHOD");
    });
  });
});
```

---

## Related Documents

- [Multi-Payment Gateway](./multi-payment-gateway.md)
- [PC Balance Payment](./pc-balance-payment.md)
- [E-Wallet Payment](./ewallet-payment.md)
- [User Journeys](../../03-users/user-journeys.md)
- [Package Selection](../packages/package-selection.md)

---

[← Back to Payments](./README.md) | [← Back to Features](../README.md)
