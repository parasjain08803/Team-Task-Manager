import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getCurrentUser()
        .then(response => {
          setUser(response.data);
        })
        .catch((error) => {

          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            setUser(null);
          } else {

            setUser(null);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      try {
        const userResponse = await authAPI.getCurrentUser();
        setUser(userResponse.data);
      } catch (userError) {
        console.error('Failed to get user data after login:', userError);

        setUser({ email: credentials.email, username: credentials.email });
      }

      toast.success('Login successful!');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.detail;
      const displayMessage = typeof errorMessage === 'string' ? errorMessage : 'Login failed';
      toast.error(displayMessage);
      return false;
    }
  };

  const register = async (userData) => {
    try {
      await authAPI.register(userData);
      toast.success('Registration successful! Please login.');
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.detail;
      const displayMessage = typeof errorMessage === 'string' ? errorMessage : 'Registration failed';
      toast.error(displayMessage);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
