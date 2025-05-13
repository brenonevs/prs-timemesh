import axios from 'axios';

const api = axios.create({
  baseURL: '/',
});

api.interceptors.request.use((config) => {
  if (!config.url?.includes('/api/users/register/')) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api; 