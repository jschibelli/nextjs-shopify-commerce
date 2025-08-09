"use client"

import { useEffect, useState } from 'react';

interface Session {
  id: string;
  customer_id: string;
  created_at: string;
  expires_at: string;
  is_active: boolean;
}

export default function SessionTracker() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentSession = async () => {
      try {
        const response = await fetch('/api/account/sessions');
        if (response.ok) {
          const data = await response.json();
          if (data.sessions && data.sessions.length > 0) {
            setCurrentSession(data.sessions[0]);
          }
        }
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentSession();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!currentSession) {
    return null;
  }

  return null; // This component doesn't render anything visible
} 