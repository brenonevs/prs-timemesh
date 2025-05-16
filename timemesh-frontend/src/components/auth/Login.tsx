import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TelescopeIcon as EnvelopeIcon, DoorClosedIcon as LockClosedIcon } from 'lucide-react';
import { SocialLoginButtons } from './SocialLoginButtons';
import { InputField } from '../ui/form/InputField';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { FaApple, FaGoogle, FaTimes, FaEnvelope, FaLock } from 'react-icons/fa';
import { authService } from '../../services/auth';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const username = formData.username.split('@')[0];
      const { access, refresh } = await authService.login(username, formData.password);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      await login(username, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Usuário ou senha inválidos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border animate-fadeIn">
      <div className="flex flex-col items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Don't have an account yet? <button 
            className="text-primary hover:text-primary/80 transition" 
            onClick={() => navigate('/register')}
          >
            Sign up
          </button>
        </p>
      </div>
      
      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <InputField
          icon={<EnvelopeIcon size={18} />}
          name="username"
          type="email"
          placeholder="Email address"
          value={formData.username}
          onChange={handleChange}
          required
        />
        
        <InputField
          icon={<LockClosedIcon size={18} />}
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <div className="flex items-center justify-between mt-1 mb-2">
          <div className="flex items-center">
            <input 
              id="remember-me" 
              type="checkbox" 
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-muted-foreground">
              Remember me
            </label>
          </div>
          <button 
            type="button" 
            className="text-sm text-primary hover:text-primary/80 transition"
          >
            Forgot password?
          </button>
        </div>
        
        {error && (
          <div className="text-destructive text-sm text-center my-1 animate-shake">{error}</div>
        )}
        
        <Button type="submit" variant="primary" isLoading={isLoading} className="mt-2">
          Sign In
        </Button>
      </form>
      
      <div className="flex items-center w-full gap-2 my-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-muted-foreground text-xs font-medium">OR CONTINUE WITH</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      
      <SocialLoginButtons />
    </div>
  );
};