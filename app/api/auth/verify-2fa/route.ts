import { getTwoFactorData, verifyTOTPCode } from 'lib/security';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Verification code and user ID are required' },
        { status: 400 }
      );
    }

    // Get 2FA data for the user
    const twoFactorData = getTwoFactorData(userId);

    if (!twoFactorData || !twoFactorData.enabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is not enabled for this account' },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const isValid = verifyTOTPCode(twoFactorData.secret, code);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Get temp session to check if user is staff member
    const cookieStore = await cookies();
    const tempSessionCookie = cookieStore.get('temp_session');
    let isStaffMember = false;

    if (tempSessionCookie) {
      try {
        const tempSession = JSON.parse(tempSessionCookie.value);
        isStaffMember = tempSession.isStaffMember || false;
      } catch (error) {
        console.error('Error parsing temp session:', error);
      }
    }

    // Set a flag in the session to indicate 2FA is verified
    cookieStore.set('2fa_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 // 1 hour
    });

    // Determine redirect URL based on user type
    const redirectUrl = isStaffMember ? '/admin' : '/account';
    console.log('2FA verified, redirecting user to:', redirectUrl, { 
      isStaffMember 
    });

    return NextResponse.json({
      success: true,
      redirect: redirectUrl,
      isStaffMember,
      message: 'Two-factor authentication verified successfully'
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA code' },
      { status: 500 }
    );
  }
} 