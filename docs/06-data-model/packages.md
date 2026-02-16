# Packages Collection

**Collection ID:** `packages`  
**Description:** WiFi service plans (e.g., "3 Hours Premium").

---

## 📄 Schema Definition

| Field                    | Type           | Required | Description                      |
| ------------------------ | -------------- | -------- | -------------------------------- |
| `name`                   | `string`       | ✅       | Package display name.            |
| `organization`           | `relationship` | ✅       | Scoped to an Organization.       |
| `price`                  | `number`       | ✅       | Cost in local currency (VND).    |
| `durationMinutes`        | `number`       | ✅       | Total time allowed (e.g., 180).  |
| `dataLimitMB`            | `number`       | ❌       | Total volume allowed (Optional). |
| **QoS Settings**         | **group**      | ✅       | Speed caps.                      |
| `qos.uploadSpeed`        | `number`       | ✅       | Mbps (e.g., 10).                 |
| `qos.downloadSpeed`      | `number`       | ✅       | Mbps (e.g., 20).                 |
| **Availability**         | **group**      | ✅       | Where/When can it be bought.     |
| `availability.locations` | `relationship` | ✅       | Specific branches or "All".      |
| `availability.isActive`  | `boolean`      | ✅       | Global visibility toggle.        |

---

## 💻 TypeScript Type (POJO)

```typescript
export type Package = {
  id: string;
  name: string;
  organization: string | Organization;
  price: number;
  durationMinutes: number;
  dataLimitMB?: number;
  qos: {
    uploadSpeed: number;
    downloadSpeed: number;
  };
  availability: {
    locations: (string | Location)[];
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
};
```

---

## 🔐 Access Control

- **Read:** `super-admin` OR `org-admin` OR `customer` (if `isActive` and allowed at their location).
- **Create/Update/Delete:** `super-admin` OR `org-admin` (of same org).

---

[← Back to Data Model](./README.md)
