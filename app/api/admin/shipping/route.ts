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

    // Get Shopify API credentials
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !adminKey) {
      return NextResponse.json({
        error: 'Shopify configuration missing',
        details: 'SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required'
      }, { status: 500 });
    }

    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;

    // Fetch shipping data in parallel
    const [shippingZonesResponse, fulfillmentsResponse, carrierServicesResponse] = await Promise.all([
      fetch(`${baseUrl}/admin/api/2024-01/shipping_zones.json`, {
        headers: {
          'X-Shopify-Access-Token': adminKey,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${baseUrl}/admin/api/2024-01/fulfillments.json?limit=250`, {
        headers: {
          'X-Shopify-Access-Token': adminKey,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${baseUrl}/admin/api/2024-01/carrier_services.json`, {
        headers: {
          'X-Shopify-Access-Token': adminKey,
          'Content-Type': 'application/json'
        }
      })
    ]);

    // Handle errors
    if (!shippingZonesResponse.ok || !fulfillmentsResponse.ok || !carrierServicesResponse.ok) {
      const errors = [];
      if (!shippingZonesResponse.ok) errors.push(`Shipping Zones: ${shippingZonesResponse.status}`);
      if (!fulfillmentsResponse.ok) errors.push(`Fulfillments: ${fulfillmentsResponse.status}`);
      if (!carrierServicesResponse.ok) errors.push(`Carrier Services: ${carrierServicesResponse.status}`);
      
      return NextResponse.json({
        error: 'Failed to fetch shipping data',
        details: errors.join(', ')
      }, { status: 500 });
    }

    const [shippingZonesData, fulfillmentsData, carrierServicesData] = await Promise.all([
      shippingZonesResponse.json(),
      fulfillmentsResponse.json(),
      carrierServicesResponse.json()
    ]);

    const shippingZones = shippingZonesData.shipping_zones || [];
    const fulfillments = fulfillmentsData.fulfillments || [];
    const carrierServices = carrierServicesData.carrier_services || [];

    // Calculate shipping statistics
    const totalZones = shippingZones.length;
    const totalFulfillments = fulfillments.length;
    const pendingFulfillments = fulfillments.filter((fulfillment: any) => 
      fulfillment.status === 'pending'
    ).length;
    const completedFulfillments = fulfillments.filter((fulfillment: any) => 
      fulfillment.status === 'success'
    ).length;

    return NextResponse.json({
      shippingZones,
      fulfillments,
      carrierServices,
      stats: {
        totalZones,
        totalFulfillments,
        pendingFulfillments,
        completedFulfillments,
        totalCarrierServices: carrierServices.length
      },
      message: `Successfully fetched shipping data`
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { orderId, lineItems, trackingCompany, trackingNumber, notifyCustomer } = body;

    if (!orderId || !lineItems) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: 'orderId and lineItems are required'
      }, { status: 400 });
    }

    // Get Shopify API credentials
    const domain = process.env.SHOPIFY_STORE_DOMAIN;
    const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

    if (!domain || !adminKey) {
      return NextResponse.json({
        error: 'Shopify configuration missing',
        details: 'SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN are required'
      }, { status: 500 });
    }

    const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
    const endpoint = `${baseUrl}/admin/api/2024-01/orders/${orderId}/fulfillments.json`;

    // Prepare fulfillment data for Shopify
    const fulfillmentData = {
      fulfillment: {
        line_items: lineItems,
        tracking_company: trackingCompany,
        tracking_number: trackingNumber,
        notify_customer: notifyCustomer !== false
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': adminKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fulfillmentData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'API permissions required. Please ensure your Shopify app has write_orders scope',
            details: errorText
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `Failed to create fulfillment: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      fulfillment: data.fulfillment,
      message: 'Fulfillment created successfully'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 