import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const LeaderboardItem = ({ rank, name, xp }) => (
  <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
    <div className="flex items-center">
      <span className="font-bold w-8">{rank}</span>
      <span>{name}</span>
    </div>
    <span className="font-semibold">{xp} XP</span>
  </div>
);

const Gamification = () => {
  const leaderboardData = [
    { rank: 1, name: 'Alice', xp: 15000 },
    { rank: 2, name: 'Bob', xp: 13500 },
    { rank: 3, name: 'You', xp: 12000 },
    { rank: 4, name: 'Charlie', xp: 11000 },
    { rank: 5, name: 'David', xp: 9500 },
  ];

  const handleAchievementUnlock = () => {
    toast.success('Achievement Unlocked: First Interview!', {
      icon: <Trophy />,
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Your Progress & Rankings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Personal Rank */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Rank</span>
              <Trophy className="text-yellow-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-5xl font-bold">#3</p>
            <Badge className="mt-2">Top 10%</Badge>
          </CardContent>
        </Card>

        {/* XP & Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>XP & Level</span>
              <Star className="text-yellow-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center mb-2">12,000 XP</p>
            <Progress value={60} className="mb-1" />
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">Level 12 (60% to Level 13)</p>
          </CardContent>
        </Card>

        {/* Weekly Challenge */}
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weekly Challenge</span>
              <Zap className="text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold mb-2">Complete 3 mock interviews</p>
            <div className="flex items-center justify-between">
              <Progress value={33} className="w-3/4" />
              <span className="text-sm font-medium">1 / 3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Global Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboardData.map((item) => (
              <LeaderboardItem key={item.rank} {...item} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Toast Button for Demo */}
      <div className="mt-6 text-center">
        <button onClick={handleAchievementUnlock} className="text-sm text-gray-500 hover:underline">
          (Demo: Unlock an achievement)
        </button>
      </div>
    </div>
  );
};

export default Gamification;
