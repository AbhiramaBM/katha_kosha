import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Token Expiration & Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Expired or Invalid Token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Attempt refreshing the access token
          const res = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken
          });

          const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;

          if (newAccessToken) {
            localStorage.setItem('auth_token', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          // Refresh failed - purge credentials and trigger logout
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('auth_user');
          window.dispatchEvent(new CustomEvent('auth:expired'));
        }
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
    }

    // Extract user-friendly error message
    const message = 
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
