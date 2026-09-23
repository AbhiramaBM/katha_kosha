import apiClient from './axios';

export const authorsApi = {
  // List authors (query: q, page, limit, sort)
  list: (params = {}) => {
    return apiClient.get('/authors', { params });
  },

  // Get author by ID
  getById: (id) => {
    return apiClient.get(`/authors/${id}`);
  },

  // Create author
  create: (data) => {
    return apiClient.post('/authors', data);
  },

  // Update author
  update: (id, data) => {
    return apiClient.patch(`/authors/${id}`, data);
  },

  // Upload author photo (multipart)
  uploadPhoto: (id, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    return apiClient.post(`/authors/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Get stories for author
  getStories: (id, params = {}) => {
    return apiClient.get(`/authors/${id}/stories`, { params });
  },

  // Soft delete author (Admin only)
  delete: (id) => {
    return apiClient.delete(`/authors/${id}`);
  }
};
