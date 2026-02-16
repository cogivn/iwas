# Section 07: API Strategy

This section describes the dual-layer API architecture of the IWAS platform.

## 🤖 1. Standard API (Auto-Generated)

80% of the platform's API requirements are handled automatically by **Payload CMS**. These follow the standard REST pattern and include built-in Access Control and Pagination.

**Base URL:** `https://api.iwas.com/api`

### Managed Collections:

- `/organizations`
- `/locations`
- `/users`
- `/packages`
- `/transactions`
- `/sessions`

_Documentation for these endpoints follows the [official Payload CMS REST API documentation](https://payloadcms.com/docs/rest-api/overview)._

---

## 🛠️ 2. Custom Endpoints (The "Brain" Logic)

The remaining 20% of the API consists of custom business logic defined in `src/endpoints`.

| Endpoint                  | Method | Role       | Description                                   |
| ------------------------- | ------ | ---------- | --------------------------------------------- |
| **Payment**               |        |            |                                               |
| `/payment/callback/momo`  | `POST` | Webhook    | Processes MoMo payment confirmation.          |
| `/payment/callback/vnpay` | `POST` | Webhook    | Processes VNPay payment confirmation.         |
| **WiFi Session**          |        |            |                                               |
| `/sessions/init`          | `POST` | Logic      | Initiates the purchase sequence (Idempotent). |
| `/sessions/terminate`     | `POST` | Logic      | Force disconnect (Admin/System triggered).    |
| **Integrations**          |        |            |                                               |
| `/pc-sync/event`          | `POST` | Webhook    | Receives Auto-Logout events from PC System.   |
| `/network/heartbeat`      | `POST` | Monitoring | Receives health logs from MikroTik Router.    |

---

## 📁 Detailed Endpoint Docs

1.  **[Payment Callbacks](./payment-callbacks.md)**: Handling secure hooks from MoMo/VNPay.
2.  **[Session Control](./session-control.md)**: Logic for activating/terminating WiFi sessions.
3.  **[PC-Sync API](./pc-sync-api.md)**: Interaction with local iCafe management software.

---

[← Back to Documentation Hub](../README.md)
