import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ProtectedRoute
 *
 * Wraps any route that requires authentication.
 * - While auth state is loading (hydrating from localStorage on refresh),
 *   shows a spinner so the user never sees a flash-redirect to /login.
 * - If there is no authenticated user, redirects to /login.
 * - If authenticated, renders child routes via <Outlet />.
 */
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
