import { createCustomerMetafieldWithAdminAPI, getCustomerMetafieldsWithAdminAPI } from 'lib/shopify';
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

    const { id: customerId } = await params;

    // Get customer metafields
    const metafields = await getCustomerMetafieldsWithAdminAPI(customerId);

    return NextResponse.json({
      success: true,
      customerId,
      metafields
    });
  } catch (error) {
    console.error('Error fetching customer metafields:', error);
    return NextResponse.json({ error: 'Failed to fetch customer metafields' }, { status: 500 });
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

    const { id: customerId } = await params;
    const { namespace, key, value, type } = await request.json();

    if (!namespace || !key || !value || !type) {
      return NextResponse.json({ 
        error: 'Namespace, key, value, and type are required' 
      }, { status: 400 });
    }

    // Create metafield
    const metafield = await createCustomerMetafieldWithAdminAPI({
      customerId,
      namespace,
      key,
      value,
      type
    });

    return NextResponse.json({
      success: true,
      message: 'Metafield created successfully',
      customerId,
      metafield
    });
  } catch (error) {
    console.error('Error creating customer metafield:', error);
    return NextResponse.json({ error: 'Failed to create customer metafield' }, { status: 500 });
  }
} 