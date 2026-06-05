"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  ChevronDown,
} from "lucide-react";
import { menuItems } from "@/data/admin/navigation";
import { useAuthStore } from "@/store/auth-store";

// ── Sidebar Component ─────────────────────────────────────

export default function SidebarEnterprise({
  collapsed: collapsedProp,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const collapsed = collapsedProp ?? false;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { user } = useAuthStore();

  // Derive initials and display name from auth store
  const adminInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || user.name[0].toUpperCase()
    : "SA";
  const adminName = user?.name || "Super Admin";
  const adminEmail = user?.email || "admin@fmcg.com";

  // Snapshot navigation data at mount so server & client use the same reference.
  // Prevents hydration mismatches caused by Turbopack Hot Module Replacement
  // refreshing the navigation module on the client while the server HTML is stale.
  const [navItems] = useState(() => menuItems);

  // Determine active parent menu item (not submenu)
  const activeParent = useMemo(() => {
    const match = navItems.find(
      (item) =>
        pathname === item.href ||
        (item.submenu && item.submenu.some((sub) => pathname.startsWith(sub.href)))
    );
    return match?.label ?? null;
  }, [pathname]);

  // Toggle accordion: if open, close it; if closed, open it
  const toggleSection = useCallback((label: string) => {
    setExpandedSection((prev) => (prev === label ? null : label));
  }, []);

  // Auto-expand parent on navigation — only responds to pathname changes,
  // never overrides a manual collapse by the user.
  useEffect(() => {
    const parent = navItems.find(
      (item) =>
        item.submenu && item.submenu.some((sub) => pathname.startsWith(sub.href))
    );
    setExpandedSection(parent?.label ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Hover-based expand for collapsed state
  const handleMouseEnter = useCallback(
    (label: string) => {
      if (!collapsed) return;
      expandTimerRef.current = setTimeout(() => {
        setHoveredItem(label);
      }, 200);
    },
    [collapsed]
  );

  const handleMouseLeave = useCallback(() => {
    if (expandTimerRef.current) {
      clearTimeout(expandTimerRef.current);
    }
    setHoveredItem(null);
  }, []);

  // ── Single sidebar, always mounted ──────────────────────────
  // Only CSS classes change — the DOM tree stays intact, preserving
  // all internal state (expanded sections, hover, etc.) across toggles.

  return (
    <aside
      className={`fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-[#e8e8e8] bg-white transition-all duration-300 ease-in-out ${
        collapsed ? "w-16 shadow-sm" : "w-64 max-md:hidden"
      }`}
    >
      {/* ── Logo area ── */}
      <div
        className={`flex w-full items-center border-b border-[#e8e8e8] transition-all duration-300 ${
          collapsed ? "justify-center px-0 py-4" : "justify-between px-4 py-4"
        }`}
      >
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#ff4f8b]">
            <span className="text-sm font-black text-white">F</span>
          </div>
          {/* Logo label — hidden when collapsed */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            <div className="whitespace-nowrap">
              <p className="text-[10px] font-black uppercase tracking-wide text-[#0c831f]">Admin Panel</p>
              <h1 className="mt-0.5 text-sm font-black leading-tight text-[#1a1a1a]">FMCG Commerce</h1>
            </div>
          </div>
        </Link>

      </div>

      {/* ── Navigation ── */}
      <nav
        className={`w-full flex-1 overflow-y-auto space-y-0.5 transition-all duration-300 ${
          collapsed ? "px-2 py-3" : "px-3 py-3"
        }`}
        style={{ scrollbarWidth: "thin", scrollbarColor: "#ccc transparent" }}
      >
        {navItems.map((item) => {
          const isActiveSection = activeParent === item.label;
          // Parent link only lights up on its exact href — not when a child is active
          const isParentExactActive = pathname === item.href;
          const isExpanded = expandedSection === item.label;
          const hasSubmenu = item.submenu && item.submenu.length > 0;

          return (
            <div key={item.label}>
              {hasSubmenu ? (
                <>
                  {/* ── Split row: Link (navigate) + Button (toggle) ── */}
                  <div
                    className={`flex w-full items-center ${collapsed ? "justify-center" : ""}`}
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => e.stopPropagation()}
                      className={`
                        flex items-center transition-all duration-150
                        ${
                          collapsed
                            ? `h-10 w-10 justify-center rounded-xl ${
                                isParentExactActive
                                  ? "bg-[#e8f5e9] text-[#0c831f]"
                                  : "text-[#999] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                              }`
                            : `flex-1 rounded-l-xl px-3 py-2.5 gap-2.5 ${
                                isParentExactActive
                                  ? "bg-[#e8f5e9] text-[#0c831f]"
                                  : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                              }`
                        }
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon className="h-6 w-6 flex-shrink-0" />
                      {/* Label — hidden when collapsed */}
                      <div
                        className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="block text-sm font-medium leading-tight">{item.label}</span>
                          {item.caption && (
                            <span className="block truncate text-[10px] font-medium opacity-70">{item.caption}</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    {/* Expand/collapse submenu button — only when expanded */}
                    {!collapsed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleSection(item.label);
                        }}
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-r-xl transition-all duration-150 ${
                          isActiveSection
                            ? "bg-[#e8f5e9] text-[#0c831f]"
                            : "text-[#999] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                        }`}
                        aria-label={isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                        type="button"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ease-in-out ${
                            isExpanded ? "rotate-0" : "-rotate-90"
                          }`}
                        />
                      </button>
                    )}

                    {/* Tooltip — only in collapsed state */}
                    {collapsed && hoveredItem === item.label && (
                      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50">
                        <div className="rounded-lg bg-[#1a1a1a] px-3 py-1.5 text-xs font-bold text-white shadow-lg whitespace-nowrap">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a1a1a]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── Submenu — CSS-animated, always in DOM ── */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      collapsed || !isExpanded ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
                    }`}
                  >
                      <div className="ml-3 mt-0.5 border-l-2 border-[#e8e8e8] pl-3 space-y-0.5">
                        {item.submenu!.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={(e) => e.stopPropagation()}
                              className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                                isSubActive
                                  ? "bg-[#e8f5e9] text-[#0c831f] font-bold"
                                  : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                              }`}
                            >
                              <sub.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${
                                isSubActive ? "text-[#0c831f]" : "text-[#999] group-hover:text-[#666]"
                              }`} />
                              <span>{sub.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                  </div>
                </>
              ) : (
                /* ── No submenu — single link ── */
                <div
                  className={`relative w-full ${collapsed ? "flex justify-center" : ""}`}
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={item.href}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                      flex items-center transition-all duration-150
                      ${
                        collapsed
                          ? `h-10 w-10 justify-center rounded-xl ${
                              isActiveSection
                                ? "bg-[#e8f5e9] text-[#0c831f]"
                                : "text-[#999] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                            }`
                          : `w-full rounded-xl px-3 py-2.5 gap-2.5 ${
                              isActiveSection
                                ? "bg-[#e8f5e9] text-[#0c831f]"
                                : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                            }`
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-6 w-6 flex-shrink-0" />
                    {/* Label — hidden when collapsed */}
                    <div
                      className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                        collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block text-sm font-medium leading-tight">{item.label}</span>
                        {item.caption && (
                          <span className="block truncate text-[10px] font-medium opacity-70">{item.caption}</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Tooltip — only in collapsed state */}
                  {collapsed && hoveredItem === item.label && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50">
                      <div className="rounded-lg bg-[#1a1a1a] px-3 py-1.5 text-xs font-bold text-white shadow-lg whitespace-nowrap">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a1a1a]" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bottom section ── */}
      <div
        className={`w-full border-t border-[#e8e8e8] transition-all duration-300 ${
          collapsed ? "px-2 py-3" : "px-4 py-3"
        }`}
      >
        <div
          className={`rounded-xl bg-[#f6f7f6] px-3 py-2 transition-all ${
            collapsed ? "flex items-center justify-center" : "flex items-center justify-between"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0c831f] animate-pulse" />
            <span
              className={`overflow-hidden whitespace-nowrap text-xs font-bold text-[#666] transition-all duration-300 ${
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}
            >
              System Online
            </span>
          </div>
          <span
            className={`overflow-hidden whitespace-nowrap text-xs font-bold text-[#0c831f] transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            99.9%
          </span>
        </div>
        <div
          className={`mt-2 flex items-center gap-2.5 transition-all ${
            collapsed ? "justify-center px-0" : "px-1"
          }`}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0c831f] text-xs font-bold text-white">
            {adminInitials}
          </div>
          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[#1a1a1a]">{adminName}</p>
              <p className="truncate text-[10px] text-[#999]">{adminEmail}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

