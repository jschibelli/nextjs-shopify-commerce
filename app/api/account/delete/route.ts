import { getAuth } from 'lib/auth';
import { deleteCustomerAccessToken, deleteCustomerWithAdminAPI, getCustomerWithAdminAPI } from 'lib/shopify';
import { clearWishlistForCustomer } from 'lib/wishlist-utils';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the request body to check if user confirmed deletion
    const body = await request.json();
    const { confirmDeletion, exportData } = body;

    if (!confirmDeletion) {
      return NextResponse.json({ error: 'Deletion must be confirmed' }, { status: 400 });
    }

    // If user wants to export data first, generate the data export
    let dataExport = null;
    if (exportData) {
      try {
        // Get full customer data from Shopify Admin API
        const customerData = await getCustomerWithAdminAPI(user.id);
        
        // Create a comprehensive data export
        dataExport = {
          customer: {
            id: customerData.id,
            email: customerData.email,
            firstName: customerData.first_name,
            lastName: customerData.last_name,
            phone: customerData.phone,
            acceptsMarketing: customerData.accepts_marketing,
            acceptsSMS: false, // Default to false since SMS marketing requires special setup
            createdAt: customerData.created_at,
            updatedAt: customerData.updated_at,
            defaultAddress: customerData.default_address,
            addresses: customerData.addresses || [],
            orders: customerData.orders || [],
            tags: customerData.tags,
            note: customerData.note,
            totalSpent: customerData.total_spent,
            ordersCount: customerData.orders_count
          },
          exportDate: new Date().toISOString(),
          exportReason: 'Account deletion request'
        };
      } catch (error) {
        console.error('Error exporting customer data:', error);
        // Continue with deletion even if export fails
      }
    }

    // Delete the customer from Shopify Admin API
    try {
      await deleteCustomerWithAdminAPI(user.id);
    } catch (error) {
      console.error('Error deleting customer from Shopify:', error);
      // Continue with local cleanup even if customer deletion fails
    }

    // Delete the customer access token from Shopify
    try {
      const token = auth.getToken();
      if (token) {
        await deleteCustomerAccessToken(token.access_token);
      }
    } catch (error) {
      console.error('Error deleting access token:', error);
      // Continue with local cleanup even if token deletion fails
    }

    // Clear wishlist data for the customer (permanent deletion)
    clearWishlistForCustomer(user.id);

    // Clear the customer token cookie
    const cookieStore = await cookies();
    cookieStore.delete('customer_token');

    // Return the data export if requested
    if (dataExport) {
      return NextResponse.json({
        success: true,
        message: 'Account deleted successfully',
        dataExport
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 