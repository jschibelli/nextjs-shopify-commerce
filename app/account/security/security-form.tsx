"use client"

import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { QRCode } from 'components/ui/qr-code';
import { Separator } from 'components/ui/separator';
import { useToast } from 'components/ui/use-toast';
import { CheckCircle, Download, QrCode, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SecurityFormProps {
  user: any;
}

export function SecurityForm({ user }: SecurityFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [step, setStep] = useState<'initial' | 'qr' | 'verify' | 'backup' | 'enabled'>('initial');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const { toast } = useToast();

  // Fetch current 2FA status on component mount
  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const response = await fetch('/api/account/security');
        const result = await response.json();
        
        if (result.success) {
          setIs2FAEnabled(result.securitySettings.twoFactorEnabled);
        }
      } catch (error) {
        console.error('Error fetching 2FA status:', error);
      }
    };

    fetch2FAStatus();
  }, []);

  const handleEnable2FA = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/account/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'enable-2fa',
          data: { email: user.email }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setQrCodeData(result);
        setStep('qr');
        toast({
          title: "2FA Setup Initiated",
          description: "Scan the QR code with your authenticator app",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to enable 2FA",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/account/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verify-2fa',
          data: { 
            code: verificationCode,
            secret: qrCodeData.secret
          }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBackupCodes(result.backupCodes);
        setStep('backup');
        setIs2FAEnabled(true); // Update local state
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been enabled successfully",
        });
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
        description: "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/account/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'disable-2fa',
          data: { code: verificationCode }
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStep('initial');
        setVerificationCode('');
        setIs2FAEnabled(false); // Update local state
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled",
        });
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
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBackupCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/account/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-backup-codes'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setBackupCodes(result.backupCodes);
        setShowBackupCodes(true);
        toast({
          title: "Backup Codes Generated",
          description: "New backup codes have been generated",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate backup codes",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate backup codes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (is2FAEnabled && step === 'initial') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Two-Factor Authentication</p>
            <p className="text-sm text-muted-foreground">
              Your account is protected with 2FA
            </p>
          </div>
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Enabled
          </Badge>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              className="mt-1"
            />
          </div>

          <Button 
            onClick={handleDisable2FA} 
            disabled={isLoading || !verificationCode}
            variant="destructive"
            className="w-full"
          >
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </Button>

          <Button 
            onClick={handleGenerateBackupCodes} 
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Generate New Backup Codes'}
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'qr') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Scan this QR code with your authenticator app
          </p>
        </div>

        {qrCodeData && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border flex justify-center">
              <QRCode 
                value={qrCodeData.qrCodeUrl} 
                size={200}
                className="mx-auto"
              />
            </div>

            <div className="space-y-2">
              <Label>Manual Entry Code</Label>
              <Input
                value={qrCodeData.secret}
                readOnly
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                If you can't scan the QR code, enter this code manually in your authenticator app
              </p>
            </div>

            <Separator />

            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code from your app"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="mt-1"
              />
            </div>

            <Button 
              onClick={handleVerifyCode} 
              disabled={isLoading || !verificationCode}
              className="w-full"
            >
              {isLoading ? 'Verifying...' : 'Verify and Enable 2FA'}
            </Button>

            <Button 
              onClick={() => setStep('initial')} 
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold mb-2">Backup Codes Generated</h3>
          <p className="text-sm text-muted-foreground">
            Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Backup Codes</CardTitle>
            <CardDescription>
              Each code can only be used once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-muted rounded text-center">
                  {code}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button 
            onClick={() => setShowBackupCodes(!showBackupCodes)}
            variant="outline"
            className="flex-1"
          >
            {showBackupCodes ? 'Hide Codes' : 'Show Codes'}
          </Button>
          <Button 
            onClick={() => {
              // In a real app, you would download the codes
              toast({
                title: "Downloaded",
                description: "Backup codes have been saved",
              });
            }}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        <Button 
          onClick={() => setStep('enabled')} 
          className="w-full"
        >
          Continue
        </Button>
      </div>
    );
  }

  if (step === 'enabled') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold mb-2">2FA Successfully Enabled</h3>
          <p className="text-sm text-muted-foreground">
            Your account is now protected with two-factor authentication.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Two-Factor Authentication</span>
            </div>
            <Badge variant="default">Active</Badge>
          </div>
        </div>

        <Button 
          onClick={() => setStep('initial')} 
          className="w-full"
        >
          Done
        </Button>
      </div>
    );
  }

  // Initial state - 2FA not enabled
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">Two-Factor Authentication</p>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account
          </p>
        </div>
        <Badge variant="secondary">Not Enabled</Badge>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <Smartphone className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">How it works</p>
            <p className="text-blue-700 dark:text-blue-300">
              You'll need to enter a 6-digit code from your authenticator app every time you sign in.
            </p>
          </div>
        </div>

        <Button 
          onClick={handleEnable2FA} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
        </Button>
      </div>
    </div>
  );
} 