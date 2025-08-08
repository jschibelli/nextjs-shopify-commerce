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
    const endpoint = `${baseUrl}/admin/api/2024-01/collections.json?limit=250`;

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
            error: 'API permissions required. Please ensure your Shopify app has read_products scope',
            details: errorText
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch collections: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const collections = data.collections || [];
    
    // Calculate collection statistics
    const collectionStats = {
      total: collections.length,
      manual: collections.filter((collection: any) => collection.collection_type === 'manual').length,
      automated: collections.filter((collection: any) => collection.collection_type === 'smart').length,
      published: collections.filter((collection: any) => collection.published_at).length,
      draft: collections.filter((collection: any) => !collection.published_at).length
    };

    return NextResponse.json({
      collections,
      stats: collectionStats,
      message: `Successfully fetched ${collections.length} collections`
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
    const endpoint = `${baseUrl}/admin/api/2024-01/collections.json`;

    // Prepare collection data for Shopify
    const collectionData = {
      collection: {
        title: body.title,
        body_html: body.description,
        collection_type: body.collection_type || 'manual',
        published: body.published || false,
        template_suffix: body.template_suffix,
        seo: body.seo ? {
          title: body.seo.title,
          description: body.seo.description
        } : undefined
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(collectionData)
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
        { error: `Failed to create collection: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      collection: data.collection,
      message: `Collection "${data.collection.title}" created successfully`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 