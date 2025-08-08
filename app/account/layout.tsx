import { AccountBreadcrumb } from 'components/account-breadcrumb';
import { AccountNavigation } from 'components/account-navigation';
import { LogoutButton } from 'components/logout-button';
import { getAuth } from 'lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function AccountLayout({ children }: { children: React.ReactNode }) {
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
      // Clear any invalid cookies and redirect to login
      const cookieStore = await cookies();
      cookieStore.delete('customer_token');
      redirect('/login?error=session_expired');
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Breadcrumb */}
          <AccountBreadcrumb />
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Account</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Welcome back, {user.firstName || user.email}
              </p>
            </div>
            <LogoutButton 
              variant="outline" 
              redirectUrl="/"
              className="flex items-center justify-center sm:justify-start w-full sm:w-auto"
            >
              Logout
            </LogoutButton>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <AccountNavigation />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-card border border-border rounded-lg shadow-sm min-h-[400px]">
                <Suspense fallback={
                  <div className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-muted rounded w-1/4"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                }>
                  {children}
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in AccountLayout:', error);
    redirect('/login?error=session_expired');
  }
}

export default AccountLayout; 