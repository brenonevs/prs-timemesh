import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SuccessPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl p-8 border border-border animate-fadeIn">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-success" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Conta criada com sucesso!
          </h1>
          
          <p className="text-muted-foreground mb-8">
            Sua conta foi criada com sucesso. Você será redirecionado para a página de login em alguns segundos.
          </p>

          <div className="w-full space-y-4">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Ir para o login
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="text-sm text-muted-foreground">
              Redirecionando em <span className="font-medium text-foreground">5</span> segundos...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 