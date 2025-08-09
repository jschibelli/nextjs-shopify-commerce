'use client';

import AdminNavigation from '@/app/admin/admin-navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import CustomerNavigation from './customer-navigation';

interface SessionData {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  } | null;
  isStaffMember: boolean;
}

export default function DynamicNavigation() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState(0);
  const pathname = usePathname();

  const checkAuthStatus = async () => {
    try {
      // Add cache-busting parameter to ensure fresh data
      const response = await fetch(`/api/auth/check-session?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('DynamicNavigation auth check result:', data);
        setSessionData(data);
        setLastCheck(Date.now());
      } else {
        setSessionData({
          isAuthenticated: false,
          user: null,
          isStaffMember: false
        });
      }
    } catch (error) {
      console.error('Auth check error in DynamicNavigation:', error);
      setSessionData({
        isAuthenticated: false,
        user: null,
        isStaffMember: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Listen for login success events
    const handleLoginSuccess = () => {
      console.log('DynamicNavigation received login-success event');
      setTimeout(checkAuthStatus, 100); // Small delay to ensure cookies are set
    };

    // Listen for storage changes (in case of logout from another tab)
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    // Listen for focus events to refresh when returning to tab
    const handleFocus = () => {
      const now = Date.now();
      if (now - lastCheck > 5000) { // Only refresh if last check was more than 5 seconds ago
        checkAuthStatus();
      }
    };

    window.addEventListener('login-success', handleLoginSuccess);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    // Also check periodically to catch any auth state changes
    const interval = setInterval(checkAuthStatus, 5000); // Check every 5 seconds

    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return <CustomerNavigation />;
  }

  // Check if we're on an admin page
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    // If we're on an admin page and user is a staff member, show admin navigation
    if (sessionData?.isStaffMember && sessionData?.user) {
      return <AdminNavigation />;
    } else {
      // If we're on an admin page but user is not a staff member, show customer navigation
      return <CustomerNavigation />;
    }
  }

  // For non-admin pages, always show customer navigation
  return <CustomerNavigation />;
} 