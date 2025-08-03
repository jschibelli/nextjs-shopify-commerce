# 2FA Login Flow Implementation

## Problem
The two-factor authentication was not being enforced during login. Users could enable 2FA, but when they logged out and logged back in, they weren't prompted for their 2FA code.

## Solution
Implemented a complete 2FA login flow that enforces 2FA verification during the login process.

## Complete Login Flow

### 1. User Attempts Login
- User enters email/password on `/login`
- Login API checks if 2FA is enabled for the user

### 2. 2FA Check During Login
```typescript
// app/api/auth/login/route.ts
const twoFactorData = getTwoFactorData(customer.id);

if (twoFactorData && twoFactorData.enabled) {
  // 2FA is enabled, require verification
  const tempSession = {
    access_token: accessToken.accessToken,
    customer_id: customer.id,
    requires2FA: true
  };
  
  // Store temporary session
  cookieStore.set('temp_session', JSON.stringify(tempSession));
  
  return NextResponse.json({
    success: true,
    requires2FA: true,
    userId: customer.id
  });
}
```

### 3. Redirect to 2FA Verification
- If 2FA is enabled, user is redirected to `/verify-2fa?userId=USER_ID`
- Login form handles the redirect automatically

### 4. 2FA Verification Page
- User enters 6-digit code from authenticator app
- Code is verified against stored TOTP secret
- If valid, sets `2fa_verified` cookie

### 5. Complete Login Process
- After successful 2FA verification, calls `/api/auth/complete-login`
- Creates final session with proper authentication
- Clears temporary session data
- Redirects to `/account`

## Files Created/Modified

### New Files
- `app/api/auth/verify-2fa/route.ts` - 2FA verification endpoint
- `app/api/auth/complete-login/route.ts` - Complete login after 2FA
- `app/verify-2fa/page.tsx` - 2FA verification page

### Modified Files
- `app/api/auth/login/route.ts` - Added 2FA check during login
- `app/login/page.tsx` - Added 2FA redirect handling

## API Endpoints

### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (2FA Required):**
```json
{
  "success": true,
  "requires2FA": true,
  "userId": "gid://shopify/Customer/1234567890",
  "message": "Two-factor authentication required"
}
```

**Response (No 2FA):**
```json
{
  "success": true,
  "redirect": "/account",
  "user": {
    "id": "gid://shopify/Customer/1234567890",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### POST `/api/auth/verify-2fa`
**Request:**
```json
{
  "code": "123456",
  "userId": "gid://shopify/Customer/1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Two-factor authentication verified successfully"
}
```

### POST `/api/auth/complete-login`
**Request:** No body required (uses cookies)

**Response:**
```json
{
  "success": true,
  "redirect": "/account",
  "message": "Login completed successfully"
}
```

## Security Features

### Session Management
- **Temporary Session**: Stored during 2FA verification (10 minutes)
- **2FA Verification Flag**: Cookie indicating successful 2FA verification
- **Final Session**: Created after successful 2FA verification

### Cookie Security
```typescript
// Temporary session (10 minutes)
cookieStore.set('temp_session', JSON.stringify(tempSession), {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 10 * 60
});

// 2FA verification flag (1 hour)
cookieStore.set('2fa_verified', 'true', {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60
});

// Final session (30 days)
cookieStore.set('customer_token', JSON.stringify(sessionToken), {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60
});
```

## User Experience Flow

### 1. Login with 2FA Enabled
1. User enters email/password
2. System checks if 2FA is enabled
3. If enabled, redirects to `/verify-2fa`
4. User enters 6-digit code from authenticator app
5. System verifies code and completes login
6. User is redirected to `/account`

### 2. Login without 2FA
1. User enters email/password
2. System checks if 2FA is enabled
3. If not enabled, completes login immediately
4. User is redirected to `/account`

### 3. Invalid 2FA Code
1. User enters incorrect code
2. System shows error message
3. User can try again or go back to login

## Testing the Flow

### Test Case 1: 2FA Enabled User
1. **Enable 2FA**: Visit `/account/security` and enable 2FA
2. **Logout**: Log out of the application
3. **Login**: Go to `/login` and enter credentials
4. **2FA Prompt**: Should be redirected to `/verify-2fa`
5. **Enter Code**: Enter 6-digit code from authenticator app
6. **Success**: Should be redirected to `/account`

### Test Case 2: 2FA Disabled User
1. **Login**: Go to `/login` and enter credentials
2. **Direct Access**: Should be redirected directly to `/account`
3. **No 2FA Prompt**: Should not see 2FA verification page

### Test Case 3: Invalid 2FA Code
1. **Login**: Go to `/login` and enter credentials
2. **2FA Prompt**: Should be redirected to `/verify-2fa`
3. **Wrong Code**: Enter incorrect 6-digit code
4. **Error**: Should see error message
5. **Retry**: Should be able to try again

## Benefits

- ✅ **Enforced 2FA**: Users with 2FA enabled must verify during login
- ✅ **Secure Session Management**: Proper session handling with temporary and final sessions
- ✅ **User-Friendly**: Clear flow with proper error handling
- ✅ **Production-Ready**: Secure cookie settings and proper validation
- ✅ **Backward Compatible**: Users without 2FA can still login normally

## Next Steps

1. **Backup Code Support**: Add backup code verification during login
2. **Remember Device**: Option to remember device for 30 days
3. **Rate Limiting**: Add rate limiting for 2FA attempts
4. **Audit Logging**: Log all 2FA verification attempts
5. **Recovery Options**: Add account recovery for lost 2FA devices 