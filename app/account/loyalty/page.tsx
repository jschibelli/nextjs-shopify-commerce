'use client';

import { Badge } from 'components/ui/badge';
import { Button } from 'components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'components/ui/card';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Coins, Gift, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LoyaltyPage() {
  const [points, setPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [action, setAction] = useState<'earn' | 'redeem' | 'adjust'>('earn');
  const [pointsToUpdate, setPointsToUpdate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await fetch('/api/account/loyalty');
      const data = await response.json();
      
      if (response.ok) {
        setPoints(data.points || 0);
      } else {
        setError(data.error || 'Failed to fetch loyalty points');
      }
    } catch (error) {
      setError('Failed to fetch loyalty points');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePoints = async () => {
    if (!pointsToUpdate || !reason) return;

    const pointsValue = parseInt(pointsToUpdate);
    if (isNaN(pointsValue) || pointsValue <= 0) {
      setError('Please enter a valid number of points');
      return;
    }

    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/account/loyalty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          points: pointsValue,
          action,
          reason
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchPoints(); // Refresh points
        setPointsToUpdate('');
        setReason('');
        setSuccess(data.message || 'Points updated successfully');
      } else {
        setError(data.error || 'Failed to update points');
      }
    } catch (error) {
      setError('Failed to update points');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Loyalty Program</h1>
          <p className="text-muted-foreground">
            Earn and redeem loyalty points for rewards
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="animate-pulse">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Program</h1>
        <p className="text-muted-foreground">
          Earn and redeem loyalty points for rewards
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-800">{success}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Current Balance
          </CardTitle>
          <CardDescription>
            Your current loyalty points balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {points.toLocaleString()}
            </div>
            <Badge variant="secondary" className="text-lg">
              Points
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Manage Points
          </CardTitle>
          <CardDescription>
            Earn, redeem, or adjust your loyalty points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={action} onValueChange={(value: 'earn' | 'redeem' | 'adjust') => setAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earn">Earn Points</SelectItem>
                  <SelectItem value="redeem">Redeem Points</SelectItem>
                  <SelectItem value="adjust">Adjust Points</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                value={pointsToUpdate}
                onChange={(e) => setPointsToUpdate(e.target.value)}
                placeholder="Enter points..."
                disabled={isUpdating}
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Purchase, Reward, Adjustment"
                disabled={isUpdating}
              />
            </div>
          </div>
          <Button 
            onClick={updatePoints} 
            disabled={!pointsToUpdate || !reason || isUpdating}
            className="w-full"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {action === 'earn' ? 'Earn Points' : action === 'redeem' ? 'Redeem Points' : 'Adjust Points'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>
            Learn how to earn and use your loyalty points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Earning Points</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Make purchases to earn points</li>
                <li>• Refer friends for bonus points</li>
                <li>• Complete special promotions</li>
                <li>• Write product reviews</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Redeeming Points</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use points for discounts</li>
                <li>• Redeem for free shipping</li>
                <li>• Get exclusive products</li>
                <li>• Access VIP events</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 