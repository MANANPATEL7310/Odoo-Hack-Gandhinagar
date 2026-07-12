import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
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
  const token = useAuthStore.getState().token;
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

    await delay(500); // Simulated latency

    // In a real environment with the backend running, we might disable this block.
    // For now, since the user wants to work actively without the backend, we intercept and mock.
    // This is a minimal mock for GET /auth/me to demonstrate the concept.
    return response;
  },
  async (error: AxiosError) => {
    // If the actual backend is not running, Axios will throw a Network Error.
    // We catch it and use our mock DB.
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
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
              data: { user, token: `mock-jwt-${user.id}` },
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

          // Create a mock user
          const newUser = {
            id: `u${Date.now()}`,
            name: body.name || "New User",
            email: body.email,
            role: "EMPLOYEE" as const,
            status: "Active" as const,
          };

          // Normally we'd push to db.users, but mockDb isn't strictly updating its initial state in this simplified interceptor.
          // For the hackathon frontend, just returning it is enough to get into the app!

          return {
            data: {
              success: true,
              data: { user: newUser, token: `mock-jwt-${newUser.id}` },
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
          assetsAvailable: db.assets.filter((a) => a.status === "Available")
            .length,
          assetsAllocated: db.assets.filter((a) => a.status === "Allocated")
            .length,
          maintenanceToday: 0,
          activeBookings: 0,
          pendingTransfers: 0,
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
