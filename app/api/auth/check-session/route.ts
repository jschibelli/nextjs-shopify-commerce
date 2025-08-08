import { getAuth } from 'lib/auth';
import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null,
        isStaffMember: false
      });
    }

    try {
      const sessionData = JSON.parse(tokenCookie.value);
      
      // First, check if this is a staff member
      const adminAuth = getShopifyAdminAuth();
      const adminUser = await adminAuth.getCurrentAdminUserFromSession();
      
      if (adminUser) {
        return NextResponse.json({
          isAuthenticated: true,
          user: {
            id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role
          },
          isStaffMember: true
        });
      }
      
      // Also check if the session data itself indicates staff member
      if (sessionData.isStaffMember && sessionData.email) {
        const staffMember = await adminAuth.getShopifyStaffMember(sessionData.email);
        if (staffMember) {
          return NextResponse.json({
            isAuthenticated: true,
            user: {
              id: sessionData.customer_id || staffMember.id,
              email: sessionData.email,
              firstName: staffMember.first_name,
              lastName: staffMember.last_name,
              role: sessionData.role || staffMember.role
            },
            isStaffMember: true
          });
        }
      }
      
      // If not admin, check if it's a regular customer
      const auth = getAuth();
      await auth.initializeFromCookies();
      
      // Only try to get customer data if we have a customer token
      if (auth.getToken()) {
        const user = await auth.getCurrentUser();
        
        if (!user) {
          return NextResponse.json({ 
            isAuthenticated: false,
            user: null,
            isStaffMember: false
          });
        }

        return NextResponse.json({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          },
          isStaffMember: false
        });
      } else {
        return NextResponse.json({ 
          isAuthenticated: false,
          user: null,
          isStaffMember: false
        });
      }
    } catch (error) {
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null,
        isStaffMember: false
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      isAuthenticated: false,
      user: null,
      isStaffMember: false
    });
  }
} 