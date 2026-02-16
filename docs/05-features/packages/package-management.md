# Package Management

**Feature ID:** FR-11  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a location manager, I want to create and manage WiFi packages with different pricing and durations so that I can offer flexible options to customers.

**Business Value:**

- Flexible pricing strategies
- Location-specific offerings
- Revenue optimization
- Competitive positioning

---

## Package Types

### 1. Time-Based Packages (MVP)

**Standard Packages:**

- **1 Hour** - Quick session (5,000 VND)
- **3 Hours** - Most popular (12,000 VND) ⭐ Recommended
- **6 Hours** - Power users (20,000 VND)

**Custom Packages:**

- Any duration (15 min - 24 hours)
- Custom pricing
- Special events/promotions

### 2. Data-Based Packages (Future - Phase 3)

- 1 GB, 3 GB, 5 GB, Unlimited
- Rollover unused data
- Shared data pools

### 3. Speed Tiers (Future - Phase 3)

- **Standard:** 10 Mbps (base price)
- **Fast:** 20 Mbps (+30%)
- **Ultra:** 50 Mbps (+50%)

---

## Acceptance Criteria

### Package Creation

- ✅ Create time-based packages (1h, 3h, 6h, custom)
- ✅ Set price per package (VND)
- ✅ Location-specific packages
- ✅ Set bandwidth limit (optional)
- ✅ Set package description
- ✅ Upload package icon (optional)
- ✅ Set display order

### Package Configuration

- ✅ Enable/disable packages
- ✅ Set visibility (public/hidden)
- ✅ Set availability schedule (e.g., peak hours only)
- ✅ Set purchase limits (max per user per day)
- ✅ Set stock limits (max concurrent users)

### Package Templates

- ✅ Pre-defined templates for quick setup
- ✅ Clone packages across locations
- ✅ Bulk create packages
- ✅ Import/export package configurations

### Pricing Strategies

- ✅ Base pricing
- ✅ Promotional pricing (time-limited)
- ✅ Dynamic pricing (peak/off-peak) - Future
- ✅ Bundle pricing (PC + WiFi) - Future
- ✅ Loyalty discounts - Future

---

## Data Model

```typescript
interface WiFiPackage {
  id: string;
  location_id: string;

  // Basic Info
  name: string;
  description?: string;
  icon_url?: string;

  // Package Type
  type: "time_based" | "data_based" | "unlimited";

  // Time-Based
  duration_minutes?: number;

  // Data-Based (Future)
  data_limit_mb?: number;

  // Pricing
  price: number;
  currency: "VND";
  original_price?: number; // For showing discounts

  // Network
  bandwidth_limit_mbps?: number; // e.g., 10, 20, 50

  // Availability
  enabled: boolean;
  visible: boolean;
  available_from?: Date; // Schedule availability
  available_until?: Date;

  // Limits
  max_purchases_per_user_per_day?: number;
  max_concurrent_users?: number;
  current_active_users?: number;

  // Display
  display_order: number;
  is_recommended: boolean;
  badge?: string; // "Popular", "Best Value", "New"

  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // Soft delete
}

interface PackageTemplate {
  id: string;
  name: string;
  description: string;
  packages: Partial<WiFiPackage>[];
  category: "standard" | "premium" | "promotional";
  created_at: Date;
}
```

---

## API Contracts

### Create Package

```typescript
POST /api/admin/packages
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "location_id": "loc_123",
  "name": "3 Hours WiFi",
  "description": "Perfect for gaming and streaming",
  "type": "time_based",
  "duration_minutes": 180,
  "price": 12000,
  "bandwidth_limit_mbps": 20,
  "enabled": true,
  "visible": true,
  "is_recommended": true,
  "display_order": 2
}

// Response
HTTP 201 Created
{
  "success": true,
  "package": {
    "id": "pkg_abc123",
    "location_id": "loc_123",
    "name": "3 Hours WiFi",
    "duration_minutes": 180,
    "price": 12000,
    "created_at": "2026-02-16T10:00:00Z"
  }
}
```

### List Packages

```typescript
GET /api/admin/packages?location_id={loc_id}&include_disabled=false
Authorization: Bearer {admin_token}

// Response
HTTP 200 OK
{
  "success": true,
  "packages": [
    {
      "id": "pkg_123",
      "name": "1 Hour WiFi",
      "duration_minutes": 60,
      "price": 5000,
      "enabled": true,
      "visible": true,
      "current_active_users": 5,
      "max_concurrent_users": 50
    },
    {
      "id": "pkg_456",
      "name": "3 Hours WiFi",
      "duration_minutes": 180,
      "price": 12000,
      "enabled": true,
      "visible": true,
      "is_recommended": true,
      "current_active_users": 12,
      "max_concurrent_users": 50
    }
  ],
  "total": 2
}
```

