import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '@config/env';
import { oktaAuth } from '@auth/oktaConfig';

/**
 * Axios Instance Configuration
 * Pre-configured axios instance with base URL, interceptors, and auth handling
 * 
 * When auth is enabled:
 * - Attaches access token to all requests
 * - Handles 401 by refreshing token (once per request, no infinite loops)
 * 
 * When auth is bypassed:
 * - Sends mock token header for backend dev mode
 */

// Extend axios config to track retry attempts
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: env.api.baseUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * Attaches auth token to all outgoing requests
 */
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip auth header when auth is bypassed
    if (env.auth.bypassAuth) {
      // Optionally add a mock header for backend dev mode
      config.headers['X-Dev-Mode'] = 'true';
      return config;
    }

    try {
      const tokens = await oktaAuth.tokenManager.getTokens();
      const accessToken = tokens?.accessToken?.accessToken;
      
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('Error attaching auth token:', error);
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common response scenarios including auth errors
 * ! IMPORTANT: Only retries once to prevent infinite loops
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // Skip token refresh when auth is bypassed
    if (env.auth.bypassAuth) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - attempt token refresh ONCE
    // ! _retry flag prevents infinite loops when refresh doesn't fix the issue
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent loops
      
      try {
        console.log('401 received, attempting token refresh...');
        await oktaAuth.tokenManager.renew('accessToken');
        const tokens = await oktaAuth.tokenManager.getTokens();
        const newToken = tokens?.accessToken?.accessToken;
        
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Token refresh failed - redirect to login
        console.error('Token refresh failed, signing out:', refreshError);
        await oktaAuth.signOut();
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 500+ Server errors
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
export default axiosInstance;
