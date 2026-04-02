import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  // Role check if allowedRoles is provided
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if role not allowed
    const redirectPath = user.role === 'recruiter' ? '/recruiter-dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
