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

    // Set a flag in the session to indicate 2FA is verified
    const cookieStore = await cookies();
    cookieStore.set('2fa_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 // 1 hour
    });

    return NextResponse.json({
      success: true,
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