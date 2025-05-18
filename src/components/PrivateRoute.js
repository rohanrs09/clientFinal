import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ allowedRoles }) => {
  const { currentUser, isAuthenticated } = useAuth();
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // If no specific roles are required or if user's role is included in allowedRoles
  if (!allowedRoles || allowedRoles.includes(currentUser.role)) {
    return <Outlet />;
  }
  
  // If user doesn't have permission, redirect based on role
  if (currentUser.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (currentUser.role === 'manager') {
    return <Navigate to="/manager" replace />;
  } else {
    return <Navigate to="/guest" replace />;
  }
};

export default PrivateRoute; 