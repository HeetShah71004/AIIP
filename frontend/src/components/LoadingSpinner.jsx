import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";

const LoadingSpinner = ({ fullPage = false, message = "Loading...", size = 40, className }) => {
  if (fullPage) {
    return (
      <div className={cn("min-h-screen flex flex-col justify-center items-center bg-background gap-4", className)}>
        <div className="relative flex justify-center items-center">
          <div 
            className="absolute rounded-full bg-primary blur-[40px] opacity-20"
            style={{ width: `${size + 20}px`, height: `${size + 20}px` }}
          />
          <Loader2 className="animate-spin text-primary" size={size} />
        </div>
        {message && <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{message}</p>}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Loader2 className="animate-spin" size={size} />
      {message && <span className="text-sm font-medium">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;
