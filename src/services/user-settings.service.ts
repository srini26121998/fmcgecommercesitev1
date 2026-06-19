import { apiClient } from "@/lib/api-client";

export interface UserPreferences {
  language: string;
  theme: string;
  currency: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const userSettingsService = {
  getPreferences: async (): Promise<UserPreferences> => {
    const res = await apiClient.get<ApiResponse<UserPreferences>>("/api/v1/user/preferences");
    return res.data;
  },
  
  updatePreferences: async (prefs: Partial<UserPreferences>): Promise<UserPreferences> => {
    const res = await apiClient.put<ApiResponse<UserPreferences>>("/api/v1/user/preferences", prefs);
    return res.data;
  },

  registerDeviceToken: async (deviceToken: string, deviceType: string): Promise<void> => {
    await apiClient.post("/api/v1/user/device-token", { deviceToken, deviceType });
  }
};
