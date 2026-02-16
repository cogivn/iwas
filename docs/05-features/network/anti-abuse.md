# Anti-Abuse & Connection Limiting

**Feature ID:** FR-19  
**Priority:** P1 (High)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a system, I need to detect and prevent network abuse (P2P, excessive connections, bandwidth hogging) to ensure fair usage and network stability.

**Business Value:**

- **Fair usage** - Prevent users from monopolizing bandwidth
- **Network stability** - Avoid congestion from abuse
- **Cost control** - Reduce excessive bandwidth consumption
- **User experience** - Better performance for legitimate users

---

## Abuse Types

### 1. Connection Flooding

```
Normal user:  10-50 concurrent connections
P2P user:     500-5000 concurrent connections ⚠️
DDoS attack:  10,000+ concurrent connections 🚨
```

### 2. Bandwidth Hogging

```
Normal user:  Sporadic usage, web browsing
Abuser:       Constant max bandwidth, 24/7 downloads
```

### 3. Hotspot Tethering

```
Single device:  1 MAC address, consistent TTL
Tethering:      1 MAC, multiple TTLs (NAT detected) ⚠️
```

---

## Connection Rate Limiting

### Limits

| Metric                     | Limit | Action        |
| -------------------------- | ----- | ------------- |
| **Concurrent Connections** | 100   | Warning       |
| **Concurrent Connections** | 200   | Throttle      |
| **Concurrent Connections** | 500   | Temporary ban |
| **New Connections/sec**    | 10    | Warning       |
| **New Connections/sec**    | 20    | Throttle      |

---

## MikroTik Implementation

### Connection Tracking

```routeros
# Enable connection tracking
/ip firewall connection tracking
set enabled=yes

# Track connections per IP
/ip firewall filter
add chain=forward src-address-list=wifi-users \
    connection-limit=100,32 \
    action=accept \
    comment="Allow up to 100 connections per IP"

add chain=forward src-address-list=wifi-users \
    connection-limit=101,32 \
    action=add-src-to-address-list \
    address-list=connection-abusers \
    address-list-timeout=30m \
    comment="Flag abusers"

# Throttle abusers
/queue simple
add name=abuser-throttle \
    target=connection-abusers \
    max-limit=512k/2M \
    comment="Throttle connection abusers"
```

### P2P Detection

```routeros
# Detect P2P protocols
/ip firewall layer7-protocol
add name=bittorrent regexp="^(\\x13bittorrent protocol|azver|get /announce\\?info_hash=)"

# Mark P2P traffic
/ip firewall mangle
add chain=prerouting protocol=tcp \
    layer7-protocol=bittorrent \
    action=mark-connection new-connection-mark=p2p-conn

add chain=prerouting protocol=udp \
    layer7-protocol=bittorrent \
    action=mark-connection new-connection-mark=p2p-conn

# Throttle P2P
/queue simple
add name=p2p-throttle \
    connection-mark=p2p-conn \
    max-limit=256k/1M \
    priority=8 \
    comment="Throttle P2P traffic"
```

---

## Backend Implementation

### Connection Monitor

```typescript
class ConnectionMonitorService {
  async monitorConnections(): Promise<void> {
    const sessions = await this.sessionService.findActive();

    for (const session of sessions) {
      const stats = await this.getConnectionStats(session.ip_address);

      // Check concurrent connections
      if (stats.concurrent_connections > 100) {
        await this.handleConnectionAbuse(session, stats);
      }

      // Check connection rate
      if (stats.connections_per_second > 10) {
        await this.handleConnectionFlood(session, stats);
      }
    }
  }

  private async handleConnectionAbuse(
    session: Session,
    stats: ConnectionStats,
  ): Promise<void> {
    const level = this.getAbuseLevel(stats.concurrent_connections);

    switch (level) {
      case "WARNING":
        await this.sendWarning(session);
        break;

      case "THROTTLE":
        await this.throttleBandwidth(session);
        break;

      case "BAN":
        await this.temporaryBan(session);
        break;
    }

    // Log event
    await this.auditService.log({
      event: "CONNECTION_ABUSE_DETECTED",
      session_id: session.id,
      concurrent_connections: stats.concurrent_connections,
      action: level,
    });
  }

  private getAbuseLevel(connections: number): AbuseLevel {
    if (connections >= 500) return "BAN";
    if (connections >= 200) return "THROTTLE";
    if (connections >= 100) return "WARNING";
    return "NORMAL";
  }
}
```

