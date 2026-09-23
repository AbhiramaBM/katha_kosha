import apiClient from './axios';

export const authApi = {
  // Login: POST /auth/login
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  // Register: POST /auth/register
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  // Logout: POST /auth/logout
  logout: () => {
    return apiClient.post('/auth/logout');
  },

  // Forgot Password: POST /auth/forgot-password
  forgotPassword: (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  // Reset Password: POST /auth/reset-password
  resetPassword: (token, password) => {
    return apiClient.post('/auth/reset-password', { token, password });
  },

  // Verify Email: POST /auth/verify-email
  verifyEmail: (token) => {
    return apiClient.post('/auth/verify-email', { token });
  },

  // Get Current Authenticated User: GET /auth/me
  getMe: () => {
    return apiClient.get('/auth/me');
  },

  // Change Password: POST /auth/change-password
  changePassword: (data) => {
    return apiClient.post('/auth/change-password', data);
  }
};
