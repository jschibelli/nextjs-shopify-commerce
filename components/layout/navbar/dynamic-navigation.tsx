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
  const pathname = usePathname();

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