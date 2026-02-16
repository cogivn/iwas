# Google OAuth Login

**Feature ID:** FR-03  
**Priority:** P0 (Critical)  
**Status:** 📝 Documented  
**Last Updated:** February 16, 2026

---

## Overview

**User Story:** As a guest user without a PC account, I want to log in using my Google account so that I can purchase WiFi access independently.

**Business Value:**

- Enables guest users (30% of target market)
- No PC account required
- Familiar, trusted authentication
- Reduces onboarding friction

---

## Acceptance Criteria

- ✅ User can click "Sign in with Google" on captive portal
- ✅ OAuth 2.0 flow with Google (scopes: `email`, `profile`)
- ✅ Create or retrieve WiFi user linked to Google ID
- ✅ Store user profile (email, name, avatar)
- ✅ Generate JWT session token
- ✅ Redirect to package selection
- ✅ Support account linking (link Google to PC account later)
- ✅ Validate OAuth state parameter (CSRF protection)

---

## User Flow

```
1. User connects to WiFi
2. Redirected to captive portal
3. Clicks "Sign in with Google"
4. Redirected to Google consent screen
5. User grants permissions (email, profile)
6. Google redirects back with authorization code
7. System exchanges code for access token
8. Fetch user profile from Google
9. Create/update WiFi user
10. Generate session token
11. Redirect to package selection
```

---

## API Contracts

### Initiate OAuth Flow

```typescript
GET / api / auth / google;
// Redirects to Google OAuth consent screen
```

### OAuth Callback

```typescript
GET /api/auth/google/callback?code={authorization_code}&state={state}

// Response (Success)
HTTP 200 OK
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar_url": "string",
    "auth_provider": "google"
  },
  "session_token": "string",
  "expires_at": "ISO8601 timestamp"
}
```

---

## Implementation

```typescript
@Controller("auth")
export class AuthController {
  @Get("google")
  googleAuth(@Res() res: Response) {
    const state = generateSecureState();
    const authUrl = this.googleOAuthService.getAuthUrl(state);

    // Store state in Redis (5 min TTL)
    await this.redis.set(`oauth_state:${state}`, "1", "EX", 300);

    res.redirect(authUrl);
  }

  @Get("google/callback")
  async googleCallback(@Query() query: GoogleCallbackDto) {
    // 1. Validate state (CSRF protection)
    const stateValid = await this.redis.get(`oauth_state:${query.state}`);
    if (!stateValid) {
      throw new UnauthorizedException("Invalid state parameter");
    }

    // 2. Exchange code for tokens
    const tokens = await this.googleOAuthService.getTokens(query.code);

    // 3. Fetch user profile
    const profile = await this.googleOAuthService.getUserProfile(
      tokens.access_token,
    );

    // 4. Create or update user
    const user = await this.userService.createOrUpdate({
      google_id: profile.id,
      email: profile.email,
      name: profile.name,
      avatar_url: profile.picture,
      auth_provider: "google",
    });

    // 5. Create session
    const session = await this.sessionService.create({
      user_id: user.id,
      location_id: query.location_id,
      device_mac: query.device_mac,
    });

    return {
      success: true,
      user,
      session_token: session.session_token,
      expires_at: session.expires_at,
    };
  }
}
```

---

## Data Model

```typescript
interface WiFiUser {
  id: string;
  google_id?: string;
  pc_user_id?: string;
  email: string;
  name: string;
  avatar_url?: string;
  auth_provider: "google" | "pc_account";
  google_refresh_token?: string; // Encrypted
  created_at: Date;
  updated_at: Date;
}
```

---

## Security Considerations

- ✅ Validate OAuth state parameter (CSRF protection)
- ✅ Store Google refresh token encrypted
- ✅ Implement token rotation
- ✅ Rate limit OAuth attempts
- ✅ Use HTTPS only
- ✅ Validate redirect URI

---

## Testing

```typescript
describe("Google OAuth Login", () => {
  it("should complete OAuth flow successfully", async () => {
    // Mock Google OAuth responses
    mockGoogleOAuth.getTokens.mockResolvedValue({
      access_token: "access_token_123",
      refresh_token: "refresh_token_456",
    });

    mockGoogleOAuth.getUserProfile.mockResolvedValue({
      id: "google_user_123",
      email: "user@gmail.com",
      name: "Test User",
      picture: "https://avatar.url",
    });

    const result = await authController.googleCallback({
      code: "auth_code_123",
      state: "valid_state",
      location_id: "loc_001",
      device_mac: "00:11:22:33:44:55",
    });

    expect(result.success).toBe(true);
    expect(result.user.email).toBe("user@gmail.com");
  });
});
```

---

## Related Documents

- [PC Account Login](./pc-account-login.md)
- [Payment Wallet](../payments/payment-wallet.md)
- [User Journeys](../../03-users/user-journeys.md)

---

[← Back to Authentication](./README.md) | [← Back to Features](../README.md)
