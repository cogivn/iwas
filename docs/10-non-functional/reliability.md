# Reliability & High Availability (HA)

**Section ID:** 10-02  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## 🛡️ The Zero-Downtime Goal

In an iCafe environment, WiFi access is critical. If the authentication system goes down, it leads to customer frustration and revenue loss. Our architecture eliminates "Single Points of Failure" (SPOF).

---

## 1. RADIUS Redundancy (Active/Passive)

We utilize MikroTik's native support for multiple RADIUS servers to ensure 100% login uptime.

### Configuration Strategy

- **Primary RADIUS (Node A):** Handles 100% of traffic under normal conditions.
- **Secondary RADIUS (Node B):** Located in a different physical region/cloud provider.
- **Failover:** The MikroTik router is configured with a 2-second timeout. If Node A doesn't respond, it instantly retries with Node B.

```routeros
# Example MikroTik Config for HA
/radius add address=[IP_NODE_A] secret=[SECRET] timeout=2s
/radius add address=[IP_NODE_B] secret=[SECRET] timeout=2s
```

---

## 2. Infrastructure Resilience

### Database & Cache (The Core)

While RADIUS servers can be easily duplicated, the data must stay consistent:

- **MongoDB Atlas:** Use a **Replica Set** (3 nodes) which provides automatic failover if one database node fails.
- **Managed Redis:** Use a cloud-managed Redis with high-availability standby.

### Backend (Load Balancing)

- Split the Backend into multiple stateless containers.
- Use a **Global Load Balancer** to distribute traffic between Backend nodes.

---

## 3. Disaster Recovery (DR)

### Automated Backups

- **Database:** Daily automated snapshots with 30-day retention.
- **Configuration:** All MikroTik scripts and environment variables are stored in a secure Version Control system (Git).

### RADIUS Local Fallback (Phase 2)

In the extreme event that the entire Cloud infrastructure is offline:

- MikroTik can be configured with a "Default Accept" bypass mode (Optional).
- Users are allowed in for free temporarily to maintain a positive customer experience until the system recovers.

---

## 5. Connection Resilience (Outage Handling)

What happens when the link between the Local Router and Central Server is lost?

### Scenario A: Active User during Outage

- **Behavior:** The user **stays online**.
- **Reason:** Once authorized, the MikroTik router caches the session locally in its `hotspot active` table. Since the user's data traffic (Internet) goes directly to the local ISP, the server outage does not affect their browsing/gaming experience.
- **Duration:** The user remains connected until their local `Session-Timeout` expires.

### Scenario B: New User trying to Login during Outage

- **Behavior:** The login will **fail**.
- **Reason:** The router cannot reach the RADIUS server to verify credentials or packages.
- **Recovery:** As soon as the VPN tunnel reconnects (Auto-healing via WireGuard), the login service resumes immediately.

### Scenario C: Admin sends "Disconnect" during Outage

- **Behavior:** The command is **delayed**.
- **Reason:** The CoA (Disconnect) packet cannot reach the local IP of the router.
- **Handling:** The Backend marks the command as `PENDING`. Once the Heartbeat service detects the router is back `ONLINE`, it re-syncs the session state and forces the disconnect if necessary.

---

## 6. Data Integrity & Sync

- **Accounting Recovery:** If the link is lost, MikroTik continues to accumulate data usage. Once reconnected, the next `Interim-Update` will reflect the total jump in data, ensuring the Backend eventually gets the correct "Total Data Used" figure.
- **Idempotency:** All administrative commands use idempotent keys. If a Disconnect command is sent twice due to a re-connection, it will not cause errors on the router.

---

## 7. Edge-Case Fallback (Plan C)

For premium locations, we can enable **Local Fallback Mode**:

- If the RADIUS server is unreachable for > 30 seconds, the router is configured to allow users in with a "Basic" profile automatically until the server is back. This ensures 0% "Locked Out" complaints.

---

## 4. Monitoring & Self-Healing

We implement proactive monitoring to catch issues before they become outages:

- **Heartbeat Alerts:** If any component (RADIUS, DB, or API) stops responding, the technical team receives an instant alert.
- **Auto-Restart:** All services run inside **Docker with `restart: always`** policy. If a process crashes, it is rebooted by the system within seconds.

---

## 📊 Reliability KPIs

- **Uptime Target:** 99.9% (SLA).
- **MTTR (Mean Time To Recovery):** < 15 minutes.
- **RPO (Recovery Point Objective):** < 4 hours (data loss limit).

---

## Related Documents

- [Performance & Scalability](./performance.md)
- [System Architecture (Overview)](../04-architecture/system-architecture.md)
- [MikroTik Integration](../../09-integrations/mikrotik-routeros.md)

---

[← Back to Non-Functional](./README.md)
