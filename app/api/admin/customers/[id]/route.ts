import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_ADMIN_ACCESS_TOKEN = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    if (!adminUser) return NextResponse.json({ error: 'Admin access denied' }, { status: 403 });

    const body = await request.json();

    const cookieStore = await cookies();
    const isDemo = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true' && cookieStore.get('demo_role')?.value === 'admin';
    if (isDemo) {
      return NextResponse.json({ customer: { id, ...body }, demo: true, message: 'Simulated update in demo mode' });
    }

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) return NextResponse.json({ error: 'Shopify configuration missing' }, { status: 500 });
    const baseUrl = SHOPIFY_STORE_DOMAIN.startsWith('https://') ? SHOPIFY_STORE_DOMAIN : `https://${SHOPIFY_STORE_DOMAIN}`;
    const endpoint = `${baseUrl}/admin/api/2024-01/customers/${id}.json`;

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer: body })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Failed to update customer: ${response.status}`, details: errorText }, { status: response.status });
    }
    const data = await response.json();
    return NextResponse.json({ customer: data.customer });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    if (!adminUser) return NextResponse.json({ error: 'Admin access denied' }, { status: 403 });

    const cookieStore = await cookies();
    const isDemo = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true' && cookieStore.get('demo_role')?.value === 'admin';
    if (isDemo) {
      return NextResponse.json({ success: true, demo: true, message: 'Simulated delete in demo mode' });
    }

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_ACCESS_TOKEN) return NextResponse.json({ error: 'Shopify configuration missing' }, { status: 500 });
    const baseUrl = SHOPIFY_STORE_DOMAIN.startsWith('https://') ? SHOPIFY_STORE_DOMAIN : `https://${SHOPIFY_STORE_DOMAIN}`;
    const endpoint = `${baseUrl}/admin/api/2024-01/customers/${id}.json`;

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN, 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Failed to delete customer: ${response.status}`, details: errorText }, { status: response.status });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 