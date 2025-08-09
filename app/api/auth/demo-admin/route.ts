import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (process.env.DEMO_MODE !== 'true') {
    return NextResponse.json({ error: 'Demo mode disabled' }, { status: 403 });
  }

  // Basic password gate
  const { password } = await request.json().catch(() => ({ password: undefined }));
  const expected = process.env.DEMO_ADMIN_PASSWORD || process.env.DEMO_PASSWORD;
  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'Invalid demo password' }, { status: 401 });
  }

  const demoEmail = process.env.DEMO_ADMIN_EMAIL || 'demo+admin@example.com';
  const cookieStore = await cookies();

  cookieStore.set('demo', 'true', { httpOnly: true, sameSite: 'lax', path: '/' });
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