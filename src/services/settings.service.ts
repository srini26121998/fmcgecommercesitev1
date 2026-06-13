// ── Settings Management Service Layer ────────────────────
// Architecture: UI → Component → Hook → Service → Axios → API Gateway → Backend
//
// This service is the single source of truth for all settings-related data.

import type {
  SettingsUser,
  Role,
  FeatureFlag,
  ThemeSettings,
  ApiKey,
  AuditLog,
  SystemConfig,
  SettingsApiResponse,
  PaginatedResponse,
  SettingsQueryParams,
  CreateUserFormData,
  CreateRoleFormData,
  CreateApiKeyFormData,
  UpdateConfigFormData,
  PaymentMethodConfig,
  TaxRate,
  GstReturn,
  NotificationChannel,
  NotificationEventMapping,
  GlobalSettings,
} from "@/types/settings";
import { apiClient } from "@/lib/api-client";

// ── Settings Service ──────────────────────────────────────

export const settingsService = {
  // ═══════════════════════════════════════════════════════
  // USER MANAGEMENT
  // ═══════════════════════════════════════════════════════

  async getUsers(
    params?: Partial<SettingsQueryParams>
  ): Promise<SettingsApiResponse<PaginatedResponse<SettingsUser>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/users", { params });
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch users:", error);
      throw error;
    }
  },

  async getUserById(userId: string): Promise<SettingsApiResponse<SettingsUser | null>> {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/settings/users/${userId}`);
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error(`[settingsService] Failed to fetch user ${userId}:`, error);
      throw error;
    }
  },

  async createUser(data: CreateUserFormData): Promise<SettingsApiResponse<SettingsUser>> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/settings/users", data);
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to create user:", error);
      throw error;
    }
  },

  async updateUserStatus(userId: string, status: string): Promise<SettingsApiResponse<boolean>> {
    try {
      await apiClient.patch(`/api/v1/admin/settings/users/${userId}/status`, { status });
      return { success: true, data: true };
    } catch (error) {
      console.error(`[settingsService] Failed to update user status for ${userId}:`, error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // ROLES & PERMISSIONS
  // ═══════════════════════════════════════════════════════

  async getRoles(
    params?: Partial<SettingsQueryParams>
  ): Promise<SettingsApiResponse<PaginatedResponse<Role>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/roles", { params });
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch roles:", error);
      throw error;
    }
  },

  async createRole(data: CreateRoleFormData): Promise<SettingsApiResponse<Role>> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/settings/roles", data);
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to create role:", error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // FEATURE FLAGS
  // ═══════════════════════════════════════════════════════

  async getFeatureFlags(
    params?: Partial<SettingsQueryParams>
  ): Promise<SettingsApiResponse<PaginatedResponse<FeatureFlag>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/feature-flags", { params });
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch feature flags:", error);
      throw error;
    }
  },

  async toggleFeatureFlag(flagId: string, enabled: boolean): Promise<SettingsApiResponse<boolean>> {
    try {
      await apiClient.patch(`/api/v1/admin/settings/feature-flags/${flagId}`, { enabled });
      return { success: true, data: true };
    } catch (error) {
      console.error(`[settingsService] Failed to toggle feature flag ${flagId}:`, error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // THEME SETTINGS
  // ═══════════════════════════════════════════════════════

  async getThemeSettings(): Promise<SettingsApiResponse<ThemeSettings>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/theme");
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch theme settings:", error);
      throw error;
    }
  },

  async updateThemeSettings(
    data: Partial<ThemeSettings>
  ): Promise<SettingsApiResponse<ThemeSettings>> {
    try {
      const response = await apiClient.put<any>("/api/v1/admin/settings/theme", data);
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to update theme settings:", error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // API KEYS
  // ═══════════════════════════════════════════════════════

  async getApiKeys(
    params?: Partial<SettingsQueryParams>
  ): Promise<SettingsApiResponse<PaginatedResponse<ApiKey>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/api-keys", { params });
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch API keys:", error);
      throw error;
    }
  },

  async createApiKey(data: CreateApiKeyFormData): Promise<SettingsApiResponse<ApiKey>> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/settings/api-keys", data);
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to create API key:", error);
      throw error;
    }
  },

  async revokeApiKey(keyId: string): Promise<SettingsApiResponse<boolean>> {
    try {
      await apiClient.delete(`/api/v1/admin/settings/api-keys/${keyId}`);
      return { success: true, data: true };
    } catch (error) {
      console.error(`[settingsService] Failed to revoke API key ${keyId}:`, error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // AUDIT LOGS
  // ═══════════════════════════════════════════════════════

  async getAuditLogs(
    params?: Partial<SettingsQueryParams>
  ): Promise<SettingsApiResponse<PaginatedResponse<AuditLog>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/audit-logs", { params });
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch audit logs:", error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // SYSTEM CONFIGURATIONS
  // ═══════════════════════════════════════════════════════

  async getSystemConfigs(
    params?: Partial<SettingsQueryParams>
  ): Promise<SettingsApiResponse<PaginatedResponse<SystemConfig>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/config", { params });
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch system configs:", error);
      throw error;
    }
  },

  async updateSystemConfig(
    data: UpdateConfigFormData
  ): Promise<SettingsApiResponse<boolean>> {
    try {
      await apiClient.put("/api/v1/admin/settings/config", data);
      return { success: true, data: true };
    } catch (error) {
      console.error("[settingsService] Failed to update system config:", error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // PAYMENT SETTINGS
  // ═══════════════════════════════════════════════════════

  async getPaymentMethods(): Promise<SettingsApiResponse<PaymentMethodConfig[]>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/payments");
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch payment methods:", error);
      throw error;
    }
  },

  async togglePaymentMethod(methodId: string, enabled: boolean): Promise<SettingsApiResponse<boolean>> {
    try {
      await apiClient.patch(`/api/v1/admin/settings/payments/${methodId}`, { enabled });
      return { success: true, data: true };
    } catch (error) {
      console.error(`[settingsService] Failed to toggle payment method ${methodId}:`, error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // GST / TAX SETTINGS
  // ═══════════════════════════════════════════════════════



  // ═══════════════════════════════════════════════════════
  // NOTIFICATION SETTINGS
  // ═══════════════════════════════════════════════════════

  async getNotificationChannels(): Promise<SettingsApiResponse<NotificationChannel[]>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/notifications/channels");
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch notification channels:", error);
      throw error;
    }
  },

  async getNotificationEventMappings(): Promise<SettingsApiResponse<NotificationEventMapping[]>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings/notifications/events");
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("[settingsService] Failed to fetch notification event mappings:", error);
      throw error;
    }
  },

  async toggleNotificationChannel(
    channelName: string,
    enabled: boolean
  ): Promise<SettingsApiResponse<boolean>> {
    try {
      await apiClient.patch(`/api/v1/admin/settings/notifications/channels/${channelName}`, { enabled });
      return { success: true, data: true };
    } catch (error) {
      console.error(`[settingsService] Failed to toggle notification channel ${channelName}:`, error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // GLOBAL SETTINGS
  // ═══════════════════════════════════════════════════════

  async getGlobalSettings(): Promise<SettingsApiResponse<GlobalSettings>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/settings");
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Failed to fetch global settings:", error);
      throw error;
    }
  },

  async updateGlobalSettings(data: GlobalSettings): Promise<SettingsApiResponse<GlobalSettings>> {
    try {
      const response = await apiClient.put<any>("/api/v1/admin/settings", data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Failed to update global settings:", error);
      throw error;
    }
  },
};

export type SettingsService = typeof settingsService;
