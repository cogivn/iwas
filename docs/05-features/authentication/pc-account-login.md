# PC Account Login

**Feature ID:** FR-01  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a PC customer, I want to log into WiFi using my existing PC account credentials so that I don't need to create a separate account.

**Business Value:**

- Reduces friction for PC customers (70% of target users)
- Leverages existing PC account infrastructure
- Enables PC balance payment integration
- Increases WiFi adoption rate

---

## Acceptance Criteria

- ✅ User can enter PC username and password on captive portal
- ✅ System validates credentials via PC System API
- ✅ On successful authentication, create WiFi user session
- ✅ Store mapping between PC user ID and WiFi session
- ✅ Redirect to package selection page
- ✅ On failed authentication, display clear error message
- ✅ Allow retry (max 3 attempts per 5 minutes)
- ✅ Session persists across device reconnections
- ✅ Support cross-location authentication

---

## User Flow

```
1. User connects to "iCafe-WiFi" network
2. Redirected to captive portal
3. Sees login options: [PC Account] [Google OAuth]
4. Selects "PC Account Login"
5. Enters PC username and password
6. System validates with PC API
7. If valid:
   - Create WiFi user session
   - Link to PC account
   - Redirect to package selection
8. If invalid:
   - Show error message
   - Allow retry (max 3 attempts)
```

---

## API Contracts

### PC System Login API

```typescript
// Request
POST /pc-api/login
Content-Type: application/json
{
  "username": "string",
  "password": "string",
  "location_id": "string"
}

// Response (Success)
HTTP 200 OK
{
  "success": true,
  "user_id": "string",
  "username": "string",
  "balance": number,
  "session_token": "string",
  "expires_at": "ISO8601 timestamp"
}

// Response (Invalid Credentials)
HTTP 401 Unauthorized
{
  "success": false,
  "error_code": "INVALID_CREDENTIALS",
  "message": "Invalid username or password"
}

// Response (Account Suspended)
HTTP 403 Forbidden
{
  "success": false,
  "error_code": "ACCOUNT_SUSPENDED",
  "message": "Your account has been suspended"
}

// Response (Rate Limited)
HTTP 429 Too Many Requests
{
  "success": false,
  "error_code": "RATE_LIMITED",
  "message": "Too many login attempts. Please try again in 5 minutes."
}
```

### IWAS Internal API

```typescript
// Create WiFi User Session
POST /api/auth/pc-login
Content-Type: application/json
{
  "pc_user_id": "string",
  "pc_session_token": "string",
  "location_id": "string",
  "device_mac": "string"
}

// Response
HTTP 200 OK
{
  "success": true,
  "wifi_session_id": "string",
  "user": {
    "id": "string",
    "pc_user_id": "string",
    "username": "string",
    "balance": number
  },
  "session_token": "string",
  "expires_at": "ISO8601 timestamp"
}
```

---

## Data Model

```typescript
interface WiFiUser {
  id: string;
  pc_user_id: string;
  username: string;
  email?: string;
  phone?: string;
  auth_provider: "pc_account" | "google_oauth";
  created_at: Date;
  updated_at: Date;
}

interface WiFiSession {
  id: string;
  user_id: string;
  location_id: string;
  device_mac: string;
  session_token: string;
  pc_session_token?: string;
  status: "active" | "expired" | "terminated";
  created_at: Date;
  expires_at: Date;
  terminated_at?: Date;
}

interface LoginAttempt {
  id: string;
  username: string;
  ip_address: string;
  location_id: string;
  success: boolean;
  error_code?: string;
  attempted_at: Date;
}
```

---

## Implementation

### Frontend (Captive Portal)

```typescript
// Login Form Component
async function handlePCLogin(username: string, password: string) {
  try {
    // 1. Validate inputs
    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    // 2. Call IWAS API
    const response = await fetch("/api/auth/pc-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        location_id: getCurrentLocationId(),
        device_mac: getDeviceMac(),
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message);
    }

    // 3. Store session token
    localStorage.setItem("wifi_session_token", data.session_token);

    // 4. Redirect to package selection
    window.location.href = "/packages";
  } catch (error) {
    // Show error message
    showError(error.message);
  }
}
```

### Backend (NestJS)

