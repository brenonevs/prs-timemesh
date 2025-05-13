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
  
  const login = async (username: string, password: string) => {
    const { access, refresh } = await authService.login(username, password);
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    const userData = await authService.getMe();
    const name = `${userData.first_name} ${userData.last_name}`.trim() || userData.username;
    setUser({
      id: userData.id,
      name,
      email: userData.email,
    });
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: userData.id,
        name,
        email: userData.email,
      })
    );
  };
  
  const register = async (name: string, email: string, password: string) => {
    const [first_name, ...rest] = name.trim().split(' ');
    const last_name = rest.join(' ') || '-';

    const username = email.split('@')[0];

    const response = await authService.register({
      username,
      email,
      password,
      password2: password,
      first_name,
      last_name,
    });

    if (response && response.user) {
      setUser({
        id: '0', 
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