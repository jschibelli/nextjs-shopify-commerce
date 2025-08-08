# Shopify Admin Authentication System

## 🏗️ **Overview**

This system integrates with **Shopify's native user management and permissions** instead of using custom admin authentication. This provides enterprise-level security and leverages Shopify's built-in staff management system.

## 🔐 **How It Works**

### **1. Shopify Staff Authentication**
- Uses Shopify's Admin API to fetch staff members
- Validates user permissions against Shopify's native permission system
- Leverages Shopify's built-in role-based access control

### **2. Permission Mapping**
- Maps Shopify permissions to our application permissions
- Supports admin, staff, and limited_staff roles
- Granular permission control based on Shopify's permission system

### **3. Security Features**
- Server-side authentication validation
- Automatic permission checking
- Integration with Shopify's security standards

## 📁 **File Structure**

```
lib/shopify/
├── admin-auth.ts              # Shopify admin authentication
└── index.ts                   # Shopify API functions

app/
├── admin/                     # Admin routes (protected)
│   ├── layout.tsx            # Admin layout with Shopify auth
│   ├── page.tsx              # Admin dashboard
│   └── reviews/              # Review moderation
└── api/
    └── auth/
        └── test-shopify-staff/ # Test endpoint for staff auth
```

## 🔧 **Configuration**

### **Environment Variables Required**

```bash
# Shopify Admin API Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_access_token
```

### **Shopify Admin Setup**

1. **Create Admin Access Token:**
   - Go to your Shopify admin
   - Navigate to Settings > Apps and sales channels > Develop apps
   - Create a new app or use existing app
   - Generate Admin API access token
   - Add required scopes:
     - `read_staff_members`
     - `write_staff_members` (if needed)

2. **Configure Staff Members:**
   - Go to Settings > Users and permissions
   - Add staff members with appropriate roles
   - Set permissions for each staff member

## 🛡️ **Security Model**

### **Role-Based Access Control**

#### **Admin Role**
- Full access to all features
- Can manage staff members
- Can modify store settings
- All permissions: `read`, `write`, `delete`, `moderate`, `manage_staff`, `manage_settings`

#### **Staff Role**
- Can manage products, orders, customers
- Can moderate content
- Permissions: `read`, `write`, `moderate`

#### **Limited Staff Role**
- Read-only access with moderation capabilities
- Can moderate reviews and content
- Permissions: `read`, `moderate`

### **Permission Mapping**

```typescript
// Shopify permissions mapped to our system
'read_products' → 'manage_products'
'write_products' → 'manage_products'
'read_orders' → 'manage_orders'
'write_orders' → 'manage_orders'
'read_customers' → 'manage_customers'
'write_customers' → 'manage_customers'
'read_content' → 'manage_content'
'write_content' → 'manage_content'
'read_marketing' → 'manage_marketing'
'write_marketing' → 'manage_marketing'
```

## 🚀 **Usage Examples**

### **1. Check Admin Authentication**

```typescript
import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';

const adminAuth = getShopifyAdminAuth();
const adminUser = await adminAuth.getCurrentShopifyAdminUser();

if (!adminUser) {
  // User is not a Shopify staff member
  redirect('/login?error=shopify_staff_access_denied');
}
```

### **2. Check Permissions**

```typescript
// Check specific permission
const canModerate = await adminAuth.hasPermission('moderate');

// Require permission (throws error if not authorized)
const adminUser = await adminAuth.requirePermission('delete');

// Check role
const isAdmin = await adminAuth.isAdmin();
const isStaff = await adminAuth.isStaff();
```

### **3. Get Staff Members**

```typescript
// Get all staff members
const staffMembers = await adminAuth.getShopifyStaffMembers();

// Get specific staff member
const staffMember = await adminAuth.getShopifyStaffMember('user@example.com');
```

## 🔄 **API Endpoints**

### **Test Shopify Staff Authentication**

```bash
GET /api/auth/test-shopify-staff
```

