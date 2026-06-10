import { apiClient } from "@/lib/api-client";
import type { Notification } from "@/store/notification-store";

export const userNotificationService = {
  async getNotifications(page: number = 0, size: number = 20): Promise<{ content: Notification[], totalElements: number, totalPages: number }> {
    const response = await apiClient.get<any>(`/api/v1/notifications?page=${page}&size=${size}`);
    return response.data || response;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<any>("/api/v1/notifications/unread-count");
    return typeof response === 'number' ? response : (response.data?.count ?? response.count ?? response.data ?? 0);
  },

  async markAllAsRead(): Promise<boolean> {
    await apiClient.patch("/api/v1/notifications/mark-all-read");
    return true;
  },

  async markAsRead(publicId: string): Promise<any> {
    const response = await apiClient.post<any>(`/api/v1/notifications/${publicId}/read`);
    return response.data || response;
  }
};
