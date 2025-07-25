import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global axios interceptor to handle 401 responses
  useEffect(() => {
    const responseInterceptor = API.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token is invalid, logout user
          localStorage.removeItem('token');
          setUser(null);
          // Redirect to login page with current path, but only if not already on /login or personal-info
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/personal-info') {
            window.location.href = `/login?from=${encodeURIComponent(currentPath)}`;
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      API.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in by checking token and fetching profile
    const token = localStorage.getItem('token');
    if (token) {
      // Set up axios interceptor for this request
      const originalRequest = API.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Fetch user profile to verify token is valid
      API.get('/auth/profile')
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          // Remove the interceptor
          API.interceptors.request.eject(originalRequest);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      
      // Fetch user profile after successful login
      const profileResponse = await API.get('/auth/profile');
      setUser(profileResponse.data);
      
      return profileResponse.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if available
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await API.post('/auth/logout');
        } catch (error) {
          console.error('Logout API call failed:', error);
        }
      }
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 