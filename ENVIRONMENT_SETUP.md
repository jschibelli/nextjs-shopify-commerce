# 🔧 Environment Setup Guide

## **Issue: Inventory Fetch Failing**

The reason your inventory fetch is failing is because the required environment variables are not set up. This guide will help you configure them.

## **Required Environment Variables**

### **Step 1: Create Environment File**

1. **Copy the example file:**
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local`** with your actual Shopify store details

### **Step 2: Get Shopify Credentials**

#### **A. Shopify Store Domain**
- Your store domain (without `https://`)
- Example: `schibelli-acme-dev.myshopify.com`

#### **B. Admin API Access Token**
1. Go to your Shopify Admin Panel
2. Navigate to **Settings** → **Apps and sales channels**
3. Click **Develop apps** (at the bottom)
4. Click **Create an app**
5. Name it: "Admin Dashboard"
6. Go to **Configuration** tab
7. Under **Admin API access scopes**, enable:
   - `read_products`
   - `write_products`
   - `read_orders`
   - `write_orders`
   - `read_customers`
   - `write_customers`
   - `read_inventory`
   - `write_inventory`
8. Click **Save**
9. Go to **API credentials** tab
10. Click **Install app**
11. Copy the **Admin API access token**

#### **C. Storefront API Access Token**
1. In the same app, go to **Configuration** tab
2. Under **Storefront API access scopes**, enable:
   - `unauthenticated_read_products`
   - `unauthenticated_read_collections`
3. Click **Save**
4. Go to **API credentials** tab
5. Copy the **Storefront access token**

### **Step 3: Configure Your .env.local**

```bash
# Your actual Shopify store domain
SHOPIFY_STORE_DOMAIN=schibelli-acme-dev.myshopify.com

# Your Admin API access token from Step 2B
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your Storefront API access token from Step 2C
SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Next.js Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### **Step 4: Restart Development Server**

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## **Verification**

After setup, test these endpoints:

1. **Admin Authentication:**
   ```
   http://localhost:3000/api/admin/test-auth
   ```

2. **Inventory Data:**
   ```
   http://localhost:3000/api/admin/inventory
   ```

3. **Products Data:**
   ```
   http://localhost:3000/api/admin/products
   ```

## **Common Issues & Solutions**

### **Issue: "Admin access denied"**
- Make sure you're logged in as an admin user
- Check that your admin session is active

### **Issue: "Shopify configuration missing"**
- Verify your `.env.local` file exists
- Check that `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ADMIN_ACCESS_TOKEN` are set

### **Issue: "Failed to fetch locations"**
- Check your Admin API access token
- Verify the app has `read_inventory` permissions
- Make sure the app is installed on your store

### **Issue: "403 Forbidden"**
- The app doesn't have required permissions
- Reinstall the app with correct scopes
- Generate a new access token

## **Debugging Tips**

1. **Check the browser console** for detailed error messages
2. **Check the terminal logs** for server-side errors
3. **Test individual API endpoints** to isolate the issue
4. **Verify your store domain** is correct (no `https://` prefix)

## **Security Notes**

- ⚠️ **Never commit `.env.local`** to version control
- 🔒 **Keep your access tokens secure**
- 🔄 **Regenerate tokens if compromised**
- 📝 **Use different tokens for development/production**

## **Next Steps**

Once you've set up the environment variables:

1. ✅ **Admin navigation should work**
2. ✅ **Inventory should load**
3. ✅ **Products should display**
4. ✅ **All admin features should be functional**

Need help? Check the logs and error messages for specific guidance! 