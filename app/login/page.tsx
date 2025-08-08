'use client';

import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
      // First, try admin login
      console.log('Attempting admin login...');
      const adminResponse = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log('Admin login successful, redirecting to:', adminData.redirect);
        // Trigger login success event
        window.dispatchEvent(new CustomEvent('login-success'));
        router.push(adminData.redirect);
        return;
      }

      // If admin login fails, try customer login
      console.log('Admin login failed, trying customer login...');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2FA) {
          // 2FA is required, redirect to verification page
          router.push(`/verify-2fa?userId=${data.userId}`);
        } else {
          // No 2FA required, redirect based on user type
          const redirectUrl = data.redirect || '/account';
          console.log('Login successful, redirecting to:', redirectUrl, { 
            isStaffMember: data.isStaffMember 
          });
          // Trigger login success event
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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your account to manage your orders and profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="relative w-full rounded-lg border p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <Lock className="h-4 w-4 absolute left-4 top-4 text-red-600 dark:text-red-400" />
              <div className="pl-7">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
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
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
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
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isLoading}
          >
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
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Demo credentials:
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Email: john@example.com</p>
              <p>Password: password123</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
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