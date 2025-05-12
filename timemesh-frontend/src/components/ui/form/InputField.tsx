import React, { InputHTMLAttributes, ReactNode } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  label?: string;
  error?: string;
}

export const InputField = ({
  icon,
  label,
  error,
  className = '',
  ...props
}: InputFieldProps) => {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={props.id || props.name} 
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          className={`w-full ${icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-lg bg-input text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${error ? 'border-destructive' : ''} ${className}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};