// ── Admin Notification Service ────────────────────────────

import type {
  AdminNotification,
  NotificationCategory,
  NotificationPriority,
  NotificationFeed,
  NotificationQueryParams,
  NotificationStats,
  NotificationPreferences,
} from "@/types/admin-notifications";

// ── Grouping Logic ────────────────────────────────────────

function getGroupLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  if (date >= weekAgo) return "This Week";
  return "Earlier";
}

function buildNotificationFeed(
  items: AdminNotification[],
  totalCount: number,
  totalUnread: number,
  page: number,
  pageSize: number
): NotificationFeed {
  const groupsMap = new Map<string, AdminNotification[]>();
  for (const notif of items) {
    const createdAt = notif.createdAt || new Date().toISOString();
    const label = getGroupLabel(createdAt);
    const group = groupsMap.get(label) || [];
    group.push(notif);
    groupsMap.set(label, group);
  }

  const groups = Array.from(groupsMap.entries()).map(
    ([label, notifications]) => ({
      label,
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    })
  );

  return { groups, totalUnread, totalCount, page, pageSize };
}

// ── API Integration & Caching ─────────────────────────────
import { apiClient } from "@/lib/api-client";

let cachedNotifications: AdminNotification[] | null = null;
let lastFetchTime = 0;

async function fetchNotificationsFromAPI(): Promise<AdminNotification[]> {
  const now = Date.now();
  // Short TTL cache (1 second) to handle concurrent calls from getNotifications and getNotificationStats
  if (cachedNotifications && now - lastFetchTime < 1000) {
    return cachedNotifications;
  }

  try {
    const response = await apiClient.get<any>("/api/v1/notifications");
    const data = response.data?.data || response.data || [];
    
    cachedNotifications = data.map((n: any) => ({
      id: String(n.id || n.publicId),
      type: (n.type || "system").toLowerCase(),
      priority: "normal",
      title: n.title || "Notification",
      message: n.message || "",
      channel: "in_app",
      read: n.isRead || false,
      archived: false,
      createdAt: n.createdAt || new Date().toISOString(),
      updatedAt: n.updatedAt || new Date().toISOString(),
      actionUrl: n.referenceId ? `/admin/orders/${n.referenceId}` : undefined,
    }));
    lastFetchTime = now;
    return cachedNotifications || [];
  } catch (error) {
    console.error("Failed to fetch notifications from API:", error);
    return cachedNotifications || [];
  }
}

let mockPreferences: NotificationPreferences = {
  orderUpdates: true,
  inventoryAlerts: true,
  promotionPerformance: true,
  vendorActivity: true,
  deliveryExceptions: true,
  customerActivity: false,
  systemAlerts: true,
  securityAlerts: true,
  billingAlerts: true,
  emailDigest: "daily",
  pushEnabled: true,
  smsEnabled: false,
  quietHoursEnabled: false,
  quietHoursStart: null,
  quietHoursEnd: null,
};

// ── Service ───────────────────────────────────────────────

