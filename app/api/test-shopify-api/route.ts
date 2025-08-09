import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !adminKey) {
      return NextResponse.json(
        { error: 'Shopify credentials not configured' },
        { status: 500 }
      );
    }

    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
    const results: any = {};

    // Test different API endpoints
    const endpoints = [
      { name: 'shop', url: `${baseUrl}/admin/api/2023-01/shop.json` },
      { name: 'staff_members', url: `${baseUrl}/admin/api/2023-01/staff_members.json` },
      { name: 'users', url: `${baseUrl}/admin/api/2023-01/users.json` },
      { name: 'products', url: `${baseUrl}/admin/api/2023-01/products.json?limit=1` }
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing endpoint: ${endpoint.name}`);
        
        const response = await fetch(endpoint.url, {
          headers: {
            'X-Shopify-Access-Token': adminKey,
            'Content-Type': 'application/json'
          }
        });

        results[endpoint.name] = {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        };
      } catch (error) {
        results[endpoint.name] = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      domain,
      adminKeyConfigured: !!adminKey,
      results
    });
  } catch (error) {
    console.error('Shopify API test error:', error);
    
    return NextResponse.json(
      { error: 'Failed to test Shopify API' },
      { status: 500 }
    );
  }
} 