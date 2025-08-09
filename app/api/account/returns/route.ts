import { getAuth } from 'lib/auth';
import { createCustomerReturnWithAdminAPI, getCustomerReturnsWithAdminAPI } from 'lib/shopify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        details: 'Please log in to view your returns'
      }, { status: 401 });
    }

    const returns = await getCustomerReturnsWithAdminAPI(user.id);

    return NextResponse.json({
      success: true,
      returns
    });
  } catch (error) {
    console.error('Error fetching returns:', error);
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
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
        details: 'Please log in to create a return request'
      }, { status: 401 });
    }

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
      customerId: user.id,
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
    console.error('Error creating return request:', error);
    return NextResponse.json({ error: 'Failed to create return request' }, { status: 500 });
  }
} 