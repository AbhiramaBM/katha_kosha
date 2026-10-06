import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
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

// Token Refresh Queue Mutex
let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Response Interceptor: Token Expiration & Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Expired or Invalid Token)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(error);
      }

      // If another request is already refreshing, wait for it
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;
        const newRefreshToken = res.data?.data?.refreshToken || res.data?.refreshToken;

        if (newAccessToken) {
          localStorage.setItem('auth_token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken);
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          onRefreshed(newAccessToken);
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth_user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';

    const errObj = new Error(message);
    errObj.response = error.response;
    return Promise.reject(errObj);
  }
);

// Auth Endpoints
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  changePassword: (data) => apiClient.post('/auth/change-password', data)
};

// Authors Endpoints
export const authorsApi = {
  list: (params = {}) => apiClient.get('/authors', { params }),
  getById: (id) => apiClient.get(`/authors/${id}`),
  create: (data) => apiClient.post('/authors', data),
  update: (id, data) => apiClient.patch(`/authors/${id}`, data),
  uploadPhoto: (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.post(`/authors/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getStories: (id, params = {}) => apiClient.get(`/authors/${id}/stories`, { params }),
  delete: (id) => apiClient.delete(`/authors/${id}`)
};

// Stories Endpoints
export const storiesApi = {
  list: (params = {}) => apiClient.get('/stories', { params }),
  getById: (id) => apiClient.get(`/stories/${id}`),
  create: (storyData, maybeFile = null) => {
    if (storyData instanceof FormData) {
      return apiClient.post('/stories', storyData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    if (storyData.content_type === 'pdf' || maybeFile) {
      const formData = new FormData();
      Object.keys(storyData).forEach((key) => {
        if (key === 'references' && Array.isArray(storyData[key])) {
          formData.append('references', JSON.stringify(storyData[key]));
        } else if (storyData[key] !== null && storyData[key] !== undefined) {
          formData.append(key, storyData[key]);
        }
      });
      if (maybeFile) {
        formData.append('file', maybeFile);
      }
      return apiClient.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return apiClient.post('/stories', storyData);
  },
  update: (id, storyData, maybeFile = null) => {
    if (storyData instanceof FormData) {
      return apiClient.patch(`/stories/${id}`, storyData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    if (maybeFile || storyData.content_type === 'pdf') {
      const formData = new FormData();
      Object.keys(storyData).forEach((key) => {
        if (key === 'references' && Array.isArray(storyData[key])) {
          formData.append('references', JSON.stringify(storyData[key]));
        } else if (storyData[key] !== null && storyData[key] !== undefined) {
          formData.append(key, storyData[key]);
        }
      });
      if (maybeFile) {
        formData.append('file', maybeFile);
      }
      return apiClient.patch(`/stories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return apiClient.patch(`/stories/${id}`, storyData);
  },
  replacePdf: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.put(`/stories/${id}/pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => apiClient.delete(`/stories/${id}`)
};

// Users Endpoints (Admin only)
export const usersApi = {
  list: (params = {}) => apiClient.get('/users', { params }),
  create: (userData) => apiClient.post('/users', userData),
  update: (id, data) => apiClient.patch(`/users/${id}`, data),
  resetPassword: (id, newPassword) => apiClient.post(`/users/${id}/reset-password`, { password: newPassword })
};

export default apiClient;
