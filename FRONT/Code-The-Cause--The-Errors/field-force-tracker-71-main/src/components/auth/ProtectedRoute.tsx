import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login and preserve the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if allowedRoles is specified
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "MANAGER"
        ? "/dashboard"
        : "/volunteer";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
