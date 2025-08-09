import { getAuth } from 'lib/auth';
import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    const result = {
      hasCookie: !!tokenCookie,
      sessionData: null,
      adminUser: null,
      customerUser: null,
      isStaffMember: false,
      isAuthenticated: false
    };
    
    if (tokenCookie) {
      try {
        const sessionData = JSON.parse(tokenCookie.value);
        result.sessionData = sessionData;
        
        // Check admin auth
        const adminAuth = getShopifyAdminAuth();
        const adminUser = await adminAuth.getCurrentAdminUserFromSession();
        result.adminUser = adminUser;
        
        if (adminUser) {
          result.isStaffMember = true;
          result.isAuthenticated = true;
        } else {
          // Check customer auth
          const auth = getAuth();
          await auth.initializeFromCookies();
          const customerUser = await auth.getCurrentUser();
          result.customerUser = customerUser;
          
          if (customerUser) {
            result.isAuthenticated = true;
          }
        }
      } catch (error) {
        result.sessionData = { error: error.message };
      }
    }
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      hasCookie: false,
      sessionData: null,
      adminUser: null,
      customerUser: null,
      isStaffMember: false,
      isAuthenticated: false
    });
  }
} 