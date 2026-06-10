"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../dashboard-layout";
import { useAdminNotifications } from "@/hooks/use-admin-notifications";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import type { AdminNotification } from "@/types/admin-notifications";
import {
  Bell,
  BellRing,
  CheckCheck,
  Archive,
  Trash2,
  ChevronRight,
  Clock,
  ShoppingCart,
  Package,
  Percent,
  Store,
  Truck,
  Users,
  Settings2,
  ShieldAlert,
  CreditCard,
  ArrowUp,
  Inbox,
  ArrowLeft,
} from "lucide-react";

// -- Notification Type Config ------------------------------

const typeConfig: Record<
  string,
  { icon: typeof Bell; color: string; bg: string }
> = {
  order: {
    icon: ShoppingCart,
    color: "text-[#2563eb]",
    bg: "bg-[#eff6ff]",
  },
  inventory: {
    icon: Package,
    color: "text-[#d97706]",
    bg: "bg-[#fffbeb]",
  },
  promotion: {
    icon: Percent,
    color: "text-[#ff4f8b]",
    bg: "bg-[#fff0f6]",
  },
  vendor: {
    icon: Store,
    color: "text-[#9333ea]",
    bg: "bg-[#f3e8ff]",
  },
  delivery: {
    icon: Truck,
    color: "text-[#0c831f]",
    bg: "bg-[#e8f5e9]",
  },
  customer: {
    icon: Users,
    color: "text-[#0891b2]",
    bg: "bg-[#ecfeff]",
  },
  system: {
    icon: Settings2,
    color: "text-[#666]",
    bg: "bg-[#f6f7f6]",
  },
  security: {
    icon: ShieldAlert,
    color: "text-[#dc2626]",
    bg: "bg-[#fef2f2]",
  },
  billing: {
    icon: CreditCard,
    color: "text-[#059669]",
    bg: "bg-[#ecfdf5]",
  },
};

const filterTabs = [
  { id: "all" as const, label: "All", icon: Bell },
  { id: "unread" as const, label: "Unread", icon: BellRing },
  { id: "activity" as const, label: "Activity", icon: Clock },
  { id: "system" as const, label: "System", icon: Settings2 },
];

