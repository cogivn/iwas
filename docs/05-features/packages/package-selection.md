# Package Selection & Purchase

**Feature ID:** FR-12  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a customer, I want to browse and purchase WiFi packages that fit my needs so that I can get online quickly.

**Business Value:**

- Primary revenue driver
- Seamless purchase experience
- High conversion rate
- Customer satisfaction

---

## User Flow

### First-Time User

```
1. User authenticated (Google OAuth or PC Account)
2. Redirected to package selection page
3. View available packages for current location
4. Compare packages (duration, price, speed)
5. Select package
6. Review order summary
   - Package details
   - Payment method (from wallet)
   - Total price
7. Click "Purchase" button
8. Process payment
9. WiFi session activated
10. Show confirmation screen
```

### Returning User (One-Click Purchase)

```
1. User authenticated (auto-recognized)
2. View packages
3. Default payment method pre-selected
4. Click "Purchase" on preferred package
5. WiFi activated instantly
6. Show confirmation
```

**Time:** ~15 seconds (vs ~1 minute for first-time)

---

## Acceptance Criteria

### Package Display

- ✅ Display all enabled packages for current location
- ✅ Show package details:
  - Name and description
  - Duration (hours/minutes)
  - Price (VND)
  - Speed (Mbps)
  - Badge (if any: "Popular", "Best Value")
- ✅ Highlight recommended package
- ✅ Show discount badge if promotional pricing
- ✅ Display user's current balance (if PC user)
- ✅ Sort packages by display_order
- ✅ Responsive design (mobile-first)

### Package Selection

- ✅ Click to select package
- ✅ Visual feedback on selection
- ✅ Show package comparison
- ✅ Display total price
- ✅ Show available payment methods
- ✅ Pre-select default payment method

### Purchase Flow

- ✅ Validate sufficient balance (PC users)
- ✅ Validate payment method is active
- ✅ Show order summary before purchase
- ✅ One-click purchase with saved payment
- ✅ Loading state during payment
- ✅ Error handling with clear messages
- ✅ Success confirmation with session details

### Post-Purchase

- ✅ Display WiFi session details:
  - Session ID
  - Duration remaining
  - Expiration time
  - Speed limit
  - Data usage (if applicable)
- ✅ Option to extend session
- ✅ View transaction receipt
- ✅ Email/SMS confirmation (optional)

---

## UI/UX Design

### Package Selection Screen

```
┌─────────────────────────────────────────────────────────┐
│ 📶 Choose Your WiFi Package                            │
│ Location: iCafe Central                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│ │ 1 Hour      │  │ 3 Hours ⭐  │  │ 6 Hours     │    │
│ │             │  │ BEST VALUE  │  │             │    │
│ │ 5,000 VND   │  │ 12,000 VND  │  │ 20,000 VND  │    │
│ │             │  │ Save 20%    │  │ Save 33%    │    │
│ │ 10 Mbps     │  │ 20 Mbps     │  │ 20 Mbps     │    │
│ │             │  │             │  │             │    │
│ │  [Select]   │  │  [Select]   │  │  [Select]   │    │
│ └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│ 💳 Payment Method                                      │
│ ● PC Account Balance (150,000 VND available)          │
│ ○ Momo (****4567)                                      │
│ ○ Bank QR Code                                         │
│ [+ Add Payment Method]                                 │
│                                                         │
│ [Purchase Selected Package]                            │
└─────────────────────────────────────────────────────────┘
```

### Order Summary Modal

```
┌─────────────────────────────────────────────────────────┐
│ 📋 Order Summary                                  [✕]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Package: 3 Hours WiFi                                  │
│ Duration: 180 minutes                                  │
│ Speed: Up to 20 Mbps                                   │
│                                                         │
│ Price: 12,000 VND                                      │
│ Discount: -                                            │
│ ─────────────────────────────────                      │
│ Total: 12,000 VND                                      │
│                                                         │
│ Payment Method:                                        │
│ PC Account Balance                                     │
│ New Balance: 138,000 VND                               │
│                                                         │
│ [Cancel]  [Confirm Purchase]                           │
└─────────────────────────────────────────────────────────┘
```

### Success Confirmation

