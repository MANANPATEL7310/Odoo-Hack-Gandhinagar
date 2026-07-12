import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "./mock-db";

type LegacySession = {
  accessToken?: string;
  token?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role | "admin" | "member" | string;
    status?: User["status"];
  };
};

function normalizeRole(role: LegacySession["user"]["role"]): Role {
  if (role === "admin") return "ADMIN";
  if (role === "member") return "EMPLOYEE";
  if (
    role === "ADMIN" ||
    role === "ASSET_MANAGER" ||
    role === "DEPARTMENT_HEAD" ||
    role === "EMPLOYEE"
  ) {
    return role;
  }
  return "EMPLOYEE";
}

function normalizeUser(user: LegacySession["user"]): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: normalizeRole(user.role),
    status: user.status ?? "Active",
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  accessToken: string | null;
  isHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  setSession: (session: LegacySession) => void;
  logout: () => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      accessToken: null,
      isHydrated: true,
      setAuth: (user, token) => set({ user, token, accessToken: token }),
      setSession: (session) => {
        const nextToken = session.accessToken ?? session.token ?? null;
        set({
          user: normalizeUser(session.user),
          token: nextToken,
          accessToken: nextToken,
          isHydrated: true,
        });
      },
      logout: () => set({ user: null, token: null, accessToken: null }),
      clearSession: () => set({ user: null, token: null, accessToken: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
