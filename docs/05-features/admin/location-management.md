# Location Management

**Feature ID:** FR-20  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As an admin, I want to manage multiple iCafe locations from a single dashboard to ensure consistent service delivery across my business network.

**Business Value:**

- **Centralized Control** - Manage all branches from one interface.
- **Scalability** - Easily add new locations as the business grows.
- **Operational Visibility** - Monitor health and performance per branch.
- **Flexibility** - Configure unique network settings (MikroTik IP, PC API) for each site.

---

## Core Capabilities

### 1. Location Lifecycle

- **Create:** Add new iCafe locations with specific network configurations.
- **Update:** Modify existing location details (address, timezone, status).
- **Monitor:** Real-time visibility of location connectivity (Router status).
- **Control:** Enable or Disable WiFi service for an entire location instantly.

### 2. Location Configuration

Each location requires the following technical parameters:

- **MikroTik Router IP:** For RADIUS communication and API management.
- **NAS Identifier:** Unique ID for RADIUS authorization.
- **PC System API:** The endpoint used to verify PC balances and logouts.
- **Timezone:** Critical for accurate session expiration and reporting.

---

## Data Model

```typescript
type LocationStatus = "ACTIVE" | "INACTIVE" | "OFFLINE";

interface Location {
  id: string; // UUID

  // Basic Info
  name: string; // e.g., "iCafe District 1"
  address: string;
  timezone: string; // "Asia/Ho_Chi_Minh"

  // Network Integration (MikroTik)
  router_ip: string; // Public or VPN IP of the router
  nas_identifier: string; // RADIUS NAS-Identifier
  radius_secret: string; // Secret key for RADIUS

  // Backend Integration (PC System)
  pc_api_endpoint: string; // Local endpoint of PC System
  webhook_secret: string; // Key for verifying PC system webhooks

  // Operational Status
  status: LocationStatus;
  is_wifi_enabled: boolean;

  // Metadata
  created_at: Date;
  updated_at: Date;
}
```

---

## UI/UX Design

### Location Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ 🏥 Location Management                               [+ Add] │
├─────────────────────────────────────────────────────────────┤
│ Search: [________________]  Status: [All v]                │
├─────────────────────────────────────────────────────────────┤
│ NAME            | STATUS   | USERS | REVENUE (Today) | ACTS │
├─────────────────|──────────|───────|─────────────────|──────┤
│ iCafe District 1| 🟢 Active| 124   | 550,000 VND     | [E][D]│
│ iCafe District 7| 🟢 Active| 86    | 320,000 VND     | [E][D]│
│ iCafe Binh Tan  | 🔴 Offline| 0     | 0 VND           | [E][D]│
└─────────────────────────────────────────────────────────────┘
```

### Configuration Screen

```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Edit Location: iCafe District 1                           │
├─────────────────────────────────────────────────────────────┤
│ Location Name:  [iCafe District 1                ]           │
│ Timezone:       [Asia/Ho_Chi_Minh (GMT+7)     ^ ]           │
│                                                              │
│ [ Network Settings ]                                         │
│ Router IP:      [115.78.x.x                      ]           │
│ NAS ID:         [ICAFE_D1                        ]           │
│ RADIUS Secret:  [****************                ]           │
│                                                              │
│ [ Integration Settings ]                                     │
│ PC API URL:     [http://192.168.10.5:8080/api    ]           │
│ API Auth Token: [****************                ]           │
│                                                              │
│ [ Status ]                                                   │
│ [ ] WiFi Service Enabled                                     │
│                                                              │
│ [ Cancel ]                               [ Save Changes ]    │
└─────────────────────────────────────────────────────────────┘
```

---

## API Contracts

### List Locations

`GET /api/admin/locations`

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "loc_001",
      "name": "iCafe District 1",
      "status": "ACTIVE",
      "stats": {
        "active_sessions": 45,
        "daily_revenue": 250000
      }
    }
  ]
}
```

### Create Location

`POST /api/admin/locations`

**Request:**

```json
{
  "name": "iCafe District 2",
  "router_ip": "118.69.x.x",
  "nas_identifier": "ICAFE_D2",
  "pc_api_endpoint": "https://d2.pc-system.com/api"
}
```

---

## Implementation Details (Payload CMS)

We will use a Payload Collection `locations` with the following configuration:

```typescript
// src/collections/Locations.ts
export const Locations: CollectionConfig = {
  slug: "locations",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "router_ip", "status"],
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "router_ip", type: "text", required: true },
    { name: "nas_identifier", type: "text", required: true, unique: true },
    { name: "pc_api_endpoint", type: "text" },
    {
      name: "status",
      type: "select",
      defaultValue: "ACTIVE",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
    },
    // ... timestamps automatically handled by Payload
  ],
};
```

---

## Testing Scenarios

1. **Validation:** Ensure `nas_identifier` is unique across all locations.
2. **Connectivity:** Test `router_ip` reachability when saving a location.
3. **Integration:** Verify PC API endpoint returns a success code upon test ping.
4. **Visibility:** Verify that users at Location A only see packages assigned to Location A (or Global packages).

---

## Related Documents

- [Package Administration](./package-administration.md)
- [System Health Monitoring](./system-health.md)
- [MikroTik Integration](../../09-integrations/mikrotik-routeros.md)

---

[← Back to Features](../README.md)
