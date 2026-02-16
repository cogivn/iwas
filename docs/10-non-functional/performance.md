# Performance & Scalability

**Section ID:** 10-01  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## 🚀 Performance Benchmarks (Target KPIs)

| Operation                   | Target Latency | Notes                                              |
| --------------------------- | -------------- | -------------------------------------------------- |
| **WiFi Authentication**     | < 300ms        | From user click to "Access-Accept" on Router.      |
| **RADIUS CoA (Disconnect)** | < 200ms        | From Admin click to session termination at branch. |
| **API Response Time**       | < 100ms        | Average for non-analytical endpoints.              |
| **VPN Handshake**           | < 50ms         | WireGuard tunnel persistence latency.              |
| **Dashboard Update**        | < 2s           | Real-time session status visibility.               |

---

## ⚖️ Scalability Strategy

The system is designed to scale from a single iCafe to a nation-wide chain (1000+ locations).

### 1. Database Optimization

- **Caching Layer:** We use **Redis** to store active sessions. RADIUS queries talk to Redis first, reducing MongoDB load by 90%.
- **Indexing:** Strategic indexes on `MAC Address`, `NAS-ID`, and `Status` ensure sub-10ms query times even with millions of records.
- **Aggregation Snapshots:** Heavy reports for the Admin Dashboard are pre-calculated every hour to avoid heavy live queries.

### 2. Horizontal Scaling

- **Load Balancing:** The Backend (Node.js) and RADIUS servers can be duplicated behind a Load Balancer (e.g., Nginx or HAProxy).
- **Stateless Design:** All session state is stored in Redis/Mongo, allowing any server node to handle any request.

### 3. Network Efficiency

- **Control vs Data Plane:** By isolating heavy user traffic (YouTube/Games) at the local branch, the central server only processes meta-data.
- **Interim-Update Jitter:** Accounting updates from routers are staggered (every 2-5 mins) to prevent "Thundering Herd" spikes at the server.

---

## 🛡️ Overload Prevention (Anti-Fragility)

### Rate Limiting

- **API Level:** Prevent script-based attacks on the auth portal.
- **RADIUS Level:** Limit the number of retries per MAC to prevent "auth storms" if a router malfunctions.

### Circuit Breakers

If the PC System API (external) is slow or down, the IWAS system uses a fallback (Circuit Breaker) to allow users to connect based on cached balance or "Grace Period" to prevent customer frustration.

---

## Monitoring & Alerts

We use **Prometheus & Grafana** (or similar) to monitor:

- CPU/RAM usage of RADIUS and Backend.
- VPN Tunnel uptime per location.
- Concurrent active sessions vs. Server capacity.

---

## Related Documents

- [Network Topology (VPN)](../04-architecture/network-topology.md)
- [Router Management](../04-architecture/router-management.md)
- [System Architecture](../04-architecture/system-architecture.md)

---

[← Back to Non-Functional](./README.md)
