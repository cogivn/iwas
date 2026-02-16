# Success Metrics

**Product:** IWAS – iCafe WiFi Access Service  
**Last Updated:** February 16, 2026

---

## Overview

This document defines the key performance indicators (KPIs) and success metrics for IWAS. These metrics are tracked continuously to measure product success, guide decision-making, and identify areas for improvement.

---

## Primary Metrics (North Star)

### 1. Monthly WiFi Revenue per Location

**Definition:** Total WiFi revenue generated per location per month

**Target:**

- **Month 3:** 3-5M VND
- **Month 6:** 5-10M VND
- **Month 12:** 10-15M VND

**Measurement:**

```sql
SELECT
  location_id,
  DATE_TRUNC('month', created_at) as month,
  SUM(amount) as monthly_revenue
FROM wifi_transactions
WHERE status = 'SUCCESS'
GROUP BY location_id, month
```

**Why it matters:** Direct measure of business value and ROI

---

### 2. WiFi Adoption Rate

**Definition:** Percentage of PC customers who purchase WiFi

**Target:**

- **Month 3:** 20%
- **Month 6:** 30%
- **Month 12:** 40%

**Measurement:**

```sql
SELECT
  COUNT(DISTINCT wifi_user_id) / COUNT(DISTINCT pc_user_id) * 100 as adoption_rate
FROM daily_active_users
WHERE date = CURRENT_DATE
```

**Why it matters:** Indicates product-market fit and customer value

---

## Revenue Metrics

### 3. WiFi ARPU (Average Revenue Per User)

**Definition:** Average revenue generated per WiFi user per month

**Target:** 50,000-100,000 VND

**Measurement:**

```sql
SELECT
  SUM(amount) / COUNT(DISTINCT user_id) as arpu
FROM wifi_transactions
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND status = 'SUCCESS'
```

**Breakdown:**

- **Low spenders:** <30,000 VND (casual users)
- **Medium spenders:** 30,000-80,000 VND (regular users)
- **High spenders:** >80,000 VND (power users)

---

### 4. Average Transaction Value

**Definition:** Average amount per WiFi purchase

**Target:** 7,000-10,000 VND

**Measurement:**

```sql
SELECT AVG(amount) as avg_transaction_value
FROM wifi_transactions
WHERE status = 'SUCCESS'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
```

---

### 5. Revenue by Payment Method

**Definition:** Distribution of revenue across payment methods

**Target Distribution:**

- PC Balance: 50-60%
- E-Wallet: 30-40%
- Bank QR: 10-20%

**Measurement:**

```sql
SELECT
  payment_method,
  SUM(amount) as revenue,
  COUNT(*) as transactions,
  SUM(amount) / SUM(SUM(amount)) OVER () * 100 as percentage
FROM wifi_transactions
WHERE status = 'SUCCESS'
GROUP BY payment_method
```

---

## User Engagement Metrics

### 6. Daily Active Users (DAU)

**Definition:** Unique users with active WiFi sessions per day

**Target:**

- Per location: 30-50 users/day
- System-wide: 1,500-2,500 users/day (50 locations)

**Measurement:**

```sql
SELECT
  DATE(session_start) as date,
  COUNT(DISTINCT user_id) as dau
FROM wifi_sessions
WHERE session_start >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY date
```

---

### 7. Session Duration

**Definition:** Average WiFi session length

**Target:** 2-4 hours

**Measurement:**

```sql
SELECT
  AVG(EXTRACT(EPOCH FROM (session_end - session_start)) / 3600) as avg_hours
FROM wifi_sessions
WHERE session_end IS NOT NULL
  AND session_start >= CURRENT_DATE - INTERVAL '30 days'
```

**Breakdown by Package:**

- 1-hour package: 0.8-1.2 hours actual usage
- 3-hour package: 2.5-3.5 hours actual usage
- 6-hour package: 5-6.5 hours actual usage

