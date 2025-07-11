import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const paymentAPI = axios.create({
  baseURL: `${API_BASE_URL()}/payments`,
});

paymentAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const initiateMobileMoneyPayment = async (paymentData) => {
  try {
    const response = await paymentAPI.post('/initiate-payment', paymentData);
    return response.data;
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw error;
  }
};

export const verifyPayment = async (transactionId) => {
  try {
    const response = await paymentAPI.get(`/verify-payment/${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

export const testPaymentAPI = async () => {
  try {
    const response = await paymentAPI.get('/test');
    return response.data;
  } catch (error) {
    console.error('Payment API test error:', error);
    throw error;
  }
};

export const testSimplePayment = async (paymentData) => {
  try {
    const response = await paymentAPI.post('/test-simple-payment', paymentData);
    return response.data;
  } catch (error) {
    console.error('Simple payment test error:', error);
    throw error;
  }
};

export default paymentAPI; 