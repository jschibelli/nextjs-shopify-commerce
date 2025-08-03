# Privacy & Security System Documentation

This document describes the comprehensive privacy and security system implemented in the Next.js Shopify Commerce application.

## Overview

The privacy and security system provides:
- **Two-Factor Authentication (2FA)**: TOTP-based authentication with backup codes
- **Privacy Controls**: GDPR-compliant data sharing preferences
- **Data Rights**: Export and deletion capabilities
- **Security Monitoring**: Login history and security alerts
- **Account Recovery**: Backup codes and security questions

## Security Features

### 🔐 Two-Factor Authentication

#### Implementation
- **TOTP (Time-based One-Time Password)**: RFC 6238 compliant
- **QR Code Generation**: Easy setup with authenticator apps
- **Backup Codes**: 10 one-time use codes for account recovery
- **Manual Entry**: Secret key for manual authenticator setup

#### Setup Process
1. User clicks "Enable 2FA"
2. System generates TOTP secret and QR code
3. User scans QR code with authenticator app
4. User enters 6-digit verification code
5. System verifies code and enables 2FA
6. System generates backup codes for recovery

#### API Endpoints
```typescript
// Enable 2FA
POST /api/account/security
{
  "action": "enable-2fa",
  "data": { "email": "user@example.com" }
}

// Verify 2FA code
POST /api/account/security
{
  "action": "verify-2fa",
  "data": { "code": "123456", "secret": "JBSWY3DPEHPK3PXP" }
}

// Disable 2FA
POST /api/account/security
{
  "action": "disable-2fa",
  "data": { "code": "123456" }
}
```

### 🛡️ Security Utilities

#### TOTP Implementation
```typescript
// Generate TOTP secret
const secret = generateTOTPSecret(); // Returns base32 encoded string

// Verify TOTP code
const isValid = verifyTOTPCode(secret, code, window = 1);

// Generate backup codes
const backupCodes = generateBackupCodes(count = 10);
```

#### Password Strength Validation
```typescript
const validation = validatePasswordStrength(password);
// Returns: { isValid: boolean, score: number, feedback: string[] }
```

#### Rate Limiting
```typescript
const rateLimiter = new RateLimiter();
const isLimited = rateLimiter.isRateLimited(key, maxAttempts = 5, windowMs = 900000);
```

## Privacy Features

### 📊 Data Sharing Controls

#### Available Settings
- **Analytics**: Website usage and performance data
- **Marketing**: Promotional emails and offers
- **Third-Party Services**: Data sharing with trusted partners
- **Personalized Ads**: Interest-based advertising

#### Implementation
```typescript
// Update data sharing preferences
PUT /api/account/privacy
{
  "action": "update-data-sharing",
  "data": {
    "analytics": true,
    "marketing": false,
    "thirdParty": false,
    "personalizedAds": false
  }
}
```

### 📧 Communication Preferences

#### Available Settings
- **Email**: Marketing and promotional emails
- **SMS**: Order updates and promotions
- **Push Notifications**: Real-time updates
- **Order Updates**: Order status notifications
- **Security Alerts**: Important security notifications

#### Implementation
```typescript
// Update communication preferences
PUT /api/account/privacy
{
  "action": "update-communication-preferences",
  "data": {
    "email": true,
    "sms": false,
    "pushNotifications": true,
    "orderUpdates": true,
    "securityAlerts": true
  }
}
```

### 🗂️ Data Rights (GDPR Compliance)

#### Data Export
```typescript
// Request data export
PUT /api/account/privacy
{
  "action": "request-data-export",
  "data": {
    "format": "json",
    "includeDeletedData": false
  }
}
```

#### Data Deletion
```typescript
// Request data deletion
PUT /api/account/privacy
{
  "action": "request-data-deletion",
  "data": {
    "scope": "all", // or "account", "orders", "preferences"
    "reason": "User request"
  }
}
```

## Pages & Components

### Security Page (`/account/security`)
- **Two-Factor Authentication**: Setup and management
- **Password Security**: Change password and session management
- **Login History**: Recent account activity
- **Security Questions**: Account recovery setup
- **Account Recovery**: Backup codes management
- **Security Alerts**: Notification preferences

### Privacy Page (`/account/privacy`)
- **Data Sharing**: Control data usage preferences
- **Communication Preferences**: Email, SMS, and notification settings
- **Data Retention**: Information about data storage periods
- **Data Rights**: Export and deletion capabilities
- **Third-Party Services**: Control external service access
- **Privacy Information**: Links to legal documents

## API Structure

### Security API (`/api/account/security`)
```typescript
// GET - Fetch security settings
GET /api/account/security

// POST - Security actions
POST /api/account/security
{
  "action": "enable-2fa" | "verify-2fa" | "disable-2fa" | 
            "generate-backup-codes" | "verify-backup-code" | 
            "update-security-questions",
  "data": { /* action-specific data */ }
}
```

### Privacy API (`/api/account/privacy`)
```typescript
// GET - Fetch privacy settings
GET /api/account/privacy

// PUT - Privacy actions
PUT /api/account/privacy
{
  "action": "update-data-sharing" | "update-communication-preferences" |
            "update-data-retention" | "request-data-export" | 
            "request-data-deletion",
  "data": { /* action-specific data */ }
}
```

