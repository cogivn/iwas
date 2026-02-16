# Session Lifecycle Management

**Feature ID:** FR-14  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a system, I need to manage WiFi session lifecycle from creation to termination with proper state tracking and automated actions.

**Business Value:**

- **Accurate billing** - Track exact usage time
- **Resource management** - Free up bandwidth when sessions end
- **User experience** - Smooth activation and termination
- **Compliance** - Audit trail for all sessions

---

## Session State Machine

```
┌─────────────────────────────────────────────────────────────┐
│                    SESSION LIFECYCLE                         │
└─────────────────────────────────────────────────────────────┘

                    PENDING
                       ↓
                  (Payment Success)
                       ↓
                    ACTIVE
                       ↓
         ┌─────────────┼─────────────┬──────────────┐
         ↓             ↓             ↓              ↓
    Time Expired   PC Logout    User Logout    Admin Action
         ↓             ↓             ↓              ↓
      EXPIRED      TERMINATED    TERMINATED    TERMINATED
```

### State Definitions

| State          | Description         | Can Connect? | Next States         |
| -------------- | ------------------- | ------------ | ------------------- |
| **PENDING**    | Payment processing  | No           | ACTIVE, FAILED      |
| **ACTIVE**     | WiFi access granted | Yes          | EXPIRED, TERMINATED |
| **EXPIRED**    | Time limit reached  | No           | - (terminal)        |
| **TERMINATED** | Manually ended      | No           | - (terminal)        |
| **FAILED**     | Activation failed   | No           | - (terminal)        |

---

## Data Model

```typescript
interface Session {
  id: string;

  // References
  user_id: string;
  package_id: string;
  transaction_id: string;
  location_id: string;

  // Time Tracking
  start_time?: Date; // When activated
  end_time?: Date; // When terminated
  expected_end_time?: Date; // start_time + duration
  duration_minutes: number; // From package

  // Status
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "TERMINATED" | "FAILED";
  termination_reason?:
    | "TIME_EXPIRED"
    | "PC_LOGOUT"
    | "USER_LOGOUT"
    | "ADMIN_ACTION"
    | "INSUFFICIENT_BALANCE";

  // Device Binding
  devices: DeviceBinding[];
  max_devices: number;

  // Network
  bandwidth_limit: string; // e.g., "2M/10M"
  vlan_id: number;

  // Usage Stats
  bytes_uploaded: number;
  bytes_downloaded: number;
  total_bytes: number;

  // RADIUS
  radius_session_id?: string;
  nas_ip_address?: string;

  // Metadata
  created_at: Date;
  updated_at: Date;
  activated_at?: Date;
  terminated_at?: Date;
}
```

---

## Activation Flow

### 1. Create Pending Session

```typescript
async function createPendingSession(
  userId: string,
  packageId: string,
  transactionId: string,
): Promise<Session> {
  const package = await packageService.findById(packageId);

  const session = await db.sessions.create({
    id: generateId(),
    user_id: userId,
    package_id: packageId,
    transaction_id: transactionId,
    location_id: package.location_id,

    duration_minutes: package.duration_minutes,
    max_devices: package.max_devices,
    bandwidth_limit: package.bandwidth_limit,
    vlan_id: 20, // WiFi VLAN

    status: "PENDING",
    devices: [],

    bytes_uploaded: 0,
    bytes_downloaded: 0,
    total_bytes: 0,

    created_at: new Date(),
    updated_at: new Date(),
  });

  return session;
}
```

### 2. Activate Session (After Payment)

```typescript
async function activateSession(sessionId: string): Promise<Session> {
  const session = await sessionService.findById(sessionId);

  if (session.status !== "PENDING") {
    throw new BadRequestException("Session is not pending");
  }

  const now = new Date();
  const expectedEnd = new Date(
    now.getTime() + session.duration_minutes * 60 * 1000,
  );

  // Update session
  const activated = await db.sessions.update(sessionId, {
    status: "ACTIVE",
    start_time: now,
    expected_end_time: expectedEnd,
    activated_at: now,
    updated_at: now,
  });

  // Schedule auto-termination
  await scheduleAutoTermination(sessionId, expectedEnd);

  // Notify user
  await notificationService.send({
    user_id: session.user_id,
    type: "SESSION_ACTIVATED",
    message: `WiFi activated! Valid until ${expectedEnd.toLocaleTimeString()}`,
  });

  // Log event
  await auditService.log({
    session_id: sessionId,
    event: "SESSION_ACTIVATED",
    details: {
      start_time: now,
      expected_end_time: expectedEnd,
    },
  });

  return activated;
}
```

---

## Termination Flows

### 1. Time Expiration (Automatic)

