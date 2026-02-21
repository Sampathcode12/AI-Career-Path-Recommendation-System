import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from token
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verify token by getting current user
      authAPI.getCurrentUser()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem('access_token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      
      // Store token
      localStorage.setItem('access_token', response.access_token);
      
      // Store user data
      setUser(response.user);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      // Create account; backend returns same shape as login (access_token, user)
      const response = await authAPI.signup({ name, email, password });
      if (response?.access_token && response?.user) {
        localStorage.setItem('access_token', response.access_token);
        setUser(response.user);
        return response;
      }
      // Fallback: auto login after signup
      return await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
