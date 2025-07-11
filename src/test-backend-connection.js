// Test script to verify frontend connection to deployed backend
import api from './services/api';

export const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing connection to deployed backend...');
    
    const response = await api.get('/test');
    console.log('✅ Backend connection successful:', response.data);
    
    return {
      success: true,
      data: response.data,
      message: 'Backend connection working!'
    };
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Backend connection failed'
    };
  }
};

// Test all API services
export const testAllServices = async () => {
  const results = {};
  
  // Test main API
  try {
    const mainApi = await api.get('/test');
    results.mainApi = { success: true, data: mainApi.data };
  } catch (error) {
    results.mainApi = { success: false, error: error.message };
  }
  
  // Test companies API
  try {
    const companiesApi = await api.get('/companies');
    results.companiesApi = { success: true, count: companiesApi.data?.length || 0 };
  } catch (error) {
    results.companiesApi = { success: false, error: error.message };
  }
  
  // Test users API
  try {
    const usersApi = await api.get('/users');
    results.usersApi = { success: true, count: usersApi.data?.length || 0 };
  } catch (error) {
    results.usersApi = { success: false, error: error.message };
  }
  
  console.log('📊 API Test Results:', results);
  return results;
}; 