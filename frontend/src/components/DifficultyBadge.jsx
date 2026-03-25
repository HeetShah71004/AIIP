import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const DifficultyBadge = ({ difficulty = 'Medium', eloRating = 1400, compact = false }) => {
  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'Easy':
        return 'bg-green-100/80 text-green-700 border-green-200 hover:bg-green-100';
      case 'Medium':
        return 'bg-amber-100/80 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'Hard':
        return 'bg-rose-100/80 text-rose-700 border-rose-200 hover:bg-rose-100';
      default:
        return 'bg-muted text-muted-foreground border-border';
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
    <div className={cn("flex gap-2", compact ? "flex-row items-center" : "flex-col")}>
      <Badge 
        variant="outline"
        className={cn("flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", getDifficultyColor())}
      >
        {getDifficultyIcon()}
        <span>{difficulty}</span>
      </Badge>
      {/* Elo display removed per user request */}
    </div>
  );
};

export default DifficultyBadge;
