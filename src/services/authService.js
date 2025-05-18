import api from './api';
import { jwtDecode } from 'jwt-decode';

const login = async (email, password, role) => {
  try {
    // The correct endpoint is /api/Token, but our axios instance already has /api as the baseURL
    const response = await api.post('/Token', { email, password, role });
    
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      
      // Decode the token to get user information
      const decodedToken = jwtDecode(response.data.token);
      
      // Save user info to localStorage
      const userInfo = {
        id: decodedToken.nameid,
        name: decodedToken.name,
        email: decodedToken.email,
        role: decodedToken.role
      };
      
      localStorage.setItem('user', JSON.stringify(userInfo));
      return { user: userInfo, success: true };
    }
    return { 
      success: false, 
      message: response.data?.message || 'No token received'
    };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      message: error.response?.data || error.message || 'Authentication failed' 
    };
  }
};

const register = async (userData) => {
  try {
    const response = await api.post('/User', userData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      message: error.response?.data || error.message || 'Registration failed' 
    };
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    // Check if token is expired
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

const authService = {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated
};

export default authService; 