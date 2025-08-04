import { AccountClientWrapper } from 'components/account-client-wrapper';
import { getAuth } from 'lib/auth';
import { getTwoFactorData } from 'lib/security';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function get2FAStatus(userId: string) {
  try {
    // Get 2FA data directly from security functions
    const twoFactorData = getTwoFactorData(userId);
    
    console.log('2FA Status Check:', {
      userId,
      twoFactorData,
      enabled: twoFactorData?.enabled || false
    });
    
    return {
      twoFactorEnabled: twoFactorData?.enabled || false,
      twoFactorSecret: twoFactorData?.secret ? 'configured' : null,
      backupCodes: twoFactorData?.backupCodes?.length || 0
    };
  } catch (error) {
    console.error('Error fetching 2FA status:', error);
    return { 
      twoFactorEnabled: false,
      twoFactorSecret: null,
      backupCodes: 0
    };
  }
}

async function AccountDashboard() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('customer_token');
  
  if (!tokenCookie) {
    redirect('/login');
  }

  const auth = getAuth();
  await auth.initializeFromCookies();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch 2FA status directly using security functions
  const securitySettings = await get2FAStatus(user.id);

  return (
    <AccountClientWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Account Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Account Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Member since:</span>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">No recent orders</p>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Security Status</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Two-Factor Auth</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  securitySettings.twoFactorEnabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {securitySettings.twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Password</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Strong</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/account/orders"
              className="flex items-center p-4 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">View Orders</p>
                <p className="text-sm text-muted-foreground">Check your order history</p>
              </div>
            </a>
            
            <a
              href="/account/addresses"
              className="flex items-center p-4 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">Manage Addresses</p>
                <p className="text-sm text-muted-foreground">Update shipping addresses</p>
              </div>
            </a>
            
            <a
              href="/account/security"
              className="flex items-center p-4 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">Security Settings</p>
                <p className="text-sm text-muted-foreground">Manage account security</p>
              </div>
            </a>
            
            <a
              href="/account/settings"
              className="flex items-center p-4 border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium">Account Settings</p>
                <p className="text-sm text-muted-foreground">Update preferences</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AccountClientWrapper>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="h-48 bg-muted rounded" /><div className="h-48 bg-muted rounded" /><div className="h-48 bg-muted rounded" /></div></div>}>
      <AccountDashboard />
    </Suspense>
  );
} 