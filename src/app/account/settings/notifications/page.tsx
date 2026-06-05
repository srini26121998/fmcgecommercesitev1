"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Bell, Smartphone, MessageSquare } from "lucide-react";
import NotificationSettingsPanel from "@/components/ui/notifications/notification-settings";
import { useUserNotifications } from "@/hooks/use-user-notifications";

export default function NotificationSettingsPage() {
  const { notifications, unreadCount } = useUserNotifications();

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link href="/account/settings" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Notification Settings</h1>
            <p className="text-xs text-[#666]">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-5 space-y-5">
        <NotificationSettingsPanel />

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-5 shadow-sm">
          <h3 className="text-sm font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#ff4f8b]" />
            Recent Notifications
          </h3>
          {notifications.length > 0 ? (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-center gap-3 rounded-xl bg-[#fafafa] p-3 border border-[#e8e8e8]">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${n.read ? "bg-[#e8e8e8]" : "bg-[#ff4f8b]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1a1a1a]">{n.title}</p>
                    <p className="text-[10px] text-[#666] truncate">{n.description}</p>
                  </div>
                  <span className="text-[9px] text-[#999] flex-shrink-0">
                    {new Date(n.timestamp).toLocaleDateString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#999] text-center py-4">No notifications yet</p>
          )}
        </div>
      </div>
    </main>
  );
}
