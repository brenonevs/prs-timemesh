import React from 'react';
import { Clock } from 'lucide-react';

export const Logo = () => {
  return (
    <div className="flex flex-col items-center mb-4">
      <div className="relative group">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/90 to-primary-foreground/70 flex items-center justify-center shadow-lg">
          <Clock className="w-7 h-7 text-primary-foreground animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/60 to-primary-foreground/40 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
      <h2 className="text-xl font-bold mt-3 text-foreground tracking-tight">TimeMesh</h2>
    </div>
  );
};