// Centralized API configuration
export const getApiUrl = () => {
  // Check for environment-specific API URL
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // For production, use HTTPS if available
  if (process.env.NODE_ENV === 'production') {
    // Try HTTPS first, fallback to HTTP
    return 'https://62.171.173.62/api';
  }
  
  // For development, use HTTP
  return 'http://62.171.173.62/api';
};

export const API_BASE_URL = getApiUrl(); 