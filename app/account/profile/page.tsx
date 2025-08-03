import { getAuth } from 'lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import ProfileForm from '../settings/profile-form';

async function ProfilePage() {
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
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">
          Update your personal information and contact details
        </p>
      </div>

      <ProfileForm 
        initialProfile={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone
        }}
      />
    </div>
  );
}

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-8 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div>}>
      <ProfilePage />
    </Suspense>
  );
} 