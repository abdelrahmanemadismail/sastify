import { useAuthStore } from "./auth-store";

export interface ApiResponse<T = null> {
  "status-code": number;
  message: string | {
    page?: number;
    per_page?: number;
    total_items?: number;
    total_pages?: number;
    count_this_page?: number;
  };
  data: T;
  success: boolean;
}

export interface ApiErrorResponse {
  "status-code": number;
  message: string;
  details?: string | Record<string, string[]>;
  success: boolean;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: string | Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeToRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshToken(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
      useAuthStore.getState().clearAuth();
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/user/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data: ApiResponse<{
      access_token: string;
      refresh_token: string;
      "refresh_token_expires-on": string;
    }> = await response.json();

    if (response.ok && data.data.access_token) {
      useAuthStore.setState({
        accessToken: data.data.access_token,
        refreshToken: data.data.refresh_token
      });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("accessToken", data.data.access_token);
        sessionStorage.setItem("refreshToken", data.data.refresh_token);
      }
      return data.data.access_token;
    }

    // Refresh token expired or invalid
    useAuthStore.getState().clearAuth();
    return null;
  } catch {
    useAuthStore.getState().clearAuth();
    return null;
  }
}

export async function apiCall<T = null>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Include httpOnly cookies
  };

  let response = await fetch(url, requestOptions);

  // Handle 401: Try to refresh token and retry
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        onRefreshToken(newToken);
        // Retry the original request
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, { ...requestOptions, headers });
        isRefreshing = false;
      } else {
        isRefreshing = false;
        throw new ApiError(401, "Unauthorized", "Session expired. Please login again.");
      }
    } else {
      // Wait for refresh token to complete
      return new Promise((resolve, reject) => {
        subscribeToRefresh((newToken) => {
          headers["Authorization"] = `Bearer ${newToken}`;
          fetch(url, { ...requestOptions, headers })
            .then((res) => res.json())
            .then(resolve)
            .catch(reject);
        });
      });
    }
  }

  // Handle 423: Account not activated
  if (response.status === 423) {
    const errorData = await response.json();
    throw new ApiError(423, errorData.message || "Account not activated", "Please activate your account to continue.");
  }

  const data: ApiErrorResponse | ApiResponse<T> = await response.json();

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(errorData["status-code"], errorData.message, errorData.details);
  }

  return (data as ApiResponse<T>).data;
}

export async function apiCallWithFullResponse<T = null>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const { accessToken } = useAuthStore.getState();
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  let response = await fetch(url, requestOptions);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        onRefreshToken(newToken);
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, { ...requestOptions, headers });
        isRefreshing = false;
      } else {
        isRefreshing = false;
        throw new ApiError(401, "Unauthorized", "Session expired. Please login again.");
      }
    } else {
      return new Promise((resolve, reject) => {
        subscribeToRefresh((newToken) => {
          headers["Authorization"] = `Bearer ${newToken}`;
          fetch(url, { ...requestOptions, headers })
            .then((res) => res.json())
            .then(resolve)
            .catch(reject);
        });
      });
    }
  }

  const data: ApiResponse<T> = await response.json();

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(errorData["status-code"], errorData.message, errorData.details);
  }

  return data;
}

/**
 * Unauthenticated API call (no Bearer token required)
 * Used for public endpoints like email activation links
 */
export async function apiCallUnauthenticated<T = null>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const requestOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  const response = await fetch(url, requestOptions);
  const data: ApiErrorResponse | ApiResponse<T> = await response.json();

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(errorData["status-code"], errorData.message, errorData.details);
  }

  return (data as ApiResponse<T>).data;
}

/**
 * Upload a file via FormData (for file uploads)
 */
export async function apiCallFileUpload<T = null>(
  endpoint: string,
  formData: FormData,
  options: Omit<RequestInit, "body" | "method"> = {}
): Promise<ApiResponse<T>> {
  const { accessToken } = useAuthStore.getState();
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  // Don't set Content-Type for FormData - let the browser set it with the boundary
  delete headers["Content-Type"];

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const requestOptions: RequestInit = {
    ...options,
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  };

  let response = await fetch(url, requestOptions);

  // Handle 401: Try to refresh token and retry
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        onRefreshToken(newToken);
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, { ...requestOptions, headers });
        isRefreshing = false;
      } else {
        isRefreshing = false;
        throw new ApiError(401, "Unauthorized", "Session expired. Please login again.");
      }
    } else {
      return new Promise((resolve, reject) => {
        subscribeToRefresh((newToken) => {
          headers["Authorization"] = `Bearer ${newToken}`;
          fetch(url, { ...requestOptions, headers })
            .then((res) => res.json())
            .then(resolve)
            .catch(reject);
        });
      });
    }
  }

  const data: ApiResponse<T> = await response.json();

  if (!response.ok) {
    const errorData = data as ApiErrorResponse;
    throw new ApiError(errorData["status-code"], errorData.message, errorData.details);
  }

  return data;
}
