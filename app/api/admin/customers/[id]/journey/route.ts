import { getCustomerJourneyWithAdminAPI, trackCustomerJourneyWithAdminAPI } from 'lib/shopify';
import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
    }

    const { id } = await params;
    const journey = await getCustomerJourneyWithAdminAPI(id);

    return NextResponse.json({
      success: true,
      journey
    });
  } catch (error) {
    console.error('Error fetching customer journey:', error);
    return NextResponse.json({ error: 'Failed to fetch customer journey' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
    }

    const { id } = await params;
    const { touchpoint, campaign, metadata } = await request.json();

    if (!touchpoint || typeof touchpoint !== 'string') {
      return NextResponse.json({ error: 'Touchpoint is required' }, { status: 400 });
    }

    await trackCustomerJourneyWithAdminAPI({
      customerId: id,
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
    return NextResponse.json({ error: 'Failed to track customer journey' }, { status: 500 });
  }
} 