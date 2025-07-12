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

// Approve recycling center booking with pricing
export const approveRecyclingCenterBooking = async (id, price, notes, sorted_properly) => {
  try {
    const response = await api.put(`/recycling-center/bookings/${id}/approve`, {
      price,
      notes,
      sorted_properly
    });
    return response.data;
  } catch (error) {
    console.error('Error approving recycling center booking:', error);
    throw error;
  }
};

// Confirm price for recycling center booking
export const confirmRecyclingCenterBookingPrice = async (id, confirmed) => {
  try {
    const response = await api.put(`/recycling-center/bookings/${id}/confirm-price`, {
      confirmed
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming recycling center booking price:', error);
    throw error;
  }
};

// Confirm payment for recycling center booking
export const confirmRecyclingCenterBookingPayment = async (id, payment_confirmed) => {
  try {
    const response = await api.put(`/recycling-center/bookings/${id}/confirm-payment`, {
      payment_confirmed
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming recycling center booking payment:', error);
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

// Get user's total points from recycling bookings
export const getUserPoints = async () => {
  try {
    const response = await api.get('/recycling-center/bookings/user/points');
    return response.data;
  } catch (error) {
    console.error('Error fetching user points:', error);
    throw error;
  }
}; 