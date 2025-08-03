# Account Deletion and Data Export Functionality

This document describes the implementation of the Delete Account and Download My Data functionality in the Shopify Next.js commerce application.

## Features Implemented

### 1. Download My Data
- **API Endpoint**: `/api/account/download-data`
- **Methods**: GET (JSON response) and POST (file download)
- **Functionality**: Exports comprehensive customer data from Shopify Admin API
- **Data Included**:
  - Personal information (name, email, phone)
  - Marketing preferences
  - Addresses
  - Order history
  - Account settings and metadata
  - Total spent and order count
  - Account creation and update dates

### 2. Delete Account
- **API Endpoint**: `/api/account/delete`
- **Method**: POST
- **Functionality**: 
  - Exports customer data (optional)
  - Deletes customer from Shopify Admin API
  - Deletes customer access token
  - Clears local session cookies
  - Redirects to home page

## Implementation Details

### API Endpoints

#### Download Data API (`/api/account/download-data`)
```typescript
// GET - Returns JSON data
GET /api/account/download-data

// POST - Returns downloadable file
POST /api/account/download-data
```

#### Delete Account API (`/api/account/delete`)
```typescript
POST /api/account/delete
{
  "confirmDeletion": true,
  "exportData": true // optional
}
```

### Shopify Integration

#### New Functions Added to `lib/shopify/index.ts`:
- `deleteCustomerWithAdminAPI(customerId: string)` - Deletes customer from Shopify Admin API
- Enhanced data export with comprehensive customer information

#### Data Export Structure:
```json
{
  "customer": {
    "id": "customer_id",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "acceptsMarketing": true,
    "acceptsSMS": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "defaultAddress": {...},
    "addresses": [...],
    "orders": [...],
    "tags": [...],
    "note": "Customer note",
    "totalSpent": "1000.00",
    "ordersCount": 5,
    "verifiedEmail": true,
    "multipassIdentifier": null,
    "taxExempt": false,
    "taxExemptions": [...],
    "currency": "USD",
    "acceptsMarketingUpdatedAt": "2024-01-01T00:00:00Z",
    "marketingOptInLevel": "single_opt_in",
    "state": "enabled",
    "lastOrderId": "order_id",
    "lastOrderName": "#1001",
    "totalSpentV2": {...},
    "adminGraphqlApiId": "gid://shopify/Customer/123"
  },
  "exportDate": "2024-01-01T00:00:00Z",
  "exportReason": "Data download request",
  "dataTypes": [
    "Personal Information",
    "Addresses", 
    "Order History",
    "Marketing Preferences",
    "Account Settings"
  ]
}
```

### Frontend Components

#### AccountActions Component (`app/account/settings/account-actions.tsx`)
- Client-side component with proper error handling
- Loading states for both download and delete operations
- Confirmation dialog for account deletion
- Automatic file download functionality
- User-friendly error messages

#### Features:
- **Download My Data**: Downloads JSON file with customer data
- **Delete Account**: Shows confirmation dialog, exports data if requested, deletes account, redirects to home

### Security Considerations

1. **Authentication**: All endpoints require valid customer token
2. **Confirmation**: Account deletion requires explicit confirmation
3. **Data Export**: Optional data export before deletion
4. **Error Handling**: Graceful handling of API failures
5. **Session Cleanup**: Proper cleanup of tokens and cookies

### Environment Variables Required

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=your-admin-access-token
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token
```

### Usage

1. **Download Data**: User clicks "Download My Data" button → File downloads automatically
2. **Delete Account**: User clicks "Delete Account" → Confirmation dialog → Account deleted → Optional data download → Redirect to home

### Error Handling

- Network errors show user-friendly messages
- API errors are logged and displayed to user
- Graceful degradation if Shopify API is unavailable
- Session cleanup even if deletion fails

### Testing

To test the functionality:

1. **Download Data**:
   ```bash
   curl -X POST http://localhost:3000/api/account/download-data \
     -H "Cookie: customer_token=your-token"
   ```

2. **Delete Account**:
   ```bash
   curl -X POST http://localhost:3000/api/account/delete \
     -H "Content-Type: application/json" \
     -H "Cookie: customer_token=your-token" \
     -d '{"confirmDeletion": true, "exportData": true}'
   ```

### Future Enhancements

1. **GDPR Compliance**: Add data retention policies
2. **Audit Logging**: Track account deletions for compliance
3. **Email Notifications**: Notify admin of account deletions
4. **Data Anonymization**: Option to anonymize data before deletion
5. **Bulk Operations**: Support for bulk data export/deletion 