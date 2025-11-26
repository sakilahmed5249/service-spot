import React, { createContext, useState, useContext, useEffect } from 'react';
import { customerAPI, providerAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials, userType = 'customer') => {
    try {
      let response;
      
      if (userType === 'customer') {
        response = await customerAPI.login(credentials);
      } else {
        response = await providerAPI.login(credentials.email);
      }
      
      // Extract user data from response
      const userData = response.data;
      
      // For now, we'll create a mock token since backend might not return one yet
      const mockToken = btoa(JSON.stringify({ id: userData.id, email: userData.email, role: userType }));
      
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify({ ...userData, role: userType }));
      setUser({ ...userData, role: userType });
      
      return { success: true, user: { ...userData, role: userType } };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData, userType = 'customer') => {
    try {
      let response;
      
      if (userType === 'customer') {
        response = await customerAPI.signup(userData);
      } else {
        response = await providerAPI.signup(userData);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isProvider: user?.role === 'provider',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
