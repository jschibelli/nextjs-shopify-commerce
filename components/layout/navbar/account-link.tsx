'use client';

import {
    ChevronDown,
    Crown,
    Heart,
    LogOut,
    MapPin,
    Package,
    Settings,
    Shield,
    User,
    UserCheck
} from 'lucide-react';
import Link from 'next/link';
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
  const [accountUrl, setAccountUrl] = useState('/account');
  const [sessionData, setSessionData] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const cookies = document.cookie.split(';');
        const customerTokenCookie = cookies.find(cookie => 
          cookie.trim().startsWith('customer_token=')
        );

        if (customerTokenCookie) {
          const tokenValue = customerTokenCookie.split('=')[1];
          if (tokenValue) {
            const parsedSession = JSON.parse(decodeURIComponent(tokenValue));
            setSessionData(parsedSession);
            setIsAuthenticated(true);
            
            if (parsedSession.isStaffMember) {
              setAccountUrl('/admin');
            } else {
              setAccountUrl('/account');
            }
          } else {
            setIsAuthenticated(false);
            setAccountUrl('/login');
          }
        } else {
          setIsAuthenticated(false);
          setAccountUrl('/login');
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        setIsAuthenticated(false);
        setAccountUrl('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
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
              <Link href={`${accountUrl}/security`} className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span className="text-xs">Security</span>
              </Link>
            </DropdownMenuItem>
          </div>
        </div>
        
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
        
        {/* Logout */}
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center space-x-2 text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 