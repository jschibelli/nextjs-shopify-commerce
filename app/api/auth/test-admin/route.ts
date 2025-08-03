import { NextResponse } from 'next/server';

export async function GET() {
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

    const adminEndpoint = `https://${domain}/admin/api/2023-01/customers.json`;
    
    console.log('Testing Admin API connection to:', adminEndpoint);
    
    const response = await fetch(adminEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminKey
      }
    });

    console.log('Admin API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Admin API error:', errorText);
      return NextResponse.json({ 
        error: `Admin API error: ${response.status} - ${errorText}` 
      }, { status: response.status });
    }

    const result = await response.json();
    console.log('Admin API success, customer count:', result.customers?.length || 0);

    return NextResponse.json({
      success: true,
      message: 'Admin API connection successful',
      customerCount: result.customers?.length || 0,
      endpoint: adminEndpoint
    });
  } catch (error) {
    console.error('Test Admin API error:', error);
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
} 