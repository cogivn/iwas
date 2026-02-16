# Package Administration

**Feature ID:** FR-21  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As an admin, I want to create and manage WiFi packages with flexible pricing, duration, and bandwidth limits to maximize revenue and network efficiency.

**Business Value:**

- **Revenue Optimization** - Adjust pricing based on demand and location.
- **Fair Resource Allocation** - Control bandwidth usage per user tier.
- **User Segmentation** - Offer different packages for casual vs. heavy users.
- **Ease of Management** - Create once, deploy to single or multiple locations.

---

## Core Capabilities

### 1. Package Configuration

Admins can define the following constraints for each package:

- **Duration:** Validity period from activation (e.g., 1 hour, 1 day).
- **Pricing:** Cost in VND.
- **Bandwidth Limits:** Upload/Download speeds (e.g., "5M/20M").
- **Device Limits:** Maximum concurrent devices allowed (Simultaneous-Use).
- **Scope:** Assign package to specific locations or make it globally available.

### 2. Lifecycle Management

- **Draft/Published:** Control visibility of packages to customers.
- **Duplicate:** Quickly create variations of successful packages.
- **Soft Delete:** Archive packages while maintaining historical transaction data.
- **Sorting:** Control the order in which packages appear on the user portal.

---

## Data Model

```typescript
interface WiFiPackage {
  id: string; // UUID

  // Basic Settings
  name: string; // e.g., "⚡ Pro Gamer - 3 Hours"
  description?: string;
  price: number; // in VND

  // Usage Limits
  duration_minutes: number; // Duration of access
  bandwidth_limit: string; // MikroTik-Rate-Limit format: "2M/10M"
  device_limit: number; // Simultaneous-Use limit

  // Assignment
  is_global: boolean; // Available at all locations if true
  locations?: string[]; // Array of Location IDs if not global

  // Status & Visibility
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  display_order: number;

  // Metadata
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date; // For soft-delete
}
```

---

## UI/UX Design

### Package List

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 WiFi Packages                                     [+ Add] │
├─────────────────────────────────────────────────────────────┤
│ Filter: [All Locations ^]  Status: [Published ^]           │
├─────────────────|─────────|──────────|────────────|────────┤
│ NAME            | PRICE   | SPEED    | DURATION   | SCOPE  │
├─────────────────|─────────|──────────|────────────|────────┤
│ ⚡ Basic Hourly | 5k VND  | 2M/10M   | 1 Hour     | Global │
│ 🚀 Gamer Plus   | 15k VND | 5M/20M   | 3 Hours    | D1, D7 │
│ 📅 Weekly Pass  | 50k VND | 5M/20M   | 7 Days     | Global │
└─────────────────|─────────|──────────|────────────|────────┤
```

### Package Editor

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Create New Package                                       │
├─────────────────────────────────────────────────────────────┤
│ Package Name:   [_________________________]                 │
│ Price (VND):    [10,000                  ]                 │
│ Duration (Min): [180 (3 Hours)           ]                 │
│                                                              │
│ [ Performance Settings ]                                     │
│ Speed (Up/Down):[2M/10M                  ]                 │
│ Max Devices:    [2                       ]                 │
│                                                              │
│ [ Availability ]                                             │
│ ( ) Global (All Locations)                                   │
│ (x) Specific Locations: [x] District 1, [ ] District 7       │
│                                                              │
│ [ Status ]                                                   │
│ ( ) Draft   (x) Published                                    │
│                                                              │
│ [ Cancel ]                                [ Create Package ] │
└─────────────────────────────────────────────────────────────┘
```

---

## API Contracts

### Get Packages

`GET /api/admin/packages`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "pkg_001",
      "name": "Basic Hourly",
      "price": 5000,
      "bandwidth_limit": "2M/10M",
      "duration_minutes": 60,
      "status": "PUBLISHED"
    }
  ]
}
```

### Create Package

`POST /api/admin/packages`

**Request Body:**

```json
{
  "name": "Standard Daily",
  "price": 20000,
  "duration_minutes": 1440,
  "bandwidth_limit": "5M/20M",
  "device_limit": 1,
  "is_global": true,
  "status": "PUBLISHED"
}
```

---

## Implementation Details (Payload CMS)

We will use a Payload Collection `packages` with relationship fields.

```typescript
// src/collections/Packages.ts
export const Packages: CollectionConfig = {
  slug: "packages",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "price", "duration_minutes", "status"],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "price", type: "number", required: true },
    { name: "duration_minutes", type: "number", required: true },
    { name: "bandwidth_limit", type: "text", required: true },
    { name: "device_limit", type: "number", defaultValue: 1 },
    { name: "is_global", type: "checkbox", defaultValue: true },
    {
      name: "locations",
      type: "relationship",
      relationTo: "locations",
      hasMany: true,
      admin: {
        condition: (data) => !data.is_global,
      },
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Draft", value: "DRAFT" },
        { label: "Published", value: "PUBLISHED" },
        { label: "Archived", value: "ARCHIVED" },
      ],
    },
  ],
};
```

---

## Operational Logic

- **Historical Consistency:** When a package is updated, active sessions and past transactions continue to reference the settings at the time of purchase. We achieve this by versioning or selective field duplication in the `sessions` table.
- **Filtering:** The user portal must only fetch packages where `status === 'PUBLISHED'` and (`is_global === true` OR `location_id` in `locations`).

---

## Related Documents

- [Location Management](./location-management.md)
- [Package Selection & Purchase](../packages/package-selection.md)
- [Bandwidth Management](../network/bandwidth-management.md)

---

[← Back to Features](../README.md)
