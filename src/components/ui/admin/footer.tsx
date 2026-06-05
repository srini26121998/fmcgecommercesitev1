"use client";

import Link from "next/link";
import { menuItems } from "@/data/admin/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ChevronUp,
  ShoppingCart,
  TrendingUp,
  Users,
  Activity,
  Zap,
  Headphones,
  BookOpen,
  ShieldCheck,
} from "lucide-react";

// ── Footer Group Configuration ─────────────────────────────
// Maps sidebar sections to footer columns (labels must match menuItems labels)

interface FooterLink {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface FooterGroup {
  title: string;
  links: FooterLink[];
}

const footerGroupConfig: { title: string; labels: string[] }[] = [
  { title: "Management", labels: ["Products", "Inventory", "Orders"] },
  { title: "Commerce", labels: ["Customers", "Promotions", "Vendors"] },
  { title: "Operations", labels: ["Reports", "Delivery"] },
  { title: "System", labels: ["Settings"] },
];

// Build footer link data from the sidebar navigation (single source of truth)
function buildFooterGroups(): FooterGroup[] {
  return footerGroupConfig.map((group) => ({
    title: group.title,
    links: group.labels.flatMap((label) => {
      const item = menuItems.find((m) => m.label === label);
      if (!item) return [];
      if (item.submenu) {
        return item.submenu.map((sub) => ({
          label: sub.label,
          href: sub.href,
          icon: sub.icon,
        }));
      }
      return [{ label: item.label, href: item.href, icon: item.icon }];
    }),
  }));
}



export default function AdminFooter() {
  const footerGroups = buildFooterGroups();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-8 border-t border-[#e8e8e8] bg-white">
      {/* ── Back to Top ── */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#f8f9fa] hover:bg-[#f0f1f3] transition-colors py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-[#666] border-b border-[#e8e8e8]"
      >
        <ChevronUp className="w-3.5 h-3.5" />
        Back to top
      </button>



      {/* ── Dashboard Quick Link ── */}
      <div className="mx-auto w-full max-w-[1200px] px-4 pt-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#ff4f8b] hover:text-[#e04373] transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard Overview
        </Link>
      </div>

      {/* ── Link Columns ── */}
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-black uppercase tracking-wider text-[#999] mb-3 pb-2 border-b border-[#e8e8e8]">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-xs font-bold text-[#666] hover:text-[#ff4f8b] transition-colors group"
                    >
                      <link.icon className="w-3.5 h-3.5 text-[#bbb] group-hover:text-[#ff4f8b] transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-[#e8e8e8]" />

      {/* ── Bottom Bar ── */}
      <div className="mx-auto w-full max-w-[1200px] px-4 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#ff4f8b] flex items-center justify-center">
                <span className="text-white font-black text-[11px]">F</span>
              </div>
              <div>
                <span className="font-bold text-sm text-[#1a1a1a]">Admin Panel</span>
                <span className="text-[10px] text-[#999] ml-2">v3.2.1</span>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#0c831f] bg-[#e8f5e9] px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0c831f] stock-pulse" />
              All systems operational
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link href="/" className="flex items-center gap-1.5 text-xs font-bold text-[#0c831f] hover:text-[#ff4f8b] transition-colors border-r border-[#e8e8e8] pr-4">
              <Zap className="w-3.5 h-3.5" />
              Storefront
            </Link>
            <Link href="/admin/support/tickets" className="flex items-center gap-1.5 text-xs font-bold text-[#666] hover:text-[#ff4f8b] transition-colors">
              <Headphones className="w-3.5 h-3.5" />
              Support
            </Link>
            <Link href="/docs" className="flex items-center gap-1.5 text-xs font-bold text-[#666] hover:text-[#ff4f8b] transition-colors">
              <BookOpen className="w-3.5 h-3.5" />
              Docs
            </Link>
          </div>
        </div>

        {/* ── System Meta ── */}
        <div className="mt-3 pt-3 border-t border-dashed border-[#e8e8e8] flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[#bbb]">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0c831f]" />
              Node v20.11.0
            </span>
            <span>Next.js 15.x</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1565c0]" />
              DB Connected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e65100]" />
              Redis Active
            </span>
            <span>Uptime 99.97%</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#999]">
            <ShieldCheck className="w-3 h-3 text-[#0c831f]" />
            <span>SSL Secured</span>
            <span className="w-1 h-1 rounded-full bg-[#e8e8e8]" />
            <span>&copy; 2026 FMCG Commerce</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
