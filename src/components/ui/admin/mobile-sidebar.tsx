"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { menuItems } from "@/data/admin/navigation";

export default function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Snapshot nav data at mount so server & client use the same reference.
  // Prevents hydration mismatches from Turbopack HMR.
  const [navItems] = useState(() => menuItems);

  // Determine active parent menu item
  const activeParent = useMemo(() => {
    const match = navItems.find(
      (item) =>
        pathname === item.href ||
        (item.submenu && item.submenu.some((sub) => pathname.startsWith(sub.href)))
    );
    return match?.label ?? null;
  }, [pathname]);

  // Auto-open parent section if a sub-route is active
  useEffect(() => {
    const parent = navItems.find(
      (item) =>
        item.submenu && item.submenu.some((sub) => pathname.startsWith(sub.href))
    );
    if (parent && parent.label !== expandedSection) {
      setExpandedSection(parent.label);
    }
  }, [pathname]);

  const toggleSection = (label: string) => {
    setExpandedSection((prev) => (prev === label ? null : label));
  };

  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] transition-colors hover:bg-[#f2f2f2] md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="border-[#e8e8e8] bg-white p-0 text-[#1a1a1a]"
      >
        <div className="flex h-full flex-col">
          {/* Logo header */}
          <div className="flex items-center justify-between border-b border-[#e8e8e8] px-4 py-4">
            <Link href="/admin" onClick={close} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff4f8b]">
                <span className="text-sm font-black text-white">F</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wide text-[#0c831f]">
                  Admin Panel
                </p>
                <h2 className="text-sm font-black leading-tight text-[#1a1a1a]">
                  FMCG Commerce
                </h2>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav
            className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5"
            style={{ scrollbarWidth: "thin" }}
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
                      <div className="flex items-center">
                        <Link
                          href={item.href}
                          onClick={close}
                          className={`flex flex-1 items-center gap-2.5 rounded-l-xl px-3 py-2.5 transition-all duration-150 ${
                            isActiveSection
                              ? "text-[#1a1a1a] font-semibold"
                              : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                          }`}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <span className="block text-sm font-bold leading-tight">
                              {item.label}
                            </span>
                            {item.caption && (
                              <span className="block truncate text-[10px] font-medium opacity-70">
                                {item.caption}
                              </span>
                            )}
                          </div>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            toggleSection(item.label);
                          }}
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-r-xl transition-all duration-150 ${
                            isActiveSection
                              ? "text-[#1a1a1a] hover:bg-[#f6f7f6]"
                              : "text-[#999] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                          }`}
                          aria-label={isExpanded ? `Collapse ${item.label}` : `Expand ${item.label}`}
                          type="button"
                        >
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform duration-300 ease-in-out ${
                              isExpanded ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                        </button>
                      </div>

                      {/* ── Submenu with smooth animation ── */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="ml-3 mt-0.5 border-l-2 border-[#e8e8e8] pl-3 space-y-0.5">
                          {item.submenu!.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={close}
                                className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                                  isSubActive
                                    ? "bg-[#e8f5e9] text-[#0c831f] font-bold"
                                    : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                                }`}
                              >
                                <sub.icon
                                  className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${
                                    isSubActive
                                      ? "text-[#0c831f]"
                                      : "text-[#999] group-hover:text-[#666]"
                                  }`}
                                />
                                <span>{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={close}
                      className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all duration-150 ${
                        isActiveSection
                          ? "bg-[#e8f5e9] text-[#0c831f]"
                          : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                      }`}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="block text-sm font-bold leading-tight">
                          {item.label}
                        </span>
                        {item.caption && (
                          <span className="block truncate text-[10px] font-medium opacity-70">
                            {item.caption}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}                </div>
              );
            })}
          </nav>

          {/* Bottom user section */}
          <div className="border-t border-[#e8e8e8] px-4 py-3 space-y-2">
            <div className="flex items-center justify-between rounded-xl bg-[#f6f7f6] px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#0c831f] animate-pulse" />
                <span className="text-xs font-bold text-[#666]">System Online</span>
              </div>
              <span className="text-xs font-bold text-[#0c831f]">99.9%</span>
            </div>
            <div className="flex items-center gap-2.5 px-1">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0c831f] text-xs font-bold text-white">
                SA
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-[#1a1a1a]">Super Admin</p>
                <p className="truncate text-[10px] text-[#999]">admin@fmcg.com</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
