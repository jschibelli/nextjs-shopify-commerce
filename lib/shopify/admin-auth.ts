import { getAuth } from '../auth';

export interface ShopifyAdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'staff' | 'limited_staff';
  permissions: string[];
  shopifyUserId?: string;
}

export interface ShopifyStaffMember {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'staff' | 'limited_staff';
  permissions: string[];
  account_owner: boolean;
  active: boolean;
}

export class ShopifyAdminAuth {
  private static instance: ShopifyAdminAuth;
  private auth = getAuth();

  static getInstance(): ShopifyAdminAuth {
    if (!ShopifyAdminAuth.instance) {
      ShopifyAdminAuth.instance = new ShopifyAdminAuth();
    }
    return ShopifyAdminAuth.instance;
  }

  async getCurrentShopifyAdminUser(): Promise<ShopifyAdminUser | null> {
    try {
      const user = await this.auth.getCurrentUser();
      if (!user) return null;

      // Get Shopify staff member details
      const staffMember = await this.getShopifyStaffMember(user.email);
      if (!staffMember) return null;

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: staffMember.role,
        permissions: staffMember.permissions,
        shopifyUserId: staffMember.id
      };
    } catch (error) {
      console.error('Shopify admin auth error:', error);
      return null;
    }
  }

  async checkIfEmailIsStaffMember(email: string): Promise<ShopifyAdminUser | null> {
    try {
      console.log(`Checking if email is staff member: ${email}`);
      
      // Get Shopify staff member details directly
      const staffMember = await this.getShopifyStaffMember(email);
      
      console.log(`Staff member check result for ${email}:`, staffMember ? 'FOUND' : 'NOT FOUND');
      
      if (!staffMember) {
        console.log(`No staff member found for email: ${email}`);
        return null;
      }

      console.log(`Staff member found for ${email}:`, {
        id: staffMember.id,
        email: staffMember.email,
        role: staffMember.role,
        permissions: staffMember.permissions
      });

      return {
        id: staffMember.id,
        email: staffMember.email,
        firstName: staffMember.first_name,
        lastName: staffMember.last_name,
        role: staffMember.role,
        permissions: staffMember.permissions,
        shopifyUserId: staffMember.id
      };
    } catch (error) {
      console.error('Shopify admin auth error:', error);
      return null;
    }
  }

  async getCurrentAdminUserFromSession(): Promise<ShopifyAdminUser | null> {
    try {
      // Check if there's an admin session token
      const tokenCookie = await this.getSessionCookie();
      if (!tokenCookie) return null;

      const sessionData = JSON.parse(tokenCookie);
      
      // Check if this is an admin session
      if (sessionData.isStaffMember && sessionData.customer_id) {
        // For admin sessions, we need to check if the user is still a staff member
        // Use the proper API method to get current staff member data
        const email = sessionData.email || 'admin@example.com';
        const staffMember = await this.getShopifyStaffMember(email);
        if (staffMember) {
          return {
            id: sessionData.customer_id,
            email: sessionData.email || staffMember.email,
            firstName: staffMember.first_name,
            lastName: staffMember.last_name,
            role: staffMember.role,
            permissions: staffMember.permissions,
            shopifyUserId: staffMember.id
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting current admin user from session:', error);
      return null;
    }
  }

  private async getSessionCookie(): Promise<string | null> {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const tokenCookie = cookieStore.get('customer_token');
      return tokenCookie?.value || null;
    } catch (error) {
      console.error('Error getting session cookie:', error);
      return null;
    }
  }

  async getShopifyStaffMember(email: string): Promise<ShopifyStaffMember | null> {
    try {
      const domain = process.env.SHOPIFY_STORE_DOMAIN;
      const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

      if (!domain || !adminKey) {
        console.error('Shopify admin credentials not configured');
        return null;
      }

      const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
      
      console.log('Attempting to fetch staff member data for:', email);

      // First, get shop information to check if user is shop owner
      try {
        console.log('Checking shop endpoint for admin access');
        const shopResponse = await fetch(`${baseUrl}/admin/api/2023-01/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': adminKey,
            'Content-Type': 'application/json'
          }
        });

        if (shopResponse.ok) {
          const shopData = await shopResponse.json();
          console.log('Shop data retrieved:', shopData);

          // Check if the user is the shop owner
          const shopOwnerEmail = shopData.shop?.email;
          const shopOwnerName = shopData.shop?.shop_owner;

          if (shopOwnerEmail && shopOwnerEmail.toLowerCase() === email.toLowerCase()) {
            console.log(`User ${email} is shop owner - granting admin access`);
            return {
              id: 'shop_owner',
              email: email,
              first_name: shopOwnerName?.split(' ')[0] || 'Shop',
              last_name: shopOwnerName?.split(' ').slice(1).join(' ') || 'Owner',
              role: 'admin',
              permissions: ['read', 'write', 'delete', 'moderate', 'manage_staff', 'manage_settings', 'manage_shop'],
              account_owner: true,
              active: true
            };
          }

          // If not shop owner, check if they have admin access by trying other endpoints
          console.log(`User ${email} is not shop owner, checking other admin endpoints`);
        }
      } catch (error) {
        console.error('Error checking shop endpoint:', error);
      }

      // Since the API doesn't provide access to staff member data,
      // we need to use a different approach. For now, we'll check if the user
      // can access admin-only endpoints as a way to determine admin status
      try {
        console.log('Testing admin access by checking admin-only endpoints');
        
        // Try to access an admin-only endpoint to see if the user has admin access
        const adminTestResponse = await fetch(`${baseUrl}/admin/api/2023-01/products.json?limit=1`, {
          headers: {
            'X-Shopify-Access-Token': adminKey,
            'Content-Type': 'application/json'
          }
        });

        if (adminTestResponse.ok) {
          console.log('User has admin access to products endpoint');
          // This means the API key has admin access, but we can't determine specific user permissions
          // For now, we'll deny access since we can't verify the specific user
          console.log(`Cannot verify specific user ${email} permissions via API - denying access`);
          return null;
        }
      } catch (error) {
        console.error('Error testing admin access:', error);
      }

      // If we can't find the user in any API endpoint, they are not an admin
      console.log(`No admin access found for email: ${email} - denying admin access`);
      return null;
    } catch (error) {
      console.error('Error fetching Shopify staff member:', error);
      return null;
    }
  }

  private async fallbackAdminCheck(email: string): Promise<ShopifyStaffMember | null> {
    // This method is deprecated - API calls are now handled in getShopifyStaffMember
    console.log('fallbackAdminCheck is deprecated - using proper API integration');
    return null;
  }

  private mapShopifyPermissions(role: string, shopifyPermissions: string[]): string[] {
    const permissions: string[] = [];

    // Base permissions based on role
    switch (role) {
      case 'admin':
        permissions.push('read', 'write', 'delete', 'moderate', 'manage_staff', 'manage_settings');
        break;
      case 'staff':
        permissions.push('read', 'write', 'moderate');
        break;
      case 'limited_staff':
        permissions.push('read', 'moderate');
        break;
      default:
        // If role is not specified, check permissions array
        if (shopifyPermissions.length > 0) {
          permissions.push('read', 'moderate');
        }
    }

    // Map specific Shopify permissions
    shopifyPermissions.forEach(permission => {
      switch (permission) {
        case 'read_products':
        case 'write_products':
          permissions.push('manage_products');
          break;
        case 'read_orders':
        case 'write_orders':
          permissions.push('manage_orders');
          break;
        case 'read_customers':
        case 'write_customers':
          permissions.push('manage_customers');
          break;
        case 'read_content':
        case 'write_content':
          permissions.push('manage_content');
          break;
        case 'read_marketing':
        case 'write_marketing':
          permissions.push('manage_marketing');
          break;
        case 'read_reports':
        case 'write_reports':
          permissions.push('manage_reports');
          break;
        case 'read_settings':
        case 'write_settings':
          permissions.push('manage_settings');
          break;
        case 'read_staff':
        case 'write_staff':
          permissions.push('manage_staff');
          break;
      }
    });

    return [...new Set(permissions)]; // Remove duplicates
  }

  async hasPermission(permission: string): Promise<boolean> {
    const adminUser = await this.getCurrentShopifyAdminUser();
    return adminUser?.permissions.includes(permission) || false;
  }

  async requirePermission(permission: string): Promise<ShopifyAdminUser> {
    const adminUser = await this.getCurrentShopifyAdminUser();
    if (!adminUser || !adminUser.permissions.includes(permission)) {
      throw new Error(`Access denied. Required permission: ${permission}`);
    }
    return adminUser;
  }

  async isAdmin(): Promise<boolean> {
    const adminUser = await this.getCurrentShopifyAdminUser();
    return adminUser?.role === 'admin';
  }

  async isStaff(): Promise<boolean> {
    const adminUser = await this.getCurrentShopifyAdminUser();
    return adminUser?.role === 'staff' || adminUser?.role === 'admin';
  }

  async isLimitedStaff(): Promise<boolean> {
    const adminUser = await this.getCurrentShopifyAdminUser();
    return adminUser?.role === 'limited_staff' || adminUser?.role === 'staff' || adminUser?.role === 'admin';
  }

  async getShopifyStaffMembers(): Promise<ShopifyStaffMember[]> {
    try {
      const domain = process.env.SHOPIFY_STORE_DOMAIN;
      const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

      if (!domain || !adminKey) {
        throw new Error('Shopify admin credentials not configured');
      }

      const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;
      const endpoint = `${baseUrl}/admin/api/2023-01/staff_members.json`;

      const response = await fetch(endpoint, {
        headers: {
          'X-Shopify-Access-Token': adminKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch staff members: ${response.status}`);
      }

      const data = await response.json();
      return data.staff_members || [];
    } catch (error) {
      console.error('Error fetching Shopify staff members:', error);
      throw error;
    }
  }
}

export function getShopifyAdminAuth(): ShopifyAdminAuth {
  return ShopifyAdminAuth.getInstance();
} 