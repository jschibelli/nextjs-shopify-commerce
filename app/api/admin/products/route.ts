import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
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
    const endpoint = `${baseUrl}/admin/api/2024-01/products.json`;

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

    return NextResponse.json({
      products,
      total: products.length,
      message: `Successfully fetched ${products.length} products`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // DEMO GUARD: do not write to Shopify when demo admin
    const cookieStore = await cookies();
    const isDemo = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true' && cookieStore.get('demo_role')?.value === 'admin';
    if (isDemo) {
      const now = Date.now();
      const demoProduct = {
        id: `demo-${now}`,
        title: body.title,
        body_html: body.description,
        vendor: body.vendor,
        product_type: body.product_type,
        tags: Array.isArray(body.tags) ? body.tags.join(',') : body.tags,
        status: body.status || 'draft',
        images: body.images || [],
        variants: [
          {
            price: body.price || '0.00',
            inventory_quantity: body.inventory_quantity || 0
          }
        ],
        created_at: new Date(now).toISOString(),
        updated_at: new Date(now).toISOString(),
        published_at: new Date(now).toISOString(),
        handle: body.handle || `demo-product-${now}`
      };
      return NextResponse.json({ product: demoProduct, demo: true, message: 'Simulated create in demo mode (no Shopify write)' });
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

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorText = await response.text();
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

    return NextResponse.json({
      product: data.product,
      message: `Product "${data.product.title}" created successfully`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 