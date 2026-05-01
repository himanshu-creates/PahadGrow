import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If true, only admin users can access */
  adminOnly?: boolean;
  /** If true, only seller/landowner/admin can access */
  sellerOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false, sellerOnly = false }: ProtectedRouteProps) {
  const { isLoggedIn, user } = useAuth();

  // Not logged in → go to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Admin-only page: reject non-admins
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Seller-only page: reject buyers
  if (sellerOnly && !['seller', 'landowner', 'admin'].includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
