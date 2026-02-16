# Bandwidth Management

**Feature ID:** FR-18  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a system, I need to enforce bandwidth limits per package to ensure fair usage, prevent network congestion, and deliver consistent service quality.

**Business Value:**

- **Fair usage** - Prevent bandwidth hogging
- **Service quality** - Consistent speeds for all users
- **Package differentiation** - Premium packages get higher speeds
- **Network stability** - Prevent congestion

---

## Bandwidth Tiers

| Package      | Upload  | Download | Burst   | Use Case                   |
| ------------ | ------- | -------- | ------- | -------------------------- |
| **Basic**    | 1 Mbps  | 5 Mbps   | 6 Mbps  | Social media, chat         |
| **Standard** | 2 Mbps  | 10 Mbps  | 12 Mbps | Web browsing, video (720p) |
| **Premium**  | 5 Mbps  | 20 Mbps  | 25 Mbps | HD video, downloads        |
| **Ultra**    | 10 Mbps | 50 Mbps  | 60 Mbps | 4K video, gaming           |

---

## RADIUS Implementation

### Rate Limit Attribute

```
# MikroTik-Rate-Limit format
"{upload}M/{download}M {burst-upload}M/{burst-download}M {burst-threshold}M/{burst-threshold}M {burst-time}s/{burst-time}s {priority}"

# Examples:
Basic:    "1M/5M 1.2M/6M 800k/4M 10/10 8"
Standard: "2M/10M 2.4M/12M 1.6M/8M 10/10 5"
Premium:  "5M/20M 6M/25M 4M/16M 10/10 3"
Ultra:    "10M/50M 12M/60M 8M/40M 10/10 1"
```

### RADIUS Response

```typescript
// Access-Accept with rate limit
{
  "Session-Timeout": 10800,
  "Mikrotik-Rate-Limit": "2M/10M 2.4M/12M 1.6M/8M 10/10 5",
  "Reply-Message": "Standard package: 2M↑ / 10M↓"
}
```

---

## MikroTik Configuration

### Queue Tree Setup

```routeros
# Parent queue for WiFi VLAN
/queue tree
add name=wifi-parent parent=vlan20-wifi max-limit=500M

# Dynamic queues created per session via RADIUS
# Each user gets their own queue with rate limit
```

### Simple Queue (Per-Session)

```routeros
# Created dynamically via RADIUS
/queue simple
add name=user-192.168.20.100 \
    target=192.168.20.100/32 \
    max-limit=2M/10M \
    burst-limit=2.4M/12M \
    burst-threshold=1.6M/8M \
    burst-time=10s/10s \
    priority=5/5 \
    comment="Session: sess_abc123"
```

---

## Burst Allowance

### How Burst Works

```
Normal Speed: 10 Mbps
Burst Speed:  12 Mbps (20% higher)
Burst Time:   10 seconds

Timeline:
0s  - User starts download
0s  - Speed: 12 Mbps (burst)
10s - Speed drops to 10 Mbps (normal)
```

**Use Case:** Fast page loads, quick downloads

### Burst Configuration

```typescript
interface BurstConfig {
  normal_rate: string; // "10M"
  burst_rate: string; // "12M" (20% higher)
  burst_threshold: string; // "8M" (80% of normal)
  burst_time: number; // 10 seconds
}

function calculateBurst(normalRate: number): BurstConfig {
  return {
    normal_rate: `${normalRate}M`,
    burst_rate: `${Math.ceil(normalRate * 1.2)}M`,
    burst_threshold: `${Math.ceil(normalRate * 0.8)}M`,
    burst_time: 10,
  };
}
```

---

## Backend Implementation

### Apply Rate Limit

```typescript
class BandwidthService {
  async applyRateLimit(sessionId: string, packageId: string): Promise<string> {
    // Get package bandwidth config
    const package = await this.packageService.findById(packageId);

    // Build rate limit string
    const rateLimit = this.buildRateLimitString({
      upload: package.bandwidth_upload,
      download: package.bandwidth_download,
      priority: package.bandwidth_priority,
    });

    // Store in session for RADIUS
    await this.sessionService.update(sessionId, {
      bandwidth_limit: rateLimit,
    });

    return rateLimit;
  }

  private buildRateLimitString(config: BandwidthConfig): string {
    const upload = config.upload;
    const download = config.download;

    // Calculate burst (20% higher)
    const burstUpload = Math.ceil(upload * 1.2);
    const burstDownload = Math.ceil(download * 1.2);

    // Burst threshold (80% of normal)
    const thresholdUpload = Math.ceil(upload * 0.8);
    const thresholdDownload = Math.ceil(download * 0.8);

    // Burst time
    const burstTime = 10;

    // Priority (1-8, lower = higher priority)
    const priority = config.priority || 5;

    return (
      `${upload}M/${download}M ` +
      `${burstUpload}M/${burstDownload}M ` +
      `${thresholdUpload}M/${thresholdDownload}M ` +
      `${burstTime}/${burstTime} ` +
      `${priority}`
    );
  }
}
```

---

## Monitoring

### Real-Time Bandwidth Usage

```typescript
interface BandwidthUsage {
  session_id: string;
  user_id: string;

  // Current usage
  current_upload: number; // Mbps
  current_download: number; // Mbps

  // Limits
  limit_upload: number; // Mbps
  limit_download: number; // Mbps

  // Utilization
  upload_percent: number; // %
  download_percent: number; // %

  // Burst status
  is_bursting: boolean;
  burst_time_remaining: number; // seconds

  // Total transferred
  total_uploaded: number; // MB
  total_downloaded: number; // MB

  last_updated: Date;
}
```