### Warning System

```typescript
interface AbuseWarning {
  id: string;
  session_id: string;
  user_id: string;

  type: "CONNECTION_FLOOD" | "BANDWIDTH_HOG" | "P2P_DETECTED" | "TETHERING";
  severity: "LOW" | "MEDIUM" | "HIGH";

  details: {
    concurrent_connections?: number;
    bandwidth_usage?: number;
    protocol_detected?: string;
  };

  action_taken: "WARNING" | "THROTTLE" | "BAN";
  expires_at?: Date;

  created_at: Date;
}

async function sendWarning(
  session: Session,
  type: string,
  details: any,
): Promise<void> {
  // Create warning record
  await db.abuse_warnings.create({
    session_id: session.id,
    user_id: session.user_id,
    type: type,
    severity: "MEDIUM",
    details: details,
    action_taken: "WARNING",
    created_at: new Date(),
  });

  // Notify user
  await notificationService.send({
    user_id: session.user_id,
    type: "ABUSE_WARNING",
    title: "Network Usage Warning",
    message: `Excessive ${type} detected. Please reduce network usage or your connection may be throttled.`,
    priority: "HIGH",
  });
}
```

---

## Throttling

### Bandwidth Throttle

```typescript
async function throttleBandwidth(session: Session): Promise<void> {
  // Reduce bandwidth to 25% of original
  const originalLimit = session.bandwidth_limit;
  const throttledLimit = this.calculateThrottledLimit(originalLimit);

  // Apply throttle via RADIUS CoA
  await radiusService.changeOfAuthorization({
    session_id: session.radius_session_id,
    attributes: {
      "Mikrotik-Rate-Limit": throttledLimit,
    },
  });

  // Update session
  await sessionService.update(session.id, {
    is_throttled: true,
    throttled_at: new Date(),
    throttled_until: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
  });

  // Notify user
  await notificationService.send({
    user_id: session.user_id,
    type: "BANDWIDTH_THROTTLED",
    message:
      "Your bandwidth has been reduced due to excessive usage. Normal speed will resume in 30 minutes.",
  });
}

function calculateThrottledLimit(originalLimit: string): string {
  // Parse "2M/10M" → [2, 10]
  const [upload, download] = originalLimit.split("/").map((s) => parseInt(s));

  // Reduce to 25%
  const throttledUpload = Math.max(1, Math.floor(upload * 0.25));
  const throttledDownload = Math.max(1, Math.floor(download * 0.25));

  return `${throttledUpload}M/${throttledDownload}M`;
}
```

---

## Temporary Ban

### Ban Implementation

```typescript
async function temporaryBan(
  session: Session,
  duration: number = 30 * 60 * 1000, // 30 minutes
): Promise<void> {
  // Terminate session
  await sessionService.terminate(session.id, "ABUSE_DETECTED");

  // Add to ban list
  await db.banned_users.create({
    user_id: session.user_id,
    ip_address: session.ip_address,
    mac_address: session.devices[0]?.mac_address,
    reason: "Excessive connection abuse",
    banned_at: new Date(),
    expires_at: new Date(Date.now() + duration),
  });

  // Block in MikroTik
  await mikrotikService.addToAddressList({
    list: "banned-users",
    address: session.ip_address,
    timeout: "30m",
    comment: `Banned: ${session.user_id}`,
  });

  // Notify user
  await notificationService.send({
    user_id: session.user_id,
    type: "TEMPORARY_BAN",
    message:
      "Your connection has been temporarily banned due to network abuse. You can reconnect in 30 minutes.",
  });

  // Alert admin
  await alertService.warning({
    title: "User Temporarily Banned",
    user_id: session.user_id,
    reason: "Connection abuse",
    duration: "30 minutes",
  });
}
```

---

## Tethering Detection (Phase 2)

### TTL Analysis

