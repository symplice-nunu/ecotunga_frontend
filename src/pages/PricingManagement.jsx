import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PricingManagement from '../components/PricingManagement';
import { Navigate } from 'react-router-dom';

export default function PricingManagementPage() {
  const { user, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if not admin
  if (user.role !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return (
      <div className="p-6">
        sads
        <PricingManagement />
      </div>
  );
} 