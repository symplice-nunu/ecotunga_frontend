import api from './api';

// Create recycling center booking
export const createRecyclingCenterBooking = async (bookingData) => {
  try {
    const response = await api.post('/recycling-center/bookings', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error creating recycling center booking:', error);
    throw error;
  }
};

// Get user's recycling center bookings
export const getUserRecyclingCenterBookings = async () => {
  try {
    const response = await api.get('/recycling-center/bookings/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user recycling center bookings:', error);
    throw error;
  }
};

// Get recycling center bookings by company (for recycling center owners)
export const getRecyclingCenterBookingsByCompany = async () => {
  try {
    const response = await api.get('/recycling-center/bookings/company');
    return response.data;
  } catch (error) {
    console.error('Error fetching company recycling center bookings:', error);
    throw error;
  }
};

// Get all recycling center bookings (for admin users)
export const getAllRecyclingCenterBookings = async () => {
  try {
    const response = await api.get('/recycling-center/bookings');
    return response.data;
  } catch (error) {
    console.error('Error fetching all recycling center bookings:', error);
    throw error;
  }
};

// Get specific recycling center booking by ID
export const getRecyclingCenterBookingById = async (id) => {
  try {
    const response = await api.get(`/recycling-center/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching recycling center booking:', error);
    throw error;
  }
};

// Cancel recycling center booking
export const cancelRecyclingCenterBooking = async (id) => {
  try {
    const response = await api.delete(`/recycling-center/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling recycling center booking:', error);
    throw error;
  }
}; 