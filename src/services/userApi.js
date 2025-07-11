import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const userAPI = axios.create({
  baseURL: `${API_BASE_URL()}/users`,
});

userAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getUserProfile = () => userAPI.get('/profile/me');
export const updateUserProfile = (profileData) => userAPI.put('/profile/me', profileData);
export const submitWasteCollection = (collectionData) => userAPI.post('/collection', collectionData);
export const getUserWasteCollections = () => userAPI.get('/collection');

// Admin functions
export const getAllWasteCollections = () => userAPI.get('/waste-collections/company');
export const approveWasteCollection = (id, adminNotes) => userAPI.put(`/collection/${id}/approve`, { admin_notes: adminNotes });
export const denyWasteCollection = (id, adminNotes) => userAPI.put(`/collection/${id}/deny`, { admin_notes: adminNotes });
export const getUsersCount = () => userAPI.get('/count');
export const getDashboardStats = () => userAPI.get('/stats');

export default userAPI; 