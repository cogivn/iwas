# Security Architecture

**Section ID:** 10-01  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 🛡️ Multi-Layer Security

IWAS follows the "Defense in Depth" principle across four distinct layers.

### 1. Network Layer (VPN Tunneling)

- **Protocol:** **WireGuard (UDP 51820)**.
- **Goal:** RADIUS traffic never travels over the public internet. It is encapsulated in an encrypted tunnel, protecting user credentials and session hashes from sniffing.
- **Firewall:** Only specific ports are exposed to the public internet (80/443). Ports 1812/1813 are only listening on the internal VPN interface.

### 2. Application Layer (Payload Access Control)

- **Logic:** **Mandatory Organization Filtering**.
- **Goal:** Every database query is automatically scoped to the user's `organization_id`. It is mathematically impossible for an Admin of tenant A to see data from tenant B.
- **Authentication:** JWT-based sessions with short expiry times for Admin users.

### 3. Payment Layer (Ledger Integrity)

- **Cơ chế:** **HMAC Post-back verification**.
- **Goal:** Ensuring that payment notifications are authentic and haven't been spoofed by malicious users.
- **Idempotency:** Unique `idempotency_keys` for every transaction prevent double-billing and data corruption.

### 4. Infrastructure Layer (DDoS & Rate Limiting)

- **Protection:** Cloudflare proxy (recommended) or Nginx rate-limiting.
- **Goal:** Preventing bot attacks on the Captive Portal login/purchase endpoints.

---

[← Back to Documentation Hub](../../README.md)
