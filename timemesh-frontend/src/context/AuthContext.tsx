import React, { createContext, ReactNode, useState } from 'react';
import { authService } from '../services/auth';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const login = async (email: string, password: string) => {
    // This would be an API call in a real application
    // For demo purposes, we'll just set a mock user
    const mockUser = {
      id: '123',
      name: 'John Doe',
      email,
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };
  
  const register = async (name: string, email: string, password: string) => {
    // Divide o nome em primeiro e último nome
    const [first_name, ...rest] = name.trim().split(' ');
    const last_name = rest.join(' ') || '-';

    // Gere um username a partir do email
    const username = email.split('@')[0];

    // Chama a API de registro
    const response = await authService.register({
      username,
      email,
      password,
      password2: password,
      first_name,
      last_name,
    });

    // Se a resposta trouxer o usuário, salve no contexto/localStorage
    if (response && response.user) {
      setUser({
        id: '0', // Ajuste se o backend retornar um id real
        name: `${response.user.first_name} ${response.user.last_name}`,
        email: response.user.email,
      });
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: '0',
          name: `${response.user.first_name} ${response.user.last_name}`,
          email: response.user.email,
        })
      );
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};