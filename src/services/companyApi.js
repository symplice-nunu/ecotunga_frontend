import axios from 'axios';
import { API_BASE_URL } from './apiConfig';

const companyAPI = axios.create({
  baseURL: `${API_BASE_URL()}/companies`,
});

companyAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getCompanies = (type = null) => {
  const params = type ? { type } : {};
  return companyAPI.get('/', { params });
};

export const getCompanyById = (id) => companyAPI.get(`/${id}`);

export default companyAPI; 