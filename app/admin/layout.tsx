import { getShopifyAdminAuth } from 'lib/shopify/admin-auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import AdminNavigation from './admin-navigation';

async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('customer_token');
  
  if (!tokenCookie) {
    redirect('/login');
  }

  const adminAuth = getShopifyAdminAuth();
  const adminUser = await adminAuth.getCurrentAdminUserFromSession();

  if (!adminUser) {
    redirect('/login?error=shopify_staff_access_denied');
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation adminUser={adminUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="h-48 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        }>
          {children}
        </Suspense>
      </div>
    </div>
  );
}

export default AdminLayout; 