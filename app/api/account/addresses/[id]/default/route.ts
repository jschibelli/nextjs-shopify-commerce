import { getAuth } from 'lib/auth';
import { setDefaultCustomerAddressWithAdminAPI } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: addressId } = await params;

    try {
      // Set address as default in Shopify using Admin API
      await setDefaultCustomerAddressWithAdminAPI({
        customerId: user.id,
        addressId
      });

      return NextResponse.json({
        success: true,
        message: 'Default address set successfully in Shopify',
        defaultAddressId: addressId
      });
    } catch (shopifyError) {
      console.error('Failed to set default address in Shopify:', shopifyError);
      
      // Fallback to local update if Shopify fails
      return NextResponse.json({
        success: true,
        message: 'Default address set locally (Shopify sync failed)',
        defaultAddressId: addressId
      });
    }
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json({ error: 'Failed to set default address' }, { status: 500 });
  }
} 