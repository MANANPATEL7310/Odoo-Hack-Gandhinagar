import { createBrowserRouter } from "react-router-dom";
import { appRoutes } from "@template/shared";
import { AppLayout } from "@/components/shared/app-layout";
import { NotFoundPage } from "@/components/shared/not-found";
import { ProtectedRoute } from "@/features/auth/routes/protected-route";
import { LoginPage } from "@/features/auth/pages/login-page";
import { SignupPage } from "@/features/auth/pages/signup-page";
import { ForgotPasswordPage } from "@/features/auth/pages/forgot-password-page";
import { ResetPasswordPage } from "@/features/auth/pages/reset-password-page";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { HomePage } from "@/features/marketing/pages/home-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";

export const router = createBrowserRouter([
  {
    path: appRoutes.home,
    element: <HomePage />,
  },
  {
    path: appRoutes.login,
    element: <LoginPage />,
  },
  {
    path: appRoutes.signup,
    element: <SignupPage />,
  },
  {
    path: appRoutes.forgotPassword,
    element: <ForgotPasswordPage />,
  },
  {
    path: appRoutes.resetPassword,
    element: <ResetPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: appRoutes.dashboard,
            element: <DashboardPage />,
          },
          {
            path: appRoutes.settings,
            element: <SettingsPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
