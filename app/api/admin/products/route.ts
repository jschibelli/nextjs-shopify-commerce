import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== FETCHING PRODUCTS ===');
    
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
    const endpoint = `${baseUrl}/admin/api/2024-01/products.json`;

    console.log('Fetching products from Shopify Admin API:', endpoint);

    const response = await fetch(endpoint, {
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      }
    });

    console.log('Shopify Admin API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify Admin API error:', response.status, errorText);
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'API permissions required. Please ensure your Shopify app has the following scopes: read_products, write_products',
            details: errorText
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch products: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const products = data.products || [];
    
    console.log('Shopify Admin API success - products found:', products.length);

    return NextResponse.json({
      products,
      total: products.length,
      message: `Successfully fetched ${products.length} products`
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATING PRODUCT ===');
    
    // Check admin authentication
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
    }

    const body = await request.json();
    console.log('Creating product with data:', body);

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
    const endpoint = `${baseUrl}/admin/api/2024-01/products.json`;

    // Prepare product data for Shopify
    const productData = {
      product: {
        title: body.title,
        body_html: body.description,
        vendor: body.vendor,
        product_type: body.product_type,
        tags: body.tags,
        status: body.status,
        variants: [
          {
            price: body.price || '0.00',
            inventory_quantity: body.inventory_quantity || 0,
            inventory_management: 'shopify'
          }
        ]
      }
    };

    console.log('Sending product data to Shopify:', productData);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    console.log('Shopify Admin API create response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify Admin API create error:', response.status, errorText);
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'API permissions required. Please ensure your Shopify app has write_products scope',
            details: errorText
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create product: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Product created successfully:', data.product.title);

    return NextResponse.json({
      product: data.product,
      message: `Product "${data.product.title}" created successfully`
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 