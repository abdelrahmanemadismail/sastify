import { apiCall, apiCallUnauthenticated, ApiResponse } from "./api-client";
import type { User } from "./auth-store";

// Auth Request/Response types
export interface RegisterRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  identifier: string; // username or email
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  "refresh_token_expires-on": string;
}

export interface OtpLoginRequest {
  username: string;
  otp: string;
}

export interface ActivateAccountRequest {
  otp: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordRequest {
  new_password: string;
  confirm_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Auth Service
export const authService = {
  // Authentication endpoints
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/user/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Registration failed");
    }

    return {
      access_token: result.data.token,
      refresh_token: result.data.refresh_token,
      "refresh_token_expires-on": result.data.refresh_token_expires_on,
    };
  },

  async login(data: LoginRequest): Promise<LoginResponse | null> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/user/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Login failed");
    }

    // If 2FA is enabled, return null (user needs to enter OTP)
    if (!result.data?.access_token) {
      return null;
    }

    return result.data;
  },

  async otpLogin(data: OtpLoginRequest): Promise<LoginResponse> {
    return apiCall("/user/auth/otp/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async logout(): Promise<void> {
    return apiCall("/user/auth/logout", {
      method: "POST",
    });
  },

  // Token endpoints
  async refreshToken(): Promise<LoginResponse> {
    return apiCall("/user/token/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  // Account endpoints
  async getProfile(): Promise<User> {
    return apiCall("/user/account", {
      method: "GET",
    });
  },

  async updateProfile(data: UpdateProfileRequest): Promise<void> {
    return apiCall("/user/account", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async sendActivationCode(): Promise<void> {
    return apiCall("/user/account/activate", {
      method: "GET",
    });
  },

  async activateAccount(data: ActivateAccountRequest): Promise<void> {
    return apiCall("/user/account/activate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async activateAccountByLink(token: string): Promise<void> {
    return apiCallUnauthenticated(`/user/account/activate/${token}`, {
      method: "GET",
    });
  },

  // Password endpoints
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    return apiCall("/user/password/forgot", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async resetPassword(token: string, data: ResetPasswordRequest): Promise<void> {
    return apiCall(`/user/password/reset/${token}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    return apiCall("/user/password/change", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 2FA endpoints
  async enable2FA(): Promise<void> {
    return apiCall("/user/2fa/enable", {
      method: "POST",
    });
  },

  async disable2FA(): Promise<void> {
    return apiCall("/user/2fa/disable", {
      method: "POST",
    });
  },

  // Get updates/notifications
  async getUpdates(): Promise<
    Array<{
      id: number;
      title: string;
      description: string;
      created_at: string;
    }>
  > {
    return apiCall("/user/updates", {
      method: "GET",
    });
  },
};
