"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  inactive: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
  pending: { bg: "bg-[#fffbeb]", text: "text-[#d97706]", dot: "bg-[#d97706]" },
  approved: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  rejected: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
  pending_review: { bg: "bg-[#fffbeb]", text: "text-[#d97706]", dot: "bg-[#d97706]" },
  pending_documents: { bg: "bg-[#fffbeb]", text: "text-[#d97706]", dot: "bg-[#d97706]" },
  draft: { bg: "bg-[#f3e8ff]", text: "text-[#9333ea]", dot: "bg-[#9333ea]" },
  archived: { bg: "bg-[#f6f7f6]", text: "text-[#999]", dot: "bg-[#ccc]" },
  busy: { bg: "bg-[#fff0f6]", text: "text-[#ff4f8b]", dot: "bg-[#ff4f8b]" },
  online: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  offline: { bg: "bg-[#f6f7f6]", text: "text-[#999]", dot: "bg-[#ccc]" },
  available: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  delivered: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  cancelled: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
  returned: { bg: "bg-[#fff0f6]", text: "text-[#ff4f8b]", dot: "bg-[#ff4f8b]" },
  confirmed: { bg: "bg-[#eff6ff]", text: "text-[#2563eb]", dot: "bg-[#2563eb]" },
  preparing: { bg: "bg-[#fffbeb]", text: "text-[#d97706]", dot: "bg-[#d97706]" },
  out_for_delivery: { bg: "bg-[#fff0f6]", text: "text-[#ff4f8b]", dot: "bg-[#ff4f8b]" },
  failed: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
  paid: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  refunded: { bg: "bg-[#fff0f6]", text: "text-[#ff4f8b]", dot: "bg-[#ff4f8b]" },
  overdue: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
  scheduled: { bg: "bg-[#eff6ff]", text: "text-[#2563eb]", dot: "bg-[#2563eb]" },
  expired: { bg: "bg-[#f6f7f6]", text: "text-[#999]", dot: "bg-[#ccc]" },
  paused: { bg: "bg-[#fffbeb]", text: "text-[#d97706]", dot: "bg-[#d97706]" },
  generating: { bg: "bg-[#fffbeb]", text: "text-[#d97706]", dot: "bg-[#d97706]" },
  ready: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  maintenance: { bg: "bg-[#fffbeb]", text: "text-[#d97706]", dot: "bg-[#d97706]" },
  full: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
  suspended: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
  churned: { bg: "bg-[#f6f7f6]", text: "text-[#999]", dot: "bg-[#ccc]" },
  new: { bg: "bg-[#eff6ff]", text: "text-[#2563eb]", dot: "bg-[#2563eb]" },
  regular: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  vip: { bg: "bg-[#f3e8ff]", text: "text-[#9333ea]", dot: "bg-[#9333ea]" },
  blocked: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
  in_transit: { bg: "bg-[#eff6ff]", text: "text-[#2563eb]", dot: "bg-[#2563eb]" },
  completed: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  coupon: { bg: "bg-[#e8f5e9]", text: "text-[#0c831f]", dot: "bg-[#0c831f]" },
  flash_sale: { bg: "bg-[#fff0f6]", text: "text-[#ff4f8b]", dot: "bg-[#ff4f8b]" },
  buy_x_get_y: { bg: "bg-[#f3e8ff]", text: "text-[#9333ea]", dot: "bg-[#9333ea]" },
  discount: { bg: "bg-[#eff6ff]", text: "text-[#2563eb]", dot: "bg-[#2563eb]" },
  urgent: { bg: "bg-[#fef2f2]", text: "text-[#dc2626]", dot: "bg-[#dc2626]" },
};

interface StatusBadgeProps {
  status: string;
  dot?: boolean;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, dot = true, size = "sm" }: StatusBadgeProps) {
  const safeStatus = String(status || "unknown");
  const cfg = statusConfig[safeStatus.toLowerCase()] || { bg: "bg-[#f6f7f6]", text: "text-[#666]", dot: "bg-[#999]" };
  const displayLabel = safeStatus.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full font-bold", cfg.bg, cfg.text, sizeClasses)}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />}
      {displayLabel}
    </span>
  );
}
