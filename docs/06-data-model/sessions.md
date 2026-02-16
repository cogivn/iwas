# Sessions Collection

**Collection ID:** `sessions`  
**Description:** Tracks active and historical WiFi connections.

---

## 📄 Schema Definition

| Field              | Type           | Required | Description                                   |
| ------------------ | -------------- | -------- | --------------------------------------------- |
| `user`             | `relationship` | ✅       | The `users` record.                           |
| `organization`     | `relationship` | ✅       | Scoped tenant.                                |
| `location`         | `relationship` | ✅       | The branch (for CoA targeting).               |
| `deviceMac`        | `string`       | ✅       | Hardware MAC of the phone/laptop.             |
| `status`           | `select`       | ✅       | `pending`, `active`, `expired`, `terminated`. |
| **Usage Tracking** | **group**      | ✅       | Data from RADIUS Accounting.                  |
| `usage.dataMB`     | `number`       | ✅       | Total MB consumed.                            |
| `usage.lastIp`     | `string`       | ❌       | Last assigned Framed-IP-Address.              |
| **Duration**       | **group**      | ✅       | Time tracking.                                |
| `startedAt`        | `date`         | ✅       | Actual start time.                            |
| `expiresAt`        | `date`         | ✅       | Pre-calculated expiry.                        |

---

## 💻 TypeScript Type (POJO)

```typescript
export type Session = {
  id: string;
  user: string | User;
  organization: string | Organization;
  location: string | Location;
  deviceMac: string;
  status: "pending" | "active" | "expired" | "terminated";
  usage: {
    dataMB: number;
    lastIp?: string;
  };
  startedAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 🔐 Access Control

- **Read:**
  - `super-admin`: All.
  - `org-admin`: Own Org.
  - `loc-manager`: Own Branch.
  - `customer`: Own active/past sessions.
- **Update:** Internal RADIUS service or Admin Force-logout only.

---

[← Back to Data Model](./README.md)
