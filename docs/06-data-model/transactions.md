# Transactions Collection

**Collection ID:** `transactions`  
**Description:** Ledger of all payments and refunds.

---

## 📄 Schema Definition

| Field             | Type           | Required | Description                                 |
| ----------------- | -------------- | -------- | ------------------------------------------- |
| `user`            | `relationship` | ✅       | Link to the `users` collection.             |
| `organization`    | `relationship` | ✅       | The tenant receiving the revenue.           |
| `package`         | `relationship` | ✅       | The `packages` record purchased.            |
| `amount`          | `number`       | ✅       | Final paid amount.                          |
| `status`          | `select`       | ✅       | `pending`, `success`, `failed`, `refunded`. |
| `provider`        | `select`       | ✅       | `momo`, `vnpay`, `pc-balance`, `wallet`.    |
| **External Data** | **group**      | ❌       | Gateway metadata.                           |
| `external.txnId`  | `string`       | ❌       | Transaction ID from the provider.           |
| `external.rawLog` | `json`         | ❌       | Full webhook response (for audit).          |
| `idempotencyKey`  | `string`       | ✅       | Unique key to prevent double billing.       |

---

## 💻 TypeScript Type (POJO)

```typescript
export type Transaction = {
  id: string;
  user: string | User;
  organization: string | Organization;
  package: string | Package;
  amount: number;
  status: "pending" | "success" | "failed" | "refunded";
  provider: "momo" | "vnpay" | "pc-balance" | "wallet";
  external?: {
    txnId?: string;
    rawLog?: any;
  };
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
};
```

---

## 🔐 Access Control

- **Read:** `super-admin` OR `org-admin` (all org txns) OR `customer` (own txns).
- **Create:** System-triggered during purchase.
- **Update:** `super-admin` OR System-callback ONLY.

---

[← Back to Data Model](./README.md)
