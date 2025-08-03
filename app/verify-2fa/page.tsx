"use client"

import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { useToast } from 'components/ui/use-toast';
import { ArrowLeft, Shield, Smartphone } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function Verify2FAForm() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get userId from URL params or localStorage
    const urlUserId = searchParams.get('userId');
    const storedUserId = localStorage.getItem('2fa_userId');
    
    if (urlUserId) {
      setUserId(urlUserId);
      localStorage.setItem('2fa_userId', urlUserId);
    } else if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // No userId found, redirect to login
      router.push('/login');
    }
  }, [searchParams, router]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please try logging in again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          userId: userId
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Complete the login process
        const completeResponse = await fetch('/api/auth/complete-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const completeResult = await completeResponse.json();

        if (completeResult.success) {
          // Clear temporary data
          localStorage.removeItem('2fa_userId');
          
          toast({
            title: "2FA Verified",
            description: "Two-factor authentication verified successfully",
          });

          // Redirect to account page
          router.push('/account');
        } else {
          toast({
            title: "Error",
            description: completeResult.error || "Failed to complete login",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Invalid Code",
          description: result.error || "Please check your code and try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify 2FA code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers
    if (!/\d/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
      e.preventDefault();
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem('2fa_userId');
    router.push('/login');
  };

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading verification...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app to complete sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code" className="text-sm font-medium">
              Verification Code
            </Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="verification-code"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                maxLength={6}
                className="pl-10 text-center text-lg font-mono tracking-widest"
                autoFocus
                required
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Enter the 6-digit code from your authenticator app</span>
              <span className="font-mono">{verificationCode.length}/6</span>
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full" 
            size="lg"
            disabled={isLoading || !verificationCode}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Verify Code
              </>
            )}
          </Button>

          <Button 
            onClick={handleBackToLogin}
            variant="outline"
            className="w-full"
            type="button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>

          <div className="text-center space-y-2">
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Need help?</strong> If you can't access your authenticator app, contact support for account recovery.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              This verification helps protect your account from unauthorized access.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Verify2FAContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading verification...</p>
        </div>
      </div>
    }>
      <Verify2FAForm />
    </Suspense>
  );
}

export default function Verify2FAPage() {
  return (
    <div className="min-h-screen bg-muted/50 flex items-center justify-center px-4">
      <Verify2FAContent />
    </div>
  );
} 