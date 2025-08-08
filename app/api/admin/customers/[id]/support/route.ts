import { createCustomerSupportTicketWithAdminAPI, getCustomerSupportTicketsWithAdminAPI } from 'lib/shopify';
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
    const tickets = await getCustomerSupportTicketsWithAdminAPI(id);

    return NextResponse.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Error fetching customer support tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch customer support tickets' }, { status: 500 });
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
    const { subject, message, orderId, priority, category } = await request.json();

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!priority || !['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return NextResponse.json({ error: 'Valid priority is required' }, { status: 400 });
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    const ticket = await createCustomerSupportTicketWithAdminAPI({
      customerId: id,
      subject,
      message,
      orderId,
      priority,
      category
    });

    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Error creating customer support ticket:', error);
    return NextResponse.json({ error: 'Failed to create customer support ticket' }, { status: 500 });
  }
} 