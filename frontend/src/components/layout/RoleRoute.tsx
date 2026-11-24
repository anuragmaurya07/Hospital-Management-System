import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types';

interface RoleRouteProps {
  allowedRoles?: Role[];
  children: React.ReactElement;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to default dashboard for user role
    const defaultDashboardMap: Record<Role, string> = {
      admin: '/admin/dashboard',
      doctor: '/doctor/dashboard',
      receptionist: '/receptionist/dashboard',
      patient: '/patient/dashboard',
      pharmacist: '/pharmacist/dashboard',
      lab_technician: '/laboratory/dashboard',
    };
    return <Navigate to={defaultDashboardMap[user.role] || '/login'} replace />;
  }

  return children;
};
