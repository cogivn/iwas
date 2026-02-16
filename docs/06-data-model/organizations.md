# Organizations Collection

**Collection ID:** `organizations`  
**Description:** Represents an Enterprise Tenant (e.g., a gaming center chain).

---

## 📄 Schema Definition

| Field                   | Type       | Required | Description                               |
| ----------------------- | ---------- | -------- | ----------------------------------------- |
| `name`                  | `string`   | ✅       | Full name of the organization.            |
| `slug`                  | `string`   | ✅       | URL-friendly identifier (unique).         |
| `logo`                  | `upload`   | ✅       | Reference to the `media` collection.      |
| `domain`                | `string`   | ❌       | Custom domain for the captive portal.     |
| `status`                | `select`   | ✅       | `active`, `suspended`, `trial`.           |
| `quota`                 | `group`    | ✅       | Multi-branch limits.                      |
| `quota.maxLocations`    | `number`   | ✅       | Max branches allowed.                     |
| `quota.maxUsers`        | `number`   | ✅       | Max concurrent users across all branches. |
| `branding`              | `group`    | ❌       | UI customization tokens.                  |
| `branding.primaryColor` | `string`   | ❌       | Hex color code.                           |
| `branding.customCss`    | `textarea` | ❌       | Injected CSS for portal.                  |

---

## 💻 TypeScript Type (POJO)

```typescript
export type Organization = {
  id: string;
  name: string;
  slug: string;
  logo: string; // Media ID
  domain?: string;
  status: "active" | "suspended" | "trial";
  quota: {
    maxLocations: number;
    maxUsers: number;
  };
  branding?: {
    primaryColor?: string;
    customCss?: string;
  };
  createdAt: string;
  updatedAt: string;
};
```

---

## 🔐 Access Control

- **Read:** `super-admin` OR `org-admin` (if matching `id`).
- **Create:** `super-admin` ONLY.
- **Update:** `super-admin` OR `org-admin` (restricted fields).
- **Delete:** `super-admin` ONLY.

---

[← Back to Data Model](./README.md)
