import api from './api';

// Create receipt
export const createReceipt = async (receiptData) => {
  try {
    const response = await api.post('/receipts', receiptData);
    return response.data;
  } catch (error) {
    console.error('Error creating receipt:', error);
    throw error;
  }
};

// Get user's receipts
export const getUserReceipts = async () => {
  try {
    const response = await api.get('/receipts/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user receipts:', error);
    throw error;
  }
};

// Get receipt by ID
export const getReceiptById = async (id) => {
  try {
    const response = await api.get(`/receipts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching receipt:', error);
    throw error;
  }
};

// Get receipts by waste collection ID
export const getReceiptsByWasteCollectionId = async (wasteCollectionId) => {
  try {
    const response = await api.get(`/receipts/waste-collection/${wasteCollectionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching receipts by waste collection ID:', error);
    throw error;
  }
};

// Get all receipts (admin only)
export const getAllReceipts = async () => {
  try {
    const response = await api.get('/receipts');
    return response.data;
  } catch (error) {
    console.error('Error fetching all receipts:', error);
    throw error;
  }
}; 