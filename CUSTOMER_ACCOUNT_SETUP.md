# Customer Account API Setup Guide

This guide will help you set up the Shopify Customer Account API integration for your Next.js store.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Shopify Store Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
SHOPIFY_REVALIDATION_SECRET=your_revalidation_secret

# Customer Account API Configuration
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID=8787b392-105b-43a1-b23c-dfbd17c197fa
SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET=your_customer_account_client_secret
SHOPIFY_CUSTOMER_ACCOUNT_AUTH_ENDPOINT=https://shopify.com/authentication/75899797737/oauth/authorize
SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_ENDPOINT=https://shopify.com/authentication/75899797737/oauth/token
SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_ENDPOINT=https://shopify.com/authentication/75899797737/logout
SHOPIFY_CUSTOMER_ACCOUNT_REDIRECT_URI=http://localhost:3000/account/auth/callback
```

## Shopify Admin Configuration

1. **Enable Customer Account API:**
   - Go to your Shopify admin
   - Navigate to Settings > Apps and sales channels > Headless
   - Click on "Customer Account API"
   - Enable the API and configure permissions

2. **Configure Permissions:**
   - Customers: `customer_read_customers` (checked)
   - Orders: `customer_read_orders` (checked)
   - Draft Orders: `customer_read_draft_orders` (checked)
   - Markets: `customer_read_markets` (checked)
   - Companies: `customer_read_companies` (checked)
   - Subscription Contracts: `customer_read_subscription_contracts` (checked)

3. **Set up Application Endpoints:**
   - Authorization endpoint: `https://shopify.com/authentication/75899797737/oauth/authorize`
   - Token endpoint: `https://shopify.com/authentication/75899797737/oauth/token`
   - Logout endpoint: `https://shopify.com/authentication/75899797737/logout`

4. **Configure Callback URIs:**
   - Add your callback URI: `http://localhost:3000/account/auth/callback` (for development)
   - For production, use your domain: `https://yourdomain.com/account/auth/callback`

## Features Implemented

### Authentication Flow
- ✅ OAuth 2.0 authorization flow
- ✅ Token exchange and storage
- ✅ Secure cookie-based session management
- ✅ Logout functionality

### Customer Dashboard
- ✅ Account overview with profile information
- ✅ Recent orders display
- ✅ Order history with details
- ✅ Quick action links

### Account Management
- ✅ Profile information display
- ✅ Order tracking and history
- ✅ Address management (placeholder)
- ✅ Account settings (placeholder)

### Navigation Integration
- ✅ Account link in main navigation
- ✅ Protected routes with authentication checks
- ✅ Responsive design

## Pages Created

- `/account/login` - Login page with OAuth flow
- `/account` - Main dashboard
- `/account/orders` - Order history
- `/account/addresses` - Address management (placeholder)
- `/account/settings` - Account settings (placeholder)

## API Routes

- `/api/auth/login` - Initiates OAuth flow
- `/api/auth/callback` - Handles OAuth callback
- `/api/auth/logout` - Handles logout

## Usage

1. **Login:** Users click the account icon in the navigation or visit `/account/login`
2. **OAuth Flow:** Users are redirected to Shopify for authentication
3. **Dashboard:** After successful authentication, users are redirected to `/account`
4. **Navigation:** Users can access orders, addresses, and settings from the sidebar

## Security Features

- HTTP-only cookies for token storage
- Secure token exchange
- Protected routes with authentication checks
- Proper error handling and user feedback

## Next Steps

1. **Complete Address Management:** Implement full CRUD operations for customer addresses
2. **Profile Editing:** Add ability to update customer profile information
3. **Order Details:** Create detailed order view pages
4. **Email Notifications:** Integrate with Shopify's notification system
5. **Two-Factor Authentication:** Add additional security measures
6. **Data Export:** Implement GDPR-compliant data export functionality

## Troubleshooting

### Common Issues

1. **OAuth Errors:**
   - Check that your client ID and secret are correct
   - Verify callback URI is properly configured in Shopify admin
   - Ensure all required permissions are enabled

2. **Token Exchange Failures:**
   - Verify token endpoint URL is correct
   - Check that client secret is properly set
   - Ensure redirect URI matches exactly

3. **Session Issues:**
   - Check cookie settings and domain configuration
   - Verify HTTPS is used in production
   - Ensure proper CORS configuration

### Debug Mode

To enable debug logging, add this to your environment:

```bash
DEBUG_CUSTOMER_ACCOUNT=true
```

This will log authentication flow details to help troubleshoot issues. 