```
┌─────────────────────────────────────────────────────────┐
│                    ✅ WiFi Activated!                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Your WiFi session is now active                        │
│                                                         │
│ Session Details:                                       │
│ • Duration: 3 hours                                    │
│ • Expires: Today at 7:30 PM                            │
│ • Speed: Up to 20 Mbps                                 │
│ • Device: iPhone 13 (****44:55)                        │
│                                                         │
│ [View Receipt]  [Done]                                 │
└─────────────────────────────────────────────────────────┘
```

---

## API Contracts

### Get Available Packages

```typescript
GET /api/packages/available?location_id={loc_id}
Authorization: Bearer {session_token}

// Response
HTTP 200 OK
{
  "success": true,
  "location": {
    "id": "loc_123",
    "name": "iCafe Central"
  },
  "packages": [
    {
      "id": "pkg_123",
      "name": "1 Hour WiFi",
      "description": "Quick session for browsing",
      "duration_minutes": 60,
      "price": 5000,
      "original_price": null,
      "bandwidth_limit_mbps": 10,
      "badge": null,
      "is_recommended": false,
      "display_order": 1,
      "available": true,
      "current_active_users": 5,
      "max_concurrent_users": 50
    },
    {
      "id": "pkg_456",
      "name": "3 Hours WiFi",
      "description": "Perfect for gaming and streaming",
      "duration_minutes": 180,
      "price": 12000,
      "original_price": null,
      "bandwidth_limit_mbps": 20,
      "badge": "Best Value",
      "is_recommended": true,
      "display_order": 2,
      "available": true,
      "current_active_users": 12,
      "max_concurrent_users": 50
    },
    {
      "id": "pkg_789",
      "name": "6 Hours WiFi",
      "description": "All-day connectivity",
      "duration_minutes": 360,
      "price": 20000,
      "original_price": null,
      "bandwidth_limit_mbps": 20,
      "badge": null,
      "is_recommended": false,
      "display_order": 3,
      "available": true,
      "current_active_users": 3,
      "max_concurrent_users": 50
    }
  ],
  "user_balance": 150000, // If PC user
  "payment_methods": [
    {
      "id": "pm_123",
      "type": "pc_balance",
      "display_name": "PC Account Balance",
      "is_default": true,
      "balance": 150000
    },
    {
      "id": "pm_456",
      "type": "momo",
      "display_name": "Momo (****4567)",
      "is_default": false
    }
  ]
}
```

### Purchase Package

```typescript
POST /api/packages/purchase
Authorization: Bearer {session_token}
Content-Type: application/json

{
  "package_id": "pkg_456",
  "payment_method_id": "pm_123", // Optional, use default if not provided
  "device_mac": "00:11:22:33:44:55",
  "location_id": "loc_123"
}

// Response (Success)
HTTP 200 OK
{
  "success": true,
  "transaction_id": "txn_abc123",
  "session": {
    "id": "sess_xyz789",
    "package_name": "3 Hours WiFi",
    "duration_minutes": 180,
    "started_at": "2026-02-16T16:30:00Z",
    "expires_at": "2026-02-16T19:30:00Z",
    "bandwidth_limit_mbps": 20,
    "device_mac": "00:11:22:33:44:55"
  },
  "payment": {
    "amount": 12000,
    "method": "pc_balance",
    "new_balance": 138000
  }
}

// Response (Insufficient Balance)
HTTP 400 Bad Request
{
  "success": false,
  "error_code": "INSUFFICIENT_BALANCE",
  "message": "Insufficient balance. Required: 12,000 VND, Available: 10,000 VND",
  "required_amount": 12000,
  "available_balance": 10000
}

// Response (Package Not Available)
HTTP 400 Bad Request
{
  "success": false,
  "error_code": "PACKAGE_NOT_AVAILABLE",
  "message": "This package is currently at maximum capacity",
  "current_users": 50,
  "max_users": 50
}

// Response (Payment Failed)
HTTP 400 Bad Request
{
  "success": false,
  "error_code": "PAYMENT_FAILED",
  "message": "Payment processing failed. Please try again or use a different payment method.",
  "payment_error": "PC API timeout"
}
```

### Get Purchase Receipt

