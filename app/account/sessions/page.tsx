import { AccountClientWrapper } from 'components/account-client-wrapper';
import { SessionManagement } from 'components/session-management';
import { getAuth } from 'lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

async function SessionsPage() {
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
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="text-muted-foreground">
            View and manage your active sessions across all devices
          </p>
        </div>

        <div className="max-w-4xl">
          <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-4 bg-muted rounded" /><div className="h-4 bg-muted rounded w-3/4" /></div>}>
            <SessionManagement />
          </Suspense>
        </div>
      </div>
    </AccountClientWrapper>
  );
}

export default function SessionsPageWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>}>
      <SessionsPage />
    </Suspense>
  );
} 