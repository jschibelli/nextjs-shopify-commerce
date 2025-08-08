import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== ADMIN AUTH TEST ===');
    
    // Check environment variables
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    
    console.log('Environment variables:');
    console.log('- SHOPIFY_STORE_DOMAIN:', domain ? 'SET' : 'MISSING');
    console.log('- SHOPIFY_ADMIN_ACCESS_TOKEN:', adminKey ? 'SET' : 'MISSING');
    
    // Check session cookie
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    console.log('- Session cookie:', tokenCookie ? 'PRESENT' : 'MISSING');
    
    if (!tokenCookie) {
      return NextResponse.json({
        error: 'No session found',
        details: 'Please login first'
      }, { status: 401 });
    }
    
    // Test admin authentication
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    console.log('Admin user check:', adminUser ? 'SUCCESS' : 'FAILED');
    
    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
    }
    
    // Test Shopify API connection
    if (!domain || !adminKey) {
      return NextResponse.json({
        error: 'Shopify configuration missing',
        details: 'SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required'
      }, { status: 500 });
    }
    
    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
    const testEndpoint = `${baseUrl}/admin/api/2024-01/shop.json`;
    
    console.log('Testing Shopify API connection:', testEndpoint);
    
    const response = await fetch(testEndpoint, {
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Shopify API test response:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API test failed:', errorText);
      
      return NextResponse.json({
        error: 'Shopify API connection failed',
        status: response.status,
        details: errorText,
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          permissions: adminUser.permissions
        }
      }, { status: response.status });
    }
    
    const shopData = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Admin authentication and Shopify API connection successful',
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions
      },
      shop: {
        name: shopData.shop?.name,
        domain: shopData.shop?.domain,
        email: shopData.shop?.email
      }
    });
    
  } catch (error) {
    console.error('Admin auth test error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 