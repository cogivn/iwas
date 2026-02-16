# FreeRADIUS Integration

**Section ID:** 09-02  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

FreeRADIUS acts as the central **AAA (Authentication, Authorization, and Accounting)** engine. It sits between the MikroTik hardware and the IWAS Backend/Database, translating network requests into business logic.

---

## Communication Ports

The interaction happens over **UDP** for high performance and low overhead.

| Port     | Type | Direction            | Description                                   |
| -------- | ---- | -------------------- | --------------------------------------------- |
| **1812** | Auth | Inbound (to Server)  | Verification of user credentials/MAC.         |
| **1813** | Acct | Inbound (to Server)  | Data usage reporting (Bytes in/out).          |
| **3799** | CoA  | Outbound (to Router) | Dynamic session termination or speed changes. |

---

## 🔐 The Authentication Flow (Radius-Accept)

When a device connects, FreeRADIUS validates the session and returns specific **MikroTik Dictionary Attributes** to control the hardware:

### Key Attributes Sent to Router:

1. **Mikrotik-Rate-Limit:** Sets the simple queue speed (e.g., `2M/10M`).
2. **Session-Timeout:** Absolute time in seconds before the router kills the session.
3. **Acct-Interim-Interval:** Frequency of usage reports (Set to `120` seconds).
4. **Port-Limit:** (Optional) Limits the number of concurrent TCP connections.

---

## 📊 The Accounting Flow (Radius-Accounting)

The Router sends packets at the start, during (interim), and at the end of a session.

### Data Points Received:

- **Acct-Status-Type:** `Start`, `Interim-Update`, or `Stop`.
- **Acct-Input-Octets:** Total Bytes uploaded by the user.
- **Acct-Output-Octets:** Total Bytes downloaded by the user.
- **Acct-Session-Time:** Total seconds the user has been online.

**Backend Sync:** FreeRADIUS triggers a script or a webhook to update the `sessions` collection in MongoDB whenever an `Interim-Update` is received.

---

## ⚡ The Change of Authorization (CoA)

This is how the Backend triggers a "Lock" or "Update" on the hardware.

### Disconnect-Request:

Used when an Admin clicks "Disconnect" or a user logs out of their PC.

- **Packet:** `Disconnect-Request`
- **Identifier:** `Calling-Station-Id` (MAC Address)
- **Result:** Router removes the user from the `/ip hotspot active` list.

---

## Backend Integration (v3-config)

FreeRADIUS is configured to query our database via a custom module (rlm_rest or rlm_exec):

```bash
# Conceptual flow inside FreeRADIUS
authorize {
    # 1. Call IWAS API to check session
    rest_api_call("/api/auth/radius-check")

    # 2. If API returns 200, respond with ACCEPT
    if (ok) {
        update reply {
            Mikrotik-Rate-Limit := "%{json:bandwidth}"
            Session-Timeout := "%{json:remaining_time}"
        }
    }
}
```

---

## Monitoring Radius Health

Admin can monitor the RADIUS service status on the dashboard:

- **Heartbeat:** Backend sends a fake Access-Request to RADIUS every 60s.
- **Failover:** If 1812 is unresponsive, Alert is triggered.

---

## Related Documents

- [MikroTik Integration Guide](./mikrotik-routeros.md)
- [Network Topology (VPN Tunnel)](../04-architecture/network-topology.md)
- [Performance & Reliability](../10-non-functional/reliability.md)

---

[← Back to Integrations](./README.md)
