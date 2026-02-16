# WireGuard Integration Service

**Section ID:** 09-03  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 🛠️ Overview

Since there is no off-the-shelf WireGuard plugin for Payload CMS, we implement a **Native WireGuard Service** within the Node.js backend. This service manages tunnel provisioning, peer creation, and connectivity monitoring for all MikroTik routers.

---

## 🏗️ Technical Architecture

The service acts as a bridge between the **Payload Collections** and the **Linux WireGuard Interface**.

### 1. Data Schema (Locations Collection)

We extend the `locations` collection to store VPN-related metadata:

- `vpn_ip`: Static Internal IP (e.g., `10.0.0.7`).
- `vpn_public_key`: The public key generated for this router.
- `vpn_private_key`: Stored securely (encrypted) for script generation.
- `is_online`: Boolean updated via heartbeat.

### 2. Service Implementation (src/services/wireguard.ts)

```typescript
import { execSync } from "child_process";
import fs from "fs";

export const WireGuardService = {
  /**
   * Generates a new Peer for a new Location
   */
  async provisionPeer(locationId: string) {
    // 1. Generate Keys
    const privateKey = execSync("wg genkey").toString().trim();
    const publicKey = execSync(`echo ${privateKey} | wg pubkey`)
      .toString()
      .trim();

    // 2. Assign next available IP (e.g., 10.0.0.x)
    const vpnIp = await this.getNextAvailableIp();

    // 3. Add Peer to Linux wg0 interface
    execSync(`wg set wg0 peer ${publicKey} allowed-ips ${vpnIp}/32`);

    // 4. Persistence: Update wireguard config file for reboot survival
    this.saveToConfig(publicKey, vpnIp);

    return { publicKey, privateKey, vpnIp };
  },

  /**
   * Generates the RouterOS script for the Admin/Manager
   */
  generateMikroTikScript(config: {
    vpnIp: string;
    privateKey: string;
    serverPub: string;
    endpoint: string;
  }) {
    return `
      /interface wireguard add listen-port=51820 name=wireguard-iwas private-key="${config.privateKey}"
      /interface wireguard peers add allowed-address=0.0.0.0/0 endpoint-address=${config.endpoint} \
        endpoint-port=51820 interface=wireguard-iwas public-key="${config.serverPub}"
      /ip address add address=${config.vpnIp}/24 interface=wireguard-iwas
    `;
  },
};
```

---

## 🔄 Automation Workflows

### 1. Automated Provisioning

When a **Location Manager** or **Org Admin** creates a new location:

1.  **BeforeChange Hook:** Validates the location data.
2.  **AfterChange Hook:** Calls `WireGuardService.provisionPeer()`.
3.  **UI Feedback:** The generated script is immediately displayed on the dashboard for the user to copy.

### 2. Connectivity Heartbeat (Live Status)

To show the "Online/Offline" status on the Dashboard:

- The service runs a cron job every 2 minutes.
- It parses the output of `wg show wg0 latest-handshake`.
- If the last handshake for a specific peer is `< 3 minutes`, the `is_online` status in the `locations` collection is set to **TRUE**.

---

## 🔒 Security Measures

1.  **Key Isolation:** Private keys are generated on-the-fly and only displayed once or stored encrypted.
2.  **Limited Scope:** The WireGuard interface (`wg0`) is configured with `AllowedIPs` strictly limited to the individual Peer IP. This prevents one router from spoofing another's traffic.
3.  **App-Level Access:** Only users with `net:router:script` permission can access the service endpoints that return VPN credentials.

---

## 📁 Related Documents

- [Network Topology](../../04-architecture/network-topology.md)
- [Router Setup Workflow](../../08-workflows/network-setup-workflow.md)
- [RBAC Permissions](../../05-features/authentication/rbac.md)

---

[← Back to Integrations](./README.md)
