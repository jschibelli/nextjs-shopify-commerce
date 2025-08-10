import { AccountSidebar } from '@/components/account-sidebar';
import { AccountBreadcrumb } from 'components/account-breadcrumb';
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
      // Token invalid; avoid mutating cookies here in a server component
      redirect('/login?error=session_expired');
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Breadcrumb */}
          <AccountBreadcrumb />
          
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Account</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Welcome back, {user.firstName || user.email}
            </p>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Navigation Sidebar - Desktop Only */}
            <div className="hidden lg:block lg:col-span-1">
              <AccountSidebar />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
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