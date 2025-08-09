import { getAuth } from 'lib/auth';
import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // Demo short-circuit
    const isDemoCookie = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true';
    const demoRole = cookieStore.get('demo_role')?.value;
    if (isDemoCookie) {
      if (demoRole === 'admin') {
        return NextResponse.json({
          isAuthenticated: true,
          user: {
            id: 'demo_admin',
            email: process.env.DEMO_ADMIN_EMAIL || 'demo+admin@example.com',
            firstName: 'Demo',
            lastName: 'Admin',
            role: 'admin'
          },
          isStaffMember: true,
          isDemo: true,
          demoRole: 'admin'
        });
      }
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          id: process.env.DEMO_CUSTOMER_ID || 'demo_customer',
          email: process.env.DEMO_CUSTOMER_EMAIL || 'demo+customer@example.com',
          firstName: 'Demo',
          lastName: 'Customer'
        },
        isStaffMember: false,
        isDemo: true,
        demoRole: 'customer'
      });
    }

    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null,
        isStaffMember: false,
        isDemo: false
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
          isStaffMember: true,
          isDemo: false
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
            isStaffMember: true,
            isDemo: false
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
            isStaffMember: false,
            isDemo: false
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
          isStaffMember: false,
          isDemo: false
        });
      } else {
        return NextResponse.json({ 
          isAuthenticated: false,
          user: null,
          isStaffMember: false,
          isDemo: false
        });
      }
    } catch (error) {
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null,
        isStaffMember: false,
        isDemo: false
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      isAuthenticated: false,
      user: null,
      isStaffMember: false,
      isDemo: false
    });
  }
} 