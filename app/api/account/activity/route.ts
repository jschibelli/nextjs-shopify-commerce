import { getAuth } from 'lib/auth';
import { getCustomerMetafieldsWithAdminAPI, trackCustomerActivityWithAdminAPI } from 'lib/shopify';
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

    // Get activity log from metafields
    const metafields = await getCustomerMetafieldsWithAdminAPI(user.id);
    const activityMetafield = metafields.find(m => m.namespace === 'activity' && m.key === 'log');
    
    let activities = [];
    if (activityMetafield) {
      try {
        activities = JSON.parse(activityMetafield.value);
      } catch {
        activities = [];
      }
    }

    return NextResponse.json({
      success: true,
      activities,
      count: activities.length
    });
  } catch (error) {
    console.error('Error fetching customer activity:', error);
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 });
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

    const { action, details } = await request.json();

    if (!action) {
      return NextResponse.json({ 
        error: 'Action is required' 
      }, { status: 400 });
    }

    // Track activity
    await trackCustomerActivityWithAdminAPI({
      customerId: user.id,
      activity: {
        action,
        details,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Activity tracked successfully',
      action,
      details
    });
  } catch (error) {
    console.error('Error tracking customer activity:', error);
    return NextResponse.json({ error: 'Failed to track activity' }, { status: 500 });
  }
} 