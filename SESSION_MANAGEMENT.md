# Session Management System

## Overview

The session management system provides comprehensive tracking and management of user sessions across all devices. It allows users to view active sessions, track session activity, and revoke sessions for security purposes.

## Features

### 🔐 **Session Tracking**
- **Automatic Session Creation**: Sessions are created when users log in
- **Device Detection**: Automatically detects device type (iPhone, Android, Mac, Windows, etc.)
- **Location Tracking**: Captures IP address and location information
- **Activity Monitoring**: Tracks user activity and updates session timestamps

### 📱 **Session Management**
- **View Active Sessions**: See all active sessions across devices
- **Session Details**: Device info, location, IP address, last activity
- **Revoke Sessions**: Remove sessions from other devices
- **Current Session**: Highlight the current active session

### 🛡️ **Security Features**
- **Session Persistence**: Sessions stored in memory (production: database)
- **Activity Updates**: Real-time activity tracking
- **Revocation**: Secure session termination
- **IP Tracking**: Monitor login locations

## Architecture

### **Core Components**

#### **1. Session Storage (`lib/security.ts`)**
```typescript
interface SessionData {
  id: string;
  userId: string;
  device: string;
  location: string;
  ip: string;
  userAgent: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: string;
}
```

#### **2. API Endpoints**
- `GET /api/account/sessions` - Fetch user sessions
- `POST /api/account/sessions` - Create new session
- `DELETE /api/account/sessions` - Revoke session
- `POST /api/account/sessions/activity` - Update session activity

#### **3. UI Components**
- `SessionManagement` - Main session management component
- `SessionTracker` - Client-side activity tracking
- `useSessionActivity` - React hook for activity monitoring

### **Session Lifecycle**

1. **Login**: Session created automatically
2. **Activity**: Session activity updated on user interaction
3. **Management**: Users can view and revoke sessions
4. **Logout**: Session marked as inactive

## Implementation Details

### **Session Creation**
```typescript
// During login
const session = createSession(userId, {
  device: detectDevice(userAgent),
  location: getLocationFromIP(ip),
  ip,
  userAgent
});
```

### **Activity Tracking**
```typescript
// Client-side activity monitoring
useSessionActivity(); // Updates every 5 minutes + user interaction
```

### **Session Management**
```typescript
// Get user sessions
const sessions = getUserSessions(userId);

// Revoke session
const success = revokeSession(userId, sessionId);
```

## Pages & Components

### **1. Sessions Page (`/account/sessions`)**
- **Purpose**: Dedicated page for session management
- **Features**: View all sessions, revoke sessions, security tips
- **Access**: Via security settings or direct URL

### **2. Security Page Integration**
- **Location**: `/account/security`
- **Feature**: "View Sessions" button linking to sessions page
- **Context**: Part of comprehensive security management

### **3. Session Management Component**
```tsx
<SessionManagement />
```

**Features:**
- ✅ **Session List**: Display all active sessions
- ✅ **Device Icons**: Visual device type indicators
- ✅ **Activity Timestamps**: Last active time
- ✅ **Revoke Buttons**: Remove individual sessions
- ✅ **Current Session**: Highlight active session
- ✅ **Security Tips**: Helpful security guidance

## API Endpoints

### **GET /api/account/sessions**
**Purpose**: Fetch user's active sessions
**Response**:
```json
{
  "success": true,
  "sessions": [
    {
      "id": "session_123",
      "device": "iPhone",
      "location": "New York, NY",
      "ip": "192.168.1.100",
      "lastActive": "2024-01-15T10:30:00Z",
      "isCurrent": true
    }
  ],
  "totalSessions": 3
}
```

### **DELETE /api/account/sessions**
**Purpose**: Revoke a specific session
**Request**:
```json
{
  "sessionId": "session_123"
}
```

### **POST /api/account/sessions/activity**
**Purpose**: Update session activity
**Request**:
```json
{
  "sessionId": "session_123"
}
```

## Security Considerations

