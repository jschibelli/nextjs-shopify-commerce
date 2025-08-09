import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== GENERATING REPORTS ===');
    
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

    // Fetch comprehensive data for reports
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
      console.error('Reports API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch data for reports', details: errorText },
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

    console.log('Reports data fetched:', {
      products: products.length,
      orders: orders.length,
      customers: customers.length
    });

    // Generate comprehensive reports
    const reports = {
      salesReport: {
        totalRevenue: orders.reduce((sum: number, order: any) => {
          return sum + parseFloat(order.total_price || '0');
        }, 0).toFixed(2),
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? 
          (orders.reduce((sum: number, order: any) => {
            return sum + parseFloat(order.total_price || '0');
          }, 0) / orders.length).toFixed(2) : '0.00',
        revenueByStatus: {
          paid: orders.filter((o: any) => o.financial_status === 'paid')
            .reduce((sum: number, order: any) => sum + parseFloat(order.total_price || '0'), 0).toFixed(2),
          pending: orders.filter((o: any) => o.financial_status === 'pending')
            .reduce((sum: number, order: any) => sum + parseFloat(order.total_price || '0'), 0).toFixed(2),
          refunded: orders.filter((o: any) => o.financial_status === 'refunded')
            .reduce((sum: number, order: any) => sum + parseFloat(order.total_price || '0'), 0).toFixed(2)
        },
        ordersByStatus: {
          paid: orders.filter((o: any) => o.financial_status === 'paid').length,
          pending: orders.filter((o: any) => o.financial_status === 'pending').length,
          refunded: orders.filter((o: any) => o.financial_status === 'refunded').length,
          cancelled: orders.filter((o: any) => o.cancelled_at).length
        }
      },
      productReport: {
        totalProducts: products.length,
        activeProducts: products.filter((p: any) => p.status === 'active').length,
        draftProducts: products.filter((p: any) => p.status === 'draft').length,
        archivedProducts: products.filter((p: any) => p.status === 'archived').length,
        productsWithImages: products.filter((p: any) => p.images && p.images.length > 0).length,
        productsWithVariants: products.filter((p: any) => p.variants && p.variants.length > 1).length,
        topProducts: products
          .sort((a: any, b: any) => (b.variants?.[0]?.inventory_quantity || 0) - (a.variants?.[0]?.inventory_quantity || 0))
          .slice(0, 5)
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            inventory: p.variants?.[0]?.inventory_quantity || 0,
            price: p.variants?.[0]?.price || '0.00'
          })),
        productCategories: products.reduce((acc: any, product: any) => {
          const type = product.product_type || 'Uncategorized';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {})
      },
      customerReport: {
        totalCustomers: customers.length,
        verifiedCustomers: customers.filter((c: any) => c.verified_email).length,
        marketingCustomers: customers.filter((c: any) => c.accepts_marketing).length,
        totalCustomerSpending: customers.reduce((sum: number, customer: any) => {
          return sum + parseFloat(customer.total_spent || '0');
        }, 0).toFixed(2),
        averageCustomerValue: customers.length > 0 ? 
          (customers.reduce((sum: number, customer: any) => {
            return sum + parseFloat(customer.total_spent || '0');
          }, 0) / customers.length).toFixed(2) : '0.00',
        topCustomers: customers
          .sort((a: any, b: any) => parseFloat(b.total_spent || '0') - parseFloat(a.total_spent || '0'))
          .slice(0, 5)
          .map((c: any) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            email: c.email,
            totalSpent: c.total_spent,
            ordersCount: c.orders_count,
            verified: c.verified_email
          })),
        customerSegments: {
          highValue: customers.filter((c: any) => parseFloat(c.total_spent || '0') >= 1000).length,
          mediumValue: customers.filter((c: any) => {
            const spent = parseFloat(c.total_spent || '0');
            return spent >= 100 && spent < 1000;
          }).length,
          lowValue: customers.filter((c: any) => parseFloat(c.total_spent || '0') < 100).length
        }
      },
      performanceReport: {
        conversionRate: orders.length > 0 && customers.length > 0 ? 
          ((orders.length / customers.length) * 100).toFixed(2) : '0.00',
        averageOrderValue: orders.length > 0 ? 
          (orders.reduce((sum: number, order: any) => {
            return sum + parseFloat(order.total_price || '0');
          }, 0) / orders.length).toFixed(2) : '0.00',
        customerRetentionRate: customers.filter((c: any) => c.orders_count > 1).length > 0 ? 
          ((customers.filter((c: any) => c.orders_count > 1).length / customers.length) * 100).toFixed(2) : '0.00',
        inventoryValue: products.reduce((sum: number, product: any) => {
          const inventory = product.variants?.[0]?.inventory_quantity || 0;
          const price = parseFloat(product.variants?.[0]?.price || '0');
          return sum + (inventory * price);
        }, 0).toFixed(2)
      },
      recentActivity: {
        recentOrders: orders
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map((o: any) => ({
            id: o.id,
            name: o.name,
            total_price: o.total_price,
            financial_status: o.financial_status,
            created_at: o.created_at,
            customer: o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : 'Unknown'
          })),
        recentCustomers: customers
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 10)
          .map((c: any) => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`,
            email: c.email,
            total_spent: c.total_spent,
            orders_count: c.orders_count,
            created_at: c.created_at
          })),
        recentProducts: products
          .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 10)
          .map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            vendor: p.vendor,
            updated_at: p.updated_at
          }))
      }
    };

    return NextResponse.json({
      reports,
      generatedAt: new Date().toISOString(),
      message: 'Reports generated successfully'
    });

  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 