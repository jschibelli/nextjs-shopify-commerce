import { getAuth } from 'lib/auth';
import { createCustomerSupportTicketWithAdminAPI, getCustomerSupportTicketsWithAdminAPI } from 'lib/shopify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        error: 'Authentication required',
        details: 'Please log in to view your support tickets'
      }, { status: 401 });
    }

    const tickets = await getCustomerSupportTicketsWithAdminAPI(user.id);

    return NextResponse.json({
      success: true,
      tickets
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch support tickets' }, { status: 500 });
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
        details: 'Please log in to create a support ticket'
      }, { status: 401 });
    }

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
      customerId: user.id,
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
    console.error('Error creating support ticket:', error);
    return NextResponse.json({ error: 'Failed to create support ticket' }, { status: 500 });
  }
} 