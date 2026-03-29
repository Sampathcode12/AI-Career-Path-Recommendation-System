import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, getStoredAccessToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredAccessToken();
    if (!token) {
      if (localStorage.getItem('access_token')) localStorage.removeItem('access_token');
      setLoading(false);
      return;
    }
    authAPI
      .getCurrentUser()
      .then((userData) => {
        setUser(userData);
      })
      .catch((err) => {
        if (err?.status === 401) {
          localStorage.removeItem('access_token');
        }
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      // API returns camelCase (accessToken); snake_case supported if backend is configured that way
      const token = response.access_token ?? response.accessToken;
      if (!token || token === 'undefined') {
        throw new Error('Login did not return a token. Check API configuration.');
      }
      localStorage.setItem('access_token', token);
      const userPayload = response.user ?? response.User;
      setUser(userPayload);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      // Create account only; do not log in — user must sign in on login page
      await authAPI.signup({ name, email, password });
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
