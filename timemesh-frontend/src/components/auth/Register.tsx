import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TelescopeIcon as EnvelopeIcon, DoorClosedIcon as LockClosedIcon, UserIcon } from 'lucide-react';
import { SocialLoginButtons } from './SocialLoginButtons';
import { InputField } from '../ui/form/InputField';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      await register(formData.name, formData.username, formData.email, formData.password);
      navigate('/success');
    } catch (err: any) {
      const errorData = err.response?.data;
      
      if (errorData?.details) {
        const { username, email } = errorData.details;
        
        if (username && email) {
          setError('This email and username are already in use.');
        } else if (email) {
          setError('This email is already in use.');
        } else if (username) {
          setError('This username is already in use.');
        } else {
          setError(errorData.error || 'Registration failed. Please try again.');
        }
      } else if (errorData?.error) {
        setError(errorData.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-xl p-8 border border-border animate-fadeIn">
      <div className="flex flex-col items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Create Account</h1>
        <p className="text-sm text-muted-foreground">
          Already have an account? <button 
            className="text-primary hover:text-primary/80 transition" 
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>
        </p>
      </div>
      
      <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
        <InputField
          icon={<UserIcon size={18} />}
          name="name"
          type="text"
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="name"
        />

        <InputField
          icon={<UserIcon size={18} />}
          name="username"
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          autoComplete="username"
        />
        
        <InputField
          icon={<EnvelopeIcon size={18} />}
          name="email"
          type="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />
        
        <InputField
          icon={<LockClosedIcon size={18} />}
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />
        
        <InputField
          icon={<LockClosedIcon size={18} />}
          name="confirmPassword"
          type="password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
        />
        
        {error && (
          <div className="text-destructive text-sm text-center my-1 animate-shake">{error}</div>
        )}
        
        <Button type="submit" variant="primary" isLoading={isLoading} className="mt-2">
          Create Account
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