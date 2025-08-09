'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Gift, Star, Target, TrendingUp, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Achievement {
  id: string;
  achievement: string;
  points: number;
  badge?: string;
  unlockedAt: string;
}

interface GamificationData {
  achievements: Achievement[];
  totalPoints: number;
  badges: string[];
  achievementCount: number;
}

export default function GamificationPage() {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/account/gamification');
      if (response.ok) {
        const data = await response.json();
        setGamificationData(data.gamification);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch gamification data');
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getAchievementIcon = (achievement: string) => {
    switch (achievement.toLowerCase()) {
      case 'first_purchase':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'loyalty_signup':
        return <Star className="h-6 w-6 text-blue-500" />;
      case 'referral_used':
        return <Gift className="h-6 w-6 text-green-500" />;
      case 'high_value_customer':
        return <TrendingUp className="h-6 w-6 text-purple-500" />;
      default:
        return <Award className="h-6 w-6 text-gray-500" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge.toLowerCase()) {
      case 'vip':
        return 'bg-purple-100 text-purple-800';
      case 'early_adopter':
        return 'bg-blue-100 text-blue-800';
      case 'loyal_customer':
        return 'bg-green-100 text-green-800';
      case 'high_spender':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
          <h1 className="text-3xl font-bold mb-2">Gamification Center</h1>
          <p className="text-gray-600">
            Track your achievements, badges, and loyalty points
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {gamificationData && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gamificationData.totalPoints}</div>
                  <p className="text-xs text-muted-foreground">
                    Earn more points by making purchases and completing achievements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievements</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gamificationData.achievementCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Unlocked achievements
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Badges</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{gamificationData.badges.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Special badges earned
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Badges */}
            {gamificationData.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Your Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {gamificationData.badges.map((badge, index) => (
                      <Badge key={index} className={getBadgeColor(badge)}>
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements ({gamificationData.achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gamificationData.achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gamificationData.achievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-4 border rounded-lg">
                        {getAchievementIcon(achievement.achievement)}
                        <div className="flex-1">
                          <div className="font-medium">
                            {achievement.achievement.replace(/_/g, ' ')}
                          </div>
                          <div className="text-sm text-gray-600">
                            +{achievement.points} points
                          </div>
                          <div className="text-xs text-gray-500">
                            Unlocked {formatDate(achievement.unlockedAt)}
                          </div>
                        </div>
                        {achievement.badge && (
                          <Badge className={getBadgeColor(achievement.badge)}>
                            {achievement.badge}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No achievements unlocked yet.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Make purchases and complete actions to unlock achievements!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Available Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 border rounded-lg opacity-60">
                    <Trophy className="h-6 w-6 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">First Purchase</div>
                      <div className="text-sm text-gray-600">+100 points</div>
                      <div className="text-xs text-gray-500">Make your first purchase</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg opacity-60">
                    <Star className="h-6 w-6 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">Loyalty Signup</div>
                      <div className="text-sm text-gray-600">+50 points</div>
                      <div className="text-xs text-gray-500">Join our loyalty program</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg opacity-60">
                    <Gift className="h-6 w-6 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">Referral Used</div>
                      <div className="text-sm text-gray-600">+25 points</div>
                      <div className="text-xs text-gray-500">Use a referral code</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 border rounded-lg opacity-60">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium">High Value Customer</div>
                      <div className="text-sm text-gray-600">+200 points</div>
                      <div className="text-xs text-gray-500">Spend over $1000</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 