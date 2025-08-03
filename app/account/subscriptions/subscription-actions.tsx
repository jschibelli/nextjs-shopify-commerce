'use client';

import { Button } from 'components/ui/button';
import {
    Edit,
    Pause,
    Play,
    Trash2
} from 'lucide-react';
import { useState } from 'react';

interface SubscriptionActionsProps {
  subscription: {
    id: string;
    name: string;
    status: string;
  };
}

export default function SubscriptionActions({ subscription }: SubscriptionActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubscriptionAction = async (action: string) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/account/subscriptions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          action
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`${action} successful`);
        // In a real app, you would update the UI state here
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(data.error || `Failed to ${action}`);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {subscription.status === 'active' ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSubscriptionAction('pause')}
            disabled={isLoading}
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleSubscriptionAction('resume')}
            disabled={isLoading}
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleSubscriptionAction('edit')}
          disabled={isLoading}
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-red-600 hover:text-red-700"
        onClick={() => handleSubscriptionAction('cancel')}
        disabled={isLoading}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Cancel
      </Button>
      {message && (
        <div className={`absolute top-0 right-0 p-2 rounded text-xs ${
          message.includes('successful') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
} 