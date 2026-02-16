# PC Logout Synchronization

**Feature ID:** FR-15  
**Priority:** P1 (High)  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## 🔄 Overview

**User Story:** As a customer, when I log out of my gaming PC or my PC time ends, I want my WiFi session to also terminate automatically, so that I don't waste my WiFi package time if I forget to disconnect.

**Business Benefit:** Pre-paid WiFi time is preserved for the user, and network resources are freed up immediately at the branch.

---

## 🔌 Technical Implementation (The Webhook)

The system uses a **Reverse Webhook** mechanism from the Local PC System to our Cloud Backend.

### 1. The Trigger (Local Branch)

When a PC Logout event occurs (managed by GCafe/GCP/ISM):

- The Local PC API sends a POST request to our Backend.
- **Payload:**
  ```json
  {
    "event": "PC_LOGOUT",
    "username": "customer_01",
    "location_id": "loc_dist_7",
    "timestamp": "2026-02-16T18:00:00Z",
    "signature": "hmac_sha256_hash"
  }
  ```

### 2. The Cloud Action (Backend)

1. **Verify:** Backend verifies the signature using the `Webhook Secret` stored in the `Locations` collection.
2. **Lookup:** Find all `ACTIVE` WiFi sessions associated with `customer_01` at `loc_dist_7`.
3. **Execution:** For each session, send a **RADIUS CoA (Disconnect)** to the router's VPN IP.
4. **Log:** Mark the session as `CLOSED_BY_PC_SYNC`.

---

## 🛠️ Security Verification

- **Signature Auth:** The local PC System API must sign the request with a shared secret to prevent malicious session termination.
- **IP Whitelisting:** Backend only accepts logout webhooks from known Router/Branch IPs.

---

[← Back to Features](../README.md)
