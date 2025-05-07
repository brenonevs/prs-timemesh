import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY);
      localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
      window.location.href = `${import.meta.env.VITE_APP_URL}/login`;
    }
    return Promise.reject(error);
  }
);

export default api; 