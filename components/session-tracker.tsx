"use client"

import { useSessionActivity } from 'lib/use-session-activity';
import React, { useEffect } from 'react';

interface SessionTrackerProps {
  children: React.ReactNode;
}

export function SessionTracker({ children }: SessionTrackerProps) {
  useSessionActivity();

  useEffect(() => {
    // Only set session ID if we're on an authenticated page
    const isAuthenticatedPage = window.location.pathname.startsWith('/account');
    
    if (isAuthenticatedPage) {
      // Fetch current session ID from server
      const fetchSessionId = async () => {
        try {
          const response = await fetch('/api/account/sessions', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            const currentSession = data.sessions?.find((session: any) => session.isCurrent);
            
            if (currentSession) {
              localStorage.setItem('current_session_id', currentSession.id);
              console.log('Session tracker: Using server session ID:', currentSession.id);
            } else {
              console.log('Session tracker: No current session found');
              // Clear any stale session ID
              localStorage.removeItem('current_session_id');
            }
          } else if (response.status === 401) {
            // User is not authenticated, clear session ID
            console.log('Session tracker: User not authenticated, clearing session ID');
            localStorage.removeItem('current_session_id');
          } else {
            console.log('Session tracker: Failed to fetch sessions:', response.status);
            // Clear any stale session ID on other errors
            localStorage.removeItem('current_session_id');
          }
        } catch (error) {
          console.error('Session tracker: Error fetching session ID:', error);
          // Clear any stale session ID on error
          localStorage.removeItem('current_session_id');
        }
      };

      fetchSessionId();
    } else {
      // Not on authenticated page, clear session ID
      localStorage.removeItem('current_session_id');
    }
    
    // Cleanup on unmount
    return () => {
      // Don't clear session ID on unmount as it might be needed for activity tracking
      // It will be cleared when user logs out or gets 401 errors
    };
  }, []);

  return <>{children}</>;
} 