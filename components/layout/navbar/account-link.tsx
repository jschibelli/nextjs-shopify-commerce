'use client';

import {
    BarChart3,
    ChevronDown,
    Crown,
    Heart,
    LogOut,
    MapPin,
    MessageSquare,
    Package,
    Settings,
    Star,
    Tag,
    Trophy,
    User,
    UserCheck
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserSession {
  isStaffMember?: boolean;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export default function AccountLink() {
  const router = useRouter();
  const pathname = usePathname();
  const [accountUrl, setAccountUrl] = useState('/account');
  const [sessionData, setSessionData] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const checkAuthStatus = async () => {
    console.log('AccountLink: Checking auth status...');
    try {
      const response = await fetch('/api/auth/check-session', {
        method: 'GET',
        credentials: 'include'
      });

      console.log('AccountLink: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('AccountLink: Response data:', data);
        
        if (data.isAuthenticated && data.user) {
          console.log('AccountLink: User authenticated:', data.user.email);
          setIsAuthenticated(true);
          setSessionData({
            isStaffMember: data.isStaffMember,
            user: data.user
          });
          
          if (data.isStaffMember) {
            setAccountUrl('/admin');
          } else {
            setAccountUrl('/account');
          }
        } else {
          console.log('AccountLink: User not authenticated');
          setIsAuthenticated(false);
          setSessionData(null);
          setAccountUrl('/login');
        }
      } else {
        console.log('AccountLink: Response not ok');
        setIsAuthenticated(false);
        setSessionData(null);
        setAccountUrl('/login');
      }
    } catch (error) {
      console.error('AccountLink: Error checking auth status:', error);
      setIsAuthenticated(false);
      setSessionData(null);
      setAccountUrl('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure session is set
    const timer = setTimeout(() => {
      checkAuthStatus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pathname]); // Re-check when pathname changes

  // Also check on mount
  useEffect(() => {
    checkAuthStatus();
  }, []); // Only run on mount

  // Listen for login success events
  useEffect(() => {
    const handleLoginSuccess = () => {
      console.log('AccountLink: Login success event received, refreshing auth status');
      setTimeout(() => checkAuthStatus(), 500); // Small delay to ensure session is set
    };

    window.addEventListener('login-success', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        // Clear any client-side state
        localStorage.removeItem('customer_token');
        sessionStorage.removeItem('customer_token');
        localStorage.removeItem('current_session_id');
        
        // Reset state
        setIsAuthenticated(false);
        setSessionData(null);
        setAccountUrl('/login');
        
        // Redirect to home page
        router.push('/');
        router.refresh();
      } else {
        console.error('Logout failed');
        // Still redirect even if logout API fails
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Redirect even if there's an error
      router.push('/');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getUserInitials = () => {
    const firstName = sessionData?.user?.firstName || '';
    const lastName = sessionData?.user?.lastName || '';
    const email = sessionData?.user?.email || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    const firstName = sessionData?.user?.firstName || '';
    const lastName = sessionData?.user?.lastName || '';
    const email = sessionData?.user?.email || '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (email) {
      return email;
    }
    return 'User';
  };

  const getUserEmail = () => {
    return sessionData?.user?.email || '';
  };

  // Debug logging
  console.log('AccountLink: Current state:', {
    isLoading,
    isAuthenticated,
    sessionData: sessionData?.user?.email,
    accountUrl
  });

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <User className="h-5 w-5" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="icon" asChild>
        <Link href="/login">
          <User className="h-5 w-5" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {getUserInitials()}
            </div>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                {getUserInitials()}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {getUserEmail()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              {sessionData?.isStaffMember ? (
                <Badge variant="secondary" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <UserCheck className="h-3 w-3 mr-1" />
                  Customer
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Account Management */}
        <DropdownMenuItem asChild>
          <Link href={accountUrl} className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>My Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${accountUrl}/settings`} className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Quick Actions */}
        <div className="px-2 py-1.5">
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick Actions</p>
          <div className="grid grid-cols-2 gap-1">
            <DropdownMenuItem asChild>
              <Link href={`${accountUrl}/orders`} className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span className="text-xs">Orders</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${accountUrl}/wishlist`} className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span className="text-xs">Wishlist</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${accountUrl}/addresses`} className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-xs">Addresses</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${accountUrl}/loyalty`} className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span className="text-xs">Loyalty</span>
              </Link>
            </DropdownMenuItem>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Account Navigation */}
        <DropdownMenuItem asChild>
          <Link href={`${accountUrl}/support`} className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${accountUrl}/analytics`} className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${accountUrl}/tags`} className="flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span>Tags</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${accountUrl}/gamification`} className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Gamification</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center space-x-2 text-red-600 focus:text-red-600"
        >
          {isLoggingOut ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              <span>Signing out...</span>
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 