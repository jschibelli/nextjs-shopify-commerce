import { getAuth } from 'lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import PreferencesForm from './preferences-form';

async function PreferencesPage() {
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communication Preferences</h1>
        <p className="text-muted-foreground">
          Choose how you'd like to receive updates and notifications
        </p>
      </div>

      <PreferencesForm 
        initialPreferences={{
          acceptsMarketing: user.acceptsMarketing,
          acceptsSMS: user.acceptsSMS
        }}
      />
    </div>
  );
}

export default function PreferencesPageWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>}>
      <PreferencesPage />
    </Suspense>
  );
} 