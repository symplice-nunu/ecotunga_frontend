import axios from 'axios';

const companyAPI = axios.create({
  baseURL: 'http://localhost:5000/api/companies',
});

companyAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getCompanies = () => companyAPI.get('/');

export const getCompanyById = (id) => companyAPI.get(`/${id}`);

export default companyAPI; 