import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ProjectDetailsPage } from "@/features/projects/pages/ProjectDetailsPage";
import { SettingsPage } from "@/features/settings/pages/SettingsPage";
import { ProjectStudioPage } from "@/features/studio/pages/ProjectStudioPage";
import { StudioHomePage } from "@/features/studio/pages/StudioHomePage";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const authenticated = useAuthStore((state) => state.isAuthenticated());
  if (authenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<StudioHomePage />} />
            <Route path="/projects" element={<StudioHomePage />} />
            <Route path="/projects/:projectId" element={<ProjectStudioPage />} />
            <Route path="/projects/:projectId/dev" element={<ProjectDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
