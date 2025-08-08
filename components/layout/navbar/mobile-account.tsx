'use client';

import {
    BarChart3,
    ChevronRight,
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
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserSession {
  isStaffMember?: boolean;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

interface MobileAccountProps {
  onClose: () => void;
}

export default function MobileAccount({ onClose }: MobileAccountProps) {
  const router = useRouter();
  const [accountUrl, setAccountUrl] = useState('/account');
  const [sessionData, setSessionData] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const checkAuthStatus = async () => {
    console.log('MobileAccount: Checking auth status...');
    try {
      const response = await fetch('/api/auth/check-session', {
        method: 'GET',
        credentials: 'include'
      });

      console.log('MobileAccount: Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('MobileAccount: Response data:', data);
        
        if (data.isAuthenticated && data.user) {
          console.log('MobileAccount: User authenticated:', data.user.email);
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
          console.log('MobileAccount: User not authenticated');
          setIsAuthenticated(false);
          setSessionData(null);
          setAccountUrl('/login');
        }
      } else {
        console.log('MobileAccount: Response not ok');
        setIsAuthenticated(false);
        setSessionData(null);
        setAccountUrl('/login');
      }
    } catch (error) {
      console.error('MobileAccount: Error checking auth status:', error);
      setIsAuthenticated(false);
      setSessionData(null);
      setAccountUrl('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for login success events
  useEffect(() => {
    const handleLoginSuccess = () => {
      console.log('MobileAccount: Login success event received, refreshing auth status');
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
        
        // Close mobile menu and redirect
        onClose();
        router.push('/');
        router.refresh();
      } else {
        console.error('Logout failed');
        // Still redirect even if logout API fails
        onClose();
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Redirect even if there's an error
      onClose();
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="text-center py-4">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Sign in to access your account</p>
        </div>
        <Button asChild className="w-full" onClick={onClose}>
          <Link href="/login">
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* User Profile Header */}
      <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
        <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-medium">
          {getUserInitials()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
          <p className="text-xs text-muted-foreground truncate">{getUserEmail()}</p>
          <div className="flex items-center mt-1">
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
      </div>

      {/* Account Management */}
      <div className="space-y-1">
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Account Management
        </h3>
        <Link
          href={accountUrl}
          className="flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
          onClick={onClose}
        >
          <div className="flex items-center space-x-3">
            <User className="h-4 w-4" />
            <span>My Account</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href={`${accountUrl}/settings`}
          className="flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
          onClick={onClose}
        >
          <div className="flex items-center space-x-3">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="space-y-1">
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`${accountUrl}/orders`}
            className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
            onClick={onClose}
          >
            <Package className="h-4 w-4" />
            <span>Orders</span>
          </Link>
          <Link
            href={`${accountUrl}/wishlist`}
            className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
            onClick={onClose}
          >
            <Heart className="h-4 w-4" />
            <span>Wishlist</span>
          </Link>
          <Link
            href={`${accountUrl}/addresses`}
            className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
            onClick={onClose}
          >
            <MapPin className="h-4 w-4" />
            <span>Addresses</span>
          </Link>
          <Link
            href={`${accountUrl}/loyalty`}
            className="flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
            onClick={onClose}
          >
            <Star className="h-4 w-4" />
            <span>Loyalty</span>
          </Link>
        </div>
      </div>

      {/* Account Navigation */}
      <div className="space-y-1">
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Account Navigation
        </h3>
        <Link
          href={`${accountUrl}/support`}
          className="flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
          onClick={onClose}
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-4 w-4" />
            <span>Support</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href={`${accountUrl}/analytics`}
          className="flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
          onClick={onClose}
        >
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href={`${accountUrl}/tags`}
          className="flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
          onClick={onClose}
        >
          <div className="flex items-center space-x-3">
            <Tag className="h-4 w-4" />
            <span>Tags</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          href={`${accountUrl}/gamification`}
          className="flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors text-foreground hover:bg-accent"
          onClick={onClose}
        >
          <div className="flex items-center space-x-3">
            <Trophy className="h-4 w-4" />
            <span>Gamification</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Logout */}
      <div className="pt-4 border-t border-border">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="destructive"
          className="w-full"
        >
          {isLoggingOut ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 