```typescript
GET /api/transactions/{transaction_id}/receipt
Authorization: Bearer {session_token}

// Response
HTTP 200 OK
{
  "success": true,
  "receipt": {
    "transaction_id": "txn_abc123",
    "date": "2026-02-16T16:30:00Z",
    "location": "iCafe Central",
    "package": {
      "name": "3 Hours WiFi",
      "duration_minutes": 180,
      "price": 12000
    },
    "payment": {
      "method": "PC Account Balance",
      "amount": 12000,
      "status": "SUCCESS"
    },
    "session": {
      "id": "sess_xyz789",
      "started_at": "2026-02-16T16:30:00Z",
      "expires_at": "2026-02-16T19:30:00Z"
    }
  }
}
```

---

## Implementation

### Frontend (React/Next.js)

```typescript
// Package Selection Component
function PackageSelection() {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  async function loadPackages() {
    const response = await fetch('/api/packages/available');
    const data = await response.json();

    setPackages(data.packages);
    setPaymentMethods(data.payment_methods);

    // Pre-select default payment method
    const defaultPayment = data.payment_methods.find(pm => pm.is_default);
    setSelectedPayment(defaultPayment);
  }

  async function handlePurchase() {
    if (!selectedPackage || !selectedPayment) {
      toast.error('Please select a package and payment method');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/packages/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          payment_method_id: selectedPayment.id,
          device_mac: getDeviceMac(),
          location_id: getCurrentLocationId()
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Show success modal
      showSuccessModal(data.session);

      // Redirect to WiFi activated page
      router.push(`/session/${data.session.id}`);

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="package-selection">
      <h1>Choose Your WiFi Package</h1>

      <div className="packages-grid">
        {packages.map(pkg => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            selected={selectedPackage?.id === pkg.id}
            onSelect={() => setSelectedPackage(pkg)}
          />
        ))}
      </div>

      <PaymentMethodSelector
        methods={paymentMethods}
        selected={selectedPayment}
        onSelect={setSelectedPayment}
      />

      <button
        onClick={handlePurchase}
        disabled={!selectedPackage || loading}
        className="purchase-button"
      >
        {loading ? 'Processing...' : 'Purchase Selected Package'}
      </button>
    </div>
  );
}
```

### Backend (NestJS)

```typescript
@Controller("packages")
export class PackagesController {
  constructor(
    private readonly packageService: PackageService,
    private readonly paymentService: PaymentService,
    private readonly sessionService: SessionService,
  ) {}

  @Get("available")
  @UseGuards(AuthGuard)
  async getAvailablePackages(@Query() query: GetPackagesDto, @User() user) {
    const packages = await this.packageService.findAvailable(query.location_id);
    const paymentMethods = await this.paymentService.getUserPaymentMethods(
      user.id,
    );

    return {
      success: true,
      location: await this.getLocation(query.location_id),
      packages,
      user_balance: user.pc_user_id
        ? await this.getPCBalance(user.pc_user_id)
        : null,
      payment_methods: paymentMethods,
    };
  }

  @Post("purchase")
  @UseGuards(AuthGuard)
  async purchasePackage(@Body() dto: PurchasePackageDto, @User() user) {
    // 1. Validate package availability
    const package = await this.packageService.findById(dto.package_id);
    if (!package || !package.enabled) {
      throw new BadRequestException("Package not available");
    }

    // 2. Check concurrent user limit
    if (package.max_concurrent_users) {
      const activeUsers = await this.sessionService.countActiveUsers(
        dto.package_id,
      );
      if (activeUsers >= package.max_concurrent_users) {
        throw new BadRequestException("Package at maximum capacity");
      }
    }

    // 3. Get payment method
    const paymentMethod = dto.payment_method_id
      ? await this.paymentService.getPaymentMethod(dto.payment_method_id)
      : await this.paymentService.getDefaultPaymentMethod(user.id);

    if (!paymentMethod) {
      throw new BadRequestException("No payment method available");
    }

    // 4. Process payment
    const transaction = await this.paymentService.processPayment({
      user_id: user.id,
      package_id: package.id,
      amount: package.price,
      payment_method: paymentMethod,
    });

    if (transaction.status !== "SUCCESS") {
      throw new BadRequestException("Payment failed");
    }

    // 5. Create WiFi session
    const session = await this.sessionService.create({
      user_id: user.id,
      package_id: package.id,
      location_id: dto.location_id,
      device_mac: dto.device_mac,
      duration_minutes: package.duration_minutes,
      bandwidth_limit_mbps: package.bandwidth_limit_mbps,
    });

    // 6. Activate session via RADIUS
    await this.radiusService.activateSession(session);

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
      },
      payment: {
        amount: transaction.amount,
        method: paymentMethod.type,
        new_balance: transaction.new_balance,
      },
    };
  }
}
```

