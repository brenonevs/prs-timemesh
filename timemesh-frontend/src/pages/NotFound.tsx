import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary">404</h1>
        <h2 className="text-3xl font-semibold text-foreground mt-6">Page Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard')}
            className="px-6"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};