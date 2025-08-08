import { getAuth } from 'lib/auth';
import { getCustomerMetafieldsWithAdminAPI, updateCustomerLoyaltyPointsWithAdminAPI } from 'lib/shopify';
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

    // Get loyalty points from metafields
    const metafields = await getCustomerMetafieldsWithAdminAPI(user.id);
    const loyaltyMetafield = metafields.find(m => m.namespace === 'loyalty' && m.key === 'loyalty_points');
    const points = loyaltyMetafield ? parseInt(loyaltyMetafield.value) : 0;

    return NextResponse.json({
      success: true,
      points,
      currency: 'points'
    });
  } catch (error) {
    console.error('Error fetching loyalty points:', error);
    return NextResponse.json({ error: 'Failed to fetch loyalty points' }, { status: 500 });
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

    const { points, action, reason } = await request.json();

    if (!points || !action) {
      return NextResponse.json({ 
        error: 'Points and action are required' 
      }, { status: 400 });
    }

    if (!['earn', 'redeem', 'adjust'].includes(action)) {
      return NextResponse.json({ 
        error: 'Action must be earn, redeem, or adjust' 
      }, { status: 400 });
    }

    // Update loyalty points
    await updateCustomerLoyaltyPointsWithAdminAPI({
      customerId: user.id,
      points,
      action
    });

    return NextResponse.json({
      success: true,
      message: `Points ${action === 'earn' ? 'earned' : action === 'redeem' ? 'redeemed' : 'adjusted'} successfully`,
      points,
      action,
      reason
    });
  } catch (error) {
    console.error('Error updating loyalty points:', error);
    return NextResponse.json({ error: 'Failed to update loyalty points' }, { status: 500 });
  }
} 