export const notificationService = {
  /**
   * Fetch notifications with filtering, search, and pagination.
   */
  async getNotifications(
    params: NotificationQueryParams = {}
  ): Promise<NotificationFeed> {
    try {
      let items = await fetchNotificationsFromAPI();
      
      if (params.status === "archived") {
        items = items.filter(n => n.archived);
      } else {
        items = items.filter(n => !n.archived);
      }

      if (params.status === "unread") {
        items = items.filter(n => !n.read);
      } else if (params.status === "read") {
        items = items.filter(n => n.read);
      }

      if (params.type && params.type !== "all") {
        items = items.filter(n => n.type === params.type);
      }

      if (params.search) {
        const q = params.search.toLowerCase();
        items = items.filter(
          n =>
            n.title.toLowerCase().includes(q) ||
            n.message.toLowerCase().includes(q)
        );
      }

      const totalCount = items.length;
      const totalUnread = items.filter(n => !n.read).length;
      const page = params.page || 1;
      const pageSize = params.pageSize || 20;

      const startIndex = (page - 1) * pageSize;
      const paginatedItems = items.slice(startIndex, startIndex + pageSize);

      return buildNotificationFeed(paginatedItems, totalCount, totalUnread, page, pageSize);
    } catch (error) {
      console.error("[notificationService] getNotifications failed:", error);
      throw error;
    }
  },

  /**
   * Fetch notification statistics.
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const allItems = await fetchNotificationsFromAPI();
      const active = allItems.filter(n => !n.archived);
      const total = active.length;
      const unread = active.filter(n => !n.read).length;

      const byType: Record<NotificationCategory, number> = {
        order: 0,
        inventory: 0,
        promotion: 0,
        vendor: 0,
        delivery: 0,
        customer: 0,
        system: 0,
        security: 0,
        billing: 0,
      };

      const byPriority: Record<NotificationPriority, number> = {
        low: 0,
        normal: 0,
        high: 0,
        critical: 0,
      };

      active.forEach(n => {
        if (byType[n.type] !== undefined) byType[n.type]++;
        if (byPriority[n.priority] !== undefined) byPriority[n.priority]++;
      });

      return {
        total,
        unread,
        byType,
        byPriority,
        trend: 0,
      };
    } catch (error) {
      console.error("[notificationService] getNotificationStats failed:", error);
      throw error;
    }
  },

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string): Promise<any> {
    try {
      const res = await apiClient.patch<any>(`/api/v1/notifications/${id}/read`);
      if (cachedNotifications) {
        cachedNotifications = cachedNotifications.map(n =>
          n.id === String(id) ? { ...n, read: true } : n
        );
      }
      return res?.data || res;
    } catch (error) {
      console.error(`[notificationService] markAsRead ${id} failed:`, error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<any> {
    try {
      const res = await apiClient.patch<any>("/api/v1/notifications/mark-all-read");
      if (cachedNotifications) {
        cachedNotifications = cachedNotifications.map(n => ({ ...n, read: true }));
      }
      return res?.data || res;
    } catch (error) {
      console.error("[notificationService] markAllAsRead failed:", error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const response = await apiClient.get<any>("/api/v1/notifications/unread-count");
      const count = typeof response === 'number' ? response : (response.data?.count ?? response.count ?? response.data ?? 0);
      return { count };
    } catch (error) {
      console.error("[notificationService] getUnreadCount failed:", error);
      return { count: 0 };
    }
  },

  /**
   * Archive a notification.
   */
  async archive(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/notifications/${id}`).catch(() => {});
      if (cachedNotifications) {
        cachedNotifications = cachedNotifications.map(n =>
          n.id === String(id) ? { ...n, archived: true } : n
        );
      }
    } catch (error) {
      console.error(`[notificationService] archive ${id} failed:`, error);
      throw error;
    }
  },

  /**
   * Bulk archive notifications.
   */
  async bulkArchive(ids: string[]): Promise<void> {
    try {
      if (cachedNotifications) {
        cachedNotifications = cachedNotifications.map(n =>
          ids.includes(n.id) ? { ...n, archived: true } : n
        );
      }
    } catch (error) {
      console.error("[notificationService] bulkArchive failed:", error);
      throw error;
    }
  },

  /**
   * Delete a notification permanently.
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/notifications/${id}`).catch(() => {});
      if (cachedNotifications) {
        cachedNotifications = cachedNotifications.filter(n => n.id !== String(id));
      }
    } catch (error) {
      console.error(`[notificationService] delete ${id} failed:`, error);
      throw error;
    }
  },

  /**
   * Add a new notification (used by notification triggers).
   */
  async addNotification(
    notification: Omit<AdminNotification, "read" | "archived">
  ): Promise<void> {
    try {
      const newNotif: AdminNotification = {
        ...notification,
        read: false,
        archived: false,
        id: notification.id || `notif-${Date.now()}`,
        createdAt: notification.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (cachedNotifications) {
        cachedNotifications.unshift(newNotif);
      }
    } catch (error) {
      console.error("[notificationService] addNotification failed:", error);
      throw error;
    }
  },

  /**
   * Get notification preferences.
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      return mockPreferences;
    } catch (error) {
      console.error("[notificationService] getPreferences failed:", error);
      throw error;
    }
  },

  /**
   * Update notification preferences.
   */
  async updatePreferences(
    prefs: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    try {
      mockPreferences = { ...mockPreferences, ...prefs };
      return mockPreferences;
    } catch (error) {
      console.error("[notificationService] updatePreferences failed:", error);
      throw error;
    }
  },
};