### Update Package

```typescript
PUT /api/admin/packages/{package_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "price": 10000, // Promotional price
  "original_price": 12000,
  "badge": "SALE 20%",
  "available_until": "2026-02-28T23:59:59Z"
}

// Response
HTTP 200 OK
{
  "success": true,
  "package": {
    "id": "pkg_456",
    "price": 10000,
    "original_price": 12000,
    "badge": "SALE 20%",
    "updated_at": "2026-02-16T10:30:00Z"
  }
}
```

### Delete Package

```typescript
DELETE /api/admin/packages/{package_id}
Authorization: Bearer {admin_token}

// Response
HTTP 200 OK
{
  "success": true,
  "message": "Package deleted successfully"
}
```

### Bulk Operations

```typescript
POST /api/admin/packages/bulk
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "action": "enable" | "disable" | "delete",
  "package_ids": ["pkg_123", "pkg_456", "pkg_789"]
}

// Response
HTTP 200 OK
{
  "success": true,
  "affected_count": 3
}
```

### Clone Package

```typescript
POST /api/admin/packages/{package_id}/clone
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "target_location_ids": ["loc_456", "loc_789"],
  "adjust_pricing": true,
  "price_multiplier": 1.1 // 10% increase
}

// Response
HTTP 201 Created
{
  "success": true,
  "created_packages": [
    {
      "id": "pkg_new_1",
      "location_id": "loc_456",
      "name": "3 Hours WiFi",
      "price": 13200 // 12000 * 1.1
    },
    {
      "id": "pkg_new_2",
      "location_id": "loc_789",
      "name": "3 Hours WiFi",
      "price": 13200
    }
  ]
}
```

---

## Package Templates

### Standard Template

```typescript
{
  "name": "Standard WiFi Packages",
  "packages": [
    {
      "name": "1 Hour WiFi",
      "duration_minutes": 60,
      "price": 5000,
      "bandwidth_limit_mbps": 10,
      "display_order": 1
    },
    {
      "name": "3 Hours WiFi",
      "duration_minutes": 180,
      "price": 12000,
      "bandwidth_limit_mbps": 20,
      "is_recommended": true,
      "badge": "Best Value",
      "display_order": 2
    },
    {
      "name": "6 Hours WiFi",
      "duration_minutes": 360,
      "price": 20000,
      "bandwidth_limit_mbps": 20,
      "display_order": 3
    }
  ]
}
```

### Premium Template

```typescript
{
  "name": "Premium WiFi Packages",
  "packages": [
    {
      "name": "3 Hours Ultra",
      "duration_minutes": 180,
      "price": 18000,
      "bandwidth_limit_mbps": 50,
      "badge": "ULTRA FAST",
      "display_order": 1
    },
    {
      "name": "6 Hours Ultra",
      "duration_minutes": 360,
      "price": 30000,
      "bandwidth_limit_mbps": 50,
      "badge": "ULTRA FAST",
      "display_order": 2
    }
  ]
}
```

---

## Pricing Strategies

### 1. Base Pricing (MVP)

```typescript
// Volume discount
1 hour: 5,000 VND (5,000 VND/hour)
3 hours: 12,000 VND (4,000 VND/hour) - 20% discount
6 hours: 20,000 VND (3,333 VND/hour) - 33% discount
```

**Rationale:**

- Encourage longer sessions
- Better value for regular users
- Competitive with mobile data

### 2. Promotional Pricing

```typescript
{
  "package_id": "pkg_123",
  "original_price": 12000,
  "promotional_price": 10000,
  "discount_percentage": 17,
  "badge": "SALE 17%",
  "available_from": "2026-02-16T00:00:00Z",
  "available_until": "2026-02-28T23:59:59Z"
}
```

### 3. Dynamic Pricing (Future - Phase 3)

```typescript
interface DynamicPricing {
  package_id: string;
  rules: [
    {
      name: "Peak Hours";
      condition: "hour >= 18 && hour <= 23";
      price_multiplier: 1.2; // +20%
    },
    {
      name: "Weekend";
      condition: "dayOfWeek in [6, 7]";
      price_multiplier: 1.1; // +10%
    },
    {
      name: "Off-Peak Discount";
      condition: "hour >= 9 && hour <= 17";
      price_multiplier: 0.8; // -20%
    },
  ];
}
```

### 4. Bundle Pricing (Future - Phase 3)

