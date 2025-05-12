import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = "rounded-lg font-medium relative inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm focus:ring-primary/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm focus:ring-secondary/20",
    outline: "bg-transparent border border-border text-foreground hover:bg-background focus:ring-border",
    ghost: "bg-transparent text-foreground hover:bg-secondary/20 focus:ring-secondary/10",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm focus:ring-destructive/20"
  };
  
  const sizeClasses = {
    sm: "text-sm py-1.5 px-3",
    md: "text-sm py-2.5 px-4",
    lg: "text-base py-3 px-5"
  };
  
  const disabledClasses = (disabled || isLoading) ? "opacity-70 cursor-not-allowed active:scale-100" : "";
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </button>
  );
};