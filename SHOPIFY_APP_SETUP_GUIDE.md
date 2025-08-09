# 🚀 Shopify App Setup Guide

## **Current Issue:**
Your admin dashboard is working, but you're getting **403 errors** because your Shopify app doesn't have the required API permissions for products.

## **Solution: Create a Proper Shopify App**

### **Step 1: Create a New Shopify App**

1. **Go to Shopify Partner Dashboard**
   - Visit: https://partners.shopify.com
   - Login with your account

2. **Create New App**
   - Click **"Apps"** in the left sidebar
   - Click **"Create app"**
   - Choose **"Custom app"**
   - Name it: `"Schibelli ACME Admin Dashboard"`
   - Click **"Create app"**

### **Step 2: Configure API Permissions**

1. **Go to App Setup**
   - Click on your new app
   - Go to **"App setup"** tab

2. **Configure Admin API Integration**
   - Scroll to **"Admin API integration"**
   - Click **"Configure"**

3. **Add Required Scopes**
   Add these scopes:
   ```
   ✅ read_products
   ✅ write_products
   ✅ read_orders
   ✅ write_orders
   ✅ read_customers
   ✅ write_customers
   ✅ read_inventory
   ✅ write_inventory
   ✅ read_content
   ✅ write_content
   ```

4. **Save Configuration**
   - Click **"Save"**

### **Step 3: Install App on Your Store**

1. **Get Installation URL**
   - In your app, go to **"App setup"**
   - Copy the **"App URL"** (it will look like: `https://your-app-name.myshopify.com`)

2. **Install on Your Store**
   - Go to: `https://schibelli-acme-dev.myshopify.com/admin/apps`
   - Click **"Develop apps"**
   - Click **"Allow custom app development"**
   - Click **"Create an app"**
   - Name it: `"Admin Dashboard"`
   - In **"Admin API integration"**, add the same scopes as above
   - Click **"Save"**
   - Click **"Install app"**

### **Step 4: Get New Access Token**

1. **Get Admin API Access Token**
   - In your app settings, go to **"API credentials"**
   - Copy the **"Admin API access token"**

2. **Update Environment Variables**
   - Open your `.env.local` file
   - Replace the current `SHOPIFY_ADMIN_ACCESS_TOKEN` with the new one:

```bash
# Replace this line in your .env.local file:
SHOPIFY_ADMIN_ACCESS_TOKEN=your_new_access_token_here
```

### **Step 5: Test the Connection**

1. **Restart Your Development Server**
   ```bash
   npm run dev
   ```

2. **Test Authentication**
   - Go to `/admin/products`
   - Click **"Test Auth"** button
   - You should see a success message

3. **Check Products**
   - Your products should now load from your Shopify store

## **Alternative: Quick Fix with Existing App**

If you want to use your existing app setup:

### **Option A: Update Existing App Permissions**

1. **Go to your existing app** in Partner Dashboard
2. **Add the missing scopes:**
   - `read_products`
   - `write_products`
   - `read_orders`
   - `write_orders`
   - `read_customers`
   - `write_customers`

3. **Reinstall the app** on your store

### **Option B: Use Storefront API (Temporary)**

If you can't get admin API access immediately, I can modify the dashboard to use the Storefront API for read-only access:

```typescript
// This would show products but not allow editing
const response = await fetch(`https://${domain}/api/2024-01/graphql.json`, {
  method: 'POST',
  headers: {
    'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: `
      query {
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              description
              vendor
              productType
              tags
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      }
    `
  })
});
```

## **Verification Steps**

After setup, you should see:

1. ✅ **"Test Auth"** shows success
2. ✅ **Products load** from your store
3. ✅ **No more 403 errors**
4. ✅ **Can create/edit/delete products**

## **Common Issues & Solutions**

### **Issue: "App not found"**
- Make sure you're using the correct store domain
- Verify the app is installed on your store

### **Issue: "Invalid access token"**
- Generate a new access token
- Make sure you're using the Admin API token, not Storefront

### **Issue: "Insufficient scopes"**
- Add the required scopes to your app
- Reinstall the app on your store

## **Next Steps**

1. **Follow the setup guide above**
2. **Test the authentication**
3. **Your products should appear**
4. **You can then create/edit/delete products**

The admin dashboard is ready - we just need the proper API permissions! 🚀 