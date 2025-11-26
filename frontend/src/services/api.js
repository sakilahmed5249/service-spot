import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
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

// Customer APIs
export const customerAPI = {
  signup: (data) => api.post('/customer/signup', data),
  login: (data) => api.post('/customer/login', data),
  update: (id, data) => api.put(`/customer/update/${id}`, data),
  delete: (id) => api.delete(`/customer/delete/${id}`),
  getById: (id) => api.get(`/customer/${id}`),
};

// Provider APIs
export const providerAPI = {
  signup: (data) => api.post('/provider/signup', data),
  login: (email) => api.post('/provider/login', { params: { email } }),
  update: (data) => api.put('/provider/update', data),
  delete: (id) => api.delete(`/provider/delete/${id}`),
  getAll: () => api.get('/provider/all'),
  getById: (id) => api.get(`/provider/${id}`),
  searchByCity: (city) => api.get('/provider/search', { params: { city } }),
};

// Service APIs (to be implemented in backend)
export const serviceAPI = {
  search: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getByProvider: (providerId) => api.get(`/services/provider/${providerId}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// Booking APIs (to be implemented in backend)
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getByUser: (userId, role) => api.get('/bookings', { params: { userId, role } }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}`, { status }),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

// Review APIs (to be implemented in backend)
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByProvider: (providerId) => api.get(`/providers/${providerId}/reviews`),
  getByBooking: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
};

// Availability APIs (to be implemented in backend)
export const availabilityAPI = {
  create: (data) => api.post('/availability', data),
  getByProvider: (providerId, date) => api.get(`/availability/provider/${providerId}`, { params: { date } }),
  update: (id, data) => api.put(`/availability/${id}`, data),
  delete: (id) => api.delete(`/availability/${id}`),
};

export default api;
