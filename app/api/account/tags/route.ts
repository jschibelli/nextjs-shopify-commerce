import { getAuth } from 'lib/auth';
import { addCustomerTagsWithAdminAPI, removeCustomerTagsWithAdminAPI } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get customer data to retrieve current tags
    const { getCustomerWithAdminAPI } = await import('lib/shopify');
    const customer = await getCustomerWithAdminAPI(user.id);
    
    const tags = customer.tags ? customer.tags.split(', ').filter((tag: string) => tag.trim()) : [];

    return NextResponse.json({
      success: true,
      tags
    });
  } catch (error) {
    console.error('Error fetching customer tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { tags } = await request.json();

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
    }

    // Add tags to customer
    await addCustomerTagsWithAdminAPI({
      customerId: user.id,
      tags
    });

    return NextResponse.json({
      success: true,
      message: 'Tags added successfully',
      tags
    });
  } catch (error) {
    console.error('Error adding customer tags:', error);
    return NextResponse.json({ error: 'Failed to add tags' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { tags } = await request.json();

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags array is required' }, { status: 400 });
    }

    // Remove tags from customer
    await removeCustomerTagsWithAdminAPI({
      customerId: user.id,
      tags
    });

    return NextResponse.json({
      success: true,
      message: 'Tags removed successfully',
      tags
    });
  } catch (error) {
    console.error('Error removing customer tags:', error);
    return NextResponse.json({ error: 'Failed to remove tags' }, { status: 500 });
  }
} 