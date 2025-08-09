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
      return null;
    }
  }

  async checkIfEmailIsStaffMember(email: string): Promise<ShopifyAdminUser | null> {
    try {
      // Get Shopify staff member details directly
      const staffMember = await this.getShopifyStaffMember(email);
      
      if (!staffMember) {
        return null;
      }

      return {
        id: staffMember.id,
        email: staffMember.email,
        first_name: staffMember.first_name,
        last_name: staffMember.last_name,
        role: staffMember.role,
        permissions: staffMember.permissions,
        shopifyUserId: staffMember.id
      } as any;
    } catch (error) {
      return null;
    }
  }

  async getCurrentAdminUserFromSession(): Promise<ShopifyAdminUser | null> {
    try {
      // DEMO short-circuit
      try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const isDemo = (process.env.DEMO_MODE === 'true') && cookieStore.get('demo')?.value === 'true';
        const demoRole = cookieStore.get('demo_role')?.value;
        if (isDemo && demoRole === 'admin') {
          const email = process.env.DEMO_ADMIN_EMAIL || 'demo+admin@example.com';
          return {
            id: 'demo_admin',
            email,
            firstName: 'Demo',
            lastName: 'Admin',
            role: 'admin',
            permissions: ['read','write','delete','moderate','manage_settings'],
            shopifyUserId: 'demo_admin'
          };
        }
      } catch {}

      // Check if there's an admin session token
      const tokenCookie = await this.getSessionCookie();
      if (!tokenCookie) {
        return null;
      }

      const sessionData = JSON.parse(tokenCookie);
      
      // Check if this is an admin session
      if (sessionData.isStaffMember && sessionData.email) {
        // For admin sessions, we need to check if the user is still a staff member
        const staffMember = await this.getShopifyStaffMember(sessionData.email);
        if (staffMember) {
          return {
            id: sessionData.customer_id || staffMember.id,
            email: sessionData.email,
            firstName: staffMember.first_name,
            lastName: staffMember.last_name,
            role: sessionData.role || staffMember.role,
            permissions: staffMember.permissions,
            shopifyUserId: staffMember.id
          };
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private async getSessionCookie(): Promise<string | null> {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      // Check for admin token first, then fallback to customer token for backward compatibility
      const adminTokenCookie = cookieStore.get('admin_token');
      const customerTokenCookie = cookieStore.get('customer_token');
      return adminTokenCookie?.value || customerTokenCookie?.value || null;
    } catch (error) {
      return null;
    }
  }

  async getShopifyStaffMember(email: string): Promise<ShopifyStaffMember | null> {
    try {
      const domain = process.env.SHOPIFY_STORE_DOMAIN;
      const adminKey = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

      if (!domain || !adminKey) {
        return null;
      }

      const baseUrl = domain.startsWith('https://') ? domain : `https://${domain}`;

      // First, get shop information to check if user is shop owner
      try {
        const shopResponse = await fetch(`${baseUrl}/admin/api/2023-01/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': adminKey,
            'Content-Type': 'application/json'
          }
        });

        if (shopResponse.ok) {
          const shopData = await shopResponse.json();

          // Check if the user is the shop owner
          const shopOwnerEmail = shopData.shop?.email;
          const shopOwnerName = shopData.shop?.shop_owner;

          if (shopOwnerEmail && shopOwnerEmail.toLowerCase() === email.toLowerCase()) {
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
        }
      } catch (error) {
        // Continue to other checks
      }

      // Since the API doesn't provide access to staff member data,
      // we need to use a different approach. For now, we'll check if the user
      // can access admin-only endpoints as a way to determine admin status
      try {
        // Try to access an admin-only endpoint to see if the user has admin access
        const adminTestResponse = await fetch(`${baseUrl}/admin/api/2023-01/products.json?limit=1`, {
          headers: {
            'X-Shopify-Access-Token': adminKey,
            'Content-Type': 'application/json'
          }
        });

        if (adminTestResponse.ok) {
          // This means the API key has admin access, but we can't determine specific user permissions
          // For now, we'll deny access since we can't verify the specific user
          return null;
        }
      } catch (error) {
        // Continue
      }

      // If we can't find the user in any API endpoint, they are not an admin
      return null;
    } catch (error) {
      return null;
    }
  }

  private async fallbackAdminCheck(email: string): Promise<ShopifyStaffMember | null> {
    // This method is deprecated - API calls are now handled in getShopifyStaffMember
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
      throw error;
    }
  }
}

export function getShopifyAdminAuth(): ShopifyAdminAuth {
  return ShopifyAdminAuth.getInstance();
} 