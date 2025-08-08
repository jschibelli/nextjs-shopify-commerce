import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    
    if (!adminKey) {
      return NextResponse.json({ 
        error: 'SHOPIFY_ADMIN_ACCESS_TOKEN not set' 
      }, { status: 500 });
    }

    if (!domain) {
      return NextResponse.json({ 
        error: 'SHOPIFY_STORE_DOMAIN not set' 
      }, { status: 500 });
    }

    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
    
    // Test different endpoints to see what's available
    const endpoints = [
      { name: 'Shop Info', url: `${baseUrl}/admin/api/2023-01/shop.json` },
      { name: 'Staff Members', url: `${baseUrl}/admin/api/2023-01/staff_members.json` },
      { name: 'Customers', url: `${baseUrl}/admin/api/2023-01/customers.json` },
      { name: 'Products', url: `${baseUrl}/admin/api/2023-01/products.json` }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.name}:`, endpoint.url);
        
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminKey
          }
        });

        const result: any = {
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          ok: response.ok
        };

        if (response.ok) {
          try {
            const data = await response.json();
            result.data = data;
          } catch (error) {
            result.error = 'Failed to parse JSON response';
          }
        } else {
          try {
            const errorText = await response.text();
            result.error = errorText;
          } catch (error) {
            result.error = 'Failed to read error response';
          }
        }

        results.push(result);
      } catch (error) {
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'ERROR',
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      domain,
      adminKeyConfigured: !!adminKey,
      results
    });
  } catch (error) {
    console.error('Test admin access error:', error);
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 