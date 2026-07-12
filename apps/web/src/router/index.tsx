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
import { OrgSetupPage } from "../features/org-setup/OrgSetupPage";
import { AllocationsPage } from "../features/allocations/AllocationsPage";
import { BookingsPage } from "../features/bookings/BookingsPage";
import { MaintenancePage } from "../features/maintenance/MaintenancePage";
import { AuditsPage } from "../features/audits/AuditsPage";
import { ReportsPage } from "../features/reports/ReportsPage";
import { HomePage } from "../features/marketing/pages/home-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/app",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/app/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "org-setup",
            element: <OrgSetupPage />,
          },
          {
            path: "assets",
            element: <AssetRegistryPage />,
          },
          {
            path: "allocations",
            element: <AllocationsPage />,
          },
          {
            path: "bookings",
            element: <BookingsPage />,
          },
          {
            path: "maintenance",
            element: <MaintenancePage />,
          },
          {
            path: "audits",
            element: <AuditsPage />,
          },
          {
            path: "reports",
            element: <ReportsPage />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
