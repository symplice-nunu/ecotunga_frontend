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
  
  // For production (Vercel), use the Vercel proxy to avoid mixed content issues
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    console.log('Using Vercel proxy for production');
    return '/api';
  }
  
  // For development, use HTTP directly
  console.log('Using HTTP URL for development');
  return 'http://62.171.173.62/api';
};

// Don't evaluate at build time, evaluate at runtime
export const API_BASE_URL = () => getApiUrl(); 