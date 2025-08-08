import { createSession, detectDevice, getLocationFromIP } from 'lib/security';
import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Attempting admin login with Shopify:', { email });

    // Check if user is a Shopify staff member first
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.checkIfEmailIsStaffMember(email);
    
    console.log('Admin login check:', { 
      email, 
      isStaffMember: !!adminUser,
      role: adminUser?.role 
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Access denied. You must be a Shopify staff member to access the admin panel.' },
        { status: 401 }
      );
    }

    // For admin users, we'll create a session without customer authentication
    // since they're staff members, not customers
    const sessionToken = {
      access_token: 'admin_session', // Placeholder for admin sessions
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'admin_access',
      customer_id: adminUser.id,
      email: adminUser.email,
      isStaffMember: true,
      role: adminUser.role
    };

    // Get request information for session tracking
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIP || '127.0.0.1';

    // Create session
    const session = createSession(adminUser.id, {
      device: detectDevice(userAgent),
      location: getLocationFromIP(ip),
      ip,
      userAgent
    });

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set('customer_token', JSON.stringify(sessionToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    console.log('Admin session created for user:', adminUser.id, 'Session ID:', session.id);

    return NextResponse.json({ 
      success: true, 
      redirect: '/admin',
      isStaffMember: true,
      user: { 
        id: adminUser.id, 
        email: adminUser.email, 
        firstName: adminUser.firstName, 
        lastName: adminUser.lastName,
        role: adminUser.role
      } 
    });
  } catch (error) {
    console.error('Admin login error:', error);
    
    return NextResponse.json(
      { error: 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
} 