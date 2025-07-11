// Centralized API configuration
export const getApiUrl = () => {
  // Debug: Log environment variables
  console.log('Environment check:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    window_location: typeof window !== 'undefined' ? window.location.hostname : 'server'
  });

  // Check for environment-specific API URL
  if (process.env.REACT_APP_API_URL) {
    console.log('Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // For now, use HTTP for all environments since HTTPS is not available
  console.log('Using HTTP URL (HTTPS not available on backend)');
  return 'http://62.171.173.62/api';
};

// Don't evaluate at build time, evaluate at runtime
export const API_BASE_URL = () => getApiUrl(); 