```typescript
class SessionExpirationService {
  async scheduleExpiration(sessionId: string, expiresAt: Date): Promise<void> {
    const delay = expiresAt.getTime() - Date.now();

    // Schedule job
    await queue.add(
      "expire-session",
      {
        session_id: sessionId,
      },
      {
        delay: delay,
      },
    );
  }

  async expireSession(sessionId: string): Promise<void> {
    const session = await sessionService.findById(sessionId);

    if (session.status !== "ACTIVE") {
      return; // Already terminated
    }

    // Send RADIUS Disconnect
    await radiusService.disconnect({
      session_id: session.radius_session_id,
      reason: "Session-Timeout",
    });

    // Update session
    await db.sessions.update(sessionId, {
      status: "EXPIRED",
      end_time: new Date(),
      termination_reason: "TIME_EXPIRED",
      terminated_at: new Date(),
    });

    // Notify user
    await notificationService.send({
      user_id: session.user_id,
      type: "SESSION_EXPIRED",
      message:
        "Your WiFi session has expired. Purchase a new package to continue.",
    });

    // Log event
    await auditService.log({
      session_id: sessionId,
      event: "SESSION_EXPIRED",
      details: {
        duration_minutes: session.duration_minutes,
        bytes_used: session.total_bytes,
      },
    });
  }
}
```

### 2. PC Logout (Webhook)

```typescript
@Controller("webhooks")
export class WebhookController {
  @Post("pc-logout")
  async handlePCLogout(@Body() payload: PCLogoutPayload) {
    // Verify signature
    if (!this.verifySignature(payload)) {
      throw new UnauthorizedException("Invalid signature");
    }

    // Find active sessions for user
    const sessions = await sessionService.findActive({
      user_id: payload.user_id,
      location_id: payload.location_id,
    });

    if (sessions.length === 0) {
      return {
        success: true,
        sessions_terminated: 0,
        message: "No active sessions found",
      };
    }

    // Terminate all sessions
    for (const session of sessions) {
      await this.terminateSession(session.id, "PC_LOGOUT");
    }

    return {
      success: true,
      sessions_terminated: sessions.length,
    };
  }

  private async terminateSession(
    sessionId: string,
    reason: string,
  ): Promise<void> {
    const session = await sessionService.findById(sessionId);

    // Send RADIUS Disconnect
    if (session.radius_session_id) {
      await radiusService.disconnect({
        session_id: session.radius_session_id,
        reason: reason,
      });
    }

    // Update session
    await db.sessions.update(sessionId, {
      status: "TERMINATED",
      end_time: new Date(),
      termination_reason: reason,
      terminated_at: new Date(),
    });

    // Log event
    await auditService.log({
      session_id: sessionId,
      event: "SESSION_TERMINATED",
      details: { reason },
    });
  }
}
```

### 3. User Manual Logout

```typescript
@Controller("sessions")
export class SessionController {
  @Post(":id/logout")
  async logout(@Param("id") sessionId: string, @CurrentUser() user: User) {
    const session = await sessionService.findById(sessionId);

    // Verify ownership
    if (session.user_id !== user.id) {
      throw new ForbiddenException("Not your session");
    }

    if (session.status !== "ACTIVE") {
      throw new BadRequestException("Session is not active");
    }

    // Terminate session
    await this.terminateSession(sessionId, "USER_LOGOUT");

    return {
      success: true,
      message: "Session terminated successfully",
    };
  }
}
```

### 4. Admin Force Disconnect

```typescript
@Controller("admin/sessions")
export class AdminSessionController {
  @Post(":id/force-disconnect")
  @RequireRole("ADMIN")
  async forceDisconnect(
    @Param("id") sessionId: string,
    @CurrentUser() admin: User,
    @Body() body: { reason?: string },
  ) {
    const session = await sessionService.findById(sessionId);

    if (session.status !== "ACTIVE") {
      throw new BadRequestException("Session is not active");
    }

    // Terminate session
    await this.terminateSession(sessionId, "ADMIN_ACTION");

    // Log admin action
    await auditService.log({
      session_id: sessionId,
      event: "ADMIN_FORCE_DISCONNECT",
      admin_id: admin.id,
      details: {
        reason: body.reason || "No reason provided",
      },
    });

    return {
      success: true,
      message: "Session terminated by admin",
    };
  }
}
```

---

## RADIUS Integration

### Session Start (Access-Accept)

```typescript
// RADIUS response when user connects
{
  "Access-Accept": {
    "Session-Timeout": 10800, // 3 hours in seconds
    "Mikrotik-Rate-Limit": "2M/10M",
    "Simultaneous-Use": 1,
    "Framed-IP-Address": "192.168.20.45",
    "Reply-Message": "Welcome! Session expires at 20:00"
  }
}
```

### Session Accounting (Interim Updates)

```typescript
@Post('radius/accounting')
async accounting(@Body() request: RadiusAccountingRequest) {
  const { session_id, acct_status_type, bytes_in, bytes_out } = request;

  switch (acct_status_type) {
    case 'Start':
      await this.handleAccountingStart(session_id);
      break;

    case 'Interim-Update':
      await this.handleInterimUpdate(session_id, bytes_in, bytes_out);
      break;

    case 'Stop':
      await this.handleAccountingStop(session_id, bytes_in, bytes_out);
      break;
  }

  return { success: true };
}

private async handleInterimUpdate(
  sessionId: string,
  bytesIn: number,
  bytesOut: number
): Promise<void> {
  await db.sessions.update(sessionId, {
    bytes_uploaded: bytesOut,
    bytes_downloaded: bytesIn,
    total_bytes: bytesIn + bytesOut,
    updated_at: new Date()
  });
}
```

