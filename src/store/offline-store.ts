"use client";

import { create } from "zustand";

interface OfflineStore {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineAt: string | null;
  pendingSync: boolean;
  registerServiceWorker: () => Promise<void>;
  setOnline: (online: boolean) => void;
  setPendingSync: (pending: boolean) => void;
}

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  wasOffline: false,
  lastOnlineAt: null,
  pendingSync: false,

  registerServiceWorker: async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("[SW] Service worker registered:", registration.scope);

      // Check for updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version available
              console.log("[SW] New version available — refresh to activate");
            }
          });
        }
      });
    } catch (error) {
      console.warn("[SW] Registration failed:", error);
    }
  },

  setOnline: (online) =>
    set((state) => ({
      isOnline: online,
      wasOffline: state.isOnline && !online ? true : !online ? true : false,
      lastOnlineAt: online ? new Date().toISOString() : state.lastOnlineAt,
    })),

  setPendingSync: (pending) => set({ pendingSync: pending }),
}));

// Auto-register on module load
if (typeof window !== "undefined") {
  // Listen for online/offline events
  window.addEventListener("online", () => {
    useOfflineStore.getState().setOnline(true);
  });
  window.addEventListener("offline", () => {
    useOfflineStore.getState().setOnline(false);
  });

  // Register service worker
  useOfflineStore.getState().registerServiceWorker();
}
