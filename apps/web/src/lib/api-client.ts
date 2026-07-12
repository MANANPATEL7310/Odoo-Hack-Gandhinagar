import axios, { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/auth-store";
import { useMockDb } from "../stores/mock-db";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = axios.create({
  baseURL: "/api/v1", // Standard prefix per API design
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock interceptor to simulate API calls and latency
api.interceptors.response.use(
  async (response) => {
    // Only mock if it's hitting our backend API base
    if (!response.config.url?.startsWith("/api/v1")) return response;

    // If Vite serves index.html (SPA fallback) for an API route, the backend is not running.
    if (typeof response.data === "string" && response.data.includes("<html")) {
      return Promise.reject({ isMockTrigger: true, config: response.config });
    }

    await delay(500); // Simulated latency
    return response;
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (error: any) => {
    if (
      error.isMockTrigger ||
      error.message === "Network Error" ||
      error.code === "ERR_NETWORK" ||
      error.response?.status === 504 ||
      error.response?.status === 404
    ) {
      await delay(500);
      const url = error.config?.url;
      const method = error.config?.method?.toUpperCase();
      const db = useMockDb.getState();

      console.log(`[Mock API] ${method} ${url}`);

      if (url?.includes("/auth/me") && method === "GET") {
        const user = useAuthStore.getState().user;
        if (!user)
          return Promise.reject({
            response: {
              status: 401,
              data: { success: false, error: "Unauthenticated" },
            },
          });
        return {
          data: { success: true, data: { user } },
          status: 200,
          statusText: "OK",
          headers: {},
          config: error.config!,
        };
      }

      if (url?.includes("/auth/login") && method === "POST") {
        try {
          const body =
            typeof error.config?.data === "string"
              ? JSON.parse(error.config.data)
              : error.config?.data || {};
          const user = db.users.find((u) => u.email === body.email);

          if (!user || body.password !== "password123") {
            return Promise.reject({
              response: {
                status: 401,
                data: {
                  success: false,
                  error: "Invalid credentials. Use 'password123'.",
                },
              },
            });
          }

          return {
            data: {
              success: true,
              data: { user, accessToken: `mock-jwt-${user.id}` },
            },
            status: 200,
            statusText: "OK",
            headers: {},
            config: error.config!,
          };
        } catch (e) {
          console.error("Login mock error", e);
          return Promise.reject({
            response: {
              status: 400,
              data: { success: false, error: "Bad Request" },
            },
          });
        }
      }

      if (url?.includes("/auth/signup") && method === "POST") {
        try {
          const body =
            typeof error.config?.data === "string"
              ? JSON.parse(error.config.data)
              : error.config?.data || {};

          if (db.users.find((u) => u.email === body.email)) {
            return Promise.reject({
              response: {
                status: 400,
                data: {
                  success: false,
                  error: "User already exists with this email.",
                },
              },
            });
          }

          const newUser = {
            id: `u${Date.now()}`,
            name: body.name || "New User",
            email: body.email,
            passwordHash: "hash",
            role: "EMPLOYEE" as const,
            status: "ACTIVE" as const,
            createdAt: new Date().toISOString(),
          };

          return {
            data: {
              success: true,
              data: { user: newUser, accessToken: `mock-jwt-${newUser.id}` },
            },
            status: 201,
            statusText: "Created",
            headers: {},
            config: error.config!,
          };
        } catch (e) {
          console.error("Signup mock error", e);
          return Promise.reject({
            response: {
              status: 400,
              data: { success: false, error: "Bad Request" },
            },
          });
        }
      }

      if (url?.includes("/dashboard") && method === "GET") {
        const kpis = {
          assetsAvailable: db.assets.filter((a) => a.status === "AVAILABLE")
            .length,
          assetsAllocated: db.assets.filter((a) => a.status === "ALLOCATED")
            .length,
          maintenanceToday: db.maintenanceRequests.filter(
            (r) => r.status === "IN_PROGRESS",
          ).length,
          activeBookings: db.bookings.filter((b) => b.status === "ONGOING")
            .length,
          pendingTransfers: db.transferRequests.filter(
            (t) => t.status === "REQUESTED",
          ).length,
          upcomingReturns: 0,
        };
        return {
          data: { success: true, data: { kpis, overdue: [], upcoming: [] } },
          status: 200,
          statusText: "OK",
          headers: {},
          config: error.config!,
        };
      }

      if (url?.includes("/assets") && method === "GET") {
        return {
          data: {
            success: true,
            data: db.assets,
            pagination: { page: 1, pageSize: 10, total: db.assets.length },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: error.config!,
        };
      }

      if (url?.includes("/uploads") && method === "POST") {
        return {
          data: {
            success: true,
            data: { url: "/placeholder.png", key: `mock-upload-${Date.now()}` },
          },
          status: 200,
          statusText: "OK",
          headers: {},
          config: error.config!,
        };
      }

      return Promise.reject({
        response: {
          status: 404,
          data: { success: false, error: "Mock route not found" },
        },
      });
    }
    return Promise.reject(error);
  },
);