---

## Error Handling

```typescript
// Error Codes
enum PurchaseErrorCode {
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  PACKAGE_NOT_AVAILABLE = "PACKAGE_NOT_AVAILABLE",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  SESSION_LIMIT_REACHED = "SESSION_LIMIT_REACHED",
  INVALID_PAYMENT_METHOD = "INVALID_PAYMENT_METHOD",
  DEVICE_ALREADY_ACTIVE = "DEVICE_ALREADY_ACTIVE",
}

// User-friendly error messages
const ERROR_MESSAGES = {
  INSUFFICIENT_BALANCE:
    "Insufficient balance. Please top up your account or use a different payment method.",
  PACKAGE_NOT_AVAILABLE:
    "This package is currently unavailable. Please try another package.",
  PAYMENT_FAILED:
    "Payment processing failed. Please try again or contact support.",
  SESSION_LIMIT_REACHED:
    "You have reached the maximum number of active sessions.",
  INVALID_PAYMENT_METHOD: "Selected payment method is invalid or expired.",
  DEVICE_ALREADY_ACTIVE: "This device already has an active session.",
};
```

---

## Analytics & Tracking

```typescript
// Track package views
analytics.track("Package Viewed", {
  package_id: pkg.id,
  package_name: pkg.name,
  price: pkg.price,
  location_id: locationId,
});

// Track package selection
analytics.track("Package Selected", {
  package_id: pkg.id,
  package_name: pkg.name,
  price: pkg.price,
});

// Track purchase attempt
analytics.track("Purchase Attempted", {
  package_id: pkg.id,
  payment_method: paymentMethod.type,
});

// Track purchase success
analytics.track("Purchase Completed", {
  package_id: pkg.id,
  transaction_id: txn.id,
  amount: pkg.price,
  payment_method: paymentMethod.type,
  time_to_purchase: Date.now() - startTime,
});

// Track purchase failure
analytics.track("Purchase Failed", {
  package_id: pkg.id,
  error_code: error.code,
  error_message: error.message,
});
```

---

## Performance Optimization

- **Package List Caching:** Cache for 5 minutes
- **Payment Method Caching:** Cache for 1 hour
- **Optimistic UI Updates:** Show loading state immediately
- **Lazy Load Images:** Load package icons on demand
- **Prefetch Payment Methods:** Load in background after authentication

---

## Testing

```typescript
describe("Package Purchase", () => {
  it("should complete purchase successfully", async () => {
    const result = await request(app.getHttpServer())
      .post("/api/packages/purchase")
      .send({
        package_id: "pkg_456",
        payment_method_id: "pm_123",
        device_mac: "00:11:22:33:44:55",
        location_id: "loc_123",
      });

    expect(result.status).toBe(200);
    expect(result.body.success).toBe(true);
    expect(result.body.session).toBeDefined();
  });

  it("should reject purchase with insufficient balance", async () => {
    // Mock insufficient balance
    mockPCAPI.getBalance.mockResolvedValue(5000);

    const result = await request(app.getHttpServer())
      .post("/api/packages/purchase")
      .send({
        package_id: "pkg_456", // 12,000 VND
        payment_method_id: "pm_123",
        device_mac: "00:11:22:33:44:55",
        location_id: "loc_123",
      });

    expect(result.status).toBe(400);
    expect(result.body.error_code).toBe("INSUFFICIENT_BALANCE");
  });
});
```

---

## Related Documents

- [Package Management](./package-management.md)
- [Payment Wallet](../payments/payment-wallet.md)
- [Session Lifecycle](../sessions/session-lifecycle.md)
- [User Journeys](../../03-users/user-journeys.md)
- [Success Metrics](../../01-overview/success-metrics.md)

---

[← Back to Packages](./README.md) | [← Back to Features](../README.md)
