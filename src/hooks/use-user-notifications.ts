"use client";

import { useState, useEffect, useCallback } from "react";
import { userNotificationService } from "@/services/user-notifications.service";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";

export function useUserNotifications() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoading(true);
    try {
      const unreadRes = await userNotificationService.getUnreadCount();
      const notifs: any = await userNotificationService.getNotifications(0, 50);
      
      let fetchedNotifs = notifs.content || notifs.data || notifs || [];
      if (!Array.isArray(fetchedNotifs)) {
          fetchedNotifs = [];
      }

      useNotificationStore.setState({
        notifications: fetchedNotifs,
        unreadCount: unreadRes || 0
      });
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    } else {
      useNotificationStore.getState().clearNotifications();
    }
  }, [isLoggedIn, fetchNotifications]);

  const markAllAsRead = async () => {
    if (!isLoggedIn) {
      useNotificationStore.getState().markAllAsRead();
      return;
    }
    try {
      const success = await userNotificationService.markAllAsRead();
      if (success) {
         useNotificationStore.getState().markAllAsRead();
         fetchNotifications();
      }
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!isLoggedIn) {
      useNotificationStore.getState().markAsRead(id);
      return null;
    }
    try {
      const response = await userNotificationService.markAsRead(id);
      useNotificationStore.getState().markAsRead(id);
      useNotificationStore.getState().setSelectedNotificationData(response);
      return response;
    } catch (error) {
      console.error("Failed to mark as read", error);
      useNotificationStore.getState().markAsRead(id);
      return null;
    }
  };

  const clearAll = () => {
     useNotificationStore.getState().clearAll();
  };

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
    clearAll
  };
}
