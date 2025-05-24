import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});


const publicRoutes = [
  '/api/users/register/',
  '/api/users/login/',
  '/api/token/refresh/'
];

api.interceptors.request.use((config) => {

  if (!publicRoutes.some(route => config.url?.includes(route))) {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;


    if (error.response?.status === 401 && !originalRequest._retry && !publicRoutes.some(route => originalRequest.url?.includes(route))) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await api.post('/api/token/refresh/', { refresh: refreshToken });
        const { access } = response.data;

        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api; 