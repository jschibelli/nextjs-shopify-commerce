import { getProducts } from 'lib/shopify';
import { getWishlistStorage } from 'lib/wishlist-utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (process.env.DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo mode disabled' }, { status: 403 });
  }

  // Basic password gate
  const { password } = await request.json().catch(() => ({ password: undefined }));
  const expected = process.env.DEMO_CUSTOMER_PASSWORD || process.env.DEMO_PASSWORD;
  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'Invalid demo password' }, { status: 401 });
  }

  const demoCustomerId = process.env.DEMO_CUSTOMER_ID || 'demo_customer';
  const demoEmail = process.env.DEMO_CUSTOMER_EMAIL || 'demo+customer@example.com';

  const cookieStore = await cookies();
  cookieStore.set('demo', 'true', { httpOnly: true, sameSite: 'lax', path: '/' });
  cookieStore.set('demo_role', 'customer', { httpOnly: true, sameSite: 'lax', path: '/' });

  const token = {
    access_token: 'demo-token',
    token_type: 'bearer',
    expires_in: 3600,
    scope: 'customer',
    customer_id: demoCustomerId
  };
  cookieStore.set('customer_token', JSON.stringify(token), { httpOnly: true, sameSite: 'lax', path: '/' });

  try {
    const products = await getProducts({ query: '', sortKey: 'CREATED_AT', reverse: true });
    const wishlist = new Set<string>();
    for (const p of products.slice(0, 2)) wishlist.add(p.id);
    const store = getWishlistStorage();
    store.set(demoCustomerId, wishlist);
  } catch {}

  return NextResponse.json({
    success: true,
    user: { id: demoCustomerId, email: demoEmail, firstName: 'Demo', lastName: 'Customer' },
    isStaffMember: false
  });
} 