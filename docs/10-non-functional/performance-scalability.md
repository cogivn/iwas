# Performance & Scalability

**Section ID:** 10-02  
**Status:** ✅ Detailed  
**Last Updated:** February 16, 2026

---

## ⚡ Performance Targets

| Metric                   | Target  | Failure Threshold |
| ------------------------ | ------- | ----------------- |
| **Portal Page Load**     | < 800ms | > 2s              |
| **RADIUS Auth Latency**  | < 300ms | > 1s              |
| **Payment Confirmation** | < 3s    | > 10s             |
| **CoA Disconnect**       | < 1s    | > 3s              |

### Optimization Strategies:

- **Server Side Rendering (SSR):** Captive portals are server-rendered to minimize JavaScript execution on low-end mobile devices.
- **Shared DB Architecture:** Payload CMS and RADIUS share the same MongoDB instance to avoid slow API hops.
- **Index Optimization:** Database indexes are set on `device_mac`, `organization_id`, and `is_active`.

---

## 📈 Scalability Roadmap

### Level 1: MVP (1 - 50 Branches)

- **Deployment:** Single VPS (Docker Compose).
- **Database:** Local MongoDB.
- **Bottlenecks:** None at this scale.

### Level 2: Growth (50 - 200 Branches)

- **Deployment:** Vertical scaling (more RAM/CPU).
- **Database:** Migration to **MongoDB Atlas** (Managed Service).
- **Security:** Introduction of Redis for Cache/Session storage.

### Level 3: Enterprise (200+ Branches)

- **Deployment:** Horizontal scaling of `payload-cms` containers.
- **Infrastructure:** Load Balancers (Nginx/HAProxy) for the RADIUS traffic.
- **Database:** Sharded MongoDB cluster.

---

[← Back to Documentation Hub](../../README.md)
