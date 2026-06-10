"use client";

import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  message?: string;
  type: string;
  read: boolean;
  timestamp: string;
  createdAt?: string | number;
  actionUrl?: string;
  publicId?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "timestamp">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  clearAll: () => void;
  selectedNotificationData: any;
  setSelectedNotificationData: (data: any) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  selectedNotificationData: null,
  setSelectedNotificationData: (data) => set({ selectedNotificationData: data }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: `notif-${Date.now()}`,
          read: false,
          timestamp: new Date().toISOString(),
          createdAt: Date.now(),
        },
        ...state.notifications,
      ],
      unreadCount: state.unreadCount + 1,
    })),

  markAsRead: (idOrPublicId) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === idOrPublicId || n.publicId === idOrPublicId ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
