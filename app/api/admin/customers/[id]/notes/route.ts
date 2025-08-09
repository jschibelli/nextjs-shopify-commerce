import { addCustomerNoteWithAdminAPI, getCustomerWithAdminAPI } from 'lib/shopify';
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

    // Get customer data to retrieve current note
    const customer = await getCustomerWithAdminAPI(customerId);

    return NextResponse.json({
      success: true,
      customerId,
      note: customer.note || ''
    });
  } catch (error) {
    console.error('Error fetching customer note:', error);
    return NextResponse.json({ error: 'Failed to fetch customer note' }, { status: 500 });
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
    const { note, isPrivate = false } = await request.json();

    if (!note) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
    }

    // Add note to customer
    await addCustomerNoteWithAdminAPI({
      customerId,
      note,
      isPrivate
    });

    return NextResponse.json({
      success: true,
      message: 'Note added successfully',
      customerId,
      note,
      isPrivate
    });
  } catch (error) {
    console.error('Error adding customer note:', error);
    return NextResponse.json({ error: 'Failed to add customer note' }, { status: 500 });
  }
} 