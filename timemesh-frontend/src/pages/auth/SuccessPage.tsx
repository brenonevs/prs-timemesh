import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SuccessPage = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 border border-border animate-fadeIn">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Account created successfully!
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Your account has been created successfully. You will be redirected to the login page in a few seconds.
          </p>

          <div className="w-full space-y-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Go to login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="text-sm text-muted-foreground">
              Redirecting in <span className="font-medium text-foreground">{countdown}</span> seconds...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 