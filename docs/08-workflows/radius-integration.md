# RADIUS Server Integration Workflow

**Workflow ID:** WF-08  
**Priority:** P1 (High)  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 📡 Overview

This workflow details the technical "handshake" between the **Payload CMS Backend (Logic)** and the **FreeRADIUS Service (Protocol)**. We use a **Shared Database Layer** to ensure zero-latency synchronization.

---

## 🏗️ The Shared State Architecture

Instead of slow API calls, both services communicate via a shared **MongoDB** instance.

1. **Payload CMS:** Writes the "Intent" (New Account, New Session).
2. **FreeRADIUS:** Reads the "Fact" at the moment of authentication.

---

## 🔄 Authentication Flow (Technical)

1. **MikroTik:** Sends an `Access-Request` (UDP 1812) containing `User-Name` and `User-Password`.
2. **FreeRADIUS:** Receives packet and triggers the `rlm_mongodb` module.
3. **Database Query:**
   ```mongodb
   db.session_credentials.find({ username: "wifi_123" })
   ```
4. **Validation:** FreeRADIUS compares the provided password with the `password_hash` in MongoDB.
5. **Response:**
   - If Match: Returns `Access-Accept` with attributes: `Session-Timeout`, `Mikrotik-Rate-Limit`.
   - If Fail: Returns `Access-Reject`.

---

## 🔄 Accounting & Monitoring Flow

1. **MikroTik:** Every 300 seconds (Interim-Interval), it sends an `Accounting-Request` packet containing `Acct-Input-Octets` (Data Downloaded).
2. **FreeRADIUS:** Receives packet and triggers an **`afterChange`** event.
3. **Payload Hook:** A small listener script (or a FreeRADIUS SQL/REST hook) updates the `active_sessions` collection:
   ```typescript
   // Pseudo-update logic
   await payload.update({
     collection: "sessions",
     id: sessionId,
     data: {
       data_used: current_octets,
       last_seen: new Date(),
     },
   });
   ```

---

## ⚡ CoA (Force Logout) Technical Flow

When the Admin initiates a logout in Payload:

1. **Action:** Payload calls a local utility `radiusClient.sendDisconnect()`.
2. **Packet:** A UDP packet is sent to `127.0.0.1:3799` (RADIUS CoA port).
3. **Relay:** FreeRADIUS receives the packet and relays it to the **MikroTik's VPN IP** (e.g., `10.0.0.7:3799`).
4. **Finality:** The session is purged from the router's memory.

---

## 📁 Related Documents

- [RADIUS Server Integration](../../09-integrations/radius-server.md)
- [System Architecture](../../04-architecture/system-architecture.md)
- [Authentication Cycle](./authentication-cycle.md)

---

[← Back to Workflows](./README.md)
