import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL.replace(/\/$/, '');

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export const authService = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/token/`, data);
    return response.data;
  },

  async register(data: RegisterData): Promise<void> {
    await axios.post(`${API_URL}/api/users/register/`, data);
  },

  async refreshToken(refresh: string): Promise<AuthResponse> {
    const response = await axios.post(`${API_URL}/api/token/refresh/`, { refresh });
    return response.data;
  },

  setTokens(access: string, refresh: string) {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },

  getTokens() {
    return {
      access: localStorage.getItem('accessToken'),
      refresh: localStorage.getItem('refreshToken'),
    };
  },

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
}; 