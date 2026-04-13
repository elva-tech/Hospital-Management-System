import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Interceptor to add JWT token if it exists
api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem('hms_user');
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

export default api;
