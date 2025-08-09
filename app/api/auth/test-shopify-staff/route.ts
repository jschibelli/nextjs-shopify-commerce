import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const adminAuth = getShopifyAdminAuth();
    
    // Test getting current admin user
    const adminUser = await adminAuth.getCurrentShopifyAdminUser();
    
    if (!adminUser) {
      return NextResponse.json({ 
        error: 'No Shopify staff member found for current user',
        authenticated: false
      }, { status: 401 });
    }

    // Test getting all staff members
    const staffMembers = await adminAuth.getShopifyStaffMembers();
    
    // Test permissions
    const permissions = {
      isAdmin: await adminAuth.isAdmin(),
      isStaff: await adminAuth.isStaff(),
      isLimitedStaff: await adminAuth.isLimitedStaff(),
      hasModeratePermission: await adminAuth.hasPermission('moderate'),
      hasWritePermission: await adminAuth.hasPermission('write'),
      hasDeletePermission: await adminAuth.hasPermission('delete')
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        permissions: adminUser.permissions,
        shopifyUserId: adminUser.shopifyUserId
      },
      permissions,
      staffMembers: staffMembers.map(member => ({
        id: member.id,
        email: member.email,
        first_name: member.first_name,
        last_name: member.last_name,
        role: member.role,
        account_owner: member.account_owner,
        active: member.active
      }))
    });
  } catch (error) {
    console.error('Shopify staff test error:', error);
    return NextResponse.json({ 
      error: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      authenticated: false
    }, { status: 500 });
  }
} 