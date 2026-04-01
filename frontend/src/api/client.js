import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api/v1';

// Production safety check
if (import.meta.env.PROD && baseURL.includes('localhost')) {
  console.warn('⚠️ PROD ERROR: Backend URL is still pointing to localhost. Check Vercel environment variables.');
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh (optional but good)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // This endpoint should be implemented in backend if not already
          // For now, redirect to login if auto-refresh fails
        } catch (refreshError) {
          // Token refresh failed
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
