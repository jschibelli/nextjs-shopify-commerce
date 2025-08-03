"use client"

import { Button } from 'components/ui/button';
import { Switch } from 'components/ui/switch';
import { useToast } from 'components/ui/use-toast';
import { Download, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PrivacyFormProps {
  user: any;
}

export function PrivacyForm({ user }: PrivacyFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dataSharing, setDataSharing] = useState({
    analytics: true,
    marketing: user.acceptsMarketing || false,
    thirdParty: false,
    personalizedAds: false
  });
  const [communicationPreferences, setCommunicationPreferences] = useState({
    email: user.acceptsMarketing || false,
    sms: user.acceptsSMS || false,
    pushNotifications: false,
    orderUpdates: true,
    securityAlerts: true
  });
  const { toast } = useToast();

  const handleDataSharingChange = async (key: string, value: boolean) => {
    setIsLoading(true);
    try {
      const updatedDataSharing = { ...dataSharing, [key]: value };
      setDataSharing(updatedDataSharing);

      const response = await fetch('/api/account/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-data-sharing',
          data: updatedDataSharing
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Settings Updated",
          description: "Your data sharing preferences have been updated",
        });
      } else {
        // Revert on error
        setDataSharing(dataSharing);
        toast({
          title: "Error",
          description: result.error || "Failed to update settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Revert on error
      setDataSharing(dataSharing);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunicationChange = async (key: string, value: boolean) => {
    setIsLoading(true);
    try {
      const updatedPreferences = { ...communicationPreferences, [key]: value };
      setCommunicationPreferences(updatedPreferences);

      const response = await fetch('/api/account/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-communication-preferences',
          data: updatedPreferences
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Settings Updated",
          description: "Your communication preferences have been updated",
        });
      } else {
        // Revert on error
        setCommunicationPreferences(communicationPreferences);
        toast({
          title: "Error",
          description: result.error || "Failed to update settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Revert on error
      setCommunicationPreferences(communicationPreferences);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/account/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request-data-export',
          data: { format: 'json', includeDeletedData: false }
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Export Requested",
          description: "Your data export has been requested. You'll receive an email when it's ready.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to request data export",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request data export",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataDeletion = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/account/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'request-data-deletion',
          data: { scope: 'all', reason: 'User request' }
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Deletion Requested",
          description: "Your account deletion has been requested. You'll receive a confirmation email.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to request account deletion",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to request account deletion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Sharing Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Analytics</p>
            <p className="text-sm text-muted-foreground">
              Help us improve by sharing usage data
            </p>
          </div>
          <Switch
            checked={dataSharing.analytics}
            onCheckedChange={(checked) => handleDataSharingChange('analytics', checked)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Marketing</p>
            <p className="text-sm text-muted-foreground">
              Receive promotional emails and offers
            </p>
          </div>
          <Switch
            checked={dataSharing.marketing}
            onCheckedChange={(checked) => handleDataSharingChange('marketing', checked)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Third-Party Services</p>
            <p className="text-sm text-muted-foreground">
              Allow data sharing with trusted partners
            </p>
          </div>
          <Switch
            checked={dataSharing.thirdParty}
            onCheckedChange={(checked) => handleDataSharingChange('thirdParty', checked)}
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Personalized Ads</p>
            <p className="text-sm text-muted-foreground">
              Show ads based on your interests
            </p>
          </div>
          <Switch
            checked={dataSharing.personalizedAds}
            onCheckedChange={(checked) => handleDataSharingChange('personalizedAds', checked)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">Your Privacy Matters</p>
            <p className="text-blue-700 dark:text-blue-300">
              We only collect and use data that helps us provide better service. 
              You can change these settings at any time.
            </p>
          </div>
        </div>
      </div>

      {/* Data Actions */}
      <div className="space-y-3">
        <Button 
          onClick={handleDataExport}
          disabled={isLoading}
          variant="outline"
          className="w-full justify-start"
        >
          <Download className="w-4 h-4 mr-2" />
          {isLoading ? 'Requesting Export...' : 'Export My Data'}
        </Button>

        <Button 
          onClick={handleDataDeletion}
          disabled={isLoading}
          variant="destructive"
          className="w-full justify-start"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isLoading ? 'Requesting Deletion...' : 'Delete My Account'}
        </Button>
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>GDPR Compliance:</strong> You have the right to access, modify, 
          and delete your personal data. Contact our support team for assistance.
        </p>
      </div>
    </div>
  );
} 