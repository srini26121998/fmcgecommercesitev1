"use client";

import { useState, useEffect } from "react";
import SidebarEnterprise from "@/components/ui/admin/sidebar-enterprise";
import Topbar from "./topbar";
import AdminFooter from "@/components/ui/admin/footer";
import AdminGuard from "@/components/ui/admin/admin-guard";

const STORAGE_KEY = "admin_sidebar_collapsed";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AdminGuard>
  );
}

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always start with false on both server and client to avoid hydration mismatch.
  // After hydration, sync from localStorage in useEffect.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setSidebarCollapsed(true);
    }
  }, []);

  // Persist sidebar state on change
  const handleToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  };

  return (
    <div className="flex min-h-screen bg-[#f2f2f2] text-[#1a1a1a]">
      {/* Enterprise Sidebar (fixed) */}
      <SidebarEnterprise
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
      />

      <div
        className={`min-w-0 flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        }`}
      >
        {/* Fixed/sticky header */}
        <Topbar collapsed={sidebarCollapsed} onToggleSidebar={() => handleToggle(!sidebarCollapsed)} />

        {/* Spacer for fixed header */}
        <div className="h-14 sm:h-16 shrink-0" />

        <main className="flex-1 min-h-0 p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>

        <AdminFooter />
      </div>
    </div>
  );
}

