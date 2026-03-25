import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const InterviewTimer = ({ 
  timeLimit = 3, // in minutes (used as fallback or for totalSeconds calculation)
  initialSeconds = null, // exact seconds to start from
  onTimeExpired = () => {},
  isActive = true,
  isPaused = false,
  onTimeUpdate = () => {},
  compact = false
}) => {
  const [timeRemaining, setTimeRemaining] = useState(initialSeconds !== null ? initialSeconds : timeLimit * 60);
  const [isExpired, setIsExpired] = useState(false);
  const onTimeExpiredRef = useRef(onTimeExpired);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  const totalSeconds = timeLimit * 60;
  const percentageRemaining = (timeRemaining / totalSeconds) * 100;

  // Determine color based on time remaining
  const getColorClass = () => {
    if (isExpired) return 'text-red-600 bg-red-50 border-red-300';
    if (percentageRemaining > 50) return 'text-green-600 bg-green-50 border-green-300';
    if (percentageRemaining > 20) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
    return 'text-red-600 bg-red-50 border-red-300';
  };

  const getProgressColor = () => {
    if (isExpired) return 'bg-red-500';
    if (percentageRemaining > 50) return 'bg-green-500';
    if (percentageRemaining > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    onTimeExpiredRef.current = onTimeExpired;
  }, [onTimeExpired]);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    if (!isActive || isPaused || isExpired) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);
        
        // Call the update callback
        onTimeUpdateRef.current(newTime);

        // Check if time expired
        if (newTime === 0 && !isExpired) {
          setIsExpired(true);
          onTimeExpiredRef.current();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, isExpired]);

  // Reset when timeLimit or initialSeconds changes (new question)
  useEffect(() => {
    setTimeRemaining(initialSeconds !== null ? initialSeconds : timeLimit * 60);
    setIsExpired(false);
  }, [timeLimit, initialSeconds]);

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 px-3 py-1.5 rounded-xl border transition-all duration-500 shadow-sm",
        isExpired ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-emerald-50/50 border-emerald-100 text-emerald-600"
      )}>
        <div className="flex items-center gap-2">
          <Clock size={14} className={cn(isExpired && "animate-pulse")} />
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Time</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm font-bold tabular-nums tracking-tight">
            {formatTime(timeRemaining)}
          </span>
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
            <div
              className={cn("h-full transition-all duration-700 ease-out", getProgressColor())}
              style={{ width: `${percentageRemaining}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-2 p-4 rounded-lg border",
      getColorClass()
    )}>
      {/* Timer Display */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className={isExpired ? 'animate-pulse' : ''} />
          <span className="text-sm font-medium">Time Remaining</span>
        </div>
        <div className="text-2xl font-bold tabular-nums">
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", getProgressColor())}
          style={{ width: `${percentageRemaining}%` }}
        />
      </div>

      {/* Status Messages */}
      {isExpired && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertCircle size={16} />
          <span>Time's up! Your answer has been submitted.</span>
        </div>
      )}

      {percentageRemaining > 0 && percentageRemaining <= 20 && !isExpired && (
        <div className="flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          <span>Time pressure! Hurry to complete your answer.</span>
        </div>
      )}

      {/* Difficulty Badge */}
      <div className="flex justify-between items-center text-xs">
        <Badge variant="outline" className="bg-white/50">
          {Math.floor(percentageRemaining)}% time left
        </Badge>
      </div>
    </div>
  );
};

export default InterviewTimer;
