import { getAuth } from './auth';

export interface AdminUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'moderator' | 'viewer';
  permissions: string[];
}

export class AdminAuth {
  private static instance: AdminAuth;
  private auth = getAuth();

  static getInstance(): AdminAuth {
    if (!AdminAuth.instance) {
      AdminAuth.instance = new AdminAuth();
    }
    return AdminAuth.instance;
  }

  async getCurrentAdminUser(): Promise<AdminUser | null> {
    try {
      const user = await this.auth.getCurrentUser();
      if (!user) return null;

      // TODO: In production, fetch admin role from database
      // For now, we'll use a simple check based on email domain or specific users
      const adminEmails = [
        'john.schibelli@intrawebtech.com' // Your email for testing
        // Add more admin emails here
      ];

      if (adminEmails.includes(user.email)) {
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: 'admin',
          permissions: ['read', 'write', 'delete', 'moderate']
        };
      }

      // Check for moderator role (could be based on specific criteria)
      const moderatorEmails: string[] = [
        // Add moderator emails here
      ];

      if (moderatorEmails.includes(user.email)) {
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: 'moderator',
          permissions: ['read', 'moderate']
        };
      }

      return null;
    } catch (error) {
      console.error('Admin auth error:', error);
      return null;
    }
  }

  async hasPermission(permission: string): Promise<boolean> {
    const adminUser = await this.getCurrentAdminUser();
    return adminUser?.permissions.includes(permission) || false;
  }

  async requirePermission(permission: string): Promise<AdminUser> {
    const adminUser = await this.getCurrentAdminUser();
    if (!adminUser || !adminUser.permissions.includes(permission)) {
      throw new Error(`Access denied. Required permission: ${permission}`);
    }
    return adminUser;
  }

  async isAdmin(): Promise<boolean> {
    const adminUser = await this.getCurrentAdminUser();
    return adminUser?.role === 'admin';
  }

  async isModerator(): Promise<boolean> {
    const adminUser = await this.getCurrentAdminUser();
    return adminUser?.role === 'moderator' || adminUser?.role === 'admin';
  }
}

export function getAdminAuth(): AdminAuth {
  return AdminAuth.getInstance();
} 