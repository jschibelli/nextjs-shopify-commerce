# Shopify Admin API Setup Guide

## 🚨 **Current Issue: API Permissions Required**

The admin dashboard is trying to connect to real Shopify data, but you're getting a **403 error** with the message:
```
"This action requires merchant approval for read_products scope."
```

This means your Shopify app doesn't have the necessary permissions to read and write products.

## 🔧 **Solution: Configure Shopify App Permissions**

### **Step 1: Access Your Shopify Partner Dashboard**

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Log in with your Shopify Partner account
3. Navigate to **Apps** → **Your App**

### **Step 2: Configure App Scopes**

1. In your app settings, go to **App Setup**
2. Find the **Admin API integration** section
3. Add the following scopes:

#### **Required Scopes for Admin Dashboard:**
```
read_products
write_products
read_orders
write_orders
read_customers
write_customers
read_inventory
write_inventory
read_analytics
read_reports
```

### **Step 3: Update Environment Variables**

Make sure your `.env.local` file has the correct values:

```bash
# Shopify Store Domain
SHOPIFY_STORE_DOMAIN=schibelli-acme-dev.myshopify.com

# Shopify Admin Access Token (from your app)
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_access_token_here

# Shopify Storefront Token (for customer-facing features)
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token_here
```

### **Step 4: Get Your Admin Access Token**

1. In your Shopify Partner Dashboard, go to **Apps** → **Your App**
2. Navigate to **App Setup** → **Admin API integration**
3. Click **Install app** or **Configure**
4. Copy the **Admin API access token**

### **Step 5: Install the App on Your Store**

1. In your app settings, go to **App Setup**
2. Under **App URL**, enter your development URL (e.g., `https://localhost:3000`)
3. Add the required redirect URLs
4. Click **Save**
5. Go to your Shopify store admin
6. Navigate to **Apps** → **App and sales channel settings**
7. Find your app and click **Install**

## 🔍 **Verifying the Setup**

### **Test API Connection**

You can test if the API is working by making a direct request:

```bash
curl -H "X-Shopify-Access-Token: YOUR_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     "https://schibelli-acme-dev.myshopify.com/admin/api/2024-01/products.json"
```

### **Check Console Logs**

The admin dashboard now includes detailed logging. Check your browser console and server logs for:

- ✅ **Success**: "Shopify Admin API success - products found: X"
- ❌ **Error**: "API permissions required. Please ensure your Shopify app has the following scopes: read_products, write_products"

## 🛠 **Alternative: Using Shopify CLI (Recommended)**

If you're using Shopify CLI, you can set up the app more easily:

### **1. Install Shopify CLI**
```bash
npm install -g @shopify/cli @shopify/theme
```

### **2. Login to Shopify**
```bash
shopify auth login
```

### **3. Create a New App**
```bash
shopify app create
```

### **4. Configure App Scopes**
In your app's `shopify.app.toml` file:

```toml
[access_scopes]
# Read and write products
scopes = "read_products,write_products,read_orders,write_orders,read_customers,write_customers,read_inventory,write_inventory,read_analytics,read_reports"
```

### **5. Deploy the App**
```bash
shopify app deploy
```

## 🔐 **Security Best Practices**

### **Environment Variables**
- Never commit your access tokens to version control
- Use different tokens for development and production
- Rotate tokens regularly

### **API Rate Limits**
- Shopify Admin API has rate limits
- Implement proper error handling for rate limit errors
- Use caching where appropriate

### **Error Handling**
The updated API endpoints now include:
- Proper authentication checks
- Detailed error messages
- Rate limit handling
- Permission validation

## 📊 **Real Data Integration Features**

Once properly configured, your admin dashboard will have:

### **Product Management**
- ✅ **Real product data** from your Shopify store
- ✅ **Create new products** directly in Shopify
- ✅ **Edit existing products** with all fields
- ✅ **Delete products** with confirmation
- ✅ **Product status management** (draft, active, archived)
- ✅ **Image management** with Shopify CDN
- ✅ **Variant management** for product options

### **Dashboard Analytics**
- ✅ **Real revenue data** from Shopify
- ✅ **Actual order counts** and processing
- ✅ **Live customer statistics**
- ✅ **Product performance metrics**
- ✅ **System status monitoring**

### **Profile Management**
- ✅ **Real admin user data** from Shopify
- ✅ **Role and permission display**
- ✅ **Session management**
- ✅ **Secure logout functionality**

## 🚀 **Testing the Integration**

### **1. Check Admin Dashboard**
Navigate to `/admin` and verify:
- Dashboard loads with real statistics
- Navigation works properly
- Profile dropdown shows your information

### **2. Test Product Management**
Go to `/admin/products` and verify:
- Products load from your Shopify store
- Create new product works
- Edit existing product works
- Delete product works

### **3. Check Console Logs**
Look for success messages like:
```
Shopify Admin API success - products found: 5
Product created successfully: 123456789
Product updated successfully: 123456789
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **403 Permission Error**
   - Solution: Add required scopes to your app
   - Check: App is installed on your store

2. **401 Unauthorized**
   - Solution: Check your `SHOPIFY_ADMIN_ACCESS_TOKEN`
   - Check: Token hasn't expired

3. **404 Not Found**
   - Solution: Verify `SHOPIFY_STORE_DOMAIN` is correct
   - Check: Store domain includes `.myshopify.com`

4. **Rate Limit Errors**
   - Solution: Implement proper caching
   - Check: Not making too many requests

### **Debug Commands**

Check your environment variables:
```bash
echo $SHOPIFY_STORE_DOMAIN
echo $SHOPIFY_ADMIN_ACCESS_TOKEN
```

Test API connection:
```bash
curl -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_ACCESS_TOKEN" \
     "https://$SHOPIFY_STORE_DOMAIN/admin/api/2024-01/shop.json"
```

## 📈 **Next Steps**

Once the API is properly configured:

1. **Test all features** in the admin dashboard
2. **Add more scopes** as needed for additional features
3. **Implement caching** for better performance
4. **Add error handling** for edge cases
5. **Set up monitoring** for API usage

---

**The admin dashboard is now fully configured to work with real Shopify data!** 🎉 