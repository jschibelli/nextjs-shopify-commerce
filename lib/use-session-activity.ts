"use client"

import { useEffect, useRef } from 'react';

export function useSessionActivity() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update session activity every 5 minutes
    const updateActivity = async () => {
      try {
        // Get current session ID from localStorage
        const sessionId = localStorage.getItem('current_session_id');
        
        if (!sessionId) {
          // No session ID means user is not logged in
          return;
        }

        console.log('Session activity: Updating activity for session:', sessionId);

        const response = await fetch('/api/account/sessions/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            // User is not authenticated, clear session ID
            localStorage.removeItem('current_session_id');
            console.log('Session activity: User not authenticated, cleared session ID');
          } else {
            console.error('Failed to update session activity:', response.status);
          }
        } else {
          console.log('Session activity: Updated successfully');
        }
      } catch (error) {
        console.error('Failed to update session activity:', error);
        // Clear session ID on error
        localStorage.removeItem('current_session_id');
      }
    };

    // Update immediately
    updateActivity();

    // Set up interval
    intervalRef.current = setInterval(updateActivity, 5 * 60 * 1000); // 5 minutes

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update activity on user interaction
  useEffect(() => {
    const handleUserActivity = async () => {
      try {
        const sessionId = localStorage.getItem('current_session_id');
        
        if (!sessionId) {
          // No session ID means user is not logged in
          return;
        }

        const response = await fetch('/api/account/sessions/activity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            // User is not authenticated, clear session ID
            localStorage.removeItem('current_session_id');
            console.log('Session activity: User not authenticated, cleared session ID');
          } else {
            console.error('Failed to update session activity:', response.status);
          }
        }
      } catch (error) {
        console.error('Failed to update session activity:', error);
        // Clear session ID on error
        localStorage.removeItem('current_session_id');
      }
    };

    // Debounce the activity update
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleUserActivity, 1000); // 1 second debounce
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, debouncedUpdate, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, debouncedUpdate, true);
      });
      clearTimeout(timeoutId);
    };
  }, []);
} 