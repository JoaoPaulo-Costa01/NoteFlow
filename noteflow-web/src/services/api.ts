import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7098/api',
});

// Injeta o JWT em toda requisição automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('noteflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se o token expirou, limpa e manda para o login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('noteflow_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;