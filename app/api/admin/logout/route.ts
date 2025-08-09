import { getAuth } from 'lib/auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (user) {
      console.log('Logging out user:', user.email);
    }
    
    const response = NextResponse.json({ success: true });
    response.cookies.delete('customer_token');
    response.cookies.delete('admin_session');
    response.cookies.delete('admin_token');

    // Clear demo cookies if present
    try {
      const cookieStore = await cookies();
      const isDemo = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true';
      const demoRole = cookieStore.get('demo_role')?.value;
      if (isDemo && demoRole === 'admin') {
        response.cookies.delete('demo');
        response.cookies.delete('demo_role');
      }
    } catch {}
    
    return response;
  } catch (error) {
    console.error('Error during admin logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 