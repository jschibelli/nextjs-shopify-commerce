import { getCustomerAPIMonitoringDataWithAdminAPI } from 'lib/shopify';
import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
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

    const monitoringData = await getCustomerAPIMonitoringDataWithAdminAPI();

    return NextResponse.json({
      success: true,
      monitoring: monitoringData
    });
  } catch (error) {
    console.error('Error fetching API monitoring data:', error);
    return NextResponse.json({ error: 'Failed to fetch API monitoring data' }, { status: 500 });
  }
} 