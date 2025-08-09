import { getAuth } from 'lib/auth';
import { generateCustomerReferralCodeWithAdminAPI, getCustomerReferralStatsWithAdminAPI } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
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

    // Get referral stats
    const referralStats = await getCustomerReferralStatsWithAdminAPI(user.id);

    return NextResponse.json({
      success: true,
      referralStats
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return NextResponse.json({ error: 'Failed to fetch referral stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { code, discountPercentage } = await request.json();

    if (!code || !discountPercentage) {
      return NextResponse.json({ 
        error: 'Code and discount percentage are required' 
      }, { status: 400 });
    }

    if (discountPercentage < 0 || discountPercentage > 100) {
      return NextResponse.json({ 
        error: 'Discount percentage must be between 0 and 100' 
      }, { status: 400 });
    }

    // Generate referral code
    await generateCustomerReferralCodeWithAdminAPI({
      customerId: user.id,
      code,
      discountPercentage
    });

    return NextResponse.json({
      success: true,
      message: 'Referral code generated successfully',
      code,
      discountPercentage
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
  }
} 