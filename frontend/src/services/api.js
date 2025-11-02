import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const { access_token } = response.data;
          
          // Update stored token
          localStorage.setItem('accessToken', access_token);
          
          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // Retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// Fraud API
export const fraudAPI = {
  getRecent: (limit = 20, offset = 0) =>
    api.get(`/api/frauds/recent`, { params: { limit, offset } }),
  
  getStats: (period = '24h') =>
    api.get(`/api/frauds/stats`, { params: { period } }),
  
  getTimeline: (hours = 24) =>
    api.get(`/api/frauds/timeline`, { params: { hours } }),
};

// Transaction API
export const transactionAPI = {
  search: (filters) =>
    api.get(`/api/transactions/search`, { params: filters }),
  
  getById: (id) =>
    api.get(`/api/transactions/${id}`),
  
  getHistory: (id) =>
    api.get(`/api/transactions/${id}/history`),
  
  submitFeedback: (id, feedback) =>
    api.post(`/api/transactions/${id}/feedback`, feedback),
  
  predict: (data) =>
    api.post(`/api/transactions/predict`, data),
};

// Drift API
export const driftAPI = {
  getReports: (limit = 10, severity = null) =>
    api.get(`/api/drift/reports`, { params: { limit, severity } }),
  
  getLatest: () =>
    api.get(`/api/drift/latest`),
  
  getHistory: (days = 7) =>
    api.get(`/api/drift/history`, { params: { days } }),
  
  getStats: () =>
    api.get(`/api/drift/stats`),
};

// Metrics API
export const metricsAPI = {
  getDashboard: (period = '24h') =>
    api.get(`/api/metrics/dashboard`, { params: { period } }),
  
  getHourly: (hours = 24) =>
    api.get(`/api/metrics/hourly`, { params: { hours } }),
  
  getTopFeatures: (limit = 10) =>
    api.get(`/api/metrics/top-features`, { params: { limit } }),
};

// Admin User Management API
export const adminAPI = {
  // Create a new user
  createUser: (userData) =>
    api.post('/admin/users', userData),
  
  // List users with pagination and filters
  listUsers: (params = {}) =>
    api.get('/admin/users', { params }),
  
  // Get user by ID
  getUserById: (id) =>
    api.get(`/admin/users/${id}`),
  
  // Update user
  updateUser: (id, userData) =>
    api.put(`/admin/users/${id}`, userData),
  
  // Delete user
  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`),
  
  // Activate/Deactivate user
  toggleUserActivation: (id, isActive) =>
    api.patch(`/admin/users/${id}/activate`, { is_active: isActive }),
  
  // Change user role
  updateUserRole: (id, role) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  
  // Reset user password
  resetUserPassword: (id, newPassword) =>
    api.patch(`/admin/users/${id}/password`, { new_password: newPassword }),
};

export default api;
