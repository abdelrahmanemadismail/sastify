import { create } from "zustand";

export interface User {
  id?: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  registered_on?: string;
  is_activated_account?: boolean;
  is_2FA_enabled?: boolean;
  projects_config_path?: string;
}

interface AuthStore {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: false,
  error: null,

  setTokens: (accessToken: string, refreshToken: string) => {
    set({ accessToken, refreshToken });
    if (typeof window !== "undefined") {
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
    }
  },

  setUser: (user: User | null) => {
    set({ user });
    if (user && typeof window !== "undefined") {
      sessionStorage.setItem("user", JSON.stringify(user));
    }
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearAuth: () => {
    set({ accessToken: null, refreshToken: null, user: null, error: null });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");
    }
  },
}));

// Initialize store from sessionStorage on app hydration
export function initializeAuthStore() {
  if (typeof window !== "undefined") {
    const storedToken = sessionStorage.getItem("accessToken");
    const storedRefreshToken = sessionStorage.getItem("refreshToken");
    const storedUser = sessionStorage.getItem("user");

    if (storedToken) {
      useAuthStore.setState({ accessToken: storedToken });
    }

    if (storedRefreshToken) {
      useAuthStore.setState({ refreshToken: storedRefreshToken });
    }

    if (storedUser) {
      try {
        useAuthStore.setState({ user: JSON.parse(storedUser) });
      } catch {
        sessionStorage.removeItem("user");
      }
    }
  }
}
