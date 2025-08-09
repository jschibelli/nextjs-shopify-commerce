'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Heart, LogOut, MessageSquare, Package, Settings, Star, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface UserSession {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;
  isStaffMember: boolean;
}

export default function AccountLink() {
  const [sessionData, setSessionData] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/check-session');
        if (response.ok) {
          const data = await response.json();
          setSessionData(data);
        } else {
          setSessionData({
            isAuthenticated: false,
            user: null,
            isStaffMember: false
          });
        }
      } catch (error) {
        setSessionData({
          isAuthenticated: false,
          user: null,
          isStaffMember: false
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    const handleLoginSuccess = () => {
      checkAuthStatus();
    };

    const handleLogoutSuccess = () => {
      checkAuthStatus();
    };

    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('logout-success', handleLogoutSuccess);
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('logout-success', handleLogoutSuccess);
    };
  }, []);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled className="hidden sm:flex">
        <div className="w-6 h-6 bg-muted rounded-full animate-pulse" />
        <span className="ml-2 hidden lg:block">Loading...</span>
      </Button>
    );
  }

  if (!sessionData?.isAuthenticated || !sessionData?.user) {
    return (
      <Link href="/login">
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <User className="h-4 w-4 mr-2" />
          <span className="hidden lg:block">Sign In</span>
        </Button>
      </Link>
    );
  }

  if (sessionData.isStaffMember) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="hidden sm:flex">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
            <span className="ml-2 hidden lg:block">Admin</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/admin" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/profile" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={async () => {
              try {
                const response = await fetch('/api/admin/logout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                });
                if (response.ok) {
                  window.dispatchEvent(new CustomEvent('logout-success'));
                  window.location.href = '/';
                }
              } catch (error) {
                console.error('Logout error:', error);
              }
            }}
            className="flex items-center text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="ml-2 hidden lg:block">
            {sessionData.user.firstName || 'Account'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/orders" className="flex items-center">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/wishlist" className="flex items-center">
            <Heart className="mr-2 h-4 w-4" />
            Wishlist
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/loyalty" className="flex items-center">
            <Star className="mr-2 h-4 w-4" />
            Loyalty
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/support" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={async () => {
            try {
              const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              });
              if (response.ok) {
                window.dispatchEvent(new CustomEvent('logout-success'));
                window.location.href = '/';
              }
            } catch (error) {
              console.error('Logout error:', error);
            }
          }}
          className="flex items-center text-red-600 cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 