### **Data Protection**
- ✅ **Session IDs**: Unique, non-guessable identifiers
- ✅ **IP Tracking**: Monitor suspicious login locations
- ✅ **Device Fingerprinting**: Track device characteristics
- ✅ **Activity Monitoring**: Detect inactive sessions

### **Privacy Features**
- ✅ **User Control**: Users can revoke their own sessions
- ✅ **Transparency**: Clear display of session information
- ✅ **Consent**: Sessions only created with user login

### **Security Best Practices**
- ✅ **Session Expiration**: Automatic cleanup of old sessions
- ✅ **Revocation**: Immediate session termination
- ✅ **Monitoring**: Track unusual activity patterns
- ✅ **Notifications**: Alert on new session creation

## User Experience

### **Session Management Flow**
1. **Login**: Session automatically created
2. **Activity**: Session activity tracked in background
3. **Management**: User visits `/account/sessions`
4. **Review**: View all active sessions
5. **Action**: Revoke suspicious sessions
6. **Security**: Follow security tips

### **Visual Design**
- ✅ **Device Icons**: Intuitive device type indicators
- ✅ **Activity Timestamps**: Clear time formatting
- ✅ **Current Session**: Highlighted active session
- ✅ **Revoke Buttons**: Clear action buttons
- ✅ **Security Tips**: Helpful guidance section

## Development Notes

### **Current Implementation**
- **Storage**: In-memory Map (development)
- **Production**: Replace with database storage
- **Geolocation**: Mock location service
- **Activity**: Client-side tracking

### **Future Enhancements**
- **Database Integration**: Persistent session storage
- **Geolocation API**: Real location services
- **Session Analytics**: Usage patterns and insights
- **Advanced Security**: Suspicious activity detection
- **Push Notifications**: New session alerts

### **Testing**
- **Session Creation**: Test login flow
- **Activity Tracking**: Verify activity updates
- **Session Revocation**: Test session removal
- **UI Components**: Test session management interface

## Integration Points

### **Authentication Flow**
1. **Login**: Creates session automatically
2. **2FA**: Session created after verification
3. **Activity**: Continuous tracking during use
4. **Logout**: Session cleanup

### **Security Integration**
- **Security Page**: Links to session management
- **Account Settings**: Session management access
- **Security Alerts**: New session notifications

## Configuration

### **Environment Variables**
```env
# Session timeout (in minutes)
SESSION_TIMEOUT=30

# Activity update interval (in minutes)
ACTIVITY_INTERVAL=5

# Maximum sessions per user
MAX_SESSIONS=10
```

### **Security Settings**
- **Session Timeout**: Automatic session expiration
- **Max Sessions**: Limit concurrent sessions
- **Activity Tracking**: Enable/disable activity monitoring
- **Location Tracking**: Enable/disable IP tracking

## Troubleshooting

### **Common Issues**
1. **Sessions Not Showing**: Check authentication status
2. **Activity Not Updating**: Verify API endpoints
3. **Revoke Not Working**: Check session ID validity
4. **Device Detection**: Verify user agent parsing

### **Debug Information**
- **Session Logs**: Console output for session operations
- **API Responses**: Network tab for API calls
- **Local Storage**: Check session ID storage
- **Activity Tracking**: Monitor activity updates

## Production Considerations

### **Database Schema**
```sql
CREATE TABLE user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  device VARCHAR(100),
  location VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  last_active TIMESTAMP,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_last_active (last_active)
);
```

### **Security Measures**
- **HTTPS Only**: Secure session cookies
- **CSRF Protection**: Prevent session hijacking
- **Rate Limiting**: Prevent session abuse
- **Audit Logging**: Track session operations

### **Performance**
- **Caching**: Cache session data
- **Indexing**: Database indexes for queries
- **Cleanup**: Regular session cleanup jobs
- **Monitoring**: Session performance metrics

---

This session management system provides comprehensive security and user control over their account sessions, ensuring a secure and transparent user experience. 