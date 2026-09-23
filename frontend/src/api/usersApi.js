import apiClient from './axios';

export const usersApi = {
  // List users (Admin only)
  list: (params = {}) => {
    return apiClient.get('/users', { params });
  },

  // Create Editor or Admin account
  create: (userData) => {
    return apiClient.post('/users', userData);
  },

  // Update user name, role, is_active
  update: (id, data) => {
    return apiClient.patch(`/users/${id}`, data);
  },

  // Admin resets user's password
  resetPassword: (id, newPassword) => {
    return apiClient.post(`/users/${id}/reset-password`, { password: newPassword });
  }
};
