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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

import { apiClient } from "@/lib/api-client";

export const profileService = {
  async getProfile(): Promise<AdminProfile> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/profile");
      return response.data?.data || response.data;
    } catch (e) {
      console.error(e);
      return { ...mockProfile }; // Fallback
    }
  },

  /**
   * Update profile fields.
   */
  async updateProfile(payload: ProfileUpdatePayload): Promise<AdminProfile> {
    try {
      const response = await apiClient.patch<any>("/api/v1/admin/profile", payload);
      return response.data?.data || response.data;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  /**
   * Change password.
   */
  async changePassword(payload: PasswordChangePayload): Promise<{ success: boolean }> {
    try {
      await apiClient.post("/api/v1/admin/profile/password", payload);
      return { success: true };
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // -- Sessions --
  async getLoginSessions(): Promise<LoginSession[]> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/profile/sessions");
      return response.data?.data || response.data;
    } catch (e) {
      console.warn("Failed to fetch login sessions", e);
      return [];
    }
  },

  async terminateSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/profile/sessions/${sessionId}`);
  },

  async terminateOtherSessions(): Promise<void> {
    await apiClient.delete("/api/v1/admin/profile/sessions/others");
  },

  // -- Activity Log --
  async getActivityLog(page = 1, pageSize = 20): Promise<{ entries: ActivityLogEntry[]; total: number; page: number; pageSize: number }> {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/profile/activity?page=${page}&pageSize=${pageSize}`);
      return response.data?.data || response.data;
    } catch (e) {
      console.warn("Failed to fetch activity log", e);
      return { entries: [], total: 0, page, pageSize };
    }
  },

  // -- Security & Auth --
  async getSecuritySettings(): Promise<AdminSecuritySettings> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/profile/security");
      return response.data?.data || response.data;
    } catch (e) {
      console.warn("Failed to fetch security settings", e);
      throw e;
    }
  },

  async updateSecuritySettings(payload: Partial<AdminSecuritySettings>): Promise<AdminSecuritySettings> {
    const response = await apiClient.patch<any>("/api/v1/admin/profile/security", payload);
    return response.data?.data || response.data;
  },

  async setupMFA(payload: MFASetupPayload): Promise<AdminSecuritySettings> {
    // We treat setupMFA the same as updateSecuritySettings for this phase
    const response = await apiClient.patch<any>("/api/v1/admin/profile/security", { mfaEnabled: payload.enabled, mfaMethod: payload.method });
    return response.data?.data || response.data;
  },

  /**
   * Rotate API key.
   */
  async rotateApiKey(): Promise<string> {
    const response = await apiClient.post<any>("/api/v1/admin/profile/api-key/rotate");
    return response.data?.data?.apiKey || response.data?.apiKey;
  },

  /**
   * Get notification preferences.
   */
  async getNotificationPrefs(): Promise<AdminNotificationPrefs> {
    const response = await apiClient.get<any>("/api/v1/admin/profile/notifications");
    return response.data?.data || response.data;
  },

  /**
   * Update notification preferences.
   */
  async updateNotificationPrefs(
    prefs: Partial<AdminNotificationPrefs>
  ): Promise<AdminNotificationPrefs> {
    await delay(300);
    return { ...mockNotifPrefs, ...prefs };
  },

  /**
   * Get profile stats.
   */
  async getProfileStats(): Promise<ProfileStats> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/profile/stats");
      return response.data?.data || response.data;
    } catch (e) {
      console.error(e);
      return { ...mockStats };
    }
  },
};
