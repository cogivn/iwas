# User Journeys

**Product:** IWAS – iCafe WiFi Access Service  
**Last Updated:** February 16, 2026

---

## Overview

This document maps out the complete user journeys for different user types, from first discovery to becoming a loyal customer. Understanding these journeys helps identify friction points and opportunities for improvement.

---

## Journey 1: First-Time PC Customer

### Context

- Regular PC gamer at iCafe
- Has PC account with balance
- Owns smartphone
- Never used IWAS WiFi before

### Journey Map

#### Stage 1: Discovery

**Touchpoint:** In-cafe signage, staff recommendation

**Actions:**

1. Arrives at iCafe for PC gaming session
2. Sees IWAS WiFi promotional poster
3. Asks staff about WiFi service
4. Staff explains: "Login with Google, link payment, one-click purchase"

**Thoughts:**

- "I could use WiFi for my phone while gaming"
- "How much does it cost?"
- "Is it complicated to set up?"

**Emotions:** 😊 Curious, interested

**Pain Points:**

- Unclear pricing
- Uncertain about setup complexity

---

#### Stage 2: Connection

**Touchpoint:** WiFi settings, captive portal

**Actions:**

1. Opens WiFi settings on smartphone
2. Connects to "iCafe-WiFi" network
3. Automatically redirected to captive portal
4. Sees clean, modern login page

**Thoughts:**

- "Looks professional"
- "Google login is convenient"

**Emotions:** 😊 Positive first impression

**Pain Points:**

- None (if redirect works smoothly)
- Potential: Redirect doesn't work on some devices

---

#### Stage 3: Authentication

**Touchpoint:** Google OAuth login

**Actions:**

1. Clicks "Sign in with Google" button
2. Redirected to Google consent screen
3. Selects Google account
4. Grants permissions (email, profile)
5. Redirected back to IWAS

**Thoughts:**

- "Easy, I don't need to create a new account"
- "I trust Google login"

**Emotions:** 😊 Relieved, confident

**Pain Points:**

- None (if OAuth flow is smooth)
- Potential: OAuth errors, slow redirect

**Success Criteria:**

- ✅ OAuth completes in <10 seconds
- ✅ Clear permission explanation
- ✅ Smooth redirect back to IWAS

---

#### Stage 4: Onboarding (Payment Wallet)

**Touchpoint:** Payment wallet setup screen

**Actions:**

1. Sees onboarding screen: "Link your payment methods"
2. Views available options:
   - ✅ PC Account Balance (recommended)
   - E-Wallet (Momo, ZaloPay, VNPay)
   - Bank QR Code
3. Selects "PC Account Balance"
4. Enters PC username/password
5. System validates and links PC account
6. Sets PC balance as default payment method
7. Sees confirmation: "Payment method linked successfully"

**Thoughts:**

- "Great, I can use my PC balance"
- "I don't need to add money separately"
- "This is convenient"

**Emotions:** 😊 Satisfied, impressed

**Pain Points:**

- Potential: PC account validation fails
- Potential: Unclear instructions

**Success Criteria:**

- ✅ Clear instructions
- ✅ PC account links in <5 seconds
- ✅ Confirmation message shown

---

#### Stage 5: Package Selection

**Touchpoint:** Package selection screen

**Actions:**

1. Sees available WiFi packages:
   - 1 hour: 5,000 VND
   - 3 hours: 12,000 VND (recommended)
   - 6 hours: 20,000 VND
2. Checks PC balance: "Balance: 150,000 VND"
3. Selects 3-hour package
4. Reviews order:
   - Package: 3 hours
   - Price: 12,000 VND
   - Payment: PC Balance
   - New balance: 138,000 VND

**Thoughts:**

- "3 hours is good value"
- "I have enough balance"
- "Clear pricing, no hidden fees"

**Emotions:** 😊 Confident in choice

**Pain Points:**

- Potential: Unclear package descriptions
- Potential: Insufficient balance

**Success Criteria:**

- ✅ Clear package comparison
- ✅ Balance displayed prominently
- ✅ Recommended package highlighted

---

#### Stage 6: Purchase

**Touchpoint:** Checkout and payment

**Actions:**

1. Clicks "Purchase" button
2. Sees loading indicator: "Processing payment..."
3. Payment succeeds in 2 seconds
4. Sees success screen:
   - ✅ "WiFi activated!"
   - Session: 3 hours
   - Expires: 7:30 PM
   - Speed: Up to 20 Mbps

**Thoughts:**

- "That was fast!"
- "Super easy"

**Emotions:** 😄 Delighted, satisfied

**Pain Points:**

- Potential: Payment fails
- Potential: Slow activation

**Success Criteria:**

- ✅ Payment completes in <5 seconds
- ✅ Clear success message
- ✅ Session details shown

---

#### Stage 7: Usage

**Touchpoint:** Active WiFi session

**Actions:**

1. Starts browsing on smartphone
2. Checks speed: 18 Mbps download
3. Streams music on Spotify
4. Browses social media
5. Downloads game updates

**Thoughts:**

- "Fast and stable"
- "Works great"

