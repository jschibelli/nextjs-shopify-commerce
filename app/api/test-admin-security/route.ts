import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get('email');

    if (!testEmail) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const adminAuth = getShopifyAdminAuth();
    
    // Test the admin check
    const adminUser = await adminAuth.checkIfEmailIsStaffMember(testEmail);
    
    return NextResponse.json({
      email: testEmail,
      isAdmin: !!adminUser,
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions
      } : null,
      message: adminUser 
        ? 'User has admin access' 
        : 'User does not have admin access'
    });
  } catch (error) {
    console.error('Admin security test error:', error);
    
    return NextResponse.json(
      { error: 'Failed to test admin security' },
      { status: 500 }
    );
  }
} 