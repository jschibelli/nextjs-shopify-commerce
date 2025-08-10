'use client';

import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

function LoginForm({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const demoConfigRef = useRef<{ customerEmail: string; adminEmail: string; password: string } | null>(null);
  const [demoRole, setDemoRole] = useState<null | 'customer' | 'admin'>(null);

  async function loadDemoConfig() {
    if (demoConfigRef.current) return demoConfigRef.current;
    const res = await fetch('/api/auth/demo-config').catch(() => null);
    if (res && res.ok) {
      const cfg = await res.json();
      demoConfigRef.current = cfg;
      return cfg;
    }
    return null;
  }

  // Handle URL error parameters
  useEffect(() => {
    const handleUrlErrors = async () => {
      if (searchParams) {
        const params = await searchParams;
        if (params.error) {
          let errorMessage = '';
          switch (params.error) {
            case 'session_expired':
              errorMessage = 'Your session has expired. Please sign in again.';
              break;
            case 'authentication_failed':
              errorMessage = 'Authentication failed. Please check your credentials and try again.';
              break;
            case 'shopify_staff_access_denied':
              errorMessage = 'Access denied. You do not have permission to access the admin area.';
              break;
            default:
              errorMessage = 'An error occurred. Please try again.';
          }
          setError(errorMessage);
        }
      }
    };

    handleUrlErrors();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // If demo prefill was chosen, use demo route
      if (demoRole) {
        const cfg = await loadDemoConfig();
        const demoPassword = cfg?.password || password;
        const res = await fetch('/api/auth/demo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: demoRole, password: demoPassword })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Invalid demo password');
          return;
        }
        window.dispatchEvent(new CustomEvent('login-success'));
        router.push(demoRole === 'admin' ? '/admin' : '/');
        return;
      }

      // Real account sign-in flow: try admin first, then customer
      const adminResponse = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        window.dispatchEvent(new CustomEvent('login-success'));
        router.push(adminData.redirect);
        return;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2FA) {
          router.push(`/verify-2fa?userId=${data.userId}`);
        } else {
          const redirectUrl = data.redirect || '/account';
          window.dispatchEvent(new CustomEvent('login-success'));
          router.push(redirectUrl);
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo starters now load password from server config automatically
  const startDemoCustomer = async () => {
    const cfg = await loadDemoConfig();
    const demoPassword = cfg?.password || password;
    const res = await fetch('/api/auth/demo', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'customer', password: demoPassword })
    });
    if (res.ok) {
      window.dispatchEvent(new CustomEvent('login-success'));
      window.location.href = '/';
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Invalid demo password');
    }
  };

  const startDemoAdmin = async () => {
    const cfg = await loadDemoConfig();
    const demoPassword = cfg?.password || password;
    const res = await fetch('/api/auth/demo', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin', password: demoPassword })
    });
    if (res.ok) {
      window.dispatchEvent(new CustomEvent('login-success'));
      window.location.href = '/admin';
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Invalid demo password');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to manage your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="relative w-full rounded-lg border p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <Lock className="h-4 w-4 absolute left-4 top-4 text-red-600 dark:text-red-400" />
              <div className="pl-7">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>

          <div className="relative flex items-center justify-center my-1">
            <span className="h-px w-full bg-border" />
            <span className="px-3 text-xs text-muted-foreground">or</span>
            <span className="h-px w-full bg-border" />
          </div>

          {/* Demo section */}
          <div className="rounded-md border p-3 bg-muted/40 space-y-3">
            <p className="text-sm font-medium text-foreground">Try the demo</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  const cfg = await loadDemoConfig();
                  if (cfg) { setEmail(cfg.customerEmail); setPassword(cfg.password); setDemoRole('customer'); }
                }}
              >
                Prefill Customer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  const cfg = await loadDemoConfig();
                  if (cfg) { setEmail(cfg.adminEmail); setPassword(cfg.password); setDemoRole('admin'); }
                }}
              >
                Prefill Admin
              </Button>
            </div>
            {demoRole && (
              <p className="text-xs text-muted-foreground">Demo mode selected: {demoRole === 'admin' ? 'Admin' : 'Customer'} — press Sign In</p>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center px-4">
      <LoginForm searchParams={searchParams} />
    </div>
  );
} 