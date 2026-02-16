# Risks & Mitigation

**Product:** IWAS – iCafe WiFi Access Service  
**Last Updated:** February 16, 2026

---

## Overview

This document identifies potential risks to the IWAS project and outlines mitigation strategies for each. Risks are categorized by type and prioritized by impact and probability.

---

## Risk Assessment Framework

### Impact Levels

- **Critical:** System failure, major revenue loss, legal issues
- **High:** Significant revenue impact, customer dissatisfaction
- **Medium:** Moderate impact on operations or revenue
- **Low:** Minor inconvenience, easily resolved

### Probability Levels

- **High:** >50% likelihood
- **Medium:** 20-50% likelihood
- **Low:** <20% likelihood

### Risk Priority Matrix

| Impact / Probability | High  | Medium | Low   |
| -------------------- | ----- | ------ | ----- |
| **Critical**         | 🔴 P1 | 🟠 P2  | 🟡 P3 |
| **High**             | 🟠 P2 | 🟡 P3  | 🟢 P4 |
| **Medium**           | 🟡 P3 | 🟢 P4  | 🟢 P4 |
| **Low**              | 🟢 P4 | 🟢 P4  | ⚪ P5 |

---

## Technical Risks

### TR-01: PC API Downtime

**Risk:** PC management system API becomes unavailable

**Impact:** High  
**Probability:** Medium  
**Priority:** 🟠 P2

**Consequences:**

- Users cannot authenticate with PC accounts
- Balance verification fails
- Payment processing blocked
- Revenue loss during downtime

**Mitigation Strategies:**

1. **Retry Logic with Exponential Backoff**

   ```typescript
   async function callPCAPI(endpoint, data, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fetch(endpoint, { body: data });
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await sleep(Math.pow(2, i) * 1000); // 1s, 2s, 4s
       }
     }
   }
   ```

2. **Cache User Data**
   - Cache user profiles in Redis (TTL: 1 hour)
   - Cache balance data (TTL: 5 minutes)
   - Serve from cache if API unavailable

3. **Fallback Authentication**
   - Allow Google OAuth as alternative
   - Queue PC balance payments for later processing
   - Notify users of degraded service

4. **SLA with PC System Vendor**
   - 99.5% uptime guarantee
   - <5 minute response time
   - Incident escalation process

**Monitoring:**

- Health check every 60 seconds
- Alert if 3 consecutive failures
- Automatic failover to cached data

---

### TR-02: RADIUS Server Failure

**Risk:** FreeRADIUS server becomes unavailable

**Impact:** Critical  
**Probability:** Low  
**Priority:** 🟠 P2

**Consequences:**

- No WiFi authentication possible
- Active sessions may be terminated
- Complete service outage
- Customer dissatisfaction

**Mitigation Strategies:**

1. **Redundant RADIUS Servers**
   - Deploy 2+ RADIUS servers per location
   - Active-active configuration
   - Automatic failover (<5 seconds)

2. **Health Monitoring**
   - Monitor RADIUS service every 30 seconds
   - Check authentication success rate
   - Alert on degradation

3. **Automated Failover**

   ```
   Primary RADIUS: 10.0.0.10
   Secondary RADIUS: 10.0.0.11
   Tertiary RADIUS: 10.0.0.12 (cloud backup)
   ```

4. **Regular Backups**
   - Daily configuration backups
   - User database replication
   - Disaster recovery plan

**Recovery Time Objective (RTO):** <5 minutes  
**Recovery Point Objective (RPO):** <1 hour

---

### TR-03: Database Performance Degradation

**Risk:** PostgreSQL database becomes slow or unresponsive

**Impact:** High  
**Probability:** Medium  
**Priority:** 🟡 P3

**Consequences:**

- Slow page loads
- Payment processing delays
- Session activation delays
- Poor user experience

**Mitigation Strategies:**

1. **Read Replicas**
   - Deploy 2+ read replicas
   - Route read queries to replicas
   - Write queries to primary only

2. **Query Optimization**
   - Index frequently queried columns
   - Use EXPLAIN ANALYZE for slow queries
   - Implement query caching

