# Session Monitoring

**Feature ID:** FR-22  
**Priority:** P1 (High)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As an admin, I want to see all active WiFi sessions in real-time to monitor network usage, identify potential abuse, and troubleshoot connection issues for customers.

**Business Value:**

- **Troubleshooting** - Quickly identify why a user can't connect.
- **Support** - Remotely disconnect/reset sessions for customers.
- **Abuse Prevention** - Detect sessions with unusual bandwidth or connection patterns.
- **Network Visibility** - Real-time snapshot of current network load.

---

## Core Capabilities

### 1. Real-Time View

Admins have access to a live list of sessions, updated every 10-30 seconds (or via WebSockets for instant updates).

**Key Metrics Tracked:**

- **User Identity:** PC Username and Profile.
- **Device Info:** MAC Address, IP Address (if available), and Device Type.
- **Time Metrics:** Start time, duration, and time remaining.
- **Network Usage:** Real-time bandwidth (Up/Down) and total data consumed.
- **Infrastructure:** Which MikroTik Router/Location the user is connected to.

### 2. Administrative Actions

- **Force Disconnect:** Terminate a session immediately (sends RADIUS CoA Disconnect-Request).
- **Session Details:** View full history of the session, including transaction info.
- **Search & Filter:** Find sessions by Username, MAC, or filter by Location status.

---

## Data Model (Client-Side Interface)

```typescript
interface ActiveSession {
  id: string; // Session ID

  // User/Device
  username: string; // PC User Name
  mac_address: string;
  ip_address?: string;
  device_type: string; // e.g., "Mobile"

  // Package/Location
  package_name: string;
  location_name: string;

  // Timing
  start_time: Date;
  expected_end_time: Date;
  time_remaining: number; // Seconds

  // Real-time Traffic (Accounting)
  current_bandwidth_up: number; // Kbps
  current_bandwidth_down: number; // Kbps
  total_data_used: number; // MB
}
```

---

## UI/UX Design

### Active Sessions Monitor

```
┌─────────────────────────────────────────────────────────────┐
│ 📺 Live Session Monitor                    [Refreshes in 8s]│
├─────────────────────────────────────────────────────────────┤
│ Search: [________________]  Location: [All v]  Sort: [Time v]│
├─────────────|────────────|─────────|────────────|───────────┤
│ USER        | MAC/IP     | PACKAGE | REMAINING  | TRAFFIC   │
├─────────────|────────────|─────────|────────────|───────────┤
│ nora_01     | AA:BB (20) | 3 Hours | 01:45:12   | 1.2M/8.5M │
│ [ACTIVE]    | 192.168... |         | (60%)      | 250 MB    │
├─────────────|────────────|─────────|────────────|───────────┤
│ gamer_pro   | CC:DD (20) | 1 Hour  | 00:05:40   | 0.5M/2.1M │
│ [ACTIVE]    | 192.168... |         | (10%)      | 1.1 GB    │
├─────────────|────────────|─────────|────────────|───────────┤
│ [ Force Disconnect Selected ]        [ View Details ]        │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Flow: Force Disconnect

1. **Admin Clicks "Disconnect"** on the dashboard.
2. **Backend receives** request with `session_id`.
3. **Internal Service** fetches session details (including `radius_session_id` and `nas_ip`).
4. **Command Execution:**
   - Backend sends a **RADIUS Disconnect-Request (CoA)** to the MikroTik router.
   - MikroTik terminates the user's connection immediately.
5. **State Update:**
   - Backend updates session status to `TERMINATED` (Reason: `ADMIN_ACTION`).
   - Audit log records which Admin performed the action.

---

## API Contracts

### List Active Sessions

`GET /api/admin/sessions/active?location_id={loc_id}`

**Response:**

```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": "sess_999",
      "username": "nora_01",
      "mac_address": "AA:BB:CC...",
      "time_remaining_sec": 6312,
      "current_speed": "8.5 Mbps",
      "status": "ACTIVE"
    }
  ]
}
```

### Terminate Session

`POST /api/admin/sessions/terminate`

**Request:**

```json
{
  "session_id": "sess_999",
  "reason": "Suspected abuse"
}
```

---

## Implementation Rationale

- **Performance:** For high-volume locations, we use a dedicated Redis cache to track "Active" sessions instead of querying the main MongoDB `sessions` collection every 10 seconds.
- **Accounting:** Real-time bandwidth numbers are derived from RADIUS Interim-Update packets sent by MikroTik (configured every 1-5 minutes).

---

## Related Documents

- [Session Lifecycle Management](../sessions/session-lifecycle.md)
- [RADIUS Integration](../../09-integrations/radius-server.md)
- [Anti-Abuse & Throttling](../network/anti-abuse.md)

---

[← Back to Features](../README.md)
