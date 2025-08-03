import { getAuth } from 'lib/auth';
import { updateCustomerPasswordWithAdminAPI } from 'lib/shopify';
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

    const { currentPassword, newPassword } = await request.json();
    
    console.log('Updating password for user:', {
      userId: user.id,
      email: user.email
    });

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    try {
      // Update password in Shopify using Admin API
      await updateCustomerPasswordWithAdminAPI({
        customerId: user.id,
        currentPassword,
        newPassword
      });

      console.log('Password updated successfully for user:', user.id);

      // Clear the session cookie to force re-login
      cookieStore.delete('customer_token');

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully. Please log in with your new password.',
        redirect: '/login'
      });
    } catch (shopifyError) {
      console.error('Failed to update password in Shopify:', shopifyError);
      
      // Handle specific error cases
      const errorMessage = shopifyError instanceof Error ? shopifyError.message : String(shopifyError);
      
      if (errorMessage.includes('current password') || errorMessage.includes('incorrect')) {
        return NextResponse.json({
          success: false,
          error: 'Current password is incorrect'
        }, { status: 400 });
      }
      
      if (errorMessage.includes('password') && errorMessage.includes('weak')) {
        return NextResponse.json({
          success: false,
          error: 'New password is too weak. Please use a stronger password.'
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to update password. Please try again.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
} 