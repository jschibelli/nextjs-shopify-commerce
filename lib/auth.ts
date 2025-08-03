import { deleteCustomerAccessToken, getCustomer } from 'lib/shopify';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface CustomerAccountToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  customer_id: string;
}

export interface CustomerAccountUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing: boolean;
  acceptsSMS?: boolean;
  createdAt: string;
  updatedAt: string;
}

export class CustomerAccountAuth {
  private static instance: CustomerAccountAuth;
  private token: CustomerAccountToken | null = null;

  private constructor() {}

  static getInstance(): CustomerAccountAuth {
    if (!CustomerAccountAuth.instance) {
      CustomerAccountAuth.instance = new CustomerAccountAuth();
    }
    return CustomerAccountAuth.instance;
  }

  // Initialize token from cookies
  async initializeFromCookies(): Promise<void> {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (tokenCookie) {
      try {
        this.token = JSON.parse(tokenCookie.value);
      } catch (error) {
        console.error('Error parsing token from cookie:', error);
        this.token = null;
      }
    }
  }

  // Get current user from Shopify
  async getCurrentUser(): Promise<CustomerAccountUser | null> {
    await this.initializeFromCookies();
    
    if (!this.token) {
      return null;
    }

    try {
      const customer = await getCustomer(this.token.access_token);
      return customer;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Token might be invalid, clear it but don't delete cookie here
      this.token = null;
      return null;
    }
  }

  // Get customer orders from Shopify
  async getCustomerOrders(): Promise<any[]> {
    await this.initializeFromCookies();
    
    if (!this.token) {
      return [];
    }

    try {
      // This would need to be implemented with Shopify's order API
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting customer orders:', error);
      return [];
    }
  }

  // Logout
  async logout(): Promise<void> {
    if (this.token) {
      try {
        // Delete the Shopify access token
        await deleteCustomerAccessToken(this.token.access_token);
      } catch (error) {
        console.error('Error deleting Shopify access token:', error);
      }
    }
    
    this.token = null;
    const cookieStore = await cookies();
    cookieStore.delete('customer_token');
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    await this.initializeFromCookies();
    return this.token !== null;
  }

  // Get stored token
  getToken(): CustomerAccountToken | null {
    return this.token;
  }

  // Set token (for session management)
  setToken(token: CustomerAccountToken): void {
    this.token = token;
  }
}

// Singleton instance
export function getAuth(): CustomerAccountAuth {
  return CustomerAccountAuth.getInstance();
}

// Require authentication (redirects to login if not authenticated)
export async function requireAuth(): Promise<CustomerAccountUser> {
  const auth = getAuth();
  const user = await auth.getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
} 