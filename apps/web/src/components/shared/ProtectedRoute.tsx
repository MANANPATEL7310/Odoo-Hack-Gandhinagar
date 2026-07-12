import React from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "../../stores/auth-store";

export function ProtectedRoute() {
  const { user, token, setAuth } = useAuthStore();

  React.useEffect(() => {
    // DEV BYPASS: Auto-login as Admin to bypass login screen during development
    if (!user || !token) {
      setAuth(
        {
          id: "u1",
          name: "Alice Admin",
          email: "alice@acme.com",
          role: "ADMIN",
          status: "Active",
        },
        "dev-bypass-token",
      );
    }
  }, [user, token, setAuth]);

  if (!user || !token) {
    return null; // Wait for auto-login
  }

  return <Outlet />;
}
