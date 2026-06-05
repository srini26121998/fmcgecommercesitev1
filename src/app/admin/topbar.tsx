"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, Zap, PanelLeft, PanelLeftClose, LogOut } from "lucide-react";
import MobileSidebar from "@/components/ui/admin/mobile-sidebar";
import { notificationService } from "@/services/notifications.service";
import { clearAdminToken } from "@/services/auth.service";

export default function Topbar({
  collapsed,
  onToggleSidebar,
  className,
}: {
  collapsed?: boolean;
  onToggleSidebar?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    clearAdminToken();
    router.replace("/admin/login");
  };

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { count } = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error("Failed to load unread count", err);
      }
    };
    fetchUnread();
    
    // Optional: could add a polling interval here if needed
    // const interval = setInterval(fetchUnread, 60000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 border-b border-[#e8e8e8]/80 bg-white/80 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? "md:left-16" : "md:left-64"
      } ${className || ""}`}
    >
      <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5 md:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* -- Sidebar toggle - always visible on desktop -- */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] transition-all duration-200 hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          {/* Mobile sidebar trigger */}
          <div className="md:hidden">
            <MobileSidebar />
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="text-[10px] font-black uppercase tracking-wider text-[#0c831f]">
              FMCG Admin
            </p>
            <p className="truncate text-sm font-black text-[#1a1a1a]">
              Operations
            </p>
          </div>
        </div>

        {/* Search - hidden on very small screens, visible on sm and up */}
        <div className="hidden sm:flex h-10 flex-1 items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f6f7f6] px-3 transition-all duration-200 focus-within:border-[#0c831f] focus-within:shadow-sm focus-within:bg-white max-w-md mx-2">
          <Search className="h-4 w-4 flex-shrink-0 text-[#999]" />
          <input
            type="text"
            placeholder="Search orders, SKUs..."
            className="min-w-0 flex-1 bg-transparent text-sm text-[#1a1a1a] outline-none placeholder:text-[#999]"
          />
        </div>
        
        {/* Mobile Search Icon Only */}
        <button className="sm:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-[#f6f7f6] text-[#666] ml-auto">
          <Search className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden h-10 items-center gap-1.5 rounded-xl border border-[#e8e8e8] px-3 text-sm font-bold text-[#0c831f] transition-all duration-200 btn-press hover:bg-[#e8f5e9] lg:flex"
          >
            <Zap className="h-4 w-4" />
            Storefront
          </Link>

          <Link
            href="/admin/notifications"
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#e8e8e8] bg-white text-[#666] transition-all duration-200 btn-press hover:bg-[#fff0f6] hover:text-[#ff4f8b] hover:border-[#ff4f8b]/30"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#ff4f8b] px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/profile"
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0c831f] to-[#10b981] text-sm font-black text-white shadow-md shadow-green-500/20 transition-all duration-200 btn-press hover:scale-105"
            aria-label="View profile"
          >
            S
          </Link>

          <button
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out of admin panel"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e8e8] bg-white text-[#666] transition-all duration-200 btn-press hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

