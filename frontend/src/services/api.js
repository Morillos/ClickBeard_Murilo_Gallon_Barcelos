import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Barber endpoints
export const barberAPI = {
  getAll: () => api.get('/barbers'),
  getById: (id) => api.get(`/barbers/${id}`),
  getBySpecialty: (specialtyId) => api.get(`/barbers/specialty/${specialtyId}`),
  create: (data) => api.post('/barbers', data),
  update: (id, data) => api.put(`/barbers/${id}`, data),
  delete: (id) => api.delete(`/barbers/${id}`),
  // Especialidades do barbeiro
  getSpecialties: (id) => api.get(`/barbers/${id}/specialties`),
  updateSpecialties: (id, specialtyIds) =>
    api.put(`/barbers/${id}/specialties`, { specialty_ids: specialtyIds }),
};

// Specialty endpoints
export const specialtyAPI = {
  getAll: () => api.get('/specialties'),
  getById: (id) => api.get(`/specialties/${id}`),
  create: (data) => api.post('/specialties', data),
  update: (id, data) => api.put(`/specialties/${id}`, data),
  delete: (id) => api.delete(`/specialties/${id}`),
};

// Appointment endpoints
export const appointmentAPI = {
  getAvailableSlots: (barberId, date) =>
    api.get('/appointments/available-slots', { params: { barberId, date } }),
  create: (data) => api.post('/appointments', data),
  getUserAppointments: () => api.get('/appointments/my-appointments'),
  getAllAppointments: (params) => api.get('/appointments/all', { params }),
  getTodayAppointments: () => api.get('/appointments/today'),
  getFutureAppointments: () => api.get('/appointments/future'),
  cancel: (id) => api.patch(`/appointments/${id}/cancel`),
  complete: (id) => api.patch(`/appointments/${id}/complete`),
};

export default api;
