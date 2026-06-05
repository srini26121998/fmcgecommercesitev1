// ── Admin Profile Service ─────────────────────────────────

import type {
  AdminProfile,
  LoginSession,
  ActivityLogEntry,
  AdminSecuritySettings,
  AdminNotificationPrefs,
  ProfileStats,
  ProfileUpdatePayload,
  PasswordChangePayload,
  MFASetupPayload,
} from "@/types/admin-profile";
import { apiClient } from "@/lib/api-client";

export const profileService = {
  /**
   * Fetch admin profile.
   */
  async getProfile(): Promise<AdminProfile> {
    const response = await apiClient.get<any>("/api/v1/admin/profile");
    return response.data || response;
  },

  /**
   * Update profile fields.
   */
  async updateProfile(payload: ProfileUpdatePayload): Promise<AdminProfile> {
    const response = await apiClient.put<any>("/api/v1/admin/profile", payload);
    return response.data || response;
  },

  /**
   * Change password.
   */
  async changePassword(payload: PasswordChangePayload): Promise<{ success: boolean }> {
    const response = await apiClient.post<any>("/api/v1/admin/profile/change-password", payload);
    return response.data || response;
  },

  /**
   * Get login sessions.
   */
  async getSessions(): Promise<LoginSession[]> {
    const response = await apiClient.get<any>("/api/v1/admin/profile/sessions");
    return response.data || response;
  },

  /**
   * Terminate a session.
   */
  async terminateSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/profile/sessions/${sessionId}`);
  },

  /**
   * Terminate all other sessions.
   */
  async terminateOtherSessions(): Promise<void> {
    await apiClient.delete("/api/v1/admin/profile/sessions/others");
  },

  /**
   * Get activity log (paginated).
   */
  async getActivityLog(
    page = 1,
    pageSize = 10
  ): Promise<{ entries: ActivityLogEntry[]; total: number; page: number; pageSize: number }> {
    const response = await apiClient.get<any>("/api/v1/admin/profile/activity", {
      params: { page, pageSize },
    });
    return response.data || response;
  },

  /**
   * Get security settings.
   */
  async getSecuritySettings(): Promise<AdminSecuritySettings> {
    const response = await apiClient.get<any>("/api/v1/admin/profile/security");
    return response.data || response;
  },

  /**
   * Update MFA settings.
   */
  async updateMFA(payload: MFASetupPayload): Promise<AdminSecuritySettings> {
    const response = await apiClient.put<any>("/api/v1/admin/profile/security/mfa", payload);
    return response.data || response;
  },

  /**
   * Rotate API key.
   */
  async rotateApiKey(): Promise<string> {
    const response = await apiClient.post<any>("/api/v1/admin/profile/security/rotate-api-key");
    return response.data || response;
  },

  /**
   * Get notification preferences.
   */
  async getNotificationPrefs(): Promise<AdminNotificationPrefs> {
    const response = await apiClient.get<any>("/api/v1/admin/profile/notifications");
    return response.data || response;
  },

  /**
   * Update notification preferences.
   */
  async updateNotificationPrefs(
    prefs: Partial<AdminNotificationPrefs>
  ): Promise<AdminNotificationPrefs> {
    const response = await apiClient.put<any>("/api/v1/admin/profile/notifications", prefs);
    return response.data || response;
  },

  /**
   * Get profile stats.
   */
  async getProfileStats(): Promise<ProfileStats> {
    const response = await apiClient.get<any>("/api/v1/admin/profile/stats");
    return response.data || response;
  },
};
