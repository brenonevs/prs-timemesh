import api from './api';

export const authService = {
  async login(identifier: string, password: string) {
    const response = await api.post('/api/users/login/', { identifier, password });
    return response.data; // { access, refresh }
  },
  async register(data: { username: string; email: string; password: string; password2: string; first_name: string; last_name: string }) {
    const response = await api.post('/api/users/register/', data);
    return response.data;
  },
  async getMe() {
    const response = await api.get('/api/users/me/');
    return response.data;
  }
}; 