'use client';

import { Button } from 'components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  redirectUrl?: string;
}

export function LogoutButton({ 
  variant = 'outline', 
  size = 'default',
  className = '',
  children,
  redirectUrl = '/'
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ redirectUrl }),
      });

      if (response.ok) {
        // Clear any client-side state if needed
        localStorage.removeItem('customer_token');
        sessionStorage.removeItem('customer_token');
        
        // Redirect to the specified URL or home page
        router.push(redirectUrl);
        router.refresh(); // Refresh to clear any cached data
      } else {
        console.error('Logout failed');
        // Still redirect even if logout API fails
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Redirect even if there's an error
      router.push(redirectUrl);
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
    >
      {isLoggingOut ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Logging out...
        </>
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          {children || 'Logout'}
        </>
      )}
    </Button>
  );
} 