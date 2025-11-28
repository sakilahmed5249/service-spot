import axios from 'axios';

/**
 * Replace this with your backend URL when ready (e.g. 'http://localhost:8080/api')
 * or wire to env var later if you prefer.
 */
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // optional: avoid hanging requests in dev
  timeout: 10000,
});

// Request interceptor: attach token if present
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

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear session and navigate to login
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // full reload to landing/login — acceptable during early dev
        window.location.href = '/login';
      } catch (e) {
        /* ignore */
      }
    }
    return Promise.reject(error);
  }
);

/* ---------------------------
   Customer APIs
   --------------------------- */
export const customerAPI = {
  signup: (data) => api.post('/auth/register/customer', data),
  login: (data) => api.post('/auth/login', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getById: (id) => api.get(`/users/${id}`),
};

/* ---------------------------
   Provider APIs
   --------------------------- */
export const providerAPI = {
  signup: (data) => api.post('/auth/register/provider', data),
  login: (data) => api.post('/auth/login', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getAll: () => api.get('/users/providers/search', { params: { keyword: '' } }),
  getById: (id) => api.get(`/users/${id}`),
  searchByCity: (city) => api.get(`/users/providers/city/${city}`),
};

/* ---------------------------
   Service APIs
   --------------------------- */
export const serviceAPI = {
  search: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getByProvider: (providerId) => api.get(`/services/provider/${providerId}`),
  create: (data, providerId) => api.post('/services', data, { params: { providerId } }),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

/* ---------------------------
   Booking APIs
   --------------------------- */
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getByUser: (userId, role) => api.get('/bookings', { params: { userId, role } }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}`, { status }),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

/* ---------------------------
   Review APIs
   --------------------------- */
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getByProvider: (providerId) => api.get(`/providers/${providerId}/reviews`),
  getByBooking: (bookingId) => api.get(`/reviews/booking/${bookingId}`),
};

/* ---------------------------
   Availability APIs
   --------------------------- */
export const availabilityAPI = {
  create: (data) => api.post('/availability', data),
  getByProvider: (providerId, date) =>
    api.get(`/availability/provider/${providerId}`, { params: { date } }),
  update: (id, data) => api.put(`/availability/${id}`, data),
  delete: (id) => api.delete(`/availability/${id}`),
};

export default api;
