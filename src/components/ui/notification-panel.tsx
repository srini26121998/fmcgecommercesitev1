"use client";

import { useState } from "react";
import { Bell, Package, Tag, Truck, X, Heart, Clock, Megaphone, Gift, RefreshCw } from "lucide-react";
import { useUserNotifications } from "@/hooks/use-user-notifications";
import Link from "next/link";

const NOTIFICATION_ICONS: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  order: { icon: Package, color: "text-[#0c831f]", bgColor: "bg-[#e8f5e9]" },
  offer: { icon: Tag, color: "text-[#ff4f8b]", bgColor: "bg-[#fff0f6]" },
  reminder: { icon: RefreshCw, color: "text-[#1565c0]", bgColor: "bg-[#e3f2fd]" },
  price_drop: { icon: Heart, color: "text-[#e91e63]", bgColor: "bg-[#fce4ec]" },
  referral: { icon: Gift, color: "text-[#e65100]", bgColor: "bg-[#fff3e0]" },
  system: { icon: Megaphone, color: "text-[#546e7a]", bgColor: "bg-[#eceff1]" },
};

const getTimeAgo = (timestamp: number) => {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useUserNotifications();

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] flex items-center justify-center hover-border-pink transition-all duration-200 btn-press hover:bg-white hover:shadow-sm group"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <Bell className="w-5 h-5 text-[#444] group-hover:text-[#ff4f8b] transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#ff4f8b] text-white text-[9px] font-black min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-1 shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#e8e8e8] shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#ff4f8b]" />
                <h3 className="text-sm font-black text-[#1a1a1a]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-[#ff4f8b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-semibold text-[#ff4f8b] hover:underline px-2 py-1"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[#f2f2f2] rounded-lg transition-colors">
                  <X className="w-4 h-4 text-[#666]" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-[#e8e8e8]">
                  {notifications.map((notification) => {
                    const iconConfig = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;
                    const Icon = iconConfig.icon;
                    return (
                      <Link
                        key={notification.id}
                        href={notification.actionUrl || "#"}
                        onClick={() => { markAsRead(notification.id); setIsOpen(false); }}
                        className={`flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fafafa] ${
                          !notification.read ? "bg-[#fff0f6]/40" : ""
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl ${iconConfig.bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                          <Icon className={`w-4 h-4 ${iconConfig.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm ${notification.read ? "font-semibold text-[#666]" : "font-bold text-[#1a1a1a]"}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-[#ff4f8b] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[#666] mt-0.5 line-clamp-2">{notification.message}</p>
                          <p className="text-[10px] text-[#999] mt-1">{getTimeAgo(typeof notification.createdAt === 'number' ? notification.createdAt : Date.now())}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Bell className="w-10 h-10 text-[#ccc] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#1a1a1a]">No notifications yet</p>
                  <p className="text-xs text-[#666] mt-1">We&apos;ll notify you when something arrives</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#e8e8e8] px-4 py-2.5">
              <button
                onClick={() => { clearAll(); setIsOpen(false); }}
                className="w-full text-center text-xs font-semibold text-[#ff4f8b] hover:underline py-1"
              >
                Clear all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
