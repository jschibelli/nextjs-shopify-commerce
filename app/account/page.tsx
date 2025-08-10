import { AccountClientWrapper } from 'components/account-client-wrapper';
import { AccountQuickActions } from 'components/account-quick-actions';
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

  // Check if this is an admin session first
  try {
    const sessionData = JSON.parse(tokenCookie.value);
    if (sessionData.isStaffMember) {
      // This is an admin session, redirect to admin dashboard
      redirect('/admin');
    }
  } catch (error) {
    // If session parsing fails, continue with customer auth
  }

  const auth = getAuth();
  await auth.initializeFromCookies();
  
  try {
    const user = await auth.getCurrentUser();

    if (!user) {
      // Token invalid; avoid mutating cookies here in a server component
      redirect('/login?error=session_expired');
    }

    // Fetch 2FA status directly using security functions
    const securitySettings = await get2FAStatus(user.id);

    return (
      <AccountClientWrapper>
        <div className="p-4 sm:p-6">
          {/* Quick Actions */}
          <AccountQuickActions />
          
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Account Overview</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">
                Welcome back! Here's what's happening with your account.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Account Info */}
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <p className="font-medium text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Member since:</span>
                    <p className="font-medium text-foreground">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Security Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Two-Factor Auth:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      securitySettings.twoFactorEnabled 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {securitySettings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Backup Codes:</span>
                    <span className="text-sm font-medium text-foreground">
                      {securitySettings.backupCodes} remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Account Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Orders:</span>
                    <span className="text-sm font-medium text-foreground">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Loyalty Points:</span>
                    <span className="text-sm font-medium text-foreground">-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Wishlist Items:</span>
                    <span className="text-sm font-medium text-foreground">-</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h3>
              <div className="text-sm text-muted-foreground">
                <p>No recent activity to display.</p>
              </div>
            </div>
          </div>
        </div>
      </AccountClientWrapper>
    );
  } catch (error) {
    console.error('Error in AccountDashboard:', error);
    redirect('/login?error=session_expired');
  }
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
            <div className="h-48 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    }>
      <AccountDashboard />
    </Suspense>
  );
} 