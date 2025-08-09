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

    // Try generic endpoint first
    const endpoint = `${baseUrl}/admin/api/2024-01/collections.json?limit=250`;
    let response = await fetch(endpoint, {
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      }
    });

    let collections: any[] = [];

    if (response.ok) {
      const data = await response.json();
      collections = data.collections || [];
    } else {
      // Fallback to custom and smart collections (Shopify standard endpoints)
      const customEndpoint = `${baseUrl}/admin/api/2024-01/custom_collections.json?limit=250`;
      const smartEndpoint = `${baseUrl}/admin/api/2024-01/smart_collections.json?limit=250`;
      const [customRes, smartRes] = await Promise.all([
        fetch(customEndpoint, { headers: { 'X-Shopify-Access-Token': adminKey, 'Content-Type': 'application/json' } }),
        fetch(smartEndpoint, { headers: { 'X-Shopify-Access-Token': adminKey, 'Content-Type': 'application/json' } })
      ]);
      if (!customRes.ok && !smartRes.ok) {
        const errorText = await response.text().catch(() => '');
        return NextResponse.json(
          { error: `Failed to fetch collections: ${response.status}`, details: errorText },
          { status: response.status }
        );
      }
      const customData = customRes.ok ? await customRes.json() : { custom_collections: [] };
      const smartData = smartRes.ok ? await smartRes.json() : { smart_collections: [] };
      // Normalize to a single shape
      const normalize = (c: any, type: 'manual' | 'smart') => ({
        id: c.id,
        title: c.title,
        body_html: c.body_html || '',
        collection_type: type,
        published_at: c.published_at || null,
        products_count: c.products_count || 0,
        handle: c.handle,
        updated_at: c.updated_at || c.published_at || new Date().toISOString()
      });
      const custom = (customData.custom_collections || []).map((c: any) => normalize(c, 'manual'));
      const smart = (smartData.smart_collections || []).map((c: any) => normalize(c, 'smart'));
      collections = [...custom, ...smart];
    }

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

    // DEMO GUARD: simulate creation for demo admin sessions
    const cookieStore = await cookies();
    const isDemo = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true' && cookieStore.get('demo_role')?.value === 'admin';
    if (isDemo) {
      const now = Date.now();
      const collection = {
        id: now,
        title: body.title,
        body_html: body.description || '',
        collection_type: body.collection_type || 'manual',
        published_at: body.published ? new Date(now).toISOString() : null,
        products_count: 0,
        handle: (body.title || 'demo-collection').toLowerCase().replace(/\s+/g, '-'),
        updated_at: new Date(now).toISOString()
      };
      return NextResponse.json({ collection, demo: true, message: 'Simulated create in demo mode (no Shopify write)' });
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