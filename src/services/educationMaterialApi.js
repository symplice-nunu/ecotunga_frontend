import api from './api';

export const educationMaterialApi = {
  // Get all materials
  getAllMaterials: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.level) params.append('level', filters.level);
    if (filters.type) params.append('type', filters.type);
    if (filters.featured) params.append('featured', filters.featured);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/education-materials?${params.toString()}`);
    return response.data;
  },

  // Get material by ID
  getMaterialById: async (materialId) => {
    const response = await api.get(`/education-materials/${materialId}`);
    return response.data;
  },

  // Create new material
  createMaterial: async (materialData) => {
    const response = await api.post('/education-materials', materialData);
    return response.data;
  },

  // Update material
  updateMaterial: async (materialId, materialData) => {
    const response = await api.put(`/education-materials/${materialId}`, materialData);
    return response.data;
  },

  // Delete material
  deleteMaterial: async (materialId) => {
    const response = await api.delete(`/education-materials/${materialId}`);
    return response.data;
  },

  // Bookmark material
  bookmarkMaterial: async (materialId) => {
    const response = await api.post(`/education-materials/${materialId}/bookmark`);
    return response.data;
  },

  // Remove bookmark
  removeBookmark: async (materialId) => {
    const response = await api.delete(`/education-materials/${materialId}/bookmark`);
    return response.data;
  },

  // Get user's bookmarked materials
  getUserBookmarks: async () => {
    const response = await api.get('/education-materials/user/bookmarks');
    return response.data;
  },

  // Rate material
  rateMaterial: async (materialId, rating) => {
    const response = await api.post(`/education-materials/${materialId}/rate`, { rating });
    return response.data;
  }
}; 