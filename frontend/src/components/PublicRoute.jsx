import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage message="Authenticating..." />;
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PublicRoute;
