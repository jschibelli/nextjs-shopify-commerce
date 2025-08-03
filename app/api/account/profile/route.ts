import { getAuth } from 'lib/auth';
import { updateCustomerWithAdminAPI } from 'lib/shopify';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
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

    const { firstName, lastName, email, phone } = await request.json();
    
    console.log('Updating profile for user:', {
      userId: user.id,
      firstName,
      lastName,
      email,
      phone
    });

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    try {
      // Update customer profile in Shopify using Admin API
      const updatedCustomer = await updateCustomerWithAdminAPI({
        customerId: user.id,
        preferences: {
          firstName,
          lastName,
          email,
          phone
        }
      });

      console.log('Profile updated successfully:', {
        customerId: updatedCustomer.id,
        firstName: updatedCustomer.firstName,
        lastName: updatedCustomer.lastName,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone
      });

      return NextResponse.json({
        success: true,
        message: 'Profile updated successfully',
        customer: {
          id: updatedCustomer.id,
          firstName: updatedCustomer.firstName,
          lastName: updatedCustomer.lastName,
          email: updatedCustomer.email,
          phone: updatedCustomer.phone
        }
      });
    } catch (shopifyError) {
      console.error('Failed to update profile in Shopify:', shopifyError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to update profile. Please try again.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 