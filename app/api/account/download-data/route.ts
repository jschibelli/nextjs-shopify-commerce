import { getAuth } from 'lib/auth';
import { getCustomerWithAdminAPI } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = getAuth();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get comprehensive customer data from Shopify Admin API
    const customerData = await getCustomerWithAdminAPI(user.id);
    
    // Create a comprehensive data export
    const dataExport = {
      customer: {
        id: customerData.id,
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        phone: customerData.phone,
        acceptsMarketing: customerData.accepts_marketing,
        acceptsSMS: customerData.sms_marketing_consent?.state === 'subscribed',
        createdAt: customerData.created_at,
        updatedAt: customerData.updated_at,
        defaultAddress: customerData.default_address,
        addresses: customerData.addresses || [],
        orders: customerData.orders || [],
        tags: customerData.tags,
        note: customerData.note,
        totalSpent: customerData.total_spent,
        verifiedEmail: customerData.verified_email,
        multipassIdentifier: customerData.multipass_identifier,
        taxExempt: customerData.tax_exempt,
        taxExemptions: customerData.tax_exemptions,
        currency: customerData.currency,
        acceptsMarketingUpdatedAt: customerData.accepts_marketing_updated_at,
        marketingOptInLevel: customerData.marketing_opt_in_level,
        state: customerData.state,
        lastOrderId: customerData.last_order_id,
        lastOrderName: customerData.last_order_name,
        totalSpentV2: customerData.total_spent_v2,
        ordersCount: customerData.orders_count,
        adminGraphqlApiId: customerData.admin_graphql_api_id
      },
      exportDate: new Date().toISOString(),
      exportReason: 'Data download request',
      dataTypes: [
        'Personal Information',
        'Addresses',
        'Order History',
        'Marketing Preferences',
        'Account Settings'
      ]
    };

    // Return the data as JSON
    return NextResponse.json({
      success: true,
      data: dataExport
    });

  } catch (error) {
    console.error('Error downloading customer data:', error);
    return NextResponse.json(
      { error: 'Failed to download data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const auth = getAuth();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get comprehensive customer data from Shopify Admin API
    const customerData = await getCustomerWithAdminAPI(user.id);
    
    // Create a comprehensive data export
    const dataExport = {
      customer: {
        id: customerData.id,
        email: customerData.email,
        firstName: customerData.first_name,
        lastName: customerData.last_name,
        phone: customerData.phone,
        acceptsMarketing: customerData.accepts_marketing,
        acceptsSMS: customerData.sms_marketing_consent?.state === 'subscribed',
        createdAt: customerData.created_at,
        updatedAt: customerData.updated_at,
        defaultAddress: customerData.default_address,
        addresses: customerData.addresses || [],
        orders: customerData.orders || [],
        tags: customerData.tags,
        note: customerData.note,
        totalSpent: customerData.total_spent,
        verifiedEmail: customerData.verified_email,
        multipassIdentifier: customerData.multipass_identifier,
        taxExempt: customerData.tax_exempt,
        taxExemptions: customerData.tax_exemptions,
        currency: customerData.currency,
        acceptsMarketingUpdatedAt: customerData.accepts_marketing_updated_at,
        marketingOptInLevel: customerData.marketing_opt_in_level,
        state: customerData.state,
        lastOrderId: customerData.last_order_id,
        lastOrderName: customerData.last_order_name,
        totalSpentV2: customerData.total_spent_v2,
        ordersCount: customerData.orders_count,
        adminGraphqlApiId: customerData.admin_graphql_api_id
      },
      exportDate: new Date().toISOString(),
      exportReason: 'Data download request',
      dataTypes: [
        'Personal Information',
        'Addresses',
        'Order History',
        'Marketing Preferences',
        'Account Settings'
      ]
    };

    // Convert to JSON string for file download
    const jsonString = JSON.stringify(dataExport, null, 2);
    const filename = `customer-data-${user.email}-${new Date().toISOString().split('T')[0]}.json`;

    // Return as downloadable file
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Error downloading customer data:', error);
    return NextResponse.json(
      { error: 'Failed to download data' },
      { status: 500 }
    );
  }
} 