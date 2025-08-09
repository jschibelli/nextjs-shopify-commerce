# Dynamic Navigation System

This document explains how the dynamic navigation system works in the Next.js Shopify Commerce application.

## Overview

The application now features a dynamic navigation system that automatically switches between admin and customer navigation based on the user's authentication status and role.

## Components

### 1. DynamicNavigation (`components/layout/navbar/dynamic-navigation.tsx`)

This is the main component that determines which navigation to display:

- **Admin Navigation**: Shows when user is authenticated as a staff member and on admin pages
- **Customer Navigation**: Shows for all other cases (regular customers, unauthenticated users, non-admin pages)

### 2. CustomerNavigation (`components/layout/navbar/customer-navigation.tsx`)

The customer-facing navigation includes:
- Product search
- Shopping cart
- Wishlist
- Account management
- Theme toggle
- Mobile-responsive menu

### 3. AdminNavigation (`app/admin/admin-navigation.tsx`)

The admin-facing navigation includes:
- Dashboard
- Products management
- Customer management
- Orders
- Analytics
- Reports
- Admin profile dropdown

## How It Works

1. **Authentication Check**: The `DynamicNavigation` component checks the user's authentication status via `/api/auth/check-session`

2. **Role Detection**: It determines if the user is a staff member (`isStaffMember: true`) or a regular customer

3. **Path-Based Logic**: 
   - If on `/admin/*` paths and user is staff member → Show AdminNavigation
   - If on `/admin/*` paths but not staff member → Show CustomerNavigation (admin layout will handle redirect)
   - All other paths → Show CustomerNavigation

4. **Real-time Updates**: The navigation updates automatically when:
   - User logs in/out
   - User navigates between pages
   - Session status changes

## Implementation Details

### Layout Integration

The main layout (`app/layout.tsx`) now uses `DynamicNavigation` instead of the static `Navbar`:

```tsx
import DynamicNavigation from 'components/layout/navbar/dynamic-navigation';

// In the layout component
<DynamicNavigation />
```

### Admin Layout Changes

The admin layout (`app/admin/layout.tsx`) no longer includes its own navigation component since the dynamic navigation handles it.

### Session Management

The system relies on the existing session management:
- Customer sessions via `customer_token` cookie
- Admin sessions via the same token but with staff member verification
- Real-time session checking via `/api/auth/check-session` endpoint

## Benefits

1. **Seamless Experience**: Users see appropriate navigation based on their role
2. **Security**: Admin navigation only shows for authenticated staff members
3. **Consistency**: Single navigation component handles all cases
4. **Maintainability**: Clear separation between admin and customer navigation logic

## Testing

To test the dynamic navigation:

1. **As a Customer**: 
   - Login as a regular customer
   - Navigate to any page → Should see customer navigation
   - Try to access `/admin` → Should be redirected to login

2. **As an Admin**:
   - Login as a staff member
   - Navigate to `/admin` → Should see admin navigation
   - Navigate to regular pages → Should see customer navigation

3. **Unauthenticated**:
   - Visit any page → Should see customer navigation
   - Try to access `/admin` → Should be redirected to login

## Future Enhancements

- Add loading states during navigation transitions
- Implement role-based navigation items (different admin roles see different menus)
- Add navigation persistence preferences
- Implement navigation analytics tracking 