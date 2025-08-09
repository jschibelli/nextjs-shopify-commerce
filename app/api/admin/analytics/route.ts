import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
    }

    // Get Shopify API credentials
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !adminKey) {
      return NextResponse.json({
        error: 'Shopify configuration missing',
        details: 'SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required'
      }, { status: 500 });
    }

    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;

    // Fetch multiple data sources in parallel
    const [productsResponse, ordersResponse, customersResponse] = await Promise.all([
      fetch(`${baseUrl}/admin/api/2024-01/products.json?limit=250`, {
        headers: {
          'X-Shopify-Access-Token': adminKey,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${baseUrl}/admin/api/2024-01/orders.json?limit=250&status=any`, {
        headers: {
          'X-Shopify-Access-Token': adminKey,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${baseUrl}/admin/api/2024-01/customers.json?limit=250`, {
        headers: {
          'X-Shopify-Access-Token': adminKey,
          'Content-Type': 'application/json'
        }
      })
    ]);

    // Handle errors
    if (!productsResponse.ok || !ordersResponse.ok || !customersResponse.ok) {
      const errors = [];
      if (!productsResponse.ok) errors.push(`Products: ${productsResponse.status}`);
      if (!ordersResponse.ok) errors.push(`Orders: ${ordersResponse.status}`);
      if (!customersResponse.ok) errors.push(`Customers: ${customersResponse.status}`);
      
      return NextResponse.json({
        error: 'Failed to fetch analytics data',
        details: errors.join(', ')
      }, { status: 500 });
    }

    const [productsData, ordersData, customersData] = await Promise.all([
      productsResponse.json(),
      ordersResponse.json(),
      customersResponse.json()
    ]);

    const products = productsData.products || [];
    const orders = ordersData.orders || [];
    const customers = customersData.customers || [];

    // Calculate analytics statistics
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + parseFloat(order.total_price || '0');
    }, 0);

    const analyticsData = {
      products: products.length,
      orders: orders.length,
      customers: customers.length,
      revenue: totalRevenue.toFixed(2),
      averageOrderValue: orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00',
      verifiedCustomers: customers.filter((customer: any) => customer.verified_email).length,
      acceptsMarketing: customers.filter((customer: any) => customer.accepts_marketing).length
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 