## Security Best Practices

### 🔒 Implementation Guidelines

1. **TOTP Security**
   - Use cryptographically secure random secrets
   - Implement time window validation (±1 window)
   - Store secrets encrypted in production
   - Rotate secrets periodically

2. **Rate Limiting**
   - Implement rate limiting on all security endpoints
   - Use IP-based and user-based limits
   - Log failed attempts for monitoring

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Implement proper session management
   - Regular security audits

4. **GDPR Compliance**
   - Clear data usage explanations
   - Granular consent controls
   - Easy data export/deletion
   - Transparent data retention policies

### 🛡️ Security Monitoring

#### Login History
- Track successful and failed login attempts
- Monitor for suspicious activity patterns
- Alert on unusual login locations/times

#### Security Alerts
- New device login notifications
- Password change confirmations
- 2FA setup/disable notifications
- Suspicious activity alerts

## User Experience

### 🎯 Security Setup Flow

1. **Initial Setup**
   - User navigates to Security page
   - Clicks "Enable Two-Factor Authentication"
   - System generates QR code and secret

2. **QR Code Scanning**
   - User scans QR code with authenticator app
   - Enters 6-digit verification code
   - System verifies and enables 2FA

3. **Backup Codes**
   - System generates 10 backup codes
   - User saves codes securely
   - Codes can be used for account recovery

4. **Ongoing Use**
   - User enters 2FA code on login
   - Can disable 2FA with verification
   - Can regenerate backup codes

### 🎯 Privacy Management Flow

1. **Data Sharing Controls**
   - User toggles data sharing preferences
   - Changes are saved immediately
   - Clear explanations of each setting

2. **Communication Preferences**
   - User controls email/SMS preferences
   - Settings sync with Shopify
   - Granular control over notifications

3. **Data Rights**
   - User can export all their data
   - User can request account deletion
   - Clear warnings about permanent actions

## Error Handling

### 🔧 Common Issues

1. **Invalid TOTP Code**
   - Check time synchronization
   - Verify authenticator app setup
   - Provide clear error messages

2. **Rate Limiting**
   - Inform user of temporary blocks
   - Provide alternative contact methods
   - Log attempts for security review

3. **Data Export Failures**
   - Retry mechanism for large exports
   - Progress indicators for long operations
   - Email notifications when ready

## Testing

### 🧪 Security Testing

1. **TOTP Validation**
   - Test with valid/invalid codes
   - Test time window boundaries
   - Test backup code functionality

2. **Rate Limiting**
   - Test rate limit enforcement
   - Test rate limit reset
   - Test different IP addresses

3. **Privacy Controls**
   - Test preference persistence
   - Test data export functionality
   - Test deletion requests

### 🧪 Privacy Testing

1. **GDPR Compliance**
   - Verify data export completeness
   - Test deletion request processing
   - Validate consent tracking

2. **User Experience**
   - Test preference saving
   - Test notification delivery
   - Test error handling

## Deployment Considerations

### 🚀 Production Setup

1. **Environment Variables**
   ```bash
   # Security settings
   SECURITY_SALT=your-secure-salt
   RATE_LIMIT_MAX_ATTEMPTS=5
   RATE_LIMIT_WINDOW_MS=900000
   
   # Privacy settings
   GDPR_ENABLED=true
   DATA_RETENTION_DAYS=2555
   EXPORT_TIMEOUT_MS=300000
   ```

2. **Database Schema**
   ```sql
   -- Security table
   CREATE TABLE user_security (
     user_id VARCHAR(255) PRIMARY KEY,
     two_factor_secret VARCHAR(255),
     two_factor_enabled BOOLEAN DEFAULT FALSE,
     backup_codes JSON,
     security_questions JSON,
     last_login TIMESTAMP,
     login_history JSON
   );
   
   -- Privacy table
   CREATE TABLE user_privacy (
     user_id VARCHAR(255) PRIMARY KEY,
     data_sharing JSON,
     communication_preferences JSON,
     data_retention JSON,
     export_settings JSON
   );
   ```

3. **Monitoring**
   - Log security events
   - Monitor rate limiting
   - Track privacy preference changes
   - Alert on suspicious activity

## Future Enhancements

### 🔮 Planned Features

1. **Advanced Security**
   - Hardware security keys (WebAuthn)
   - Biometric authentication
   - Advanced threat detection

2. **Enhanced Privacy**
   - Data anonymization options
   - Privacy-preserving analytics
   - Advanced consent management

3. **Compliance**
   - CCPA compliance
   - LGPD compliance
   - Industry-specific regulations

## Support

### 📞 Troubleshooting

1. **2FA Issues**
   - Check device time synchronization
   - Verify authenticator app setup
   - Use backup codes for recovery

2. **Privacy Concerns**
   - Review data sharing settings
   - Contact support for data export
   - Submit deletion requests

3. **Technical Support**
   - Check browser compatibility
   - Clear browser cache/cookies
   - Try different devices/browsers 