```typescript
class TetheringDetectionService {
  async detectTethering(session: Session): Promise<boolean> {
    // Collect TTL values from packets
    const ttlValues = await this.collectTTLValues(session.ip_address);

    // Normal: All packets have same TTL (e.g., 64)
    // Tethering: Multiple TTLs (e.g., 64, 63, 62) due to NAT
    const uniqueTTLs = new Set(ttlValues);

    if (uniqueTTLs.size > 2) {
      // Multiple TTLs detected - likely tethering
      await this.handleTetheringDetected(session, Array.from(uniqueTTLs));
      return true;
    }

    return false;
  }

  private async handleTetheringDetected(
    session: Session,
    ttls: number[],
  ): Promise<void> {
    await this.sendWarning(session, "TETHERING", {
      ttl_values: ttls,
      message: "Multiple device TTLs detected",
    });

    // For single-device packages, throttle
    if (session.max_devices === 1) {
      await this.throttleBandwidth(session);
    }
  }
}
```

---

## Monitoring Dashboard

### Abuse Metrics

```typescript
interface AbuseMetrics {
  // Warnings
  total_warnings: number;
  warnings_by_type: {
    connection_flood: number;
    bandwidth_hog: number;
    p2p_detected: number;
    tethering: number;
  };

  // Actions
  total_throttled: number;
  total_banned: number;

  // Top offenders
  top_offenders: Array<{
    user_id: string;
    warning_count: number;
    last_offense: Date;
  }>;

  // Network health
  avg_connections_per_user: number;
  p2p_traffic_percent: number;
}
```

### API Endpoint

```typescript
GET /api/admin/abuse-metrics
  ?start_date=2026-02-16
  &end_date=2026-02-17
Authorization: Bearer {admin_token}

// Response
{
  "success": true,
  "metrics": {
    "total_warnings": 45,
    "warnings_by_type": {
      "connection_flood": 30,
      "bandwidth_hog": 10,
      "p2p_detected": 5,
      "tethering": 0
    },
    "total_throttled": 12,
    "total_banned": 3,
    "top_offenders": [
      {
        "user_id": "user_123",
        "warning_count": 5,
        "last_offense": "2026-02-16T15:30:00Z"
      }
    ]
  }
}
```

---

## Whitelist

### Legitimate High-Usage Users

```typescript
async function addToWhitelist(userId: string, reason: string): Promise<void> {
  await db.abuse_whitelist.create({
    user_id: userId,
    reason: reason,
    added_by: "admin",
    created_at: new Date(),
  });

  // Whitelisted users bypass abuse detection
}

async function isWhitelisted(userId: string): Promise<boolean> {
  const entry = await db.abuse_whitelist.findOne({ user_id: userId });
  return !!entry;
}
```

---

## Testing

```typescript
describe("Anti-Abuse", () => {
  it("should detect connection flooding", async () => {
    const session = await createActiveSession();

    // Simulate 150 concurrent connections
    await simulateConnections(session.ip_address, 150);

    // Check if warning was sent
    const warnings = await db.abuse_warnings.find({
      session_id: session.id,
      type: "CONNECTION_FLOOD",
    });

    expect(warnings.length).toBeGreaterThan(0);
  });

  it("should throttle persistent abusers", async () => {
    const session = await createActiveSession();

    // Simulate 250 concurrent connections
    await simulateConnections(session.ip_address, 250);

    // Wait for throttle
    await sleep(1000);

    const updated = await sessionService.findById(session.id);
    expect(updated.is_throttled).toBe(true);
  });

  it("should ban extreme abusers", async () => {
    const session = await createActiveSession();

    // Simulate 600 concurrent connections
    await simulateConnections(session.ip_address, 600);

    // Check if banned
    const banned = await db.banned_users.findOne({
      user_id: session.user_id,
    });

    expect(banned).toBeDefined();
  });
});
```

---

## Performance

**Connection Check:** < 50ms  
**Throttle Application:** < 200ms  
**Ban Enforcement:** < 300ms

---

## Related Documents

- [VLAN Isolation](./vlan-isolation.md)
- [Bandwidth Management](./bandwidth-management.md)
- [Session Lifecycle](../sessions/session-lifecycle.md)
- [MikroTik Integration](../../09-integrations/mikrotik-routeros.md)

---

[← Back to Network](./README.md) | [← Back to Features](../README.md)