```typescript
// PC Login Controller
@Controller("auth")
export class AuthController {
  constructor(
    private readonly pcApiService: PcApiService,
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  @Post("pc-login")
  async pcLogin(@Body() dto: PcLoginDto) {
    // 1. Check rate limit
    await this.checkRateLimit(dto.username, dto.ip_address);

    // 2. Validate with PC API
    const pcUser = await this.pcApiService.login({
      username: dto.username,
      password: dto.password,
      location_id: dto.location_id,
    });

    if (!pcUser.success) {
      // Log failed attempt
      await this.logLoginAttempt(dto.username, false, pcUser.error_code);
      throw new UnauthorizedException(pcUser.message);
    }

    // 3. Create or update WiFi user
    const wifiUser = await this.userService.createOrUpdate({
      pc_user_id: pcUser.user_id,
      username: pcUser.username,
      auth_provider: "pc_account",
    });

    // 4. Create WiFi session
    const session = await this.sessionService.create({
      user_id: wifiUser.id,
      location_id: dto.location_id,
      device_mac: dto.device_mac,
      pc_session_token: pcUser.session_token,
    });

    // 5. Log successful attempt
    await this.logLoginAttempt(dto.username, true);

    return {
      success: true,
      wifi_session_id: session.id,
      user: wifiUser,
      session_token: session.session_token,
      expires_at: session.expires_at,
    };
  }

  private async checkRateLimit(username: string, ip: string) {
    const attempts = await this.getRecentAttempts(username, ip);
    if (attempts >= 3) {
      throw new TooManyRequestsException(
        "Too many login attempts. Please try again in 5 minutes.",
      );
    }
  }
}
```

---

## Security Considerations

### 1. Credential Transmission

- ✅ Always use HTTPS for login requests
- ✅ Never log passwords
- ✅ Clear password from memory after use

### 2. Rate Limiting

- ✅ Max 3 attempts per 5 minutes per username
- ✅ Max 10 attempts per 5 minutes per IP
- ✅ Exponential backoff on failures

### 3. Session Security

- ✅ Generate cryptographically secure session tokens
- ✅ Set appropriate session expiration (24 hours)
- ✅ Invalidate session on PC logout
- ✅ Support session refresh

### 4. Error Messages

- ✅ Generic error for invalid credentials (don't reveal if username exists)
- ✅ Specific error for account suspension
- ✅ Clear error for rate limiting

---

## Testing

### Unit Tests

```typescript
describe("PC Account Login", () => {
  it("should login successfully with valid credentials", async () => {
    const result = await authController.pcLogin({
      username: "testuser",
      password: "password123",
      location_id: "loc_001",
      device_mac: "00:11:22:33:44:55",
    });

    expect(result.success).toBe(true);
    expect(result.user.username).toBe("testuser");
    expect(result.session_token).toBeDefined();
  });

  it("should reject invalid credentials", async () => {
    await expect(
      authController.pcLogin({
        username: "testuser",
        password: "wrongpassword",
        location_id: "loc_001",
        device_mac: "00:11:22:33:44:55",
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("should enforce rate limiting", async () => {
    // Attempt login 3 times with wrong password
    for (let i = 0; i < 3; i++) {
      try {
        await authController.pcLogin({
          username: "testuser",
          password: "wrong",
          location_id: "loc_001",
          device_mac: "00:11:22:33:44:55",
        });
      } catch (e) {}
    }

    // 4th attempt should be rate limited
    await expect(
      authController.pcLogin({
        username: "testuser",
        password: "wrong",
        location_id: "loc_001",
        device_mac: "00:11:22:33:44:55",
      }),
    ).rejects.toThrow(TooManyRequestsException);
  });
});
```

### Integration Tests

```typescript
describe("PC Login Integration", () => {
  it("should complete full login flow", async () => {
    // 1. Mock PC API response
    mockPcApi.login.mockResolvedValue({
      success: true,
      user_id: "pc_user_123",
      username: "testuser",
      balance: 100000,
      session_token: "pc_token_abc",
    });

    // 2. Login
    const response = await request(app.getHttpServer())
      .post("/api/auth/pc-login")
      .send({
        username: "testuser",
        password: "password123",
        location_id: "loc_001",
        device_mac: "00:11:22:33:44:55",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // 3. Verify user created
    const user = await userService.findByPcUserId("pc_user_123");
    expect(user).toBeDefined();

    // 4. Verify session created
    const session = await sessionService.findById(
      response.body.wifi_session_id,
    );
    expect(session.status).toBe("active");
  });
});
```

---

## Performance Considerations

- **PC API Latency:** Cache user data for 5 minutes to reduce PC API calls
- **Database Queries:** Index on `pc_user_id` and `username`
- **Rate Limiting:** Use Redis for fast rate limit checks
- **Session Lookup:** Cache active sessions in Redis

---

## Related Documents

- [Google OAuth Login](./google-oauth.md)
- [QR Code Login](./qr-code-login.md)
- [RBAC](./rbac.md)
- [PC Balance Payment](../payments/pc-balance-payment.md)
- [User Journeys](../../03-users/user-journeys.md)

---

[← Back to Authentication](./README.md) | [← Back to Features](../README.md)
