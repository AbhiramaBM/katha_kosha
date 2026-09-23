import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLoading from '../pages/AuthLoading';

export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    // Redirect to where they wanted to go, or /dashboard
    const destination = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
}
