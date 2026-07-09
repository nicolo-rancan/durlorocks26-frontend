import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me'),
};

export const prevenditeApi = {
  getStats: (edizione) => api.get('/prevendite/stats', { params: { edizione } }),
  list: (edizione, search) => api.get('/prevendite', { params: { edizione, search } }),
  create: (data) => api.post('/prevendite', data),
  getByCodice: (codice) => api.get(`/prevendite/${codice}`),
  valida: (codice) => api.post(`/prevendite/${codice}/valida`),
  trasferisci: (id, data) => api.put(`/prevendite/${id}/trasferisci`, data),
  delete: (id) => api.delete(`/prevendite/${id}`),
};

export const usersApi = {
  list: () => api.get('/users'),
  create: (username, password) => api.post('/users', { username, password }),
  changePassword: (id, password) => api.put(`/users/${id}/password`, { password }),
  delete: (id) => api.delete(`/users/${id}`),
};
