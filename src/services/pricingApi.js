import API from './api';

const pricingApi = {
  // Get all pricing configurations
  getAllPricing: async () => {
    try {
      const response = await API.get('/pricing');
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing configurations:', error);
      throw error;
    }
  },

  // Get pricing by ubudehe category
  getPricingByCategory: async (category) => {
    try {
      const response = await API.get(`/pricing/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing by category:', error);
      throw error;
    }
  },

  // Create new pricing configuration (Admin only)
  createPricing: async (pricingData) => {
    try {
      const response = await API.post('/pricing', pricingData);
      return response.data;
    } catch (error) {
      console.error('Error creating pricing configuration:', error);
      throw error;
    }
  },

  // Update pricing configuration (Admin only)
  updatePricing: async (id, pricingData) => {
    try {
      const response = await API.put(`/pricing/${id}`, pricingData);
      return response.data;
    } catch (error) {
      console.error('Error updating pricing configuration:', error);
      throw error;
    }
  },

  // Delete pricing configuration (Admin only)
  deletePricing: async (id) => {
    try {
      const response = await API.delete(`/pricing/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting pricing configuration:', error);
      throw error;
    }
  }
};

export default pricingApi; 