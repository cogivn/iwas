# System Health Monitoring

**Feature ID:** FR-24  
**Priority:** P1 (High)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As an admin, I want to monitor the health of all system components (Database, RADIUS, PC API, MikroTik) to ensure high availability and proactively resolve technical issues before they affect customers.

**Business Value:**

- **Pre-emptive Maintenance** - Identify failing services before a total outage.
- **Reliability** - Maintain a high Service Level Agreement (SLA) for WiFi access.
- **Troubleshooting Efficiency** - Clear visibility into which component is failing (e.g., "Is it the Router or the Database?").
- **Security** - Monitor for unusual error spikes which could indicate an attack.

---

## Components Monitored

### 1. Internal Services

- **Database (MongoDB):** Check connection state and disk usage.
- **Cache (Redis):** Monitor for session caching latency and memory usage.
- **RADIUS Server:** Heartbeat check to ensure authentication is possible.

### 2. External Integrations

- **PC System API:** Verifying connectivity to each branch's PC management endpoint.
- **Payment Gateways:** Checking health status of Momo/ZaloPay/VNPay integration.
- **MikroTik Routers:** Ping status and API connectivity for all configured locations.

---

## Health Check Mechanics

The system performs periodic "Heartbeat" checks (Pings) every 60 seconds.

**Status Levels:**

- 🟢 **Healthy:** Service is responding normally (Latency < 200ms).
- 🟡 **Degraded:** Service is responding but slow OR one node in a cluster is down.
- 🔴 **Critical:** Service is unreachable or returning 5xx errors.

---

## UI/UX Design

### System Health Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ 🛠️ System Health Monitor                     [Re-check Now] │
├─────────────────────────────────────────────────────────────┤
│ Overall Status: 🔘 HEALTHY (98.5% Uptime)                   │
├─────────────────────────────────────────────────────────────┤
│ CORE SERVICES                                               │
│ [🟢] Database (MongoDB Atlas)   [ 12ms ]                    │
│ [🟢] RADIUS Auth Server         [ 5ms  ]                    │
│ [🟢] Payment Webhooks           [ 20ms ]                    │
│                                                             │
│ EXTERNAL INTEGRATIONS                                       │
│ [🟢] District 1 Router (MikroTik) [ 45ms ]                  │
│ [🟡] District 7 Router          [ 850ms] -> High Latency    │
│ [🟢] Momo Gateway API           [ 120ms]                    │
│ [🔴] PC System API (D1)         [ Down ] -> Connection Ref. │
└─────────────────────────────────────────────────────────────┘
```

---

## Alerting Workflow

1. **Failure Detected:** The monitoring service detects a component is `CRITICAL`.
2. **Auto-Retry:** The system attempts 3 retries over 3 minutes.
3. **Trigger Alert:** If still down:
   - **Admin Dashboard:** Sets status icon to Red.
   - **Internal Log:** Record error stack trace.
   - **Notification (Phase 2):** Send a message to the Admin via Telegram/Slack/Email.
4. **Recovery:** Once service resumes, another notification is sent, and the status returns to 🟢.

---

## API Contracts

### Get System Health

`GET /api/admin/system/health`

**Response:**

```json
{
  "success": true,
  "timestamp": "2026-02-16T17:25:00Z",
  "components": {
    "database": { "status": "UP", "latency": 12 },
    "radius": { "status": "UP", "latency": 5 },
    "locations": [
      { "id": "loc_01", "name": "Dist 1", "status": "UP", "latency": 45 },
      { "id": "loc_07", "name": "Dist 7", "status": "DEGRADED", "latency": 850 }
    ]
  }
}
```

---

## Implementation Details

We implement a `HealthService` that uses the following strategy:

- **Database:** `mongoose.connection.readyState`.
- **API Endpoints:** A simple `axios.head(url)` with a 5s timeout.
- **MikroTik:** Attempting to query `/system/resource` via the router API.

---

## Related Documents

- [Location Management](./location-management.md)
- [Multi-Payment Gateway](../payments/multi-payment-gateway.md)
- [RADIUS Integration](../../09-integrations/radius-server.md)

---

[← Back to Features](../README.md)
