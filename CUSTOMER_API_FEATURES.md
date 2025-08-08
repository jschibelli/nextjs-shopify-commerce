# Customer API Features Documentation

This document describes all the Customer API features implemented in the Next.js Shopify Commerce application.

## 🎯 Overview

The Customer API system provides comprehensive customer management capabilities including:
- **Customer Tags & Segmentation**
- **Customer Metafields**
- **Customer Notes & Comments**
- **Loyalty Points System**
- **Activity Tracking**
- **Referral Program**
- **Payment Methods Management**
- **Customer Analytics**
- **Communication Preferences**

## 📋 API Endpoints

### Customer Tags Management

#### Get Customer Tags
```http
GET /api/account/tags
```

**Response:**
```json
{
  "success": true,
  "tags": ["vip", "wholesale", "newsletter"]
}
```

#### Add Customer Tags
```http
POST /api/account/tags
Content-Type: application/json

{
  "tags": ["vip", "wholesale"]
}
```

#### Remove Customer Tags
```http
DELETE /api/account/tags
Content-Type: application/json

{
  "tags": ["vip"]
}
```

### Customer Metafields

#### Get Customer Metafields
```http
GET /api/account/metafields
```

**Response:**
```json
{
  "success": true,
  "metafields": [
    {
      "id": "gid://shopify/Metafield/123",
      "namespace": "loyalty",
      "key": "loyalty_points",
      "value": "1500",
      "type": "number_integer"
    }
  ]
}
```

#### Create Customer Metafield
```http
POST /api/account/metafields
Content-Type: application/json

{
  "namespace": "custom",
  "key": "preferred_contact",
  "value": "email",
  "type": "single_line_text_field"
}
```

### Loyalty Points System

#### Get Loyalty Points
```http
GET /api/account/loyalty
```

**Response:**
```json
{
  "success": true,
  "points": 1500,
  "currency": "points"
}
```

#### Update Loyalty Points
```http
POST /api/account/loyalty
Content-Type: application/json

{
  "points": 100,
  "action": "earn",
  "reason": "purchase"
}
```

**Actions:**
- `earn` - Add points to balance
- `redeem` - Subtract points from balance
- `adjust` - Set points to specific value

### Activity Tracking

#### Get Customer Activity
```http
GET /api/account/activity
```

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "action": "product_viewed",
      "details": {
        "product_id": "gid://shopify/Product/123"
      },
      "timestamp": "2025-01-08T10:00:00Z"
    }
  ],
  "count": 25
}
```

#### Track Activity
```http
POST /api/account/activity
Content-Type: application/json

{
  "action": "product_viewed",
  "details": {
    "product_id": "gid://shopify/Product/123"
  }
}
```

### Referral Program

#### Get Referral Stats
```http
GET /api/account/referrals
```

**Response:**
```json
{
  "success": true,
  "referralStats": {
    "code": "FRIEND2025",
    "discountPercentage": 10,
    "uses": 5
  }
}
```

#### Generate Referral Code
```http
POST /api/account/referrals
Content-Type: application/json

{
  "code": "FRIEND2025",
  "discountPercentage": 10
}
```

### Payment Methods

#### Get Payment Methods
```http
GET /api/account/payment-methods
```

**Response:**
```json
{
  "success": true,
  "paymentMethods": [
    {
      "id": "pm_1234567890",
      "type": "credit_card",
      "last4": "1234",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true,
      "createdAt": "2025-01-08T10:00:00Z"
    }
  ]
}
```

#### Save Payment Method
```http
POST /api/account/payment-methods
Content-Type: application/json

{
  "type": "credit_card",
  "last4": "1234",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "isDefault": true
}
```

### Customer Analytics

#### Get Customer Analytics
```http
GET /api/account/analytics
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "customerId": "gid://shopify/Customer/123",
    "email": "customer@example.com",
    "totalSpent": 1250.00,
    "ordersCount": 10,
    "lastOrderDate": "2025-01-08T10:00:00Z",
    "loyaltyPoints": 1500,
    "activityCount": 25,
    "referralStats": {
      "code": "FRIEND2025",
      "discountPercentage": 10,
      "uses": 5
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "acceptsMarketing": true,
    "verifiedEmail": true
  }
}
```

### Communication Preferences

#### Get Communication Preferences
```http
GET /api/account/communication-preferences
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    "emailMarketing": true,
    "smsMarketing": false,
    "orderUpdates": true,
    "productRecommendations": true,
    "newsletterFrequency": "weekly"
  }
}
```

#### Update Communication Preferences
```http
PUT /api/account/communication-preferences
Content-Type: application/json

{
  "emailMarketing": true,
  "smsMarketing": false,
  "orderUpdates": true,
  "productRecommendations": true,
  "newsletterFrequency": "weekly"
}
```

## 🔧 Admin API Endpoints

### Customer Tags (Admin)

#### Get Customer Tags
```http
GET /api/admin/customers/{customerId}/tags
```

#### Add Customer Tags
```http
POST /api/admin/customers/{customerId}/tags
Content-Type: application/json

{
  "tags": ["vip", "wholesale"]
}
```

#### Remove Customer Tags
```http
DELETE /api/admin/customers/{customerId}/tags
Content-Type: application/json

{
  "tags": ["vip"]
}
```

### Customer Metafields (Admin)

#### Get Customer Metafields
```http
GET /api/admin/customers/{customerId}/metafields
```

#### Create Customer Metafield
```http
POST /api/admin/customers/{customerId}/metafields
Content-Type: application/json

