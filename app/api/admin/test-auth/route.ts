import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const adminAuth = getShopifyAdminAuth();
    const adminUser = await adminAuth.getCurrentAdminUserFromSession();
    
    if (!adminUser) {
      return NextResponse.json({
        error: 'Admin access denied',
        details: 'User is not authenticated as admin'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        permissions: adminUser.permissions
      },
      message: 'Admin authentication successful'
    });

  } catch (error) {
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 