import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

// Helper function to extract numeric ID from Shopify ID
function extractNumericId(shopifyId: string): string {
  return shopifyId.replace(/^gid:\/\/shopify\/\w+\//, '');
}

// Helper function to create Shopify GID
function createShopifyGid(type: string, id: string): string {
  return `gid://shopify/${type}/${id}`;
}

// GET - Fetch a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    
    // Verify admin authentication
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access denied' },
        { status: 403 }
      );
    }

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'Shopify configuration missing' },
        { status: 500 }
      );
    }

    const productId = extractNumericId(id);
    const baseUrl = SHOPIFY_STORE_DOMAIN.startsWith('https://') 
      ? SHOPIFY_STORE_DOMAIN 
      : `https://${SHOPIFY_STORE_DOMAIN}`;
    
    const endpoint = `${baseUrl}/admin/api/2024-01/products/${productId}.json`;

    console.log('Fetching product:', endpoint);

    const response = await fetch(endpoint, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch product:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch product: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Product fetched successfully:', data.product.id);

    return NextResponse.json({ product: data.product });

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access denied' }, { status: 403 });
    }

    // DEMO GUARD
    const isDemo = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true' && cookieStore.get('demo_role')?.value === 'admin';
    const body = await request.json();
    if (isDemo) {
      const now = new Date().toISOString();
      return NextResponse.json({ product: { id, ...body, updated_at: now }, demo: true, message: 'Simulated update in demo mode (no Shopify write)' });
    }

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Shopify configuration missing' }, { status: 500 });
    }

    const productId = extractNumericId(id);
    const baseUrl = SHOPIFY_STORE_DOMAIN.startsWith('https://') ? SHOPIFY_STORE_DOMAIN : `https://${SHOPIFY_STORE_DOMAIN}`;
    const endpoint = `${baseUrl}/admin/api/2024-01/products/${productId}.json`;

    console.log('Updating product:', endpoint);

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ product: body })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update product:', response.status, errorText);
      return NextResponse.json({ error: `Failed to update product: ${response.status}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    console.log('Product updated successfully:', data.product.id);

    return NextResponse.json({ product: data.product });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin access denied' }, { status: 403 });
    }

    // DEMO GUARD
    const isDemo = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true' && cookieStore.get('demo_role')?.value === 'admin';
    if (isDemo) {
      return NextResponse.json({ success: true, demo: true, message: 'Simulated delete in demo mode (no Shopify write)' });
    }

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'Shopify configuration missing' }, { status: 500 });
    }

    const productId = extractNumericId(id);
    const baseUrl = SHOPIFY_STORE_DOMAIN.startsWith('https://') ? SHOPIFY_STORE_DOMAIN : `https://${SHOPIFY_STORE_DOMAIN}`;
    const endpoint = `${baseUrl}/admin/api/2024-01/products/${productId}.json`;

    console.log('Deleting product:', endpoint);

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete product:', response.status, errorText);
      return NextResponse.json({ error: `Failed to delete product: ${response.status}`, details: errorText }, { status: response.status });
    }

    console.log('Product deleted successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 