### Session Disconnect (CoA)

```typescript
async function sendDisconnect(session: Session): Promise<void> {
  // Send RADIUS Disconnect-Request (CoA - Change of Authorization)
  await radiusClient.send({
    type: "Disconnect-Request",
    attributes: {
      "User-Name": session.user_id,
      "Calling-Station-Id": session.devices[0]?.mac_address,
      "NAS-IP-Address": session.nas_ip_address,
    },
  });
}
```

---

## API Contracts

### Get Session Status

```typescript
GET /api/sessions/{session_id}
Authorization: Bearer {session_token}

// Response
{
  "success": true,
  "session": {
    "id": "sess_abc123",
    "status": "ACTIVE",
    "start_time": "2026-02-16T17:00:00Z",
    "expected_end_time": "2026-02-16T20:00:00Z",
    "time_remaining": {
      "hours": 2,
      "minutes": 45,
      "seconds": 30
    },
    "usage": {
      "uploaded": "125 MB",
      "downloaded": "850 MB",
      "total": "975 MB"
    },
    "devices": [
      {
        "mac": "****EE:FF",
        "connected_at": "2026-02-16T17:00:00Z"
      }
    ]
  }
}
```

### Get Session History

```typescript
GET /api/sessions/history
  ?user_id={user_id}
  &limit=20
Authorization: Bearer {session_token}

// Response
{
  "success": true,
  "sessions": [
    {
      "id": "sess_abc123",
      "package_name": "3 Hours WiFi",
      "status": "EXPIRED",
      "start_time": "2026-02-16T14:00:00Z",
      "end_time": "2026-02-16T17:00:00Z",
      "duration": "3h 0m",
      "data_used": "1.2 GB"
    }
    // ... more sessions
  ],
  "total": 45
}
```

---

## Monitoring & Alerts

```typescript
class SessionMonitoringService {
  async monitorActiveSessions(): Promise<void> {
    const sessions = await sessionService.findAll({ status: "ACTIVE" });

    for (const session of sessions) {
      // Check if session should have expired
      if (session.expected_end_time < new Date()) {
        await this.alertService.warning({
          title: "Session Overrun",
          session_id: session.id,
          message: "Session is still active past expected end time",
        });

        // Force terminate
        await sessionService.terminate(session.id, "TIME_EXPIRED");
      }

      // Check for stale sessions (no accounting updates)
      const lastUpdate = session.updated_at;
      const staleDuration = Date.now() - lastUpdate.getTime();

      if (staleDuration > 10 * 60 * 1000) {
        // 10 minutes
        await this.alertService.info({
          title: "Stale Session",
          session_id: session.id,
          last_update: lastUpdate,
        });
      }
    }
  }
}
```

---

## Testing

```typescript
describe("Session Lifecycle", () => {
  it("should activate session after payment", async () => {
    const session = await createPendingSession();

    const activated = await sessionService.activate(session.id);

    expect(activated.status).toBe("ACTIVE");
    expect(activated.start_time).toBeDefined();
    expect(activated.expected_end_time).toBeDefined();
  });

  it("should expire session after duration", async () => {
    const session = await createActiveSession({
      duration_minutes: 1, // 1 minute for testing
    });

    // Wait for expiration
    await sleep(65000); // 65 seconds

    const expired = await sessionService.findById(session.id);
    expect(expired.status).toBe("EXPIRED");
  });

  it("should terminate on PC logout", async () => {
    const session = await createActiveSession();

    await webhookController.handlePCLogout({
      user_id: session.user_id,
      location_id: session.location_id,
      event: "logout",
    });

    const terminated = await sessionService.findById(session.id);
    expect(terminated.status).toBe("TERMINATED");
    expect(terminated.termination_reason).toBe("PC_LOGOUT");
  });
});
```

---

## Performance

**Session Activation:** < 200ms  
**Session Termination:** < 300ms  
**Status Query:** < 50ms (indexed)

**Indexes:**

```sql
CREATE INDEX idx_sessions_user_status ON sessions(user_id, status);
CREATE INDEX idx_sessions_status_expected_end ON sessions(status, expected_end_time);
CREATE INDEX idx_sessions_location_status ON sessions(location_id, status);
```

---

## Related Documents

- [Device Binding](./device-binding.md)
- [PC Logout Sync](./pc-logout-sync.md)
- [Package Purchase Flow](../../08-workflows/package-purchase-flow.md)
- [RADIUS Integration](../../09-integrations/radius-server.md)

---

[← Back to Sessions](./README.md) | [← Back to Features](../README.md)
