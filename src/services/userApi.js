import axios from 'axios';

const userAPI = axios.create({
  baseURL: 'http://localhost:5000/api/users',
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
export const getAllWasteCollections = () => userAPI.get('/collection/all');
export const approveWasteCollection = (id, adminNotes) => userAPI.put(`/collection/${id}/approve`, { admin_notes: adminNotes });
export const denyWasteCollection = (id, adminNotes) => userAPI.put(`/collection/${id}/deny`, { admin_notes: adminNotes });

export default userAPI; 