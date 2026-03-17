import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--bg)', color: 'white' }}>
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PublicRoute;