**Response:**
```json
{
  "success": true,
  "authenticated": true,
  "adminUser": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "permissions": ["read", "write", "delete", "moderate"],
    "shopifyUserId": "shopify_staff_id"
  },
  "permissions": {
    "isAdmin": true,
    "isStaff": true,
    "isLimitedStaff": true,
    "hasModeratePermission": true,
    "hasWritePermission": true,
    "hasDeletePermission": true
  },
  "staffMembers": [...]
}
```

## 🛡️ **Security Benefits**

### **1. Native Shopify Security**
- Uses Shopify's built-in security standards
- Leverages Shopify's permission system
- Integrates with Shopify's audit logs

### **2. Automatic Permission Sync**
- Permissions automatically sync with Shopify
- No manual permission management needed
- Real-time permission updates

### **3. Enterprise Compliance**
- Follows Shopify's security best practices
- Integrates with Shopify's compliance standards
- Supports enterprise security requirements

## 🔧 **Setup Instructions**

### **Step 1: Configure Shopify Admin API**

1. **Get Admin Access Token:**
   ```bash
   # Add to .env.local
   SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_access_token
   ```

2. **Verify Store Domain:**
   ```bash
   # Add to .env.local
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   ```

### **Step 2: Add Staff Members**

1. Go to Shopify admin → Settings → Users and permissions
2. Add staff members with appropriate roles
3. Set permissions for each staff member

### **Step 3: Test Authentication**

1. **Test the API endpoint:**
   ```bash
   curl http://localhost:3000/api/auth/test-shopify-staff
   ```

2. **Access admin dashboard:**
   - Visit `/admin`
   - Login with Shopify staff member credentials
   - Verify permissions are working

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"No Shopify staff member found"**
   - Ensure user email exists in Shopify staff members
   - Check Shopify Admin API access token
   - Verify store domain configuration

2. **"Access denied" errors**
   - Check staff member permissions in Shopify
   - Verify role assignments
   - Ensure proper API scopes

3. **API connection errors**
   - Verify `SHOPIFY_ADMIN_ACCESS_TOKEN` is correct
   - Check `SHOPIFY_STORE_DOMAIN` format
   - Ensure API scopes include `read_staff_members`

### **Debug Steps**

1. **Test Admin API connection:**
   ```bash
   curl -H "X-Shopify-Access-Token: YOUR_TOKEN" \
        https://your-store.myshopify.com/admin/api/2023-01/staff_members.json
   ```

2. **Check environment variables:**
   ```bash
   echo $SHOPIFY_ADMIN_ACCESS_TOKEN
   echo $SHOPIFY_STORE_DOMAIN
   ```

3. **Test authentication endpoint:**
   ```bash
   curl http://localhost:3000/api/auth/test-shopify-staff
   ```

## 🎯 **Benefits Over Custom Auth**

### **✅ Advantages**
- **Native Shopify integration** - Uses Shopify's built-in security
- **Automatic permission sync** - No manual permission management
- **Enterprise compliance** - Follows Shopify's security standards
- **Audit trail** - Integrates with Shopify's audit logs
- **Scalable** - Leverages Shopify's infrastructure
- **Maintained** - Shopify handles security updates

### **✅ Production Ready**
- **Security tested** - Uses Shopify's battle-tested security
- **Compliance ready** - Meets enterprise security requirements
- **Scalable** - Handles large organizations
- **Reliable** - Built on Shopify's infrastructure

## 🔄 **Migration from Custom Auth**

If you're migrating from the custom admin auth system:

1. **Update imports:**
   ```typescript
   // Old
   import { getAdminAuth } from 'lib/admin-auth';
   
   // New
   import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
   ```

2. **Update method calls:**
   ```typescript
   // Old
   const adminUser = await adminAuth.getCurrentAdminUser();
   
   // New
   const adminUser = await adminAuth.getCurrentShopifyAdminUser();
   ```

3. **Test permissions:**
   ```typescript
   // Test the new system
   const canModerate = await adminAuth.hasPermission('moderate');
   ```

## 🚀 **Next Steps**

1. **Configure Shopify staff members** with appropriate roles
2. **Test authentication** using the test endpoint
3. **Deploy to production** with confidence
4. **Monitor permissions** through Shopify admin
5. **Add more admin features** as needed

This system provides enterprise-level security while maintaining simplicity and leveraging Shopify's proven infrastructure. 