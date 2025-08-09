'use client';

import { useEffect, useState } from 'react';

interface User {
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

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('useAuth - Checking authentication...');
      const response = await fetch(`/api/auth/test?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('useAuth - Response status:', response.status);
      console.log('useAuth - Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('useAuth - Response data:', data);
        if (data.success && data.user) {
          console.log('useAuth - User authenticated:', data.user.email);
          setAuthState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          console.log('useAuth - User not authenticated (no user data)');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } else {
        console.log('useAuth - Response not ok, user not authenticated');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('useAuth - Error checking authentication:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const logout = async () => {
    try {
      console.log('useAuth - Logging out...');
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      console.log('useAuth - Logout successful, clearing auth state');
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('useAuth - Error logging out:', error);
    }
  };

  const forceRefresh = () => {
    console.log('useAuth - Force refreshing authentication state');
    setAuthState(prev => ({ ...prev, isLoading: true }));
    checkAuth();
  };

  return {
    ...authState,
    logout,
    refetch: checkAuth,
    forceRefresh,
  };
} 