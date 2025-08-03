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

  const auth = getAuth();
  await auth.initializeFromCookies();
  const user = await auth.getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {user.firstName || user.email}</p>
          </div>
          <LogoutButton 
            variant="outline" 
            redirectUrl="/"
            className="flex items-center"
          >
            Logout
          </LogoutButton>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <a
                href="/account"
                className="block px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Overview
              </a>
              <a
                href="/account/orders"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-transparent rounded-lg transition-colors"
              >
                Orders
              </a>
              <a
                href="/account/addresses"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-transparent rounded-lg transition-colors"
              >
                Addresses
              </a>
              <a
                href="/account/wishlist"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-transparent rounded-lg transition-colors"
              >
                Wishlist
              </a>
              <a
                href="/account/settings"
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-card border border-transparent rounded-lg transition-colors"
              >
                Settings
              </a>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountLayout; 