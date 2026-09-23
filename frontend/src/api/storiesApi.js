import apiClient from './axios';

export const storiesApi = {
  // List stories (query: q, author_id, genre, status, page, limit, sort)
  list: (params = {}) => {
    return apiClient.get('/stories', { params });
  },

  // Get story detail with author and references
  getById: (id) => {
    return apiClient.get(`/stories/${id}`);
  },

  // Create story
  create: (storyData, pdfFile = null) => {
    if (storyData.content_type === 'pdf' || pdfFile) {
      const formData = new FormData();
      Object.keys(storyData).forEach((key) => {
        if (key === 'references' && Array.isArray(storyData[key])) {
          formData.append('references', JSON.stringify(storyData[key]));
        } else if (storyData[key] !== null && storyData[key] !== undefined) {
          formData.append(key, storyData[key]);
        }
      });
      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }
      return apiClient.post('/stories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    return apiClient.post('/stories', storyData);
  },

  // Update story
  update: (id, storyData, pdfFile = null) => {
    if (pdfFile) {
      const formData = new FormData();
      Object.keys(storyData).forEach((key) => {
        if (key === 'references' && Array.isArray(storyData[key])) {
          formData.append('references', JSON.stringify(storyData[key]));
        } else if (storyData[key] !== null && storyData[key] !== undefined) {
          formData.append(key, storyData[key]);
        }
      });
      formData.append('pdf', pdfFile);
      return apiClient.patch(`/stories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }

    return apiClient.patch(`/stories/${id}`, storyData);
  },

  // Replace story PDF
  replacePdf: (id, file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return apiClient.put(`/stories/${id}/pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Soft delete story (Admin only)
  delete: (id) => {
    return apiClient.delete(`/stories/${id}`);
  }
};
