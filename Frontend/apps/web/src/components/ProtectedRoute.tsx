import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();

  // Check localStorage directly for token to prevent immediate redirect on refresh
  const tokenExists = !!localStorage.getItem('authToken');
  const hasValidAuth = isAuthenticated || tokenExists;

  // If AuthContext is still initializing, wait for it unless we have an optimistic token
  if (!isInitialized && !hasValidAuth) {
    return null; // Or a loading spinner
  }

  // Only redirect after we've confirmed there's no valid token
  if (!hasValidAuth) {
    console.log('ProtectedRoute - No auth, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
