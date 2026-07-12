import { QueryClientProvider } from "@tanstack/react-query";

import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { queryClient } from "@/lib/query-client";
import { router } from "@/router";
import { ThemeProvider } from "@/theme/theme-provider";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export function AppProviders() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
              },
            }}
          />
        </ThemeProvider>

      </QueryClientProvider>
    </ErrorBoundary>
  );
}
