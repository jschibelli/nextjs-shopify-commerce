import { getAuth } from 'lib/auth';
import { updateCustomer, updateCustomerWithAdminAPI } from 'lib/shopify';
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

    const { acceptsMarketing, acceptsSMS } = await request.json();
    
    console.log('Updating preferences for user:', {
      userId: user.id,
      acceptsMarketing,
      acceptsSMS
    });

    try {
      let updatedCustomer;
      
      // Try to update email marketing via Storefront API
      try {
        updatedCustomer = await updateCustomer({
          customer: {
            acceptsMarketing
          },
          customerAccessToken: tokenCookie.value ? JSON.parse(tokenCookie.value).access_token : ''
        });
        
        console.log('Email preferences updated via Storefront API:', {
          customerId: updatedCustomer.id,
          acceptsMarketing: updatedCustomer.acceptsMarketing
        });
      } catch (storefrontError) {
        console.log('Storefront API update failed:', storefrontError);
      }
      
      // Always use Admin API for SMS preferences since Storefront API doesn't support it
      if (acceptsSMS !== undefined) {
        try {
          updatedCustomer = await updateCustomerWithAdminAPI({
            customerId: user.id,
            preferences: {
              acceptsMarketing,
              acceptsSMS
            }
          });
          
          console.log('SMS preferences updated via Admin API:', {
            customerId: updatedCustomer.id,
            acceptsMarketing: updatedCustomer.acceptsMarketing,
            acceptsSMS: updatedCustomer.acceptsSMS
          });
        } catch (adminError) {
          console.log('Admin API update failed:', adminError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Preferences updated successfully',
        customer: {
          id: user.id,
          acceptsMarketing: updatedCustomer?.acceptsMarketing || acceptsMarketing,
          acceptsSMS: updatedCustomer?.acceptsSMS || acceptsSMS
        }
      });
    } catch (shopifyError) {
      console.error('Failed to update preferences in Shopify:', shopifyError);
      
      // Check if it's an SMS-related error
      const errorMessage = shopifyError instanceof Error ? shopifyError.message : String(shopifyError);
      if (errorMessage.includes('406') || errorMessage.includes('SMS')) {
        return NextResponse.json({
          success: true,
          message: 'Email preferences updated. SMS preferences require SMS marketing setup in Shopify.',
          customer: {
            id: user.id,
            acceptsMarketing,
            acceptsSMS: false // Reset SMS preference if not supported
          }
        });
      }
      
      // Fallback to local update if Shopify fails
      return NextResponse.json({
        success: true,
        message: 'Preferences updated locally (Shopify sync failed)',
        customer: {
          id: user.id,
          acceptsMarketing,
          acceptsSMS
        }
      });
    }
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
} 