---

### 8. Repeat Purchase Rate

**Definition:** Percentage of users who make multiple purchases

**Target:** >60% within 30 days

**Measurement:**

```sql
SELECT
  COUNT(DISTINCT CASE WHEN purchase_count > 1 THEN user_id END) /
  COUNT(DISTINCT user_id) * 100 as repeat_rate
FROM (
  SELECT user_id, COUNT(*) as purchase_count
  FROM wifi_transactions
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND status = 'SUCCESS'
  GROUP BY user_id
) subquery
```

---

### 9. Purchase Frequency

**Definition:** Average number of purchases per user per month

**Target:** 3-5 purchases/month

**Measurement:**

```sql
SELECT
  AVG(purchase_count) as avg_frequency
FROM (
  SELECT user_id, COUNT(*) as purchase_count
  FROM wifi_transactions
  WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND status = 'SUCCESS'
  GROUP BY user_id
) subquery
```

---

## Operational Metrics

### 10. System Uptime

**Definition:** Percentage of time the system is operational

**Target:** 99.9% (< 43 minutes downtime per month)

**Measurement:**

- Monitored via health checks every 60 seconds
- Downtime = any period where health check fails

**SLA:**

- **Critical:** 99.9% uptime
- **Acceptable:** 99.5% uptime
- **Unacceptable:** <99.5% uptime

---

### 11. Payment Success Rate

**Definition:** Percentage of payment attempts that succeed

**Target:** >95%

**Measurement:**

```sql
SELECT
  payment_method,
  COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) /
  COUNT(*) * 100 as success_rate
FROM wifi_transactions
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY payment_method
```

**Breakdown by Method:**

- PC Balance: >98% (direct integration)
- E-Wallet: >95% (depends on provider)
- Bank QR: >90% (manual confirmation)

---

### 12. Average Session Activation Time

**Definition:** Time from payment to WiFi activation

**Target:** <5 seconds

**Measurement:**

```sql
SELECT
  AVG(EXTRACT(EPOCH FROM (session_start - payment_time))) as avg_seconds
FROM wifi_sessions s
JOIN wifi_transactions t ON s.transaction_id = t.id
WHERE t.created_at >= CURRENT_DATE - INTERVAL '7 days'
```

---

## Customer Satisfaction Metrics

### 13. Customer Satisfaction Score (CSAT)

**Definition:** Average rating from post-session surveys

**Target:** >4.0/5.0

**Measurement:**

- Survey sent after each session
- 5-point scale: "How satisfied were you with your WiFi experience?"

**Response Rate Target:** >30%

---

### 14. Net Promoter Score (NPS)

**Definition:** Likelihood to recommend IWAS to others

**Target:** >30

**Measurement:**

- Survey question: "How likely are you to recommend IWAS WiFi to a friend?" (0-10 scale)
- NPS = % Promoters (9-10) - % Detractors (0-6)

**Categories:**

- **Promoters (9-10):** >50%
- **Passives (7-8):** 30-40%
- **Detractors (0-6):** <20%

---

### 15. Support Ticket Volume

**Definition:** Number of support tickets per 1,000 sessions

**Target:** <10 tickets per 1,000 sessions

**Measurement:**

```sql
SELECT
  COUNT(DISTINCT ticket_id) /
  (COUNT(DISTINCT session_id) / 1000.0) as tickets_per_1k
FROM support_tickets t
JOIN wifi_sessions s ON t.session_id = s.id
WHERE t.created_at >= CURRENT_DATE - INTERVAL '30 days'
```

**Common Issues to Track:**

- Connection problems
- Payment failures
- Slow speeds
- Authentication issues

---

## Security & Anti-Abuse Metrics

### 16. Fraud/Abuse Rate

**Definition:** Percentage of sessions flagged for abuse

**Target:** <1%

**Measurement:**

