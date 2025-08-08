import { getAuth } from 'lib/auth';
import { createCustomerMetafieldWithAdminAPI, getCustomerMetafieldsWithAdminAPI } from 'lib/shopify';
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

    // Get customer metafields
    const metafields = await getCustomerMetafieldsWithAdminAPI(user.id);

    return NextResponse.json({
      success: true,
      metafields
    });
  } catch (error) {
    console.error('Error fetching customer metafields:', error);
    return NextResponse.json({ error: 'Failed to fetch metafields' }, { status: 500 });
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

    const { namespace, key, value, type } = await request.json();

    if (!namespace || !key || !value || !type) {
      return NextResponse.json({ 
        error: 'Namespace, key, value, and type are required' 
      }, { status: 400 });
    }

    // Create metafield
    const metafield = await createCustomerMetafieldWithAdminAPI({
      customerId: user.id,
      namespace,
      key,
      value,
      type
    });

    return NextResponse.json({
      success: true,
      message: 'Metafield created successfully',
      metafield
    });
  } catch (error) {
    console.error('Error creating customer metafield:', error);
    return NextResponse.json({ error: 'Failed to create metafield' }, { status: 500 });
  }
} 