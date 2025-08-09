import { createSession, detectDevice, getLocationFromIP, getTwoFactorData } from 'lib/security';
import { createCustomerAccessToken, getCustomer } from 'lib/shopify';
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

    console.log('Attempting login with Shopify:', { email });

    let customer;
    let accessToken;

    try {
      // Authenticate with Shopify
      accessToken = await createCustomerAccessToken({
        email,
        password
      });
      
      // Get customer details from Shopify
      customer = await getCustomer(accessToken.accessToken);
      console.log('Login successful with Shopify:', customer.id);
    } catch (error) {
      console.error('Shopify authentication failed:', error);
      
      // Handle specific Shopify errors
      if (error instanceof Error) {
        if (error.message.includes('Invalid credentials')) {
          return NextResponse.json(
            { error: 'Invalid email or password' },
            { status: 401 }
          );
        }
        if (error.message.includes('Customer not found')) {
          return NextResponse.json(
            { error: 'Account not found. Please sign up first.' },
            { status: 401 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is a Shopify staff member
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentShopifyAdminUser();
    
    console.log('Checking if user is Shopify staff member:', { 
      email: customer.email, 
      isStaffMember: !!adminUser,
      role: adminUser?.role 
    });

    // Check if 2FA is enabled for this user
    const twoFactorData = getTwoFactorData(customer.id);
    console.log('2FA check for user:', customer.id, '2FA data:', twoFactorData);

    if (twoFactorData && twoFactorData.enabled) {
      console.log('2FA is enabled, redirecting to verification');
      // 2FA is enabled, require verification
      // Store temporary session data for 2FA verification
      const tempSession = {
        access_token: accessToken.accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'customer_read_customers,customer_read_orders',
        customer_id: customer.id,
        requires2FA: true,
        isStaffMember: !!adminUser
      };

      const cookieStore = await cookies();
      cookieStore.set('temp_session', JSON.stringify(tempSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 10 * 60 // 10 minutes for 2FA verification
      });

      return NextResponse.json({
        success: true,
        requires2FA: true,
        userId: customer.id,
        isStaffMember: !!adminUser,
        message: 'Two-factor authentication required'
      });
    }

    console.log('2FA not enabled, proceeding with normal login');

    // No 2FA required, complete login and create session
    const sessionToken = {
      access_token: accessToken.accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'customer_read_customers,customer_read_orders',
      customer_id: customer.id
    };

    // Get request information for session tracking
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIP || '127.0.0.1';

    // Create session
    const session = createSession(customer.id, {
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

    console.log('Session created for user:', customer.id, 'Session ID:', session.id);

    // Determine redirect URL based on user type
    const redirectUrl = adminUser ? '/admin' : '/account';
    console.log('Redirecting user to:', redirectUrl, { 
      isStaffMember: !!adminUser, 
      role: adminUser?.role 
    });

    return NextResponse.json({ 
      success: true, 
      redirect: redirectUrl,
      isStaffMember: !!adminUser,
      user: { 
        id: customer.id, 
        email: customer.email, 
        firstName: customer.firstName, 
        lastName: customer.lastName 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
} 