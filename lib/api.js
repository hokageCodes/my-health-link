// lib/api.js - Fixed version
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Separate axios instance for refresh requests to avoid interceptor loops
const refreshApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor: attach access token
api.interceptors.request.use(
  (config) => {
    // Don't add token for auth endpoints except /me
    const isAuthEndpoint = config.url?.includes('/auth/');
    const isMeEndpoint = config.url?.includes('/auth/me');
    const isPublicAuthEndpoint = isAuthEndpoint && !isMeEndpoint;
    
    if (!isPublicAuthEndpoint) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors for protected endpoints
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry auth endpoints (except /me)
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      const isMeEndpoint = originalRequest.url?.includes('/auth/me');
      
      if (isAuthEndpoint && !isMeEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
          return Promise.reject(new Error('Token refresh failed'));
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        console.log("🔄 Attempting token refresh...");

        // Use separate instance to avoid interceptor loop
        const response = await refreshApi.post("/auth/refresh", {
          refreshToken: refreshToken
        });

        if (response.data?.success && response.data?.data?.accessToken) {
          const { accessToken } = response.data.data;
          
          // Store new token
          localStorage.setItem("accessToken", accessToken);
          
          // Update default auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Update original request header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          console.log("✅ Token refresh successful");
          
          // Process queued requests
          processQueue(null, accessToken);
          
          // Retry original request
          return api(originalRequest);
        } else {
          throw new Error("Invalid refresh response structure");
        }

      } catch (refreshError) {
        console.log("❌ Token refresh failed:", refreshError.message);
        
        processQueue(refreshError, null);
        
        // Clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete api.defaults.headers.common['Authorization'];
        
        // Only redirect if we're not already on auth pages
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const authPaths = ['/login', '/register', '/verify', '/forgot-password', '/reset-password'];
          const isOnAuthPage = authPaths.some(path => currentPath.includes(path));
          
          if (!isOnAuthPage && currentPath !== '/') {
            console.log("🔄 Redirecting to login due to auth failure");
            window.location.href = "/login";
          }
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;