import { enrichCustomerDataWithAdminAPI, getCustomerDataQualityScoreWithAdminAPI } from 'lib/shopify';
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
    const qualityData = await getCustomerDataQualityScoreWithAdminAPI(id);

    return NextResponse.json({
      success: true,
      quality: qualityData
    });
  } catch (error) {
    console.error('Error fetching customer data quality:', error);
    return NextResponse.json({ error: 'Failed to fetch customer data quality' }, { status: 500 });
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
    const { services } = await request.json();

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ error: 'Services array is required' }, { status: 400 });
    }

    // Validate services
    const validServices = ['email_validation', 'address_verification', 'social_profiles'];
    for (const service of services) {
      if (!validServices.includes(service)) {
        return NextResponse.json({ error: `Invalid service: ${service}` }, { status: 400 });
      }
    }

    const enrichmentData = await enrichCustomerDataWithAdminAPI({
      customerId: id,
      services
    });

    return NextResponse.json({
      success: true,
      message: 'Customer data enriched successfully',
      enrichment: enrichmentData
    });
  } catch (error) {
    console.error('Error enriching customer data:', error);
    return NextResponse.json({ error: 'Failed to enrich customer data' }, { status: 500 });
  }
} 