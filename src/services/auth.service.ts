import { apiClient } from "@/lib/api-client";
import type { UserProfile } from "@/store/auth-store";

// ── Admin token storage key ────────────────────────────
const ADMIN_TOKEN_KEY = "admin_token";

/** Read the admin token from sessionStorage (client-side only). */
export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

/** Remove the admin token from sessionStorage (on logout). */
export function clearAdminToken(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export interface LoginPayload {
  identifier: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password?: string;
  mobile: string;
  role?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  zone?: string;
}

export interface SendOtpPayload {
  identifier: string;
  channel: string;
  name?: string;
}

export interface VerifyOtpPayload {
  identifier: string;
  otp: string;
  name?: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: Partial<UserProfile>;
  data?: any;
}

class AuthService {
  /**
   * Authenticate a user with identifier and password
   * @param payload LoginPayload containing identifier and password
   * @returns AuthResponse containing token and user details
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      // The API endpoint matches the base url configured in api-client
      const response = await apiClient.post<any>("/api/v1/auth/login", payload);
      
      const token = response.accessToken || response.token || response.data?.token || response.data?.accessToken;
      if (token && typeof window !== "undefined") {
        sessionStorage.setItem("admin_token", token);
      }
      
      const user = response.user || response.data?.user;
      const role = user?.role || response.role || response.data?.role;
      
      if (role === "DELIVERY_BOY") {
        apiClient.get("/api/v1/notifications/stream").catch((err) => {
          console.warn("Failed to initialize notifications stream:", err);
        });
      }

      // Return normalized response. Adjust based on the actual API structure
      return {
        success: true,
        message: response.message || response.data?.message,
        token: token,
        user: user,
        data: response.data || response,
      };
    } catch (error: any) {
      console.warn("Login failed:", error);
      throw error;
    }
  }

  /**
   * Register a new user
   * @param payload RegisterPayload containing user details
   * @returns AuthResponse containing token and user details
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("/api/v1/auth/register", payload);
      const token = response.accessToken || response.token || response.data?.token || response.data?.accessToken;
      if (token && typeof window !== "undefined") {
        sessionStorage.setItem("admin_token", token);
      }
      
      return {
        success: true,
        message: response.message || response.data?.message,
        token: token,
        user: response.user || response.data?.user,
        data: response.data || response,
      };
    } catch (error: any) {
      console.warn("Registration failed:", error);
      throw error;
    }
  }

  /**
   * Log out a user
   * @param payload object containing refreshToken
   * @returns AuthResponse
   */
  async logout(payload: { refreshToken: string }): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("/api/v1/auth/logout", payload);
      
      return {
        success: true,
        message: response.message || response.data?.message,
        data: response.data || response,
      };
    } catch (error: any) {
      console.warn("Logout failed:", error);
      throw error;
    }
  }

  /**
   * Send OTP to user's mobile or email
   * @param payload SendOtpPayload
   */
  async sendOtp(payload: SendOtpPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("/api/v1/auth/send-otp", payload);
      
      return {
        success: true,
        message: response.message || response.data?.message,
        data: response.data || response,
      };
    } catch (error: any) {
      console.warn("Failed to send OTP:", error);
      throw error;
    }
  }

  /**
   * Verify OTP
   * @param payload VerifyOtpPayload
   */
  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("/api/v1/auth/verify-otp", payload);
      const token = response.accessToken || response.token || response.data?.token || response.data?.accessToken;
      if (token && typeof window !== "undefined") {
        sessionStorage.setItem("admin_token", token);
      }
      
      const user = response.user || response.data?.user;
      const role = user?.role || response.role || response.data?.role;
      
      if (role === "DELIVERY_BOY") {
        apiClient.get("/api/v1/notifications/stream").catch((err) => {
          console.warn("Failed to initialize notifications stream:", err);
        });
      }

      return {
        success: true,
        message: response.message || response.data?.message,
        token: token,
        user: user,
        data: response.data || response,
      };
    } catch (error: any) {
      console.warn("Failed to verify OTP:", error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * @param payload RefreshTokenPayload
   */
  async refreshToken(payload: RefreshTokenPayload): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("/api/v1/auth/refresh", payload);
      const token = response.accessToken || response.token || response.data?.token || response.data?.accessToken;
      if (token && typeof window !== "undefined") {
        sessionStorage.setItem("admin_token", token);
      }
      
      return {
        success: true,
        message: response.message || response.data?.message,
        token: token,
        user: response.user || response.data?.user,
        data: response.data || response,
      };
    } catch (error: any) {
      console.warn("Failed to refresh token:", error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param email User's email
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("/api/v1/auth/forgot-password", { email });
      return {
        success: true,
        message: response.message || response.data?.message,
        data: response.data || response,
      };
    } catch (error: any) {
      console.warn("Forgot password failed:", error);
      throw error;
    }
  }

  /**
   * Reset password using token
   * @param password New password
   * @param token Reset token
   */
  async resetPassword(password: string, token: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<any>("/api/v1/auth/reset-password", { password, token });
      return {
        success: true,
        message: response.message || response.data?.message,
        data: response.data || response,
      };
    } catch (error: any) {
      console.warn("Reset password failed:", error);
      throw error;
    }
  }

  /**
   * Admin-specific login.
   * Hits /api/v1/auth/login and stores the token under 'admin_token'
   * in sessionStorage ONLY when the backend returns role == ADMIN.
   * Throws if credentials are wrong or the account is not an admin.
   */
  async adminLogin(identifier: string, password: string): Promise<AuthResponse> {
    // Clear any stale admin token before attempting
    clearAdminToken();

    const response = await apiClient.post<any>("/api/v1/auth/login", {
      identifier,
      password,
    });

    const token =
      response.accessToken ||
      response.token ||
      response.data?.accessToken ||
      response.data?.token;

    if (!token) {
      throw new Error(response.message || "Login failed: no token returned.");
    }

    // Decode role from JWT payload (base64url, no signature verify needed here).
    let role = "";
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      role = (payload.role || payload.authorities?.[0] || "").toUpperCase();
    } catch {
      // If we can't decode, fall back to checking response body
      role = (
        response.role ||
        response.data?.role ||
        response.user?.role ||
        ""
      ).toUpperCase();
    }

    if (role !== "ADMIN") {
      throw new Error(
        "Access denied: this account does not have admin privileges."
      );
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    }

    return {
      success: true,
      message: response.message || response.data?.message,
      token,
      user: response.user || response.data?.user,
      data: response.data || response,
    };
  }
}

export const authService = new AuthService();