### MikroTik Monitoring

```routeros
# Get queue statistics
/queue simple print stats where name~"user-"

# Monitor specific user
/queue simple monitor user-192.168.20.100 once do={
  :put ("Upload: " . [get current-upload])
  :put ("Download: " . [get current-download])
}
```

### API Endpoint

```typescript
GET /api/sessions/{session_id}/bandwidth
Authorization: Bearer {session_token}

// Response
{
  "success": true,
  "bandwidth": {
    "current": {
      "upload": "1.5 Mbps",
      "download": "8.2 Mbps"
    },
    "limit": {
      "upload": "2 Mbps",
      "download": "10 Mbps"
    },
    "utilization": {
      "upload": 75,
      "download": 82
    },
    "burst": {
      "active": false,
      "available": true
    },
    "total": {
      "uploaded": "125 MB",
      "downloaded": "850 MB"
    }
  }
}
```

---

## Fair Usage Policy

### Traffic Shaping

```routeros
# Prioritize interactive traffic
/ip firewall mangle
add chain=prerouting protocol=tcp dst-port=80,443 \
    action=mark-packet new-packet-mark=http-traffic passthrough=no

add chain=prerouting protocol=udp dst-port=53 \
    action=mark-packet new-packet-mark=dns-traffic passthrough=no

# Lower priority for bulk downloads
add chain=prerouting protocol=tcp dst-port=21,22,873,3389 \
    action=mark-packet new-packet-mark=bulk-traffic passthrough=no

# Queue priorities
/queue tree
add name=http-queue parent=wifi-parent packet-mark=http-traffic priority=1
add name=dns-queue parent=wifi-parent packet-mark=dns-traffic priority=1
add name=bulk-queue parent=wifi-parent packet-mark=bulk-traffic priority=7
```

---

## Dynamic Bandwidth Adjustment

### Load-Based Adjustment

```typescript
class DynamicBandwidthService {
  async adjustBandwidthBasedOnLoad(): Promise<void> {
    // Get current network load
    const load = await this.getNetworkLoad();

    if (load > 0.9) {
      // 90% utilization
      // Reduce burst allowance
      await this.reduceBurstAllowance();
    } else if (load < 0.5) {
      // 50% utilization
      // Increase burst allowance
      await this.increaseBurstAllowance();
    }
  }

  private async reduceBurstAllowance(): Promise<void> {
    // Reduce burst from 20% to 10%
    const sessions = await this.sessionService.findActive();

    for (const session of sessions) {
      const newLimit = this.buildRateLimitString({
        ...session.bandwidth_config,
        burst_multiplier: 1.1, // 10% instead of 20%
      });

      await this.radiusService.updateRateLimit(session.id, newLimit);
    }
  }
}
```

---

## Package Upgrade Flow

### Bandwidth Upgrade

```typescript
async function upgradePackage(
  sessionId: string,
  newPackageId: string,
): Promise<void> {
  const session = await sessionService.findById(sessionId);
  const newPackage = await packageService.findById(newPackageId);

  // Calculate new rate limit
  const newRateLimit = bandwidthService.buildRateLimitString({
    upload: newPackage.bandwidth_upload,
    download: newPackage.bandwidth_download,
    priority: newPackage.bandwidth_priority,
  });

  // Update session
  await sessionService.update(sessionId, {
    package_id: newPackageId,
    bandwidth_limit: newRateLimit,
  });

  // Send RADIUS CoA to update bandwidth immediately
  await radiusService.changeOfAuthorization({
    session_id: session.radius_session_id,
    attributes: {
      "Mikrotik-Rate-Limit": newRateLimit,
    },
  });

  // Notify user
  await notificationService.send({
    user_id: session.user_id,
    type: "BANDWIDTH_UPGRADED",
    message: `Bandwidth upgraded to ${newPackage.bandwidth_download}M!`,
  });
}
```

---

## Testing

```typescript
describe("Bandwidth Management", () => {
  it("should enforce download limit", async () => {
    const session = await createSession({
      bandwidth_limit: "2M/10M",
    });

    // Simulate download
    const speed = await measureDownloadSpeed(session.ip_address);

    expect(speed).toBeLessThanOrEqual(10); // 10 Mbps limit
  });

  it("should allow burst for short duration", async () => {
    const session = await createSession({
      bandwidth_limit: "2M/10M 2.4M/12M 1.6M/8M 10/10 5",
    });

    // Start download
    const initialSpeed = await measureDownloadSpeed(session.ip_address);
    expect(initialSpeed).toBeGreaterThan(10); // Burst active
    expect(initialSpeed).toBeLessThanOrEqual(12); // Burst limit

    // Wait for burst to expire
    await sleep(15000); // 15 seconds

    const finalSpeed = await measureDownloadSpeed(session.ip_address);
    expect(finalSpeed).toBeLessThanOrEqual(10); // Back to normal
  });
});
```

---

## Performance

**Rate Limit Application:** < 100ms  
**CoA Update:** < 200ms  
**Monitoring Query:** < 50ms

---

## Related Documents

- [VLAN Isolation](./vlan-isolation.md)
- [Anti-Abuse](./anti-abuse.md)
- [Package Management](../packages/package-management.md)
- [MikroTik Integration](../../09-integrations/mikrotik-routeros.md)

---

[← Back to Network](./README.md) | [← Back to Features](../README.md)
