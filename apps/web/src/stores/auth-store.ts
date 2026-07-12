import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@template/shared";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isHydrated: boolean;
  setAuth: (user: AuthUser, accessToken: string) => void;
  setHydrated: (state: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isHydrated: false,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setHydrated: (state) => set({ isHydrated: state }),
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
