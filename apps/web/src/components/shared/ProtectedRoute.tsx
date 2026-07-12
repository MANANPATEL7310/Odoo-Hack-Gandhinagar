import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api-client";

export function ProtectedRoute() {
  const { user, accessToken, setAuth, logout, isHydrated } = useAuthStore();
  const [isValidating, setIsValidating] = React.useState(true);

  React.useEffect(() => {
    if (!isHydrated) return;

    if (!accessToken) {
      setIsValidating(false);
      return;
    }

    async function validateToken() {
      try {
        const res = await api.get("/auth/me");
        setAuth(res.data.data.user, accessToken as string);
      } catch {
        logout();
      } finally {
        setIsValidating(false);
      }
    }

    validateToken();
  }, [accessToken, isHydrated, setAuth, logout]);

  if (!isHydrated || isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
