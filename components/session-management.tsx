"use client"

import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { useToast } from 'components/ui/use-toast';
import { AlertTriangle, CheckCircle, Clock, Computer, Monitor, Smartphone, Tablet, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  userAgent: string;
  lastActive: string;
  isCurrent: boolean;
}

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/account/sessions');
      
      if (response.status === 401) {
        // User is not authenticated, redirect to login
        console.log('Session management: User not authenticated, redirecting to login');
        window.location.href = '/login';
        return;
      }
      
      const data = await response.json();

      if (data.success) {
        setSessions(data.sessions);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch sessions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Session management: Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sessions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      const response = await fetch('/api/account/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.status === 401) {
        // User is not authenticated, redirect to login
        console.log('Session management: User not authenticated during revoke, redirecting to login');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Remove the session from the list
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        toast({
          title: "Session Revoked",
          description: "The session has been successfully revoked",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to revoke session",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Session management: Error revoking session:', error);
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      });
    } finally {
      setRevokingSession(null);
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return <Smartphone className="w-4 h-4" />;
    } else if (device.toLowerCase().includes('ipad') || device.toLowerCase().includes('tablet')) {
      return <Tablet className="w-4 h-4" />;
    } else if (device.toLowerCase().includes('mac') || device.toLowerCase().includes('windows')) {
      return <Computer className="w-4 h-4" />;
    } else {
      return <Monitor className="w-4 h-4" />;
    }
  };

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Active Sessions</h3>
          <p className="text-sm text-muted-foreground">
            {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchSessions}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-4 rounded-lg border ${
              session.isCurrent 
                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800' 
                : 'bg-card border-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                  {getDeviceIcon(session.device)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {session.device}
                    </p>
                    {session.isCurrent && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatLastActive(session.lastActive)}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{session.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-blue-500" />
                      <span>IP: {session.ip}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {!session.isCurrent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => revokeSession(session.id)}
                  disabled={revokingSession === session.id}
                  className="ml-2"
                >
                  {revokingSession === session.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8">
          <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No active sessions found</p>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium text-sm mb-2">Security Tips</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Regularly review and revoke sessions you don't recognize</li>
          <li>• Use strong, unique passwords for your account</li>
          <li>• Enable two-factor authentication for extra security</li>
          <li>• Log out from shared devices when you're done</li>
        </ul>
      </div>
    </div>
  );
} 