import axios, { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/auth-store";

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
