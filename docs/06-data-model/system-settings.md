# System Settings (Globals)

**Global ID:** `system-settings`  
**Description:** Centralized singleton configuration for the platform infrastructure.

---

## 📄 Schema Definition

This is a **Global** collection in Payload, meaning it has only one record accessible via a dedicated "Settings" menu.

| Field                   | Type      | Required | Description                      |
| ----------------------- | --------- | -------- | -------------------------------- |
| **WireGuard Config**    | **group** | ✅       | Public server details.           |
| `wg.publicIp`           | `string`  | ✅       | The Cloud server's public IP.    |
| `wg.serverPublicKey`    | `string`  | ✅       | The server's WG public key.      |
| `wg.listenPort`         | `number`  | ✅       | Default: `51820`.                |
| **RADIUS Config**       | **group** | ✅       | Default secrets.                 |
| `radius.defaultSecret`  | `string`  | ✅       | Fallback secret for new routers. |
| **Payment URLs**        | **group** | ❌       | Environment overrides.           |
| `payment.momoCallback`  | `string`  | ❌       | Webhook endpoint.                |
| `payment.vnpayCallback` | `string`  | ❌       | Webhook endpoint.                |

---

## 💻 TypeScript Type (POJO)

```typescript
export type SystemSettings = {
  wg: {
    publicIp: string;
    serverPublicKey: string;
    listenPort: number;
  };
  radius: {
    defaultSecret: string;
  };
  payment: {
    momoCallback?: string;
    vnpayCallback?: string;
  };
};
```

---

## 🔐 Access Control

- **Read:** `super-admin` ONLY (contains sensitive infra secrets).
- **Update:** `super-admin` ONLY.

---

[← Back to Data Model](./README.md)
