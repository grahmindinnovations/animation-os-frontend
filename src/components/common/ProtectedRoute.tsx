import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Loading } from "@/components/common/Loading";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute() {
  const location = useLocation();
  const authenticated = useAuthStore((state) => state.isAuthenticated());
  const { isLoading, isError } = useCurrentUser();

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoading) {
    return <Loading fullScreen label="Checking session..." />;
  }

  if (isError) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
