"use client";

import Link from "next/link";
import DashboardLayout from "../dashboard-layout";
import ReusableCard from "@/components/ui/admin/reusable-card";
import { ReusablePageHeader } from "@/components/common";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Boxes,
  Store,
  Users,
  Landmark,
  FileSearch,
  Receipt,
  Group,
  ShoppingBag,
  ShoppingCart,
  Percent,
  ArrowRight,
  Activity,
  DollarSign,
  RefreshCw,
} from "lucide-react";

// -- Report Hub Sections -----------------------------------

const reportSections = [
  {
    href: "/admin/reports/sales",
    icon: TrendingUp,
    title: "Sales Reports",
    description: "Daily, weekly, and monthly revenue with order and payment breakdowns.",
    color: "text-[#0c831f]",
    bg: "bg-[#e8f5e9]",
    badge: "30 days",
  },
  {
    href: "/admin/reports/inventory",
    icon: Boxes,
    title: "Inventory Reports",
    description: "Stock levels, turnover rates, warehouse health, and reorder alerts.",
    color: "text-[#2563eb]",
    bg: "bg-[#eff6ff]",
    badge: "12 SKUs",
  },
  {
    href: "/admin/reports/vendor",
    icon: Store,
    title: "Vendor Reports",
    description: "Vendor performance, payout summaries, and commission tracking.",
    color: "text-[#9333ea]",
    bg: "bg-[#f3e8ff]",
    badge: "8 vendors",
  },
  {
    href: "/admin/reports/customer",
    icon: Users,
    title: "Customer Reports",
    description: "Customer segmentation, lifetime value, and retention analysis.",
    color: "text-[#ff4f8b]",
    bg: "bg-[#fff0f6]",
    badge: "10 customers",
  },
  {
    href: "/admin/reports/gst",
    icon: Landmark,
    title: "GST Reports",
    description: "GST returns, input tax credit, and tax compliance filings.",
    color: "text-[#d97706]",
    bg: "bg-[#fffbeb]",
    badge: "7 returns",
  },
  {
    href: "/admin/reports/tax",
    icon: FileSearch,
    title: "Tax Reports",
    description: "GSTR-1, GSTR-3B, TDS certificates, and ITC claim reports.",
    color: "text-[#0c831f]",
    bg: "bg-[#e8f5e9]",
    badge: "8 reports",
  },
  {
    href: "/admin/reports/cohort",
    icon: Group,
    title: "Cohort Analysis",
    description: "User retention cohorts ₹ track how customer groups engage over time.",
    color: "text-[#2563eb]",
    bg: "bg-[#eff6ff]",
    badge: "12 cohorts",
  },
  {
    href: "/admin/reports/revenue-analytics",
    icon: ShoppingBag,
    title: "Revenue Analytics",
    description: "Detailed revenue breakdown, profitability metrics, and EBITDA.",
    color: "text-[#9333ea]",
    bg: "bg-[#f3e8ff]",
    badge: "5 months",
  },
  {
    href: "/admin/reports/abandoned-cart",
    icon: ShoppingCart,
    title: "Abandoned Cart",
    description: "Monitor cart abandonment, recovery rates, and lost revenue.",
    color: "text-[#d97706]",
    bg: "bg-[#fffbeb]",
    badge: "10 carts",
  },
  {
    href: "/admin/reports/promotion-roi",
    icon: Percent,
    title: "Promotion ROI",
    description: "Analyze promotion performance, ROI, and campaign effectiveness.",
    color: "text-[#ff4f8b]",
    bg: "bg-[#fff0f6]",
    badge: "8 promos",
  },
];

// -- Top-level KPIs (static summary for the hub) -----------

const topKPIs = [
  { label: "Total Revenue (MTD)", value: "?1.32Cr", change: "+12.5%", trend: "up" as const },
  { label: "Total Orders (MTD)", value: "32,450", change: "+10.1%", trend: "up" as const },
  { label: "Avg Order Value", value: "?847", change: "+6.8%", trend: "up" as const },
  { label: "Return Rate", value: "2.3%", change: "-0.5%", trend: "down" as const },
  { label: "Active Vendors", value: "42", change: "+3", trend: "up" as const },
  { label: "GST Pending", value: "2 filings", change: "Due Jun 20", trend: "down" as const },
];

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Admin"
          title="Reports & Analytics"
          subtitle="Comprehensive analytics hub ₹ sales, inventory, vendor, customer, tax, and financial reports."
        />

        {/* Top KPI Strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {topKPIs.map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-[#e8e8e8] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wide text-[#666]">{kpi.label}</span>
                {kpi.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-[#0c831f]" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-[#ff4f8b]" />
                )}
              </div>
              <p className="mt-1.5 text-lg font-black text-[#1a1a1a]">{kpi.value}</p>
              <span className={`text-[10px] font-bold ${kpi.trend === "up" ? "text-[#0c831f]" : "text-[#ff4f8b]"}`}>
                {kpi.change}
              </span>
            </div>
          ))}
        </div>

        {/* Report Sections Grid */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wide text-[#666]">All Report Sections</h2>
            <span className="text-xs text-[#999]">{reportSections.length} sections</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {reportSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="group flex items-start gap-4 rounded-xl border border-[#e8e8e8] bg-white p-5 transition-all duration-200 hover:border-[#0c831f]/30 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${section.bg}`}>
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-[#1a1a1a] group-hover:text-[#0c831f] transition-colors">
                      {section.title}
                    </h3>
                    <span className="flex-shrink-0 rounded-full bg-[#f6f7f6] px-2 py-0.5 text-[10px] font-bold text-[#999]">
                      {section.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#666] leading-relaxed">{section.description}</p>
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-[#0c831f] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>View Report</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="rounded-xl border border-[#e8e8e8] bg-white p-5">
          <h3 className="mb-4 text-sm font-black text-[#1a1a1a]">System Overview</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Reports Generated", value: "48", icon: <BarChart3 className="h-4 w-4 text-[#2563eb]" />, bg: "bg-[#eff6ff]" },
              { label: "Data Points Tracked", value: "1.2M+", icon: <Activity className="h-4 w-4 text-[#0c831f]" />, bg: "bg-[#e8f5e9]" },
              { label: "Revenue Tracked", value: "?6.2Cr", icon: <DollarSign className="h-4 w-4 text-[#9333ea]" />, bg: "bg-[#f3e8ff]" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-lg font-black text-[#1a1a1a]">{stat.value}</p>
                  <p className="text-[10px] text-[#999]">{stat.label}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff0f6]">
                <RefreshCw className="h-4 w-4 text-[#ff4f8b]" />
              </div>
              <div>
                <p className="text-lg font-black text-[#1a1a1a]">Live</p>
                <p className="text-[10px] text-[#999]">Data refresh rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

