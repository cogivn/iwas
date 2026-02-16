# PC Management System API

**Section ID:** 09-04  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 🎮 Overview

The local PC System (e.g., G-Cafe, CSM, or custom solution) acts as a local source of truth for Gaming Balances. IWAS communicates with it to enable automatic WiFi sessions linked to PC accounts.

---

## 📡 Required Endpoints (Local -> Cloud)

The local system must send these events to the IWAS Cloud endpoint: `POST https://api.iwas.com/api/pc-sync/event`.

### 1. User Login Event

- **Trigger:** User enters account/password at a gaming station.
- **Goal:** Potentially pre-authorize WiFi for that MAC.

### 2. User Logout Event (CRITICAL)

- **Trigger:** User closes their PC session.
- **Payload:** `{ "pc_user_id": "U123", "event": "LOGOUT" }`
- **Goal:** Immediately trigger RADIUS CoA to kill the associated WiFi session.

---

## 📡 Cloud -> Local communication

IWAS calls the local PC System to verify balances.

### `GET /api/v1/user/balance`

- **Header:** `Authorization: Bearer <ID_TOKEN>`
- **Response:** `{ "balance_vnd": 50000 }`

---

## 🛡️ Security: The Synchronization Token

To prevent spoofing, every branch has a unique **`PC_SYNC_TOKEN`** stored in the `locations` collection.

- Every request from the site must include an HMAC-SHA256 signature calculated with this token.

---

[← Back to Integrations](./README.md)
