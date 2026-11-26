import { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    const roleNormalized = (user?.role || "").trim().toLowerCase();
    const isAdmin =
      roleNormalized === "admin" ||
      roleNormalized === "administrator" ||
      roleNormalized === "superadmin" ||
      roleNormalized.includes("system admin");

    if (!isAdmin) {
      return <Navigate to="/rsm" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
