import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
  });
  
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionTest, setConnectionTest] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (apiError) {
      setApiError('');
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionTest('');
    
    try {
      const response = await api.get('/Hotels');
      setConnectionTest(`✅ Backend connection successful. Received ${response.data.length} hotels.`);
    } catch (error) {
      console.error('Connection test error:', error);
      setConnectionTest(`❌ Backend connection failed: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]+$/.test(formData.password)) {
      newErrors.password = 'Password must contain both letters and numbers';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setApiError('');
    
    try {
      const { email, password, role } = formData;
      const result = await login(email, password, role);
      
      if (result.success) {
        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'manager') {
          navigate('/manager');
        } else {
          navigate('/guest');
        }
      } else {
        setApiError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      setApiError('An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          {/* Connection test button */}
          <div className="mb-4">
            <Button 
              onClick={testConnection} 
              variant="outline" 
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? <Spinner size="sm" /> : 'Test Backend Connection'}
            </Button>
            
            {connectionTest && (
              <div className={`mt-2 p-2 text-sm rounded ${connectionTest.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {connectionTest}
              </div>
            )}
          </div>
          
          {apiError && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
            />
            
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              error={errors.password}
            />
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <div className="flex items-center">
                  <input
                    id="guest"
                    name="role"
                    type="radio"
                    value="user"
                    checked={formData.role === 'user'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="guest" className="ml-3 block text-sm font-medium text-gray-700">
                    Guest
                  </label>
                </div>
                
                <div className="flex items-center mt-2">
                  <input
                    id="manager"
                    name="role"
                    type="radio"
                    value="manager"
                    checked={formData.role === 'manager'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="manager" className="ml-3 block text-sm font-medium text-gray-700">
                    Hotel Manager
                  </label>
                </div>
                
                <div className="flex items-center mt-2">
                  <input
                    id="admin"
                    name="role"
                    type="radio"
                    value="admin"
                    checked={formData.role === 'admin'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="admin" className="ml-3 block text-sm font-medium text-gray-700">
                    Admin
                  </label>
                </div>
              </div>
              {errors.role && <p className="text-red-500 text-xs italic mt-1">{errors.role}</p>}
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Sign In'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login; 