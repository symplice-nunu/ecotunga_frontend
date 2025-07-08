import api from './api';

export const wasteCollectionApi = {
  // Create a new waste collection request
  createWasteCollection: async (data) => {
    const response = await api.post('/waste-collections', data);
    return response.data;
  },

  // Get user's waste collections
  getUserWasteCollections: async () => {
    const response = await api.get('/waste-collections/user');
    return response.data;
  },

  // Get waste collections by company (for waste collectors)
  getWasteCollectionsByCompany: async () => {
    const response = await api.get('/waste-collections/company');
    return response.data;
  },

  // Get all waste collections (for admin users)
  getAllWasteCollections: async () => {
    const response = await api.get('/waste-collections');
    return response.data;
  },

  // Get next waste pickup for user
  getNextWastePickup: async () => {
    const response = await api.get('/waste-collections/next-pickup');
    return response.data;
  },

  // Admin: Approve waste collection
  approveWasteCollection: async (id, adminNotes) => {
    const response = await api.put(`/waste-collections/admin/${id}/approve`, {
      admin_notes: adminNotes
    });
    return response.data;
  },

  // Admin: Deny waste collection
  denyWasteCollection: async (id, adminNotes) => {
    const response = await api.put(`/waste-collections/admin/${id}/deny`, {
      admin_notes: adminNotes
    });
    return response.data;
  },

  // Cancel waste collection
  cancelWasteCollection: async (id) => {
    const response = await api.put(`/waste-collections/${id}/cancel`);
    return response.data;
  }
}; 