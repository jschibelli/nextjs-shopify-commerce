import { createCustomerReturnWithAdminAPI, getCustomerReturnsWithAdminAPI } from 'lib/shopify';
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
    const returns = await getCustomerReturnsWithAdminAPI(id);

    return NextResponse.json({
      success: true,
      returns
    });
  } catch (error) {
    console.error('Error fetching customer returns:', error);
    return NextResponse.json({ error: 'Failed to fetch customer returns' }, { status: 500 });
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
    const { orderId, items, reason } = await request.json();

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items array is required' }, { status: 400 });
    }

    if (!reason || typeof reason !== 'string') {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    // Validate items
    for (const item of items) {
      if (!item.lineItemId || !item.quantity || !item.reason) {
        return NextResponse.json({ error: 'Invalid item format' }, { status: 400 });
      }
    }

    const returnRequest = await createCustomerReturnWithAdminAPI({
      customerId: id,
      orderId,
      items,
      reason
    });

    return NextResponse.json({
      success: true,
      message: 'Return request created successfully',
      returnRequest
    });
  } catch (error) {
    console.error('Error creating customer return request:', error);
    return NextResponse.json({ error: 'Failed to create customer return request' }, { status: 500 });
  }
} 