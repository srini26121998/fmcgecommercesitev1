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

// ── In-Memory Mock Store ──────────────────────────────────

let mockNotifications: AdminNotification[] = [
  {
    id: "notif-1",
    type: "order",
    priority: "normal",
    title: "New order received",
    message: "Order #ORD-4920 has been placed by Ramesh Kumar for ₹1,250.",
    channel: "in_app",
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-2",
    type: "inventory",
    priority: "high",
    title: "Low Inventory Alert",
    message: "Fortune Soya Health Oil (1L) stock is below safety threshold (50 units remaining).",
    channel: "in_app",
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-3",
    type: "vendor",
    priority: "normal",
    title: "New Vendor Registration",
    message: "Organic Farms Pvt Ltd has submitted registration documents for approval.",
    channel: "in_app",
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-4",
    type: "system",
    priority: "critical",
    title: "Database Backup Completed with Warnings",
    message: "Weekly DB backup completed, but 2 media attachments failed to verify.",
    channel: "in_app",
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-5",
    type: "promotion",
    priority: "low",
    title: "Campaign 'Diwali Mega Sale' ended",
    message: "Promo code DIWALI50 is now expired. Total redemptions: 1,420.",
    channel: "in_app",
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-6",
    type: "delivery",
    priority: "normal",
    title: "Delivery delayed",
    message: "Shipment for order #ORD-4811 is delayed due to local traffic conditions.",
    channel: "in_app",
    read: false,
    archived: false,
    createdAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
  },
  {
    id: "notif-7",
    type: "customer",
    priority: "normal",
    title: "Customer feedback received",
    message: "Suresh Pillai left a 5-star review on 'Tata Salt Lite'.",
    channel: "in_app",
    read: true,
    archived: false,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  }
];

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
      // Filter out archived notifications unless status is explicitly archived
      let items = mockNotifications;
      
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
      const active = mockNotifications.filter(n => !n.archived);
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
  async markAsRead(id: string): Promise<void> {
    try {
      mockNotifications = mockNotifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
    } catch (error) {
      console.error(`[notificationService] markAsRead ${id} failed:`, error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<void> {
    try {
      mockNotifications = mockNotifications.map(n => ({ ...n, read: true }));
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
      const count = mockNotifications.filter(n => !n.archived && !n.read).length;
      return { count };
    } catch (error) {
      console.error("[notificationService] getUnreadCount failed:", error);
      throw error;
    }
  },

  /**
   * Archive a notification.
   */
  async archive(id: string): Promise<void> {
    try {
      mockNotifications = mockNotifications.map(n =>
        n.id === id ? { ...n, archived: true } : n
      );
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
      mockNotifications = mockNotifications.map(n =>
        ids.includes(n.id) ? { ...n, archived: true } : n
      );
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
      mockNotifications = mockNotifications.filter(n => n.id !== id);
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
      mockNotifications.unshift(newNotif);
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
