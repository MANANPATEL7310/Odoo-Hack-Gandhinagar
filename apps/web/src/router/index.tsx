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

// Temporary empty components for unbuilt routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex h-full items-center justify-center text-muted-foreground">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-2">This feature is currently under development.</p>
    </div>
  </div>
);

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
            element: <Placeholder title="Org Setup" />,
          },
          {
            path: "assets",
            element: <AssetRegistryPage />,
          },
          {
            path: "allocations",
            element: <Placeholder title="Allocations" />,
          },
          {
            path: "bookings",
            element: <Placeholder title="Resource Bookings" />,
          },
          {
            path: "maintenance",
            element: <Placeholder title="Maintenance Requests" />,
          },
          {
            path: "audits",
            element: <Placeholder title="Asset Audits" />,
          },
          {
            path: "reports",
            element: <Placeholder title="Reports & Analytics" />,
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
