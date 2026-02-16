# Locations Collection

**Collection ID:** `locations`  
**Description:** Represents a physical branch/site where a router is deployed.

---

## 📄 Schema Definition

| Field                 | Type           | Required | Description                                   |
| --------------------- | -------------- | -------- | --------------------------------------------- |
| `name`                | `string`       | ✅       | Branch name (e.g., "District 7").             |
| `organization`        | `relationship` | ✅       | Link to `organizations`.                      |
| `address`             | `string`       | ❌       | Physical address.                             |
| `timezone`            | `select`       | ✅       | Local timezone (default: `Asia/Ho_Chi_Minh`). |
| **Network Config**    | **group**      | ✅       | Technical attributes.                         |
| `config.nasId`        | `string`       | ✅       | Unique ID for RADIUS (e.g., `d7-router`).     |
| `config.radiusSecret` | `string`       | ✅       | Shared secret with MikroTik.                  |
| `config.vpnIp`        | `string`       | ✅       | Static WireGuard IP (e.g., `10.0.0.7`).       |
| `config.vpnPublicKey` | `string`       | ✅       | Server-side public key for the peer.          |
| **Live Status**       | **group**      | ✅       | Real-time monitoring fields.                  |
| `status.isOnline`     | `boolean`      | ✅       | Updated via heartbeat cron.                   |
| `status.lastSeen`     | `date`         | ✅       | Timestamp of last RADIUS packet.              |

---

## 💻 TypeScript Type (POJO)

```typescript
export type Location = {
  id: string;
  name: string;
  organization: string | Organization;
  address?: string;
  timezone: string;
  config: {
    nasId: string;
    radiusSecret: string;
    vpnIp: string;
    vpnPublicKey: string;
  };
  status: {
    isOnline: boolean;
    lastSeen: string;
  };
  createdAt: string;
  updatedAt: string;
};
```

---

## 🔐 Access Control

- **Read:** `super-admin` OR `org-admin` (of same org) OR `location-manager` (if assigned).
- **Create:** `super-admin` OR `org-admin` (within quota).
- **Update:** `super-admin` OR `org-admin` OR `location-manager` (restricted).
- **Delete:** `super-admin` OR `org-admin`.

---

[← Back to Data Model](./README.md)
