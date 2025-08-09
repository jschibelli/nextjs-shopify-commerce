import { getProducts } from 'lib/shopify';
import { getWishlistStorage } from 'lib/wishlist-utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (process.env.DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo mode disabled' }, { status: 403 });
  }

  const { role, password } = await request.json().catch(() => ({ role: 'customer', password: undefined }));
  const expected = process.env.DEMO_PASSWORD;
  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'Invalid demo password' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set('demo', 'true', { httpOnly: true, sameSite: 'lax', path: '/' });

  if (role === 'admin') {
    const demoEmail = process.env.DEMO_ADMIN_EMAIL || 'demo+admin@example.com';
    cookieStore.set('demo_role', 'admin', { httpOnly: true, sameSite: 'lax', path: '/' });

    const token = {
      access_token: 'demo-admin-token',
      token_type: 'bearer',
      expires_in: 3600,
      scope: 'admin',
      customer_id: 'demo_admin',
      isStaffMember: true,
      email: demoEmail,
      role: 'admin'
    };
    cookieStore.set('customer_token', JSON.stringify(token), { httpOnly: true, sameSite: 'lax', path: '/' });

    return NextResponse.json({
      success: true,
      user: { id: 'demo_admin', email: demoEmail, firstName: 'Demo', lastName: 'Admin', role: 'admin' },
      isStaffMember: true
    });
  }

  // default to customer
  const demoCustomerId = process.env.DEMO_CUSTOMER_ID || 'demo_customer';
  const demoEmail = process.env.DEMO_CUSTOMER_EMAIL || 'demo+customer@example.com';
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