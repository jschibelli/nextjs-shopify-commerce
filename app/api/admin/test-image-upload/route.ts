import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST IMAGE UPLOAD DEBUG ===');
    
    // Check environment variables
    console.log('SHOPIFY_STORE_DOMAIN:', SHOPIFY_STORE_DOMAIN ? 'Set' : 'Missing');
    console.log('SHOPIFY_ADMIN_ACCESS_TOKEN:', SHOPIFY_ADMIN_ACCESS_TOKEN ? 'Set' : 'Missing');
    
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
      return NextResponse.json({
        error: 'Shopify configuration missing',
        details: {
          storeDomain: !!SHOPIFY_STORE_DOMAIN,
          accessToken: !!SHOPIFY_ADMIN_ACCESS_TOKEN
        }
      }, { status: 500 });
    }

    // Try to verify admin authentication
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    console.log('Token cookie found:', !!tokenCookie);
    
    if (!tokenCookie) {
      return NextResponse.json({
        error: 'Unauthorized - No token cookie found',
        message: 'Please log in as admin first'
      }, { status: 401 });
    }

    console.log('Attempting admin authentication...');
    
    try {
      const adminAuth = getShopifyAdminAuth();
      const adminUser = await adminAuth.getCurrentAdminUserFromSession();
      
      console.log('Admin user found:', !!adminUser);
      
      if (!adminUser) {
        return NextResponse.json({
          error: 'Admin access denied',
          message: 'User is not an admin'
        }, { status: 403 });
      }
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({
        error: 'Authentication failed',
        details: authError instanceof Error ? authError.message : 'Unknown auth error'
      }, { status: 403 });
    }

    const baseUrl = SHOPIFY_STORE_DOMAIN.startsWith('https://') 
      ? SHOPIFY_STORE_DOMAIN 
      : `https://${SHOPIFY_STORE_DOMAIN}`;
    
    // Test 1: Get products to find a product ID
    const productsEndpoint = `${baseUrl}/admin/api/2024-01/products.json?limit=1`;
    
    console.log('Testing Shopify API connection...');
    console.log('Products endpoint:', productsEndpoint);
    
    const productsResponse = await fetch(productsEndpoint, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log('Products response status:', productsResponse.status);
    
    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error('Failed to fetch products:', errorText);
      return NextResponse.json({
        error: 'Failed to fetch products',
        status: productsResponse.status,
        details: errorText
      });
    }

    const productsData = await productsResponse.json();
    const products = productsData.products || [];
    
    if (products.length === 0) {
      return NextResponse.json({
        error: 'No products found to test with',
        message: 'Please create a product first to test image upload'
      });
    }

    const testProduct = products[0];
    console.log('Found test product:', testProduct.id);
    
    // Test 2: Try to get images for this product
    const imagesEndpoint = `${baseUrl}/admin/api/2024-01/products/${testProduct.id}/images.json`;
    
    console.log('Testing images endpoint:', imagesEndpoint);
    
    const imagesResponse = await fetch(imagesEndpoint, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log('Images response status:', imagesResponse.status);
    
    if (!imagesResponse.ok) {
      const errorText = await imagesResponse.text();
      console.error('Failed to fetch images:', errorText);
      return NextResponse.json({
        error: 'Failed to fetch images',
        status: imagesResponse.status,
        details: errorText,
        productId: testProduct.id
      });
    }

    const imagesData = await imagesResponse.json();
    
    console.log('=== TEST COMPLETED SUCCESSFULLY ===');
    
    return NextResponse.json({
      success: true,
      message: 'Shopify API connection test successful',
      productId: testProduct.id,
      productTitle: testProduct.title,
      imagesCount: imagesData.images?.length || 0,
      endpoints: {
        products: productsEndpoint,
        images: imagesEndpoint
      },
      permissions: {
        canReadProducts: productsResponse.ok,
        canReadImages: imagesResponse.ok
      }
    });

  } catch (error) {
    console.error('Error testing Shopify API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 