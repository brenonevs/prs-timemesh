import React from 'react';

export const BackgroundLines = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Outer frame */}
      <div className="absolute inset-8 border border-border/30 rounded-3xl opacity-50" />
      
      {/* Inner frame */}
      <div className="absolute inset-16 border border-border/20 rounded-2xl opacity-40" />
      
      {/* Corner accents */}
      <div className="absolute top-12 left-12 w-6 h-3 bg-card rounded-lg border border-border/50 shadow-inner opacity-80" />
      <div className="absolute top-12 right-12 w-6 h-3 bg-card rounded-lg border border-border/50 shadow-inner opacity-80" />
      <div className="absolute bottom-12 left-12 w-6 h-3 bg-card rounded-lg border border-border/50 shadow-inner opacity-80" />
      <div className="absolute bottom-12 right-12 w-6 h-3 bg-card rounded-lg border border-border/50 shadow-inner opacity-80" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-secondary/5 rounded-full blur-3xl opacity-20" />
      
      {/* Grid lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    </div>
  );
};