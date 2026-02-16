# MikroTik RouterOS Integration

**Section ID:** 09-01  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

This document details how the IWAS Backend communicates with MikroTik RouterOS to control internet access, enforce bandwidth limits, and monitor system health.

---

## Communication Protocols

We use two primary methods to bridge the Software (Payload CMS) and Hardware (MikroTik):

### 1. RADIUS (Remote Authentication Dial-In User Service)

- **Purpose:** Handling Authentication, Authorization, and Accounting (AAA).
- **Inbound (Router -> IWAS):** Router asks IWAS if a user is allowed to connect.
- **Outbound (IWAS -> Router):** IWAS forces a user to disconnect or changes their speed (CoA).
- **Port:** `1812` (Auth), `1813` (Acct), `3799` (CoA).

### 2. MikroTik REST API

- **Purpose:** Direct management, health monitoring, and firewall control.
- **Protocol:** HTTPS (REST).
- **Available since:** RouterOS v7.1+.
- **Port:** `443` or `80`.

---

## Unlocking Internet (Session Start)

The "Unlock" process is automated via the RADIUS auth flow:

1. **Trigger:** User device attempts to connect to the WiFi SSID.
2. **RADIUS Request:** MikroTik sends an `Access-Request` containing the user's credentials (or MAC).
3. **IWAS Logic:**
   - Backend verifies the user has an active session in MongoDB.
   - If valid, returns an `Access-Accept`.
4. **RADIUS Response Attributes:**
   - `Session-Timeout`: Remaining time in seconds.
   - `Mikrotik-Rate-Limit`: Bandwidth limit (e.g., "5M/10M").
   - `Simultaneous-Use`: Device limit (e.g., "1").
5. **Hardware Action:** MikroTik creates a dynamic entry in `/ip hotspot active` and allows traffic.

---

## Locking Internet (Session Termination)

Admin can "Lock" a session manually from the Dashboard or it happens automatically on timeout.

### Method A: RADIUS CoA (Preferred)

The Backend sends a `Disconnect-Request` packet.

```typescript
// Example Payload for CoA
{
  "attributes": {
    "User-Name": "nora_01",
    "Calling-Station-Id": "AA:BB:CC:DD:EE:FF", // MAC
    "Acct-Session-Id": "81200001"
  }
}
```

### Method B: MikroTik API

Directly delete the active session via REST API.

**Endpoint:** `POST /rest/ip/hotspot/active/remove`  
**Body:** `{"numbers": "*1"}`

---

## Bandwidth Enforcement

Bandwidth is enforced using **MikroTik Queues**. The limits are sent as part of the RADIUS attributes during login.

**Attribute:** `Mikrotik-Rate-Limit`  
**Format:** `Rx/Tx` (e.g., `2M/10M`)

MikroTik will automatically create a **Simple Queue** for that specific IP/MAC address.

---

## Real-time Statistics (Accounting)

How we get the "Total Data Used" shown on the Admin Dashboard:

1. **Interim-Update:** MikroTik is configured to send accounting packets every 2 minutes.
2. **RADIUS Accounting:** These packets contain `Acct-Input-Octets` (Download) and `Acct-Output-Octets` (Upload).
3. **Backend Storage:** IWAS receives these packets and updates the `sessions` collection in MongoDB.

---

## Security & Firewall

To ensure the system cannot be bypassed:

- **Walled Garden:** Only the Authentication Portal (`https://wifi.icafe.com`) is allowed before login.
- **IP Spoofing Prevention:** MikroTik bindings link the IP to the MAC address.
- **VLAN Isolation:** Guest WiFi traffic is tagged as VLAN 20 and cannot reach the PC Gaming VLAN (VLAN 10).

---

## Troubleshooting commands (RouterOS)

Admins can use these commands in the MikroTik Terminal to debug:

```routeros
# Check RADIUS connection status
/radius monitor [find]

# View active WiFi users
/ip hotspot active print

# View accounting packets
/system logging add topics=radius,debug
```

---

## Related Documents

- [VLAN Isolation](../05-features/network/vlan-isolation.md)
- [Session Lifecycle](../05-features/sessions/session-lifecycle.md)
- [System Architecture](../../04-architecture/system-architecture.md)
