import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== FETCHING ANALYTICS ===');
    
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

    // Check for errors
    if (!productsResponse.ok || !ordersResponse.ok || !customersResponse.ok) {
      const errorText = await productsResponse.text();
      console.error('Analytics API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data', details: errorText },
        { status: 500 }
      );
    }

    const [productsData, ordersData, customersData] = await Promise.all([
      productsResponse.json(),
      ordersResponse.json(),
      customersResponse.json()
    ]);

    const products = productsData.products || [];
    const orders = ordersData.orders || [];
    const customers = customersData.customers || [];

    console.log('Analytics data fetched:', {
      products: products.length,
      orders: orders.length,
      customers: customers.length
    });

    // Calculate comprehensive analytics
    const analytics = {
      overview: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCustomers: customers.length,
        totalRevenue: orders.reduce((sum: number, order: any) => {
          return sum + parseFloat(order.total_price || '0');
        }, 0).toFixed(2)
      },
      products: {
        active: products.filter((p: any) => p.status === 'active').length,
        draft: products.filter((p: any) => p.status === 'draft').length,
        archived: products.filter((p: any) => p.status === 'archived').length,
        withImages: products.filter((p: any) => p.images && p.images.length > 0).length,
        withVariants: products.filter((p: any) => p.variants && p.variants.length > 1).length
      },
      orders: {
        pending: orders.filter((o: any) => o.financial_status === 'pending').length,
        paid: orders.filter((o: any) => o.financial_status === 'paid').length,
        fulfilled: orders.filter((o: any) => o.fulfillment_status === 'fulfilled').length,
        cancelled: orders.filter((o: any) => o.cancelled_at).length,
        averageOrderValue: orders.length > 0 ? 
          (orders.reduce((sum: number, order: any) => {
            return sum + parseFloat(order.total_price || '0');
          }, 0) / orders.length).toFixed(2) : '0.00'
      },
      customers: {
        verified: customers.filter((c: any) => c.verified_email).length,
        acceptsMarketing: customers.filter((c: any) => c.accepts_marketing).length,
        totalSpent: customers.reduce((sum: number, customer: any) => {
          return sum + parseFloat(customer.total_spent || '0');
        }, 0).toFixed(2),
        averageCustomerValue: customers.length > 0 ? 
          (customers.reduce((sum: number, customer: any) => {
            return sum + parseFloat(customer.total_spent || '0');
          }, 0) / customers.length).toFixed(2) : '0.00'
      },
      recentActivity: {
        recentProducts: products
          .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5)
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            updated_at: p.updated_at
          })),
        recentOrders: orders
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((o: any) => ({
            id: o.id,
            name: o.name,
            total_price: o.total_price,
            financial_status: o.financial_status,
            created_at: o.created_at
          })),
        recentCustomers: customers
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map((c: any) => ({
            id: c.id,
            first_name: c.first_name,
            last_name: c.last_name,
            email: c.email,
            total_spent: c.total_spent,
            created_at: c.created_at
          }))
      }
    };

    return NextResponse.json({
      analytics,
      message: 'Analytics data fetched successfully'
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 