{
  "namespace": "custom",
  "key": "preferred_contact",
  "value": "email",
  "type": "single_line_text_field"
}
```

### Customer Notes (Admin)

#### Get Customer Note
```http
GET /api/admin/customers/{customerId}/notes
```

#### Add Customer Note
```http
POST /api/admin/customers/{customerId}/notes
Content-Type: application/json

{
  "note": "Customer prefers phone contact",
  "isPrivate": true
}
```

## 🎨 Frontend Pages

### Customer-Facing Pages

1. **Tags Management** (`/account/tags`)
   - Add/remove customer tags
   - View current tags
   - Tag management interface

2. **Loyalty Program** (`/account/loyalty`)
   - View current points balance
   - Earn/redeem/adjust points
   - Points history and rewards

3. **Analytics Dashboard** (`/account/analytics`)
   - Customer performance metrics
   - Spending analytics
   - Activity tracking
   - Referral statistics

### Navigation Integration

The account layout includes navigation for all new features:
- Loyalty Program
- Analytics
- Tags

## 🛠️ Implementation Details

### Shopify Integration

All features are built using Shopify's Admin API and Storefront API:

#### Admin API Functions
- `addCustomerTagsWithAdminAPI()` - Add tags to customers
- `removeCustomerTagsWithAdminAPI()` - Remove tags from customers
- `createCustomerMetafieldWithAdminAPI()` - Create customer metafields
- `getCustomerMetafieldsWithAdminAPI()` - Get customer metafields
- `addCustomerNoteWithAdminAPI()` - Add notes to customers
- `updateCustomerLoyaltyPointsWithAdminAPI()` - Manage loyalty points
- `trackCustomerActivityWithAdminAPI()` - Track customer activity
- `generateCustomerReferralCodeWithAdminAPI()` - Generate referral codes
- `saveCustomerPaymentMethodWithAdminAPI()` - Save payment methods
- `getCustomerAnalyticsWithAdminAPI()` - Get customer analytics
- `updateCustomerCommunicationPreferencesWithAdminAPI()` - Update preferences

### Data Storage

#### Metafields Usage
- **Loyalty Points**: `loyalty.loyalty_points` (number_integer)
- **Activity Log**: `activity.log` (json_string)
- **Referral Data**: `referral.code`, `referral.discount_percentage`, `referral.uses`
- **Payment Methods**: `payment.methods` (json_string)
- **Communication Preferences**: `communication.preferences` (json_string)

#### Tags System
- Stored directly in Shopify customer tags field
- Comma-separated format
- Automatic deduplication and filtering

## 🔒 Security & Permissions

### Authentication
- All endpoints require customer authentication
- Admin endpoints require admin authentication
- Session-based authentication with cookies

### Data Validation
- Input validation for all API endpoints
- Type checking for metafields
- Sanitization of user inputs
- Error handling for invalid data

### Privacy Compliance
- GDPR-compliant data handling
- Customer consent management
- Data export capabilities
- Right to deletion support

## 🚀 Usage Examples

### Adding Customer Tags
```javascript
// Add VIP tag to customer
const response = await fetch('/api/account/tags', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tags: ['vip'] })
});
```

### Earning Loyalty Points
```javascript
// Earn 100 points for purchase
const response = await fetch('/api/account/loyalty', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    points: 100,
    action: 'earn',
    reason: 'purchase'
  })
});
```

### Tracking Activity
```javascript
// Track product view
const response = await fetch('/api/account/activity', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'product_viewed',
    details: { product_id: 'gid://shopify/Product/123' }
  })
});
```

### Generating Referral Code
```javascript
// Generate referral code with 10% discount
const response = await fetch('/api/account/referrals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'FRIEND2025',
    discountPercentage: 10
  })
});
```

## 📊 Analytics & Insights

### Customer Analytics Features
- **Total Spent**: Lifetime customer value
- **Order Count**: Number of orders placed
- **Loyalty Points**: Current points balance
- **Activity Count**: Number of tracked activities
- **Referral Stats**: Referral code usage
- **Account Metrics**: Verification status, marketing preferences

### Performance Metrics
- Average order value calculation
- Points per order ratio
- Monthly activity averages
- Customer lifetime value tracking

## 🔄 Future Enhancements

### Planned Features
1. **Customer Groups**: Bulk customer management
2. **Advanced Segmentation**: Complex customer filtering
3. **Automated Workflows**: Trigger-based actions
4. **Integration APIs**: Third-party system connections
5. **Advanced Analytics**: Machine learning insights
6. **Mobile App Support**: Native mobile features

### Scalability Considerations
- Database optimization for large customer bases
- Caching strategies for frequently accessed data
- API rate limiting and throttling
- Horizontal scaling capabilities

## 🐛 Troubleshooting

### Common Issues

#### Metafield Creation Fails
- Check Shopify API permissions
- Verify metafield namespace/key uniqueness
- Ensure proper data type specification

#### Tags Not Updating
- Verify customer ID format
- Check Shopify API response for errors
- Ensure proper authentication

#### Loyalty Points Issues
- Verify points calculation logic
- Check for negative balance prevention
- Ensure proper error handling

### Debug Information
All API endpoints include comprehensive error logging and debugging information in the console for development purposes.

## 📚 Additional Resources

- [Shopify Admin API Documentation](https://shopify.dev/api/admin)
- [Shopify Storefront API Documentation](https://shopify.dev/api/storefront)
- [Shopify Metafields Documentation](https://shopify.dev/apps/metafields)
- [Customer API Best Practices](https://shopify.dev/docs/apps/customer-data)

---

This comprehensive Customer API system provides a robust foundation for advanced customer management, loyalty programs, and personalized experiences in your Shopify commerce application. 