'use client';

import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
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

export default function MobileAccount() {
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

    // Listen for login success events
    const handleLoginSuccess = () => {
      checkAuthStatus();
    };

    window.addEventListener('login-success', handleLoginSuccess);
    return () => {
      window.removeEventListener('login-success', handleLoginSuccess);
    };
  }, []);

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (!sessionData?.isAuthenticated || !sessionData?.user) {
    return (
      <Link href="/login">
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-2" />
          Sign In
        </Button>
      </Link>
    );
  }

  // If user is a staff member, show admin account link
  if (sessionData.isStaffMember) {
    return (
      <Link href="/admin">
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-2" />
          Admin
        </Button>
      </Link>
    );
  }

  // For regular customers, show account link
  return (
    <Link href="/account">
      <Button variant="ghost" size="sm">
        <User className="h-4 w-4 mr-2" />
        Account
      </Button>
    </Link>
  );
} 