```typescript
{
  "name": "PC + WiFi Combo",
  "items": [
    {
      "type": "pc_rental",
      "duration_minutes": 180,
      "price": 30000
    },
    {
      "type": "wifi_package",
      "duration_minutes": 180,
      "price": 12000
    }
  ],
  "bundle_price": 40000, // Save 2,000 VND
  "discount": 2000,
  "discount_percentage": 5
}
```

---

## Validation Rules

```typescript
class PackageValidator {
  validate(package: WiFiPackage): ValidationResult {
    const errors = [];

    // Name
    if (!package.name || package.name.length < 3) {
      errors.push("Name must be at least 3 characters");
    }
    if (package.name.length > 100) {
      errors.push("Name cannot exceed 100 characters");
    }

    // Duration
    if (package.type === "time_based") {
      if (!package.duration_minutes || package.duration_minutes < 15) {
        errors.push("Duration must be at least 15 minutes");
      }
      if (package.duration_minutes > 1440) {
        errors.push("Duration cannot exceed 24 hours");
      }
    }

    // Price
    if (!package.price || package.price < 1000) {
      errors.push("Price must be at least 1,000 VND");
    }
    if (package.price > 1000000) {
      errors.push("Price cannot exceed 1,000,000 VND");
    }

    // Bandwidth
    if (package.bandwidth_limit_mbps) {
      if (
        package.bandwidth_limit_mbps < 1 ||
        package.bandwidth_limit_mbps > 100
      ) {
        errors.push("Bandwidth must be between 1-100 Mbps");
      }
    }

    // Promotional pricing
    if (package.original_price && package.original_price <= package.price) {
      errors.push("Original price must be higher than promotional price");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

---

## Security & Permissions

**RBAC Requirements:**

| Action          | Super Admin | Location Manager   | Operator          | Customer         |
| --------------- | ----------- | ------------------ | ----------------- | ---------------- |
| Create Package  | ✅          | ✅ (own location)  | ❌                | ❌               |
| Edit Package    | ✅          | ✅ (own location)  | ❌                | ❌               |
| Delete Package  | ✅          | ✅ (own location)  | ❌                | ❌               |
| View Packages   | ✅          | ✅ (own location)  | ✅ (own location) | ✅ (public only) |
| Clone Package   | ✅          | ✅ (own locations) | ❌                | ❌               |
| Bulk Operations | ✅          | ✅ (own location)  | ❌                | ❌               |

---

## Testing

```typescript
describe("Package Management", () => {
  describe("Create Package", () => {
    it("should create package with valid data", async () => {
      const package = await packageService.create({
        location_id: "loc_123",
        name: "3 Hours WiFi",
        duration_minutes: 180,
        price: 12000,
      });

      expect(package.id).toBeDefined();
      expect(package.name).toBe("3 Hours WiFi");
      expect(package.price).toBe(12000);
    });

    it("should reject invalid duration", async () => {
      await expect(
        packageService.create({
          location_id: "loc_123",
          name: "Invalid Package",
          duration_minutes: 5, // Too short
          price: 12000,
        }),
      ).rejects.toThrow("Duration must be at least 15 minutes");
    });

    it("should reject invalid price", async () => {
      await expect(
        packageService.create({
          location_id: "loc_123",
          name: "Cheap Package",
          duration_minutes: 60,
          price: 500, // Too low
        }),
      ).rejects.toThrow("Price must be at least 1,000 VND");
    });
  });

  describe("Pricing Calculations", () => {
    it("should calculate correct price per hour", () => {
      const package = {
        duration_minutes: 180,
        price: 12000,
      };

      const pricePerHour = (package.price / package.duration_minutes) * 60;
      expect(pricePerHour).toBe(4000);
    });

    it("should calculate discount percentage", () => {
      const package = {
        original_price: 12000,
        price: 10000,
      };

      const discount =
        ((package.original_price - package.price) / package.original_price) *
        100;
      expect(Math.round(discount)).toBe(17);
    });
  });

  describe("Clone Package", () => {
    it("should clone package to multiple locations", async () => {
      const result = await packageService.clone("pkg_123", {
        target_location_ids: ["loc_456", "loc_789"],
        adjust_pricing: true,
        price_multiplier: 1.1,
      });

      expect(result.created_packages).toHaveLength(2);
      expect(result.created_packages[0].price).toBe(13200); // 12000 * 1.1
    });
  });
});
```

---

## Related Documents

- [Package Selection & Purchase](./package-selection.md)
- [Pricing Strategy](../../02-business/revenue-model.md)
- [RBAC](../authentication/rbac.md)
- [Admin Dashboard](../admin/package-administration.md)
- [Success Metrics](../../01-overview/success-metrics.md)

---

[← Back to Packages](./README.md) | [← Back to Features](../README.md)
