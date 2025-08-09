import { getAuth } from 'lib/auth';
import { getCustomerJourneyWithAdminAPI, trackCustomerJourneyWithAdminAPI } from 'lib/shopify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        details: 'Please log in to view your journey'
      }, { status: 401 });
    }

    const journey = await getCustomerJourneyWithAdminAPI(user.id);

    return NextResponse.json({
      success: true,
      journey
    });
  } catch (error) {
    console.error('Error fetching customer journey:', error);
    return NextResponse.json({ error: 'Failed to fetch journey' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        details: 'Please log in to track your journey'
      }, { status: 401 });
    }

    const { touchpoint, campaign, metadata } = await request.json();

    if (!touchpoint || typeof touchpoint !== 'string') {
      return NextResponse.json({ error: 'Touchpoint is required' }, { status: 400 });
    }

    await trackCustomerJourneyWithAdminAPI({
      customerId: user.id,
      touchpoint,
      campaign,
      metadata
    });

    return NextResponse.json({
      success: true,
      message: 'Journey touchpoint tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking customer journey:', error);
    return NextResponse.json({ error: 'Failed to track journey' }, { status: 500 });
  }
} 