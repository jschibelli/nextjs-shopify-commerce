import { createSession, detectDevice, getLocationFromIP } from 'lib/security';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Get the temporary session data
    const tempSessionCookie = cookieStore.get('temp_session');
    
    if (!tempSessionCookie) {
      return NextResponse.json(
        { error: 'No temporary session found. Please login again.' },
        { status: 401 }
      );
    }

    let tempSession;
    try {
      tempSession = JSON.parse(tempSessionCookie.value);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid session data. Please login again.' },
        { status: 401 }
      );
    }

    // Check if 2FA is verified
    const twoFACookie = cookieStore.get('2fa_verified');
    
    if (!twoFACookie || twoFACookie.value !== 'true') {
      return NextResponse.json(
        { error: 'Two-factor authentication not verified.' },
        { status: 401 }
      );
    }

    // Get request information for session tracking
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIP || '127.0.0.1';

    // Create session
    const session = createSession(tempSession.customer_id, {
      device: detectDevice(userAgent),
      location: getLocationFromIP(ip),
      ip,
      userAgent
    });

    // Create the final session token
    const sessionToken = {
      access_token: tempSession.access_token,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'customer_read_customers,customer_read_orders',
      customer_id: tempSession.customer_id
    };

    // Set the final session cookie
    cookieStore.set('customer_token', JSON.stringify(sessionToken), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    // Clear temporary cookies
    cookieStore.delete('temp_session');
    cookieStore.delete('2fa_verified');

    console.log('Session created after 2FA for user:', tempSession.customer_id, 'Session ID:', session.id);

    return NextResponse.json({
      success: true,
      redirect: '/account',
      message: 'Login completed successfully'
    });
  } catch (error) {
    console.error('Complete login error:', error);
    return NextResponse.json(
      { error: 'Failed to complete login. Please try again.' },
      { status: 500 }
    );
  }
} 