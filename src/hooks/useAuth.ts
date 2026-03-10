"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { authService, type LoginRequest, type RegisterRequest } from "@/lib/auth-service";
import type { User } from "@/lib/auth-store";

export function useAuth() {
  const { accessToken, user, isLoading, error, setTokens, setUser, setLoading, setError, clearAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    // Mark as initialized after checking storage
    const checkAndRestore = () => {
      // Restore tokens from sessionStorage if available
      if (typeof window !== "undefined") {
        const storedToken = sessionStorage.getItem("accessToken");
        const storedRefreshToken = sessionStorage.getItem("refreshToken");
        const storedUser = sessionStorage.getItem("user");

        if (storedToken && storedRefreshToken) {
          setTokens(storedToken, storedRefreshToken);
        }

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            sessionStorage.removeItem("user");
          }
        }
      }

      // Set flag after a microtask to avoid cascading renders
      Promise.resolve().then(() => {
        setIsInitialized(true);
      });
    };

    checkAndRestore();
  }, [setTokens, setUser]);

  const register = useCallback(
    async (data: RegisterRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.register(data);

        // Store tokens (user is auto-logged in after registration)
        setTokens(response.access_token, response.refresh_token);

        // Try to fetch user profile (may fail with 423 if not activated)
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch {
          // Account not activated yet, user will be fetched after activation
        }

        setLoading(false);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Registration failed";
        setError(message);
        setLoading(false);
        return { success: false, error: message };
      }
    },
    [setLoading, setError, setTokens, setUser]
  );

  const login = useCallback(
    async (data: LoginRequest) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.login(data);

        // 2FA required
        if (response === null) {
          setLoading(false);
          return { success: false, requires2FA: true };
        }

        // Successful login
        setTokens(response.access_token, response.refresh_token);

        // Fetch user profile
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch {
          // If we can't fetch profile, at least we have tokens
          // User can retry from dashboard
        }

        setLoading(false);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        setLoading(false);
        return { success: false, error: message };
      }
    },
    [setLoading, setError, setTokens, setUser]
  );

  const otpLogin = useCallback(
    async (username: string, otp: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await authService.otpLogin({ username, otp });
        setTokens(response.access_token, response.refresh_token);

        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch {
          // If we can't fetch profile, at least we have tokens
        }

        setLoading(false);
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "OTP login failed";
        setError(message);
        setLoading(false);
        return { success: false, error: message };
      }
    },
    [setLoading, setError, setTokens, setUser]
  );

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
    } catch (err) {
      // Even if logout API call fails, we still clear local state
      console.error("Logout API error:", err);
    }
    clearAuth();
    setLoading(false);
  }, [setLoading, setError, clearAuth]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await authService.refreshToken();
      setTokens(response.access_token, response.refresh_token);
      return true;
    } catch (err) {
      console.error("Token refresh failed:", err);
      clearAuth();
      return false;
    }
  }, [setTokens, clearAuth]);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setLoading(false);
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch profile";
      setError(message);
      setLoading(false);
      throw err;
    }
  }, [setLoading, setError, setUser]);

  return {
    // State
    accessToken,
    user,
    isLoading,
    error,
    isInitialized,

    // Computed
    isAuthenticated: !!accessToken,
    // If field is missing from API response, consider account activated (API returns this field only when false)
    isAccountActivated: user?.is_activated_account !== false,
    is2FAEnabled: user?.is_2FA_enabled ?? false,

    // Actions
    register,
    login,
    otpLogin,
    logout,
    refreshToken,
    fetchProfile,
    clearError: () => setError(null),
  };
}
