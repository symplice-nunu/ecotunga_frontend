import axios from 'axios';

const companyAPI = axios.create({
  baseURL: 'http://62.171.173.62/api/companies',
});

companyAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getCompanies = () => companyAPI.get('/');

export const getCompanyById = (id) => companyAPI.get(`/${id}`);

export default companyAPI; 