import { AccountClientWrapper } from 'components/account-client-wrapper';
import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Switch } from 'components/ui/switch';
import { getAuth } from 'lib/auth';
import { AlertTriangle, CheckCircle, Clock, Key, Shield, Smartphone, UserCheck } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { SecurityForm } from './security-form';

async function SecurityPage() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('customer_token');
  
  if (!tokenCookie) {
    redirect('/account/login');
  }

  const auth = getAuth();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect('/account/login');
  }

  return (
    <AccountClientWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Security Settings</h1>
          <p className="text-muted-foreground">
            Manage your account security and authentication methods
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-4 bg-muted rounded" /><div className="h-4 bg-muted rounded w-3/4" /></div>}>
                <SecurityForm user={user} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Password Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Password Security
              </CardTitle>
              <CardDescription>
                Manage your password and account access
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Last changed: Never
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/account/password">Change Password</a>
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-muted-foreground">
                    Manage active sessions and devices
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/account/sessions">View Sessions</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Login History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Login History
              </CardTitle>
              <CardDescription>
                Recent account activity and login attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Successful Login</p>
                      <p className="text-xs text-muted-foreground">Today at 2:30 PM</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Current</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Successful Login</p>
                      <p className="text-xs text-muted-foreground">Yesterday at 10:15 AM</p>
                    </div>
                  </div>
                  <Badge variant="outline">Mobile</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Failed Login Attempt</p>
                      <p className="text-xs text-muted-foreground">3 days ago at 8:45 PM</p>
                    </div>
                  </div>
                  <Badge variant="destructive">Blocked</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Security Questions
              </CardTitle>
              <CardDescription>
                Set up security questions for account recovery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Security Questions</p>
                    <p className="text-sm text-muted-foreground">
                      0 questions configured
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Not Set
                  </Badge>
                </div>
                
                <Button variant="outline" className="w-full">
                  Set Security Questions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Recovery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Account Recovery
              </CardTitle>
              <CardDescription>
                Backup codes and recovery options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Backup Codes</p>
                    <p className="text-sm text-muted-foreground">
                      0 codes remaining
                    </p>
                  </div>
                  <Badge variant="secondary">
                    None
                  </Badge>
                </div>
                
                <Button variant="outline" className="w-full">
                  Generate New Backup Codes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Security Alerts
              </CardTitle>
              <CardDescription>
                Configure security notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Login Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password Change Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Notify when password is changed
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Suspicious Activity</p>
                    <p className="text-sm text-muted-foreground">
                      Alert on unusual account activity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AccountClientWrapper>
  );
}

export default function SecurityPageWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>}>
      <SecurityPage />
    </Suspense>
  );
} 