```sql
SELECT
  COUNT(CASE WHEN is_flagged = true THEN 1 END) /
  COUNT(*) * 100 as abuse_rate
FROM wifi_sessions
WHERE session_start >= CURRENT_DATE - INTERVAL '30 days'
```

**Abuse Types:**

- Hotspot/tethering detected
- Excessive bandwidth usage
- Multiple device binding attempts
- Suspicious traffic patterns

---

### 17. Payment Fraud Rate

**Definition:** Percentage of fraudulent transactions

**Target:** <0.1%

**Measurement:**

```sql
SELECT
  COUNT(CASE WHEN is_fraud = true THEN 1 END) /
  COUNT(*) * 100 as fraud_rate
FROM wifi_transactions
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
```

---

## Network Performance Metrics

### 18. Average WiFi Speed

**Definition:** Average download/upload speeds for WiFi users

**Target:**

- Download: 10-20 Mbps
- Upload: 5-10 Mbps

**Measurement:**

- Periodic speed tests from client devices
- Logged in session metadata

---

### 19. PC Gaming Impact

**Definition:** Change in PC gaming latency/performance

**Target:** 0% degradation (no measurable impact)

**Measurement:**

- Monitor PC network latency before/after WiFi deployment
- Track PC user complaints

**Acceptable:** <5ms increase in average latency

---

## Business Health Metrics

### 20. Customer Acquisition Cost (CAC)

**Definition:** Cost to acquire one new WiFi customer

**Target:** <20,000 VND

**Calculation:**

```
CAC = (Marketing + Sales + Onboarding Costs) / New Customers
```

---

### 21. Customer Lifetime Value (LTV)

**Definition:** Total revenue expected from a customer

**Target:** >200,000 VND (LTV:CAC ratio > 10:1)

**Calculation:**

```
LTV = ARPU × Average Customer Lifespan (months)
```

**Assumptions:**

- ARPU: 70,000 VND/month
- Average lifespan: 6 months
- LTV = 420,000 VND

---

### 22. Payback Period

**Definition:** Time to recover customer acquisition cost

**Target:** <3 months

**Calculation:**

```
Payback Period = CAC / Monthly ARPU
```

---

## Reporting & Dashboards

### Real-Time Dashboard

**Metrics displayed:**

- Current active sessions
- Revenue today (vs. yesterday)
- Payment success rate (last hour)
- System uptime
- Active alerts

**Refresh:** Every 60 seconds

---

### Daily Report

**Metrics included:**

- DAU
- Revenue by location
- New users
- Repeat purchase rate
- Top packages sold
- Payment method distribution

**Delivery:** Email at 9:00 AM daily

---

### Weekly Report

**Metrics included:**

- Week-over-week growth
- Adoption rate trends
- CSAT scores
- Support ticket summary
- Fraud/abuse incidents

**Delivery:** Email every Monday

---

### Monthly Business Review

**Metrics included:**

- All primary metrics
- Revenue trends
- User cohort analysis
- LTV/CAC analysis
- Feature usage statistics
- Strategic recommendations

**Delivery:** First week of each month

---

## Metric Ownership

| Metric                | Owner         | Review Frequency |
| --------------------- | ------------- | ---------------- |
| Revenue Metrics       | Product Team  | Daily            |
| User Engagement       | Product Team  | Daily            |
| Operational Metrics   | Engineering   | Real-time        |
| Customer Satisfaction | Support Team  | Weekly           |
| Security & Anti-Abuse | Security Team | Daily            |
| Network Performance   | Network Team  | Real-time        |
| Business Health       | Finance Team  | Monthly          |

---

## Related Documents

- [Executive Summary](./executive-summary.md)
- [Product Vision](./product-vision.md)
- [Target Market](./target-market.md)
- [Business Objectives](../02-business/objectives.md)
- [Admin Dashboard](../05-features/admin/reports-analytics.md)

---

[← Back to Overview](./README.md) | [← Back to Hub](../README.md)
