import axios from 'axios';
import TokenService from './tokenService';

const BASE_URL = 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Don't add token for login endpoint
    if (config.url === '/user-login/') {
      return config;
    }

    // Check if the request contains FormData
    if (config.data instanceof FormData) {
      // Remove Content-Type header to let the browser set it with boundary
      delete config.headers['Content-Type'];
    }

    const token = TokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the final request configuration
    console.log('Final Request Config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      isFormData: config.data instanceof FormData,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to track if we're refreshing
let isRefreshing = false;

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('Axios Interceptor Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      error: error.message,
    });

    const originalRequest = error.config;

    // Only attempt refresh if:
    // 1. It's a 401 error
    // 2. We haven't already tried refreshing for this request
    // 3. We're not currently in the middle of refreshing
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      console.log('Attempting token refresh...', {
        isRefreshing,
        originalUrl: originalRequest.url,
      });

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('Calling refreshToken()');
        const newToken = await TokenService.refreshToken();
        console.log('Token refresh successful:', !!newToken);

        // Update the authorization header
        originalRequest.headers[
          'Authorization'
        ] = `Bearer ${TokenService.getToken()}`;
        isRefreshing = false;

        console.log('Retrying original request:', originalRequest.url);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        isRefreshing = false;
        // Handle refresh failure (e.g., redirect to login)
        TokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;