import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const DifficultyBadge = ({ difficulty = 'Medium', eloRating = 1400 }) => {
  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200';
      case 'Hard':
        return 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDifficultyIcon = () => {
    switch(difficulty) {
      case 'Easy':
        return null;
      case 'Medium':
        return <Zap size={14} className="inline mr-1" />;
      case 'Hard':
        return <TrendingUp size={14} className="inline mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Badge 
        variant="outline"
        className={cn("flex items-center gap-1 px-3 py-1", getDifficultyColor())}
      >
        {getDifficultyIcon()}
        <span className="font-semibold">{difficulty}</span>
      </Badge>
      {eloRating && (
        <div className="text-xs text-muted-foreground">
          <span className="inline-block">Elo: {eloRating}</span>
        </div>
      )}
    </div>
  );
};

export default DifficultyBadge;