3. **Connection Pooling**

   ```typescript
   const pool = new Pool({
     max: 20, // max connections
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

4. **Caching Layer (Redis)**
   - Cache session data (TTL: 1 hour)
   - Cache user profiles (TTL: 30 minutes)
   - Cache package data (TTL: 1 day)

5. **Database Monitoring**
   - Monitor query performance
   - Track connection pool usage
   - Alert on slow queries (>1s)

**Performance Targets:**

- Query response time: <100ms (p95)
- Connection pool utilization: <80%
- Database CPU: <70%

---

### TR-04: Network Congestion

**Risk:** Network bandwidth becomes saturated

**Impact:** Medium  
**Probability:** Medium  
**Priority:** 🟢 P4

**Consequences:**

- Slow WiFi speeds
- Poor user experience
- Customer complaints
- Potential refunds

**Mitigation Strategies:**

1. **QoS Policies**
   - Prioritize PC gaming traffic (highest)
   - Limit WiFi per-user bandwidth
   - Implement fair queuing

2. **Bandwidth Monitoring**
   - Monitor real-time bandwidth usage
   - Alert on >80% utilization
   - Automatic throttling if needed

3. **Capacity Planning**
   - Calculate bandwidth needs per location
   - Upgrade ISP plan proactively
   - Reserve 20% headroom

4. **Traffic Shaping**
   ```
   PC Gaming: Priority 1, No limit
   WiFi Users: Priority 2, 10 Mbps per user
   Admin: Priority 3, 5 Mbps
   ```

**Monitoring:**

- Real-time bandwidth graphs
- Per-user bandwidth tracking
- Automatic alerts

---

### TR-05: Double Billing Due to Retry

**Risk:** Payment retry logic causes duplicate charges

**Impact:** High  
**Probability:** Low  
**Priority:** 🟡 P3

**Consequences:**

- Customer charged twice
- Customer complaints
- Refund processing overhead
- Reputation damage

**Mitigation Strategies:**

1. **Idempotency Keys**

   ```typescript
   const idempotencyKey = `wifi_${userId}_${Date.now()}_${uuidv4()}`;

   await pcAPI.debit({
     user_id: userId,
     amount: packagePrice,
     idempotency_key: idempotencyKey,
   });
   ```

2. **Transaction Logging**
   - Log all payment attempts
   - Track idempotency keys
   - Detect duplicates before processing

3. **Reconciliation Process**
   - Daily reconciliation with PC system
   - Automated refund for duplicates
   - Alert on discrepancies

4. **Database Constraints**
   ```sql
   CREATE UNIQUE INDEX idx_unique_transaction
   ON wifi_transactions(user_id, idempotency_key);
   ```

**Monitoring:**

- Track duplicate transaction attempts
- Alert on reconciliation mismatches
- Automated refund processing

---

## Business Risks

### BR-01: Low Adoption Rate

**Risk:** Fewer than expected customers purchase WiFi

**Impact:** High  
**Probability:** Medium  
**Priority:** 🟠 P2

**Consequences:**

- Revenue shortfall
- Longer payback period
- Investor concerns
- Potential project cancellation

**Mitigation Strategies:**

1. **User Education**
   - In-cafe signage and posters
   - Staff training to promote WiFi
   - Tutorial videos
   - FAQ documentation

2. **Promotional Pricing**
   - Launch promotion: 50% off first purchase
   - Referral bonuses
   - Loyalty discounts
   - Bundle deals (PC + WiFi)

3. **Reduce Friction**
   - QR code quick login (Phase 2)
   - Google OAuth (one-click)
   - Payment wallet (saved methods)
   - Auto-renewal option

4. **Targeted Marketing**
   - Email campaigns to PC users
   - In-app notifications
   - Social media advertising
   - Influencer partnerships

**Success Metrics:**

- Track adoption rate weekly
- A/B test promotions
- Survey non-adopters
- Iterate based on feedback

---

### BR-02: Customer Complaints About Speed

**Risk:** WiFi speeds don't meet customer expectations

**Impact:** Medium  
**Probability:** Medium  
**Priority:** 🟢 P4

**Consequences:**

- Customer dissatisfaction
- Negative reviews
- Refund requests
- Reduced adoption

**Mitigation Strategies:**

1. **Clear Package Descriptions**
   - Display expected speeds prominently
   - Set realistic expectations
   - Show "typical speeds" not "up to"

2. **Bandwidth Guarantees**
   - Minimum guaranteed speeds
   - SLA for performance
   - Automatic refund if below threshold

3. **Speed Testing**
   - Built-in speed test tool
   - Log actual speeds per session
   - Proactive issue detection

4. **Network Optimization**
   - Regular speed tests
   - Optimize router placement
   - Upgrade APs if needed
   - Monitor interference

**SLA:**

- Minimum speed: 80% of advertised
- Uptime: 99.5%
- Refund if below SLA

---

### BR-03: Abuse / Hotspot Sharing

**Risk:** Users share WiFi via hotspot/tethering

**Impact:** Medium  
**Probability:** High  
**Priority:** 🟡 P3

**Consequences:**

- Revenue leakage
- Network congestion
- Unfair usage
- Legitimate users affected

**Mitigation Strategies:**

1. **Device Binding**
   - Bind session to MAC address
   - Allow only 1 device per session
   - Detect MAC spoofing

2. **Tethering Detection**

   ```typescript
   function detectTethering(session) {
     // Check TTL values (Android/iOS have different TTLs)
     // Monitor user agent strings
     // Analyze traffic patterns
     // Flag suspicious behavior
   }
   ```

3. **Usage Monitoring**
   - Track bandwidth per session
   - Flag excessive usage (>10 GB/hour)
   - Automatic throttling or disconnect

4. **Automated Enforcement**
   - Auto-disconnect violators
   - Temporary ban (24 hours)
   - Permanent ban for repeat offenders

**Detection Accuracy Target:** >95%

---

### BR-04: PC System Integration Issues

**Risk:** Difficulty integrating with PC management systems

**Impact:** High  
**Probability:** Low  
**Priority:** 🟡 P3

**Consequences:**

- Delayed deployment
- Increased costs
- Limited functionality
- Customer frustration

**Mitigation Strategies:**

1. **Comprehensive API Documentation**
   - Clear API contracts
   - Code examples
   - Postman collections
   - Integration guides

2. **Sandbox Testing**
   - Test environment for integration
   - Mock PC API for development
   - Automated integration tests

3. **SLA with PC Vendor**
   - Response time guarantees
   - Integration support
   - Escalation process

4. **Fallback Options**
   - Google OAuth as alternative
   - Manual balance entry (admin)
   - Offline mode (limited)

**Integration Timeline:**

- Week 1: API documentation review
- Week 2: Sandbox testing
- Week 3: Pilot integration
- Week 4: Production deployment

---

### BR-05: Regulatory Compliance

**Risk:** Non-compliance with data privacy or telecom regulations

**Impact:** Medium  
**Probability:** Low  
**Priority:** 🟢 P4

**Consequences:**

- Legal penalties
- Service suspension
- Reputation damage
- Customer trust loss

**Mitigation Strategies:**

1. **Legal Review**
   - Consult legal counsel
   - Review Vietnam telecom laws
   - GDPR compliance (if applicable)
   - Terms of service review

2. **Data Privacy Compliance**
   - Encrypt sensitive data
   - Implement data retention policies
   - User consent for data collection
   - Right to deletion

3. **Terms of Service**
   - Clear, compliant ToS
   - User acceptance required
   - Regular updates
   - Legal review

4. **Audit Trail**
   - Log all data access
   - Track consent
   - Compliance reporting

**Compliance Checklist:**

- ✅ Data encryption (at rest and in transit)
- ✅ User consent mechanism
- ✅ Privacy policy
- ✅ Terms of service
- ✅ Data retention policy
- ✅ Right to deletion

---

## Operational Risks

### OR-01: Insufficient Staff Training

**Risk:** Staff not properly trained to support WiFi service

**Impact:** Medium  
**Probability:** Medium  
**Priority:** 🟢 P4

**Consequences:**

- Poor customer support
- Incorrect troubleshooting
- Customer frustration
- Support ticket backlog

**Mitigation Strategies:**

1. **Training Materials**
   - Video tutorials
   - Step-by-step guides
   - FAQ documentation
   - Troubleshooting flowcharts

2. **Admin Documentation**
   - Complete admin guide
   - Common issues and solutions
   - Escalation procedures

3. **Support Hotline**
   - 24/7 technical support
   - <5 minute response time
   - Remote assistance

4. **Regular Training Sessions**
   - Monthly webinars
   - Quarterly in-person training
   - Certification program

**Training Completion Target:** 100% of staff within 2 weeks

---

### OR-02: Configuration Errors

**Risk:** Incorrect network or system configuration

**Impact:** Medium  
**Probability:** Medium  
**Priority:** 🟢 P4

**Consequences:**

- Service outages
- Security vulnerabilities
- Performance issues
- Customer impact

**Mitigation Strategies:**

1. **Configuration Validation**
   - Automated validation scripts
   - Pre-deployment checks
   - Configuration templates

2. **Staging Environment**
   - Test all changes in staging
   - Automated testing
   - Approval process

3. **Rollback Procedures**
   - Version control for configs
   - One-click rollback
   - Backup configurations

4. **Change Management**
   - Change request process
   - Peer review required
   - Scheduled maintenance windows

**Deployment Process:**

1. Make changes in staging
2. Run automated tests
3. Peer review
4. Schedule deployment
5. Deploy to production
6. Monitor for issues
7. Rollback if needed

---

### OR-03: Data Loss

**Risk:** Loss of critical data due to failure or error

**Impact:** Critical  
**Probability:** Low  
**Priority:** 🟠 P2

**Consequences:**

- Lost transaction records
- Customer data loss
- Revenue reconciliation issues
- Legal liability

**Mitigation Strategies:**

1. **Daily Backups**
   - Automated daily backups
   - Incremental backups every 6 hours
   - Backup retention: 30 days

2. **Disaster Recovery Plan**
   - Documented recovery procedures
   - Regular DR drills (quarterly)
   - RTO: 4 hours
   - RPO: 6 hours

3. **Backup Testing**
   - Monthly restore tests
   - Verify backup integrity
   - Test recovery procedures

4. **Geographic Redundancy**
   - Backups in multiple regions
   - Cloud backup (AWS S3)
   - Offline backup (encrypted)

**Backup Schedule:**

- Full backup: Daily at 2 AM
- Incremental: Every 6 hours
- Transaction log: Real-time replication

---

### OR-04: Security Breach

**Risk:** Unauthorized access to system or data

**Impact:** Critical  
**Probability:** Low  
**Priority:** 🟠 P2

**Consequences:**

- Data theft
- Service disruption
- Legal liability
- Reputation damage
- Customer trust loss

**Mitigation Strategies:**

1. **Security Audits**
   - Quarterly security audits
   - Annual penetration testing
   - Vulnerability scanning

2. **Access Controls**
   - Role-based access control (RBAC)
   - Multi-factor authentication (MFA)
   - Principle of least privilege
   - Regular access reviews

3. **Encryption**
   - TLS 1.3 for all communications
   - AES-256 for data at rest
   - Encrypted backups
   - Secure key management

4. **Incident Response Plan**
   - Documented response procedures
   - Incident response team
   - Communication plan
   - Post-incident review

**Security Checklist:**

- ✅ Regular security audits
- ✅ Penetration testing
- ✅ Encrypted communications
- ✅ Encrypted data storage
- ✅ MFA for admin access
- ✅ RBAC implementation
- ✅ Incident response plan
- ✅ Security monitoring

---

## Risk Monitoring & Review

### Continuous Monitoring

**Daily:**

- System uptime
- Payment success rate
- Fraud/abuse incidents
- Support tickets

**Weekly:**

- Adoption rate trends
- Customer satisfaction
- Security alerts
- Performance metrics

**Monthly:**

- Risk assessment review
- Mitigation effectiveness
- New risk identification
- Update risk register

### Risk Register

All risks tracked in central risk register:

| Risk ID | Risk            | Impact   | Probability | Priority | Owner       | Status |
| ------- | --------------- | -------- | ----------- | -------- | ----------- | ------ |
| TR-01   | PC API Downtime | High     | Medium      | P2       | Engineering | Active |
| TR-02   | RADIUS Failure  | Critical | Low         | P2       | Engineering | Active |
| ...     | ...             | ...      | ...         | ...      | ...         | ...    |

### Escalation Process

**P1 Risks (Critical):**

- Immediate escalation to CTO
- Emergency response team activated
- Hourly status updates

**P2 Risks (High):**

- Escalation to Engineering Manager
- Daily status updates
- Mitigation plan required within 24h

**P3-P4 Risks (Medium-Low):**

- Track in risk register
- Weekly review
- Mitigation plan within 1 week

---

## Related Documents

- [Business Objectives](./objectives.md)
- [Revenue Model](./revenue-model.md)
- [Success Metrics](../01-overview/success-metrics.md)
- [Security Architecture](../04-architecture/security-architecture.md)
- [Non-Functional Requirements](../09-non-functional/)

---

[← Back to Business](./README.md) | [← Back to Hub](../README.md)
