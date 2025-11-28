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
  signup: (data) => api.post('/customer/signup', data),
  login: (data) => api.post('/customer/login', data),
  update: (id, data) => api.put(`/customer/update/${id}`, data),
  delete: (id) => api.delete(`/customer/delete/${id}`),
  getById: (id) => api.get(`/customer/${id}`),
};

/* ---------------------------
   Provider APIs
   NOTE: providerAPI.login now sends { email } as JSON body.
   Change this if your backend expects query params or a different payload.
   --------------------------- */
export const providerAPI = {
  signup: (data) => api.post('/provider/signup', data),
  // send email as JSON body (recommended). If backend expects query param, change accordingly.
  login: (email) => api.post('/provider/login', { email }),
  update: (data) => api.put('/provider/update', data),
  delete: (id) => api.delete(`/provider/delete/${id}`),
  getAll: () => api.get('/provider/all'),
  getById: (id) => api.get(`/provider/${id}`),
  searchByCity: (city) => api.get('/provider/search', { params: { city } }),
};

/* ---------------------------
   Service APIs
   --------------------------- */
export const serviceAPI = {
  search: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getByProvider: (providerId) => api.get(`/services/provider/${providerId}`),
  create: (data) => api.post('/services', data),
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