'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, MessageSquare, ShoppingCart, Star, Trophy, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface JourneyTouchpoint {
  touchpoint: string;
  campaign?: string;
  metadata?: any;
  timestamp: string;
}

interface Journey {
  touchpoints: JourneyTouchpoint[];
  milestones: {
    signup?: string;
    first_purchase?: string;
    loyalty_signup?: string;
    referral_used?: string;
  };
  totalTouchpoints: number;
  lastActivity?: string;
}

export default function CustomerJourneyPage() {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newTouchpoint, setNewTouchpoint] = useState({
    touchpoint: '',
    campaign: '',
    metadata: ''
  });

  useEffect(() => {
    fetchJourney();
  }, []);

  const fetchJourney = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/account/journey');
      if (response.ok) {
        const data = await response.json();
        setJourney(data.journey);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch journey');
      }
    } catch (error) {
      console.error('Error fetching journey:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const trackTouchpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTouchpoint.touchpoint.trim()) return;

    try {
      const response = await fetch('/api/account/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touchpoint: newTouchpoint.touchpoint,
          campaign: newTouchpoint.campaign || undefined,
          metadata: newTouchpoint.metadata ? JSON.parse(newTouchpoint.metadata) : undefined
        })
      });

      if (response.ok) {
        setSuccess('Touchpoint tracked successfully!');
        setNewTouchpoint({ touchpoint: '', campaign: '', metadata: '' });
        fetchJourney();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to track touchpoint');
      }
    } catch (error) {
      console.error('Error tracking touchpoint:', error);
      setError('Failed to track touchpoint');
    }
  };

  const getTouchpointIcon = (touchpoint: string) => {
    switch (touchpoint.toLowerCase()) {
      case 'signup':
        return <Users className="h-4 w-4" />;
      case 'first_purchase':
        return <ShoppingCart className="h-4 w-4" />;
      case 'loyalty_signup':
        return <Star className="h-4 w-4" />;
      case 'referral_used':
        return <Trophy className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Customer Journey</h1>
          <p className="text-gray-600">
            Track your interactions and milestones with our store
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Journey Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Journey Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {journey ? (
                  <div className="space-y-6">
                    {/* Milestones */}
                    <div>
                      <h3 className="font-semibold mb-3">Key Milestones</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Signup</Badge>
                          <span className="text-sm text-gray-600">
                            {journey.milestones.signup ? formatDate(journey.milestones.signup) : 'Not reached'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">First Purchase</Badge>
                          <span className="text-sm text-gray-600">
                            {journey.milestones.first_purchase ? formatDate(journey.milestones.first_purchase) : 'Not reached'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Loyalty Signup</Badge>
                          <span className="text-sm text-gray-600">
                            {journey.milestones.loyalty_signup ? formatDate(journey.milestones.loyalty_signup) : 'Not reached'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Referral Used</Badge>
                          <span className="text-sm text-gray-600">
                            {journey.milestones.referral_used ? formatDate(journey.milestones.referral_used) : 'Not reached'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Touchpoints */}
                    <div>
                      <h3 className="font-semibold mb-3">Recent Touchpoints ({journey.totalTouchpoints})</h3>
                      <div className="space-y-3">
                        {journey.touchpoints.slice(-10).reverse().map((touchpoint, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            {getTouchpointIcon(touchpoint.touchpoint)}
                            <div className="flex-1">
                              <div className="font-medium">{touchpoint.touchpoint.replace(/_/g, ' ')}</div>
                              {touchpoint.campaign && (
                                <div className="text-sm text-gray-600">Campaign: {touchpoint.campaign}</div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDate(touchpoint.timestamp)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No journey data available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Track New Touchpoint */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Track New Touchpoint</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={trackTouchpoint} className="space-y-4">
                  <div>
                    <Label htmlFor="touchpoint">Touchpoint</Label>
                    <Input
                      id="touchpoint"
                      value={newTouchpoint.touchpoint}
                      onChange={(e) => setNewTouchpoint(prev => ({ ...prev, touchpoint: e.target.value }))}
                      placeholder="e.g., email_opened, page_viewed"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="campaign">Campaign (Optional)</Label>
                    <Input
                      id="campaign"
                      value={newTouchpoint.campaign}
                      onChange={(e) => setNewTouchpoint(prev => ({ ...prev, campaign: e.target.value }))}
                      placeholder="e.g., welcome_series"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="metadata">Metadata (Optional)</Label>
                    <Textarea
                      id="metadata"
                      value={newTouchpoint.metadata}
                      onChange={(e) => setNewTouchpoint(prev => ({ ...prev, metadata: e.target.value }))}
                      placeholder='{"key": "value"}'
                      rows={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Track Touchpoint
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 