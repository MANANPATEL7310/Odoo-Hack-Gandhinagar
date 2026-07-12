import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { DashboardLayout } from "../components/shared/DashboardLayout";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { AssetRegistryPage } from "../features/assets/AssetRegistryPage";
import { LoginPage } from "../features/auth/LoginPage";
import { SignupPage } from "../features/auth/SignupPage";
import { ProtectedRoute } from "../components/shared/ProtectedRoute";
import { ModulePlaceholder } from "../components/shared/ModulePlaceholder";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "org-setup",
            element: <ModulePlaceholder feature="orgSetup" />,
          },
          {
            path: "assets",
            element: <AssetRegistryPage />,
          },
          {
            path: "allocations",
            element: <ModulePlaceholder feature="allocations" />,
          },
          {
            path: "bookings",
            element: <ModulePlaceholder feature="bookings" />,
          },
          {
            path: "maintenance",
            element: <ModulePlaceholder feature="maintenance" />,
          },
          {
            path: "audits",
            element: <ModulePlaceholder feature="audits" />,
          },
          {
            path: "reports",
            element: <ModulePlaceholder feature="reports" />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