// -- Priority Dot ------------------------------------------

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    low: "bg-[#999]",
    normal: "bg-[#0c831f]",
    high: "bg-[#d97706]",
    critical: "bg-[#dc2626]",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${
        colors[priority] || "bg-[#999]"
      }`}
      title={priority}
    />
  );
}

// -- Time Format -------------------------------------------

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

// -- Notification Item -------------------------------------

function NotificationItem({
  notification,
  isSelected,
  isExpanded,
  onToggleSelect,
  onExpand,
  onMarkRead,
  onArchive,
  onDelete,
}: {
  notification: AdminNotification;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleSelect: () => void;
  onExpand: () => void;
  onMarkRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const cfg = typeConfig[notification.type] || typeConfig.system;
  const Icon = cfg.icon;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isSelected
          ? "border-[#0c831f]/30 bg-[#f0fdf4]"
          : notification.read
          ? "border-[#e8e8e8] bg-white"
          : "border-[#0c831f]/20 bg-[#fafdfb]"
      } ${!notification.read ? "shadow-sm" : ""} hover:border-[#0c831f]/30 hover:shadow-sm`}
    >
      <div className="flex items-start gap-3 p-3 sm:p-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-0.5">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-[#d0d0d0] text-[#0c831f] focus:ring-[#0c831f]"
          />
        </div>

        {/* Type Icon */}
        <div
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${cfg.color}`}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#0c831f]" />
                )}
                <p
                  className={`truncate text-sm ${
                    notification.read ? "font-semibold text-[#666]" : "font-bold text-[#1a1a1a]"
                  }`}
                >
                  {notification.title}
                </p>
                <PriorityDot priority={notification.priority} />
              </div>
              <p
                className={`mt-0.5 line-clamp-2 text-xs ${
                  notification.read ? "text-[#999]" : "text-[#666]"
                }`}
              >
                {notification.message}
              </p>
            </div>

            {/* Time + Actions */}
            <div className="flex flex-shrink-0 items-center gap-1.5">
              <span className="hidden whitespace-nowrap text-[10px] font-semibold text-[#999] sm:block">
                {formatTime(notification.createdAt)}
              </span>
              <button
                onClick={onExpand}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-[#999] opacity-0 transition-all hover:bg-[#f6f7f6] hover:text-[#1a1a1a] group-hover:opacity-100"
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Quick actions on hover */}
          <div className="mt-2 flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
            {!notification.read && (
              <button
                onClick={onMarkRead}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[#0c831f] hover:bg-[#e8f5e9]"
              >
                <CheckCheck className="h-3 w-3" />
                Mark Read
              </button>
            )}
            <button
              onClick={onArchive}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[#666] hover:bg-[#f6f7f6]"
            >
              <Archive className="h-3 w-3" />
              Archive
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[#dc2626] hover:bg-[#fef2f2]"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>

          {/* Expanded detail */}
          {isExpanded && (
            <div className="mt-3 rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-3 text-xs text-[#666]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-bold text-[#1a1a1a]">Type:</span>{" "}
                  {notification.type}
                </div>
                <div>
                  <span className="font-bold text-[#1a1a1a]">Priority:</span>{" "}
                  {notification.priority}
                </div>
                <div>
                  <span className="font-bold text-[#1a1a1a]">Channel:</span>{" "}
                  {notification.channel}
                </div>
                <div>
                  <span className="font-bold text-[#1a1a1a]">Received:</span>{" "}
                  {new Date(notification.createdAt).toLocaleString("en-IN")}
                </div>
              </div>
              {notification.actionUrl && (
                <a
                  href={notification.actionUrl}
                  className="mt-2 inline-flex items-center gap-1 rounded-lg bg-[#0c831f] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#0a6a18]"
                >
                  {notification.actionLabel || "View Details"}
                  <ChevronRight className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -- Notification Skeleton ---------------------------------

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-[#e8e8e8] bg-white p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#f0f0f0]" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-[#f0f0f0]" />
              <div className="h-3 w-1/2 rounded bg-[#f0f0f0]" />
              <div className="h-3 w-full rounded bg-[#f0f0f0]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// -- Main Page ---------------------------------------------

export default function NotificationsPage() {
  const router = useRouter();
  const {
    feed,
    stats,
    loading,
    error,
    activeTab,
    search,
    selectedIds,
    expandedId,
    setActiveTab,
    setSearch,
    setPage,
    markAsRead,
    markAllAsRead,
    archive,
    bulkArchive,
    delete: deleteNotif,
    toggleSelect,
    toggleSelectAll,
    toggleExpand,
  } = useAdminNotifications();

  // -- Scroll to top on page change ------------------------
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // -- Compute unread for each tab -------------------------
  const tabUnread = useMemo(() => {
    if (!stats) return {};
    const result: Record<string, number> = {};
    filterTabs.forEach((tab) => {
      if (tab.id === "all") result[tab.id] = stats.unread;
      else result[tab.id] = 0;
    });
    return result;
  }, [stats]);

  const totalPages = feed ? Math.ceil(feed.totalCount / feed.pageSize) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        {/* -- Header -------------------------------------- */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
                  Notifications
                </p>
                <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">
                  Notification Center
                </h1>
                <p className="mt-1 text-xs text-[#666]">
                  Stay updated with orders, inventory, vendors, and system alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <button
                  onClick={bulkArchive}
                  className="flex items-center gap-2 rounded-xl bg-[#f6f7f6] px-4 py-2.5 text-sm font-bold text-[#666] hover:bg-[#e8e8e8]"
                >
                  <Archive className="h-4 w-4" />
                  Archive {selectedIds.length}
                </button>
              )}
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]"
              >
                <CheckCheck className="h-4 w-4" />
                Mark All Read
                {stats && stats.unread > 0 && (
                  <span className="ml-0.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
                    {stats.unread}
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* -- Stats Bar ----------------------------------- */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Total",
                value: stats.total,
                icon: Bell,
                color: "text-[#0c831f]",
                bg: "bg-[#e8f5e9]",
              },
              {
                label: "Unread",
                value: stats.unread,
                icon: BellRing,
                color: "text-[#d97706]",
                bg: "bg-[#fffbeb]",
              },
              {
                label: "Critical",
                value: stats.byPriority.critical || 0,
                icon: ShieldAlert,
                color: "text-[#dc2626]",
                bg: "bg-[#fef2f2]",
              },
              {
                label: "High Priority",
                value: stats.byPriority.high || 0,
                icon: ArrowUp,
                color: "text-[#d97706]",
                bg: "bg-[#fffbeb]",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#1a1a1a]">
                      {item.value}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* -- Filters + Search ---------------------------- */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 rounded-2xl border border-[#e8e8e8] bg-white p-1 shadow-sm">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const unreadCount = tabUnread[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all sm:px-4 ${
                    isActive
                      ? "bg-[#0c831f] text-white shadow-sm"
                      : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {unreadCount > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#0c831f]/10 text-[#0c831f]"
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="w-full sm:w-72">
            <ReusableSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search notifications..."
            />
          </div>
        </div>

        {/* -- Select All Bar ------------------------------ */}
        {feed && feed.groups.length > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-4 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  feed.groups.flatMap((g) => g.notifications).length > 0 &&
                  feed.groups
                    .flatMap((g) => g.notifications)
                    .every((n) => selectedIds.includes(n.id))
                }
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-[#d0d0d0] text-[#0c831f] focus:ring-[#0c831f]"
              />
              <span className="text-xs font-bold text-[#666]">
                Select All
              </span>
            </label>
            {selectedIds.length > 0 && (
              <span className="text-xs font-bold text-[#0c831f]">
                {selectedIds.length} selected
              </span>
            )}
          </div>
        )}

        {/* -- Notification List --------------------------- */}
        {loading ? (
          <NotificationSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#fef2f2] bg-white p-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fef2f2]">
              <ShieldAlert className="h-7 w-7 text-[#dc2626]" />
            </div>
            <p className="text-lg font-black text-[#1a1a1a]">Something went wrong</p>
            <p className="mt-1 text-xs text-[#666]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-[#0c831f] px-5 py-2 text-sm font-bold text-white"
            >
              Try Again
            </button>
          </div>
        ) : feed && feed.groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#e8e8e8] bg-white p-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f5e9]">
              <Inbox className="h-7 w-7 text-[#0c831f]" />
            </div>
            <p className="text-lg font-black text-[#1a1a1a]">
              {search
                ? "No notifications found"
                : "All caught up!"}
            </p>
            <p className="mt-1 text-xs text-[#666]">
              {search
                ? "Try a different search term"
                : "You have no unread notifications"}
            </p>
          </div>
        ) : feed ? (
          <>
            {/* Groups */}
            {feed.groups.map((group) => (
              <div key={group.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wide text-[#999]">
                    {group.label}
                  </span>
                  <span className="h-px flex-1 bg-[#e8e8e8]" />
                  {group.unreadCount > 0 && (
                    <span className="rounded-full bg-[#0c831f]/10 px-2 py-0.5 text-[10px] font-bold text-[#0c831f]">
                      {group.unreadCount} unread
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {group.notifications.map((notif) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      isSelected={selectedIds.includes(notif.id)}
                      isExpanded={expandedId === notif.id}
                      onToggleSelect={() => toggleSelect(notif.id)}
                      onExpand={() => toggleExpand(notif.id)}
                      onMarkRead={() => markAsRead(notif.id)}
                      onArchive={() => archive(notif.id)}
                      onDelete={() => deleteNotif(notif.id)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* -- Pagination ----------------------------- */}
            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8e8e8] bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2 text-xs text-[#666]">
                  <span>
                    Showing {(feed.page - 1) * feed.pageSize + 1}₹
                    {Math.min(feed.page * feed.pageSize, feed.totalCount)} of{" "}
                    {feed.totalCount} notifications
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={feed.page <= 1}
                    onClick={() => handlePageChange(feed.page - 1)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#666] hover:bg-[#f0f0f0] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (feed.page <= 3) {
                      pageNum = i + 1;
                    } else if (feed.page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = feed.page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          feed.page === pageNum
                            ? "bg-[#0c831f] text-white"
                            : "text-[#666] hover:bg-[#f0f0f0]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={feed.page >= totalPages}
                    onClick={() => handlePageChange(feed.page + 1)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#666] hover:bg-[#f0f0f0] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* -- Empty spacer -------------------------------- */}
        <div className="h-8" />
      </div>
    </DashboardLayout>
  );
}

