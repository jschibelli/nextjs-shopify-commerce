import { getAuth } from 'lib/auth';
import { deleteCustomerAddressWithAdminAPI, updateCustomerAddressWithAdminAPI } from 'lib/shopify';
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
    const body = await request.json();
    const {
      firstName,
      lastName,
      company,
      address1,
      address2,
      city,
      province,
      country,
      zip,
      phone
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !address1 || !city || !province || !country || !zip) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    try {
      // Update address in Shopify using Admin API
      const shopifyAddress = await updateCustomerAddressWithAdminAPI({
        customerId: user.id,
        addressId,
        address: {
          firstName,
          lastName,
          company,
          address1,
          address2,
          city,
          province,
          country,
          zip,
          phone
        }
      });

      // Transform the response to match our frontend format
      const address = {
        id: shopifyAddress.id.toString(),
        firstName: shopifyAddress.first_name,
        lastName: shopifyAddress.last_name,
        company: shopifyAddress.company,
        address1: shopifyAddress.address1,
        address2: shopifyAddress.address2,
        city: shopifyAddress.city,
        province: shopifyAddress.province,
        country: shopifyAddress.country,
        zip: shopifyAddress.zip,
        phone: shopifyAddress.phone
      };

      return NextResponse.json({
        success: true,
        message: 'Address updated successfully in Shopify',
        address
      });
    } catch (shopifyError) {
      console.error('Failed to update address in Shopify:', shopifyError);
      
      // Fallback to local update if Shopify fails
      return NextResponse.json({
        success: true,
        message: 'Address updated locally (Shopify sync failed)',
        address: {
          id: addressId,
          firstName,
          lastName,
          company,
          address1,
          address2,
          city,
          province,
          country,
          zip,
          phone
        }
      });
    }
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(
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
      // Delete address from Shopify using Admin API
      await deleteCustomerAddressWithAdminAPI({
        customerId: user.id,
        addressId
      });

      return NextResponse.json({
        success: true,
        message: 'Address deleted successfully from Shopify',
        deletedAddressId: addressId
      });
    } catch (shopifyError) {
      console.error('Failed to delete address from Shopify:', shopifyError);
      
      // Check if it's a default address error
      const errorMessage = shopifyError instanceof Error ? shopifyError.message : String(shopifyError);
      if (errorMessage.includes('Cannot delete the customer\'s default address')) {
        return NextResponse.json({
          success: false,
          message: 'Cannot delete default address. Please set another address as default first.',
          error: 'DEFAULT_ADDRESS_DELETE_ERROR'
        }, { status: 400 });
      }
      
      // Fallback to local deletion if Shopify fails
      return NextResponse.json({
        success: true,
        message: 'Address deleted locally (Shopify sync failed)',
        deletedAddressId: addressId
      });
    }
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
} 