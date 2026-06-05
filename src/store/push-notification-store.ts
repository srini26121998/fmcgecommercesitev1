"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushSubscriptionState {
  isSubscribed: boolean;
  subscription: PushSubscriptionJSON | null;
  permission: NotificationPermission | "default";
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  updatePermission: () => void;
}

export const usePushNotificationStore = create<PushSubscriptionState>()(
  persist(
    (set, get) => ({
      isSubscribed: false,
      subscription: null,
      permission: typeof Notification !== "undefined" ? Notification.permission : "default",

      updatePermission: () => {
        if (typeof Notification !== "undefined") {
          set({ permission: Notification.permission });
        }
      },

      subscribe: async () => {
        try {
          // Check for notification permission
          if (typeof Notification === "undefined") {
            console.warn("[Push] Notifications not supported");
            return;
          }

          let perm = Notification.permission;
          if (perm === "default") {
            perm = await Notification.requestPermission();
            set({ permission: perm });
          }

          if (perm !== "granted") {
            console.warn("[Push] Notification permission denied");
            return;
          }

          // Check for service worker
          if (!("serviceWorker" in navigator)) {
            console.warn("[Push] Service workers not supported");
            return;
          }

          const registration = await navigator.serviceWorker.ready;

          // Check for push manager
          if (!("pushManager" in registration)) {
            console.warn("[Push] Push manager not supported");
            return;
          }

          // Get existing subscription
          let sub = await registration.pushManager.getSubscription();

          if (!sub) {
            // In production, this would use a real VAPID key from the server
            const vapidPublicKey = "BEl62iUYgUvdBHTGNsamFvGJoXKQixP2yFpVvnzP7hD-S_F_9XUJ7qQVFUjNqFvq0KJwKjvLqZvJmBxYz9Kx5w";
            try {
              sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
              });
            } catch {
              console.warn("[Push] VAPID key invalid — simulating subscription for demo");
              sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
              });
            }
          }

          set({
            isSubscribed: true,
            subscription: sub.toJSON(),
          });

          // Send a test notification to confirm
          if (Notification.permission === "granted") {
            new Notification("🔔 Notifications Enabled", {
              body: "You'll now receive order updates and offers!",
              icon: "/favicon.ico",
            });
          }
        } catch (err) {
          console.warn("[Push] Subscription failed:", err);
          set({ isSubscribed: false });
        }
      },

      unsubscribe: async () => {
        try {
          if (!("serviceWorker" in navigator)) return;
          const registration = await navigator.serviceWorker.ready;
          const sub = await registration.pushManager.getSubscription();
          if (sub) {
            await sub.unsubscribe();
          }
          set({ isSubscribed: false, subscription: null });
        } catch (err) {
          console.warn("[Push] Unsubscribe failed:", err);
        }
      },
    }),
    {
      name: "push-notification-storage",
      partialize: (state) => ({
        isSubscribed: state.isSubscribed,
        permission: state.permission,
      }),
    }
  )
);
