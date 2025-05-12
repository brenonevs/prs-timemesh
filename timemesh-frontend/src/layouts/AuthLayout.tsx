import React, { ReactNode } from 'react';
import { BackgroundLines } from '../components/ui/backgrounds/BackgroundLines';
import { Logo } from '../components/ui/Logo';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden px-4 py-8">
      {/* Background elements */}
      <BackgroundLines />
      
      {/* Content container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <Logo />
        </div>
        {children}
      </div>
      
      <div className="absolute bottom-4 text-center w-full text-xs text-gray-600 z-10">
        © {new Date().getFullYear()} TimeMesh. All rights reserved.
      </div>
    </div>
  );
};