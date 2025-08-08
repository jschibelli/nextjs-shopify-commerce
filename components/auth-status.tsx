'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from 'lib/use-auth';
import { LogIn, LogOut, User } from 'lucide-react';
import Link from 'next/link';

interface AuthStatusProps {
  className?: string;
  showUserInfo?: boolean;
}

export function AuthStatus({ className = '', showUserInfo = true }: AuthStatusProps) {
  const { user, isAuthenticated, isLoading, logout, forceRefresh } = useAuth();

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link href="/login">
          <Button variant="outline" size="sm">
            <LogIn className="h-4 w-4 mr-1" />
            Log In
          </Button>
        </Link>
        <Link href="/signup">
          <Button size="sm">
            Sign Up
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showUserInfo && user && (
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">
            {user.firstName || user.email}
          </span>
        </div>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={async () => {
          await logout();
          forceRefresh();
        }}
      >
        <LogOut className="h-4 w-4 mr-1" />
        Logout
      </Button>
    </div>
  );
} 