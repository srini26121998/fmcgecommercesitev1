"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { notificationService } from "@/services/notifications.service";
import { adminToast } from "@/lib/admin-toast";
import type {
  AdminNotification,
  NotificationFeed,
  NotificationStats,
  NotificationQueryParams,
  NotificationFilterTab,
} from "@/types/admin-notifications";

// ── Hook ──────────────────────────────────────────────────

export function useAdminNotifications() {
  const [feed, setFeed] = useState<NotificationFeed | null>(null);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<NotificationFilterTab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Track selected IDs for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Track which notification is expanded for details
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildQueryParams = useCallback(
    (tab: NotificationFilterTab, searchQuery: string, p: number): NotificationQueryParams => {
      const params: NotificationQueryParams = { page: p, pageSize };

      // Map tabs to backend params
      switch (tab) {
        case "all":
          break;
        case "unread":
          params.status = "unread";
          break;
        case "mentions":
          params.type = "system";
          break;
        case "activity":
          params.type = "order";
          break;
        case "system":
          params.type = "system";
          break;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      return params;
    },
    [pageSize]
  );

  const fetchNotifications = useCallback(
    async (tab: NotificationFilterTab, searchQuery: string, p: number) => {
      try {
        setLoading(true);
        setError(null);
        const params = buildQueryParams(tab, searchQuery, p);
        const [feedData, statsData] = await Promise.all([
          notificationService.getNotifications(params),
          notificationService.getNotificationStats(),
        ]);
        setFeed(feedData);
        setStats(statsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams]
  );

  // Initial load
  useEffect(() => {
    fetchNotifications(activeTab, search, page);
  }, [activeTab, page, fetchNotifications]);

  // Debounced search
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setPage(1);
        fetchNotifications(activeTab, value, 1);
      }, 300);
    },
    [activeTab, fetchNotifications]
  );

  // Tab change
  const handleTabChange = useCallback(
    (tab: NotificationFilterTab) => {
      setActiveTab(tab);
      setPage(1);
      setSelectedIds([]);
      setExpandedId(null);
    },
    []
  );

  // Mark as read
  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        const res = await notificationService.markAsRead(id);
        if (res?.message) adminToast.success(res.message);
        fetchNotifications(activeTab, search, page);
      } catch (err) {
        adminToast.apiError("Failed to mark as read");
      }
    },
    [activeTab, search, page, fetchNotifications]
  );

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res?.message) {
        adminToast.success(res.message);
      } else {
        adminToast.success("All notifications marked as read");
      }
      setSelectedIds([]);
      fetchNotifications(activeTab, search, page);
    } catch (err) {
      adminToast.apiError("Failed to mark all as read");
    }
  }, [activeTab, search, page, fetchNotifications]);

  // Archive
  const handleArchive = useCallback(
    async (id: string) => {
      try {
        await notificationService.archive(id);
        adminToast.success("Notification archived");
        fetchNotifications(activeTab, search, page);
      } catch (err) {
        adminToast.apiError("Failed to archive notification");
      }
    },
    [activeTab, search, page, fetchNotifications]
  );

  // Bulk archive
  const handleBulkArchive = useCallback(async () => {
    if (selectedIds.length === 0) return;
    try {
      await notificationService.bulkArchive(selectedIds);
      adminToast.success("Notifications archived");
      setSelectedIds([]);
      fetchNotifications(activeTab, search, page);
    } catch (err) {
      adminToast.apiError("Failed to archive notifications");
    }
  }, [selectedIds, activeTab, search, page, fetchNotifications]);

  // Delete
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await notificationService.delete(id);
        adminToast.success("Notification deleted");
        fetchNotifications(activeTab, search, page);
      } catch (err) {
        adminToast.apiError("Failed to delete notification");
      }
    },
    [activeTab, search, page, fetchNotifications]
  );

  // Page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    setSelectedIds([]);
    setExpandedId(null);
  }, []);

  // Toggle select
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  // Toggle select all
  const toggleSelectAll = useCallback(() => {
    if (!feed) return;
    const allIds = feed.groups.flatMap((g) => g.notifications.map((n) => n.id));
    setSelectedIds((prev) =>
      prev.length === allIds.length ? [] : allIds
    );
  }, [feed]);

  // Expand/collapse detail
  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // Refresh
  const refresh = useCallback(() => {
    fetchNotifications(activeTab, search, page);
  }, [activeTab, search, page, fetchNotifications]);

  return {
    // Data
    feed,
    stats,
    loading,
    error,
    // State
    activeTab,
    search,
    page,
    selectedIds,
    expandedId,
    // Actions
    setActiveTab: handleTabChange,
    setSearch: handleSearchChange,
    setPage: handlePageChange,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    archive: handleArchive,
    bulkArchive: handleBulkArchive,
    delete: handleDelete,
    toggleSelect,
    toggleSelectAll,
    toggleExpand,
    refresh,
  };
}
