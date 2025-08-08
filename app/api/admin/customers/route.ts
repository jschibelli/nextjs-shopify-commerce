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
    const endpoint = `${baseUrl}/admin/api/2024-01/customers.json?limit=50`;

    const response = await fetch(endpoint, {
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'API permissions required. Please ensure your Shopify app has read_customers scope',
            details: errorText
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch customers: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const customers = data.customers || [];

    // Calculate customer statistics
    const customerStats = {
      total: customers.length,
      verified: customers.filter((customer: any) => customer.verified_email).length,
      acceptsMarketing: customers.filter((customer: any) => customer.accepts_marketing).length,
      totalSpent: customers.reduce((sum: number, customer: any) => {
        return sum + parseFloat(customer.total_spent || '0');
      }, 0).toFixed(2),
      averageOrderValue: customers.length > 0 ? 
        (customers.reduce((sum: number, customer: any) => {
          return sum + parseFloat(customer.total_spent || '0');
        }, 0) / customers.length).toFixed(2) : '0.00'
    };

    return NextResponse.json({
      customers,
      stats: customerStats,
      message: `Successfully fetched ${customers.length} customers`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 