**Emotions:** 😊 Satisfied

**Pain Points:**

- Potential: Slow speeds
- Potential: Connection drops

**Success Criteria:**

- ✅ Speeds meet expectations (10-20 Mbps)
- ✅ Stable connection
- ✅ No interruptions

---

#### Stage 8: Session End

**Touchpoint:** Session expiration

**Actions:**

1. Receives notification: "WiFi session expires in 10 minutes"
2. Option to extend session
3. Chooses to let it expire
4. Session ends automatically
5. Receives summary:
   - Duration: 3 hours
   - Data used: 2.5 GB
   - Average speed: 18 Mbps

**Thoughts:**

- "Good session"
- "I'll use this again"

**Emotions:** 😊 Satisfied

**Success Criteria:**

- ✅ Clear expiration warning
- ✅ Easy extension option
- ✅ Session summary provided

---

### Journey Summary

**Total Time:** ~5 minutes (setup) + 3 hours (usage)  
**Friction Points:** 2 (potential OAuth/payment issues)  
**Delight Moments:** 3 (easy login, fast payment, good speeds)  
**Overall Satisfaction:** 😄 High

**Key Takeaways:**

- ✅ Google OAuth reduces friction
- ✅ Payment wallet enables one-click purchase
- ✅ Clear pricing builds trust
- ✅ Fast activation delights users

---

## Journey 2: Returning PC Customer

### Context

- Used IWAS WiFi before
- Already has Google account linked
- Payment method saved
- Knows the process

### Journey Map

#### Stage 1: Connection

**Actions:**

1. Arrives at iCafe
2. Connects to "iCafe-WiFi" network
3. Auto-redirected to captive portal
4. System recognizes device/account
5. Shows: "Welcome back, [Name]!"

**Thoughts:**

- "Nice, it remembers me"

**Emotions:** 😊 Pleased

**Time:** 10 seconds

---

#### Stage 2: Quick Login

**Actions:**

1. Sees "Continue as [Name]" button
2. Clicks button
3. Authenticated instantly via saved session

**Thoughts:**

- "So fast!"

**Emotions:** 😄 Delighted

**Time:** 2 seconds

---

#### Stage 3: One-Click Purchase

**Actions:**

1. Sees package selection with default selected (3 hours)
2. Default payment method pre-selected (PC Balance)
3. Clicks "Purchase" button
4. Payment processes instantly
5. WiFi activated

**Thoughts:**

- "Literally one click!"
- "This is amazing"

**Emotions:** 😄 Extremely satisfied

**Time:** 3 seconds

**Success Criteria:**

- ✅ Total time from connection to activation: <15 seconds
- ✅ Zero friction
- ✅ One-click purchase

---

### Journey Summary

**Total Time:** ~15 seconds (setup) + 3 hours (usage)  
**Friction Points:** 0  
**Delight Moments:** 2 (auto-recognition, one-click)  
**Overall Satisfaction:** 😄 Extremely high

**Key Takeaways:**

- ✅ Returning user experience is seamless
- ✅ Payment wallet eliminates friction
- ✅ Auto-recognition delights users
- ✅ One-click purchase is killer feature

---

## Journey 3: First-Time Guest User

### Context

- No PC account
- Visiting iCafe for WiFi only (not renting PC)
- Has smartphone/laptop
- Prefers e-wallet payment

### Journey Map

#### Stage 1: Discovery

**Actions:**

1. Enters iCafe looking for WiFi
2. Asks staff: "Can I use WiFi without renting a PC?"
3. Staff: "Yes! Connect to iCafe-WiFi and login with Google"

**Thoughts:**

- "Great, I don't need to rent a PC"

**Emotions:** 😊 Relieved

---

#### Stage 2: Authentication

**Actions:**

1. Connects to WiFi
2. Redirected to captive portal
3. Clicks "Sign in with Google"
4. Completes OAuth
5. Account created automatically

**Thoughts:**

- "Easy login"

**Emotions:** 😊 Satisfied

**Time:** 15 seconds

---

#### Stage 3: Payment Method Selection

**Actions:**

1. Sees onboarding: "Link your payment method"
2. Options shown:
   - PC Account (grayed out - no PC account)
   - ✅ E-Wallet (Momo, ZaloPay, VNPay)
   - Bank QR Code
3. Selects "Momo"
4. Enters Momo phone number
5. Receives OTP, enters it
6. Momo account linked
7. Sets as default payment

**Thoughts:**

- "I can use Momo, perfect"

**Emotions:** 😊 Satisfied

**Time:** 30 seconds

---

#### Stage 4: Package Selection & Purchase

**Actions:**

1. Selects 3-hour package (12,000 VND)
2. Clicks "Purchase"
3. Redirected to Momo app
4. Confirms payment in Momo
5. Redirected back to IWAS
6. WiFi activated

**Thoughts:**

- "Smooth Momo integration"

**Emotions:** 😊 Satisfied

**Time:** 20 seconds

---

### Journey Summary

**Total Time:** ~1 minute (setup) + 3 hours (usage)  
**Friction Points:** 1 (Momo OTP)  
**Delight Moments:** 2 (easy login, Momo integration)  
**Overall Satisfaction:** 😊 High

