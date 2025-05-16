import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authService.getMe();
          const name = `${userData.first_name} ${userData.last_name}`.trim() || userData.username;
          setUser({
            id: userData.id,
            name,
            email: userData.email,
          });
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []);
  
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
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
      setIsAuthenticated(true);
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: userData.id,
          name,
          email: userData.email,
        })
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (name: string, username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const [first_name, ...rest] = name.trim().split(' ');
      const last_name = rest.join(' ') || '-';

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
        setIsAuthenticated(true);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: '0',
            name: `${response.user.first_name} ${response.user.last_name}`,
            email: response.user.email,
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register,
      logout, 
      isAuthenticated,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};