# Authentication & Identification Cycle

**Feature ID:** WF-04  
**Priority:** P0 (Critical)  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 🔄 The 3-Layer Identification Mechanism

This workflow explains how the system tracks a user across multiple network layers to ensure commands (like Force Disconnect) are sent to the correct physical router.

### Layer 1: Initial Redirection (Captive Portal)

When an unauthenticated device connects to the WiFi, the MikroTik local service intercepts the HTTP request and redirects it to our Cloud Portal.

**Redirection Link:**
`https://wifi.icafe.com/portal?nasid=quan_7_branch&mac=AA:BB:CC:11:22:33&client_ip=192.168.20.50`

- `nasid`: Identifies the specific router/branch.
- `mac`: Identifies the user's hardware device.
- **Goal:** The Frontend now knows _who_ the user is and _where_ they are located.

### Layer 2: RADIUS Handshake (The Secret Talk)

When the user submits their login credentials (or pays for a package), the MikroTik sends a RADIUS Access-Request to our Server Cloud.

**Attributes sent by Router:**

- `NAS-Identifier`: "quan_7_branch"
- `NAS-IP-Address`: `10.0.0.7` (The fixed WireGuard VPN IP)
- `Calling-Station-Id`: "AA:BB:CC:11:22:33"
- **Goal:** The RADIUS server confirms the login and maps the User's MAC to the Router's VPN IP.

### Layer 3: Session Mapping (Database Persistence)

The Backend creates an active session record in the `sessions` collection.

```typescript
{
  "user_id": "user_nora_01",
  "mac_address": "AA:BB:CC:11:22:33",
  "location_id": "loc_district_7",
  "router_vpn_ip": "10.0.0.7", // The critical "Return Address"
  "status": "ACTIVE",
  "started_at": ISODate("...")
}
```

---

## ⚡ Command Execution Flow (CoA)

When an Admin clicks **"Force Disconnect"** on the Dashboard:

1. **Lookup:** Backend looks up the session for that user/MAC.
2. **Targeting:** Finds the `router_vpn_ip` is `10.0.0.7`.
3. **Execution:** Backend sends a UDP `Disconnect-Request` packet to `10.0.0.7:3799`.
4. **VPN Tunnel:** Because `10.0.0.7` is inside the WireGuard tunnel, the packet bypasses all NAT/Firewalls and hits the MikroTik directly.
5. **Effect:** The MikroTik kills the session, and the user is instantly redirected back to the Captive Portal.

---

## 📁 Related Documents

- [Role-Based Access Control (RBAC)](../../05-features/authentication/rbac.md)
- [Network Setup Workflow](./network-setup-workflow.md)
- [MikroTik Integration Guide](../../09-integrations/mikrotik-routeros.md)

---

[← Back to Workflows](./README.md)
