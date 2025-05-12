import React from 'react';
import { Github, Mail } from 'lucide-react';
import { FaGoogle, FaApple } from 'react-icons/fa';

export const SocialLoginButtons = () => {
  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      <button 
        className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-card hover:bg-secondary/10 border border-border text-foreground transition-all duration-200 group"
        aria-label="Sign in with Google"
      >
        <FaGoogle className="text-lg text-[#EA4335] group-hover:scale-110 transition-transform" />
      </button>
      
      <button 
        className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-card hover:bg-secondary/10 border border-border text-foreground transition-all duration-200 group"
        aria-label="Sign in with Apple"
      >
        <FaApple className="text-lg group-hover:scale-110 transition-transform" />
      </button>
      
      <button 
        className="flex items-center justify-center py-2.5 px-4 rounded-lg bg-card hover:bg-secondary/10 border border-border text-foreground transition-all duration-200 group"
        aria-label="Sign in with Github"
      >
        <Github className="size-5 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};