**Key Takeaways:**

- ✅ Guest users can access without PC account
- ✅ E-wallet integration is crucial
- ✅ Momo/ZaloPay are preferred by guests

---

## Journey 4: iCafe Owner/Manager

### Context

- Managing 3 iCafe locations
- Wants to monitor WiFi revenue
- Needs to configure packages

### Journey Map

#### Stage 1: Login

**Actions:**

1. Opens admin dashboard URL
2. Enters email/password
3. Completes 2FA (SMS code)
4. Logged in

**Time:** 20 seconds

---

#### Stage 2: Dashboard Overview

**Actions:**

1. Sees dashboard with key metrics:
   - Today's revenue: 450,000 VND
   - Active sessions: 23
   - WiFi adoption: 28%
2. Views revenue chart (last 7 days)
3. Checks top-performing location

**Thoughts:**

- "Revenue is growing"
- "Location 2 is doing well"

**Emotions:** 😊 Satisfied

**Time:** 30 seconds

---

#### Stage 3: Package Management

**Actions:**

1. Navigates to "Packages" section
2. Views current packages for Location 1
3. Clicks "Edit" on 3-hour package
4. Changes price from 12,000 to 10,000 VND (promotion)
5. Sets start/end date for promotion
6. Saves changes
7. Sees confirmation: "Package updated"

**Thoughts:**

- "Easy to run promotions"

**Emotions:** 😊 Satisfied

**Time:** 1 minute

---

#### Stage 4: Session Monitoring

**Actions:**

1. Navigates to "Sessions" section
2. Views active sessions (23 total)
3. Filters by Location 2
4. Sees 8 active sessions
5. Notices one session using excessive bandwidth
6. Clicks "Force Disconnect"
7. Session terminated

**Thoughts:**

- "Good monitoring tools"
- "Easy to handle abuse"

**Emotions:** 😊 Confident

**Time:** 1 minute

---

### Journey Summary

**Total Time:** ~3 minutes  
**Friction Points:** 0  
**Delight Moments:** 2 (clear dashboard, easy management)  
**Overall Satisfaction:** 😊 High

**Key Takeaways:**

- ✅ Dashboard provides clear insights
- ✅ Package management is intuitive
- ✅ Session monitoring is powerful
- ✅ Location managers have right level of control

---

## Cross-Location Journey

### Scenario: PC Customer Visits Different Location

**Context:**

- Regular customer at Location A
- Visits Location B for first time
- Already has IWAS account with payment linked

**Journey:**

1. **Connects to WiFi at Location B**
   - Same SSID: "iCafe-WiFi"
   - Auto-redirected to captive portal

2. **Auto-Recognition**
   - System recognizes account
   - Shows: "Welcome back, [Name]!"
   - Displays: "You're at [Location B Name]"

3. **One-Click Purchase**
   - Same packages available
   - Same payment method works
   - One-click purchase
   - WiFi activated

**Thoughts:**

- "Wow, it works at this location too!"
- "Same easy experience"

**Emotions:** 😄 Delighted

**Key Takeaway:**

- ✅ Cross-location support is a major differentiator
- ✅ Consistent experience builds trust
- ✅ Single account across all locations

---

## Pain Points & Solutions

### Common Pain Points

| Pain Point                    | User Type          | Solution                            |
| ----------------------------- | ------------------ | ----------------------------------- |
| Complex login                 | PC Customer, Guest | Google OAuth (one-click)            |
| Multiple payment steps        | All customers      | Payment Wallet (saved methods)      |
| Slow activation               | All customers      | <5 second activation                |
| Unclear pricing               | All customers      | Clear package comparison            |
| Connection issues             | All customers      | QoS, monitoring, support            |
| Different system per location | PC Customer        | Single account, cross-location      |
| No guest access               | Guest User         | Google OAuth (no PC account needed) |
| Complex dashboard             | Owner/Manager      | Intuitive UI, clear metrics         |

---

## Success Metrics by Journey Stage

### First-Time User

| Stage          | Metric                | Target              |
| -------------- | --------------------- | ------------------- |
| Discovery      | Awareness rate        | 60% of PC customers |
| Connection     | Redirect success      | >99%                |
| Authentication | OAuth completion      | >95%                |
| Onboarding     | Payment link success  | >90%                |
| Purchase       | Payment success       | >95%                |
| Usage          | Session completion    | >98%                |
| Retention      | Return rate (30 days) | >60%                |

### Returning User

| Stage      | Metric             | Target |
| ---------- | ------------------ | ------ |
| Connection | Auto-recognition   | >99%   |
| Login      | One-click success  | >98%   |
| Purchase   | One-click purchase | >95%   |
| Usage      | Session completion | >99%   |

---

## Related Documents

- [User Personas](./personas.md)
- [RBAC](./rbac.md)
- [Features](../05-features/)
- [UI/UX Guidelines](../11-ui-ux/)
- [Success Metrics](../01-overview/success-metrics.md)

---

[← Back to Users](./README.md) | [← Back to Hub](../README.md)
