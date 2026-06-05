// ── Axios API Client ─────────────────────────────────────
// Single Axios instance for all admin API calls.
// Swap baseURL via env var — defaults to mock/data layer when not set.

import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { env } from "@/lib/env";
import { useGlobalLoaderStore } from "@/store/global-loader-store";

const API_BASE_URL = env.apiBaseUrl;

// ── Retry configuration ──────────────────────────────────
const RETRY_STATUS_CODES = [429, 502, 503, 504];
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY = 1000; // ms

function retryDelay(attempt: number): number {
  return RETRY_BASE_DELAY * Math.pow(2, attempt); // exponential backoff
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 60_000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      withCredentials: false,
    });

    // ── Request interceptor: attach auth token ──
    this.client.interceptors.request.use(
      (config) => {
        let token = null;
        if (typeof window !== "undefined") {
          token = sessionStorage.getItem("admin_token") || localStorage.getItem("admin_token");
          if (!token) {
            try {
              const authData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
              token = authData?.state?.user?.token;
            } catch (e) {}
          }
        }
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Skip global loader for specific endpoints or background requests if needed
        // For now, track all requests
        if (typeof window !== "undefined") {
          useGlobalLoaderStore.getState().startLoading();
        }
        
        return config;
      },
      (error) => Promise.reject(error),
    );

    // ── Response interceptor: retry, refresh, normalize ──
    this.client.interceptors.response.use(
      (response) => {
        if (typeof window !== "undefined") {
          useGlobalLoaderStore.getState().stopLoading();
        }
        return response;
      },
      async (error: AxiosError) => {
        if (typeof window !== "undefined") {
          useGlobalLoaderStore.getState().stopLoading();
        }
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
        if (!originalRequest) return Promise.reject(error);

        // ── Retry logic for transient failures (429, 502, 503, 504) ──
        const retryCount = originalRequest._retryCount ?? 0;
        if (
          error.response &&
          RETRY_STATUS_CODES.includes(error.response.status) &&
          retryCount < MAX_RETRIES
        ) {
          originalRequest._retryCount = retryCount + 1;
          const delayMs = retryDelay(retryCount);
          await new Promise((res) => setTimeout(res, delayMs));
          return this.client(originalRequest);
        }

        // ── Handle 401 Unauthorized (Token Expired) ──
        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== "undefined") {
          originalRequest._retry = true;

          // Deduplicate concurrent refresh calls
          if (!this.refreshPromise) {
            this.refreshPromise = this.attemptTokenRefresh();
          }
          try {
            const newToken = await this.refreshPromise;
            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch {
            // Refresh failed — handled inside attemptTokenRefresh
          } finally {
            this.refreshPromise = null;
          }
        }

        // ── Normalize error response ──
        if (error.response) {
          const { status, data } = error.response;
          const message =
            (data as { message?: string })?.message ||
            (data as { error?: string })?.error ||
            `Request failed with status ${status}`;
          return Promise.reject(new ApiError(message, status, data));
        }
        if (error.request) {
          const errMsg = error.message === "Network Error" 
            ? "No response from server — check your connection (Network Error or CORS)"
            : `No response from server — check your connection (${error.message})`;
          return Promise.reject(new ApiError(errMsg, 0));
        }
        return Promise.reject(new ApiError(error.message, 0));
      },
    );
  }

  /**
   * Attempt to refresh the auth token.
   * FIXED: Previously sent access token as refresh token — now reads
   * a separate `refresh_token` key. Falls back to access token for
   * backends that accept it, but stores refresh token properly going forward.
   */
  private async attemptTokenRefresh(): Promise<string | null> {
    try {
      // 1. Look for a dedicated refresh token first
      let refreshToken = sessionStorage.getItem("admin_refresh_token") || localStorage.getItem("admin_refresh_token");
      let isUserToken = false;

      // 2. Fall back to user auth storage refresh token
      if (!refreshToken) {
        try {
          const authData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
          refreshToken = authData?.state?.user?.refreshToken || authData?.state?.user?.token;
          isUserToken = true;
        } catch {}
      }

      // 3. Last resort: use admin access token (some backends accept this)
      if (!refreshToken) {
        refreshToken = sessionStorage.getItem("admin_token") || localStorage.getItem("admin_token");
      }

      if (!refreshToken) return null;

      const refreshRes = await axios.post(`${API_BASE_URL || ""}/api/v1/auth/refresh`, {
        refreshToken,
      });

      const newToken =
        refreshRes.data?.accessToken ||
        refreshRes.data?.token ||
        refreshRes.data?.data?.accessToken ||
        refreshRes.data?.data?.token;
      const newRefreshToken =
        refreshRes.data?.refreshToken ||
        refreshRes.data?.data?.refreshToken;

      if (newToken) {
        if (isUserToken) {
          const authData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
          if (authData?.state?.user) {
            authData.state.user.token = newToken;
            if (newRefreshToken) authData.state.user.refreshToken = newRefreshToken;
            localStorage.setItem("auth-storage", JSON.stringify(authData));
          }
        } else {
          sessionStorage.setItem("admin_token", newToken);
          if (newRefreshToken) sessionStorage.setItem("admin_refresh_token", newRefreshToken);
        }
        return newToken;
      }

      return null;
    } catch {
      // Refresh failed — clear tokens and redirect to login
      this.clearAuthAndRedirect();
      return null;
    }
  }

  /**
   * Clear all auth state and redirect to admin login.
   * Uses a softer approach than window.location.reload() — navigates to login.
   */
  private clearAuthAndRedirect(): void {
    if (typeof window === "undefined") return;

    const hadAdminToken = !!sessionStorage.getItem("admin_token");
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");

    if (hadAdminToken) {
      // Admin token expired — go to admin login
      window.location.href = "/admin/login";
    } else {
      try {
        const authData = JSON.parse(localStorage.getItem("auth-storage") || "{}");
        if (authData?.state) {
          authData.state.isLoggedIn = false;
          authData.state.user = null;
          localStorage.setItem("auth-storage", JSON.stringify(authData));
        }
      } catch {}
      window.location.href = "/";
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Singleton export
export const apiClient = new ApiClient(API_BASE_URL);

// For testing / custom instances
export function createApiClient(baseURL: string): ApiClient {
  return new ApiClient(baseURL);
}
