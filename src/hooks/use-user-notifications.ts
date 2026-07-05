"use client";

import { useState, useEffect, useCallback } from "react";
import { userNotificationService } from "@/services/user-notifications.service";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.warn("AudioContext not supported or blocked", e);
  }
};

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
    let eventSource: EventSource | null = null;
    
    if (isLoggedIn) {
      fetchNotifications();
      
      const token = useAuthStore.getState().user?.token;
      if (token) {
        eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/notifications/stream?token=${token}`);
        
        eventSource.addEventListener("NOTIFICATION", (event: any) => {
          try {
            const newNotif = JSON.parse(event.data);
            useNotificationStore.getState().addNotification(newNotif);
            playNotificationSound();
          } catch (e) {
            console.error("Failed to parse SSE notification", e);
          }
        });
      }
    } else {
      useNotificationStore.getState().clearNotifications();
    }
    
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
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
      const notification = useNotificationStore.getState().notifications.find(n => n.publicId === id || n.id === id);
      useNotificationStore.getState().setSelectedNotificationData(notification || response);
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
