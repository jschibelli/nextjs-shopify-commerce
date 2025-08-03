import { getAuth } from 'lib/auth';
import { getTwoFactorData } from 'lib/security';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get 2FA data from persistence
    const twoFactorData = getTwoFactorData(user.id);

    return NextResponse.json({
      success: true,
      userId: user.id,
      twoFactorData,
      enabled: twoFactorData?.enabled || false
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ error: 'Failed to get debug info' }, { status: 500 });
  }
} 