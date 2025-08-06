import { getAdminAuth } from 'lib/admin-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('customer_token');
  
  if (!tokenCookie) {
    redirect('/login');
  }

  const adminAuth = getAdminAuth();
  const adminUser = await adminAuth.getCurrentAdminUser();

  if (!adminUser) {
    redirect('/login?error=admin_access_denied');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {adminUser.firstName || adminUser.email} ({adminUser.role})
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Admin Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <a
                href="/admin/reviews"
                className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span>Review Moderation</span>
              </a>
              {/* Add more admin navigation items here */}
            </nav>
          </div>
          
          {/* Admin Content */}
          <div className="lg:col-span-3">
            <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="h-48 bg-muted rounded" /><div className="h-48 bg-muted rounded" /><div className="h-48 bg-muted rounded" /></div></div>}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout; 