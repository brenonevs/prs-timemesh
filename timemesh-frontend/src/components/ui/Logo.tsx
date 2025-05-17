import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Logo = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button 
      onClick={() => navigate('/dashboard')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col items-center mb-4 transition-all duration-300 hover:scale-105 active:scale-95"
      aria-label="Go to dashboard"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/90 to-primary-foreground/70 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/20">
          <Clock 
            className={`w-7 h-7 text-primary-foreground transition-all duration-300 ${
              isHovered ? 'animate-spin-once' : 'animate-pulse'
            }`} 
          />
        </div>
        <div 
          className={`absolute inset-0 rounded-full bg-gradient-to-br from-primary/60 to-primary-foreground/40 blur-md transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-110' : 'opacity-70'
          }`} 
        />
      </div>
      <h2 className="text-xl font-bold mt-3 text-foreground tracking-tight transition-all duration-300 group-hover:text-primary">
        TimeMesh
      </h2>
    </button>
  );
};