'use client';

import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Switch } from 'components/ui/switch';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface PreferencesFormProps {
  initialPreferences: {
    acceptsMarketing: boolean;
    acceptsSMS?: boolean;
  };
}

export default function PreferencesForm({ initialPreferences }: PreferencesFormProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggle = (key: 'acceptsMarketing' | 'acceptsSMS') => {
    console.log(`Toggling ${key}:`, {
      currentValue: preferences[key],
      newValue: !preferences[key]
    });
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    console.log('Submitting preferences:', preferences);

    try {
      const response = await fetch('/api/account/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();
      console.log('Preferences API response:', data);

      if (response.ok) {
        setMessage({ type: 'success', text: 'Preferences updated successfully!' });
        
        // Update the local state with the response data
        if (data.customer) {
          console.log('Updating local state with:', data.customer);
          setPreferences({
            acceptsMarketing: data.customer.acceptsMarketing,
            acceptsSMS: data.customer.acceptsSMS
          });
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update preferences' });
      }
    } catch (error) {
      console.error('Error submitting preferences:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Communication Preferences
        </CardTitle>
        <CardDescription>
          Choose how you'd like to receive updates and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email Marketing */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about new products, sales, and exclusive offers
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.acceptsMarketing}
                onCheckedChange={() => handleToggle('acceptsMarketing')}
              />
            </div>

            {/* SMS Marketing */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive SMS updates about orders, promotions, and important updates
                  </p>
                </div>
              </div>
              <Switch
                checked={preferences.acceptsSMS || false}
                onCheckedChange={() => handleToggle('acceptsSMS')}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>• You can change these preferences at any time</p>
            <p>• SMS messages may incur standard carrier charges</p>
            <p>• SMS notifications require SMS marketing to be enabled in your Shopify store</p>
            <p>• We respect your privacy and will never share your information</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 