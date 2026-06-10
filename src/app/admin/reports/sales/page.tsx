"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { ReusablePageHeader, ReusableDrawer, ReusableChart, ReusableDatePicker } from "@/components/common";
import { useSalesReports } from "@/hooks/use-reports";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  Tag,
  Eye,
  Download,
  CreditCard,
  Smartphone,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import type { SalesReportEntry } from "@/types/reports";

export default function SalesReportsPage() {
  const {
    data,
    loading,
    error,
    summary,
    filters,
    meta,
    fetchData,
    updateFilters,
    goToPage,
    changePageSize,
  } = useSalesReports();

  const [selectedEntry, setSelectedEntry] = useState<SalesReportEntry | null>(null);

  // Build chart data from loaded entries (most recent 14 days)
  const chartData = [...(data || [])]
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
    .slice(-14)
    .map((r) => ({ label: (r.date || "").slice(5), value: r.grossRevenue || 0 }));
  const maxChart = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="Sales Reports"
          subtitle="Daily, weekly, and monthly sales performance with revenue, order, and payment breakdowns."
          actions={
            <ReusableExportButton
              onExport={(fmt) => {
                toast.success(`Exporting sales report as ${fmt.toUpperCase()}`);
                fetchData();
              }}
            />
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard
            title="Total Revenue (MTD)"
            value={summary?.totalRevenue != null ? `₹${(summary.totalRevenue / 10000000).toFixed(2)}Cr` : "₹0"}
            icon={<DollarSign className="h-5 w-5" />}
            color="text-[#0c831f]"
            bgColor="bg-[#e8f5e9]"
          />
          <ReusableCard
            title="Total Orders (MTD)"
            value={summary?.totalOrders != null ? summary.totalOrders.toLocaleString() : "0"}
            icon={<ShoppingCart className="h-5 w-5" />}
            color="text-[#2563eb]"
            bgColor="bg-[#eff6ff]"
          />
          <ReusableCard
            title="Avg Order Value"
            value={summary?.averageOrderValue != null ? `₹${summary.averageOrderValue.toLocaleString()}` : "₹0"}
            icon={<TrendingUp className="h-5 w-5" />}
            color="text-[#9333ea]"
            bgColor="bg-[#f3e8ff]"
          />
          <ReusableCard
            title="Total Tax"
            value={summary?.totalTax != null ? `₹${(summary.totalTax / 100000).toFixed(2)}L` : "₹0"}
            icon={<RefreshCw className="h-5 w-5" />}
            color="text-[#d97706]"
            bgColor="bg-[#fffbeb]"
            subtitle={summary?.totalDiscounts != null ? `Discounts: ₹${(summary.totalDiscounts / 100000).toFixed(1)}L` : undefined}
          />
        </div>

        {/* Revenue Trend Chart */}
        <ReusableChart
          title="Daily Revenue Trend"
          subtitle="Gross revenue over the last 14 days"
          height={240}
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8e8e8] border-t-[#0c831f]" />
            </div>
          ) : (
            <div className="flex h-full items-end gap-1.5">
              {chartData.map((point) => {
                const heightPct = (point.value / maxChart) * 100;
                return (
                  <div key={point.label} className="flex flex-1 flex-col items-center gap-1 h-full justify-end">
                    <span className="text-[8px] font-bold text-[#666]">
                      ₹{(point.value / 100000).toFixed(0)}L
                    </span>
                    <div
                      className="w-full rounded-t-sm transition-all duration-300"
                      style={{ height: `${Math.max(heightPct, 3)}%`, backgroundColor: "#0c831f", opacity: 0.8 }}
                    />
                    <span className="text-[8px] font-bold text-[#999]">{point.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </ReusableChart>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(val) => updateFilters({ search: val })}
              placeholder="Search by date or category..."
            />
          </div>
          <ReusableDatePicker
            value={filters.dateFrom ?? ""}
            onChange={(val) => updateFilters({ dateFrom: val })}
            placeholder="From date"
            className="w-36"
          />
          <ReusableDatePicker
            value={filters.dateTo ?? ""}
            onChange={(val) => updateFilters({ dateTo: val })}
            placeholder="To date"
            className="w-36"
          />
        </div>

        {/* Data Table */}
        <ReusableTable
          data={data}
          keyExtractor={(r) => r.id}
          isLoading={loading}
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          columns={[
            {
              key: "date",
              header: "Date",
              sortable: true,
              render: (r) => (
                <div>
                  <span className="font-bold text-[#1a1a1a]">{r.date}</span>
                  <span className="block text-[10px] text-[#999]">{r.topCategory}</span>
                </div>
              ),
            },
            {
              key: "grossRevenue",
              header: "Gross Revenue",
              align: "right",
              sortable: true,
              render: (r) => <span className="font-bold">₹{(r.grossRevenue / 100000).toFixed(2)}L</span>,
            },
            {
              key: "netRevenue",
              header: "Net Revenue",
              align: "right",
              hideOnMobile: true,
              render: (r) => <span className="font-bold text-[#0c831f]">₹{(r.netRevenue / 100000).toFixed(2)}L</span>,
            },
            {
              key: "orders",
              header: "Orders",
              align: "right",
              sortable: true,
              render: (r) => <span className="font-bold">{r.orders != null ? r.orders.toLocaleString() : "0"}</span>,
            },
            {
              key: "avgOrderValue",
              header: "AOV",
              align: "right",
              width: "80px",
              render: (r) => <span>₹{r.avgOrderValue}</span>,
            },
            {
              key: "refunds",
              header: "Refunds",
              align: "right",
              width: "90px",
              hideOnMobile: true,
              render: (r) => <span className="text-[#d97706]">₹{(r.refunds / 1000).toFixed(1)}K</span>,
            },
{
               key: "returnRate",
               header: "Return %",
               align: "right",
               width: "80px",
               hideOnMobile: true,
               render: (r) => (
                 <span className={`font-bold ${r.returnRate && r.returnRate > 3 ? "text-red-500" : "text-[#0c831f]"}`}>
                   {r.returnRate ?? 0}%
                 </span>
               ),
             },
          ]}
          actions={[
            {
              label: "View Details",
              icon: <Eye className="h-3.5 w-3.5" />,
              onClick: (r) => setSelectedEntry(r),
            },
            {
              label: "Download",
              icon: <Download className="h-3.5 w-3.5" />,
              onClick: (r) => toast.success(`Downloading sales data for ${r.date}`),
              variant: "success",
            },
          ]}
        />
      </div>

      {/* Detail Drawer */}
      <ReusableDrawer
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title="Daily Sales Detail"
        subtitle={selectedEntry?.date}
        width="md"
      >
        {selectedEntry && (
          <div className="space-y-4">
            {/* Revenue Breakdown */}
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Revenue Breakdown</h4>
              <div className="space-y-2.5">
                {[
                  { label: "Gross Revenue", value: `₹${(selectedEntry.grossRevenue / 100000).toFixed(2)}L`, highlight: false },
                  { label: "Discounts Applied", value: `-₹${(selectedEntry.discounts / 1000).toFixed(1)}K`, highlight: false },
                  { label: "Promo Cost", value: `-₹${(selectedEntry.promoCost / 1000).toFixed(1)}K`, highlight: false },
                  { label: "Refunds", value: `-₹${(selectedEntry.refunds / 1000).toFixed(1)}K`, highlight: false },
                  { label: "Net Revenue", value: `₹${(selectedEntry.netRevenue / 100000).toFixed(2)}L`, highlight: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between py-1 ${item.highlight ? "border-t border-[#e8e8e8] pt-2.5" : ""}`}
                  >
                    <span className="text-sm text-[#666]">{item.label}</span>
                    <span className={`text-sm ${item.highlight ? "font-black text-[#1a1a1a]" : "font-bold text-[#1a1a1a]"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Stats */}
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Order Statistics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">Total Orders</p>
                  <p className="mt-1 text-xl font-bold text-[#1a1a1a]">{selectedEntry.orders != null ? selectedEntry.orders.toLocaleString() : "0"}</p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">Avg Order Value</p>
                  <p className="mt-1 text-xl font-bold text-[#1a1a1a]">₹{selectedEntry.avgOrderValue}</p>
                </div>
<div className="rounded-lg bg-[#f9fafb] p-3">
                   <p className="text-[10px] font-bold text-[#666]">Return Rate</p>
                   <p className={`mt-1 text-xl font-black ${selectedEntry.returnRate && selectedEntry.returnRate > 3 ? "text-red-500" : "text-[#0c831f]"}`}>
                     {selectedEntry.returnRate ?? 0}%
                   </p>
                 </div>
                 <div className="rounded-lg bg-[#f9fafb] p-3">
                   <p className="text-[10px] font-bold text-[#666]">Top Category</p>
                   <p className="mt-1 text-sm font-black text-[#1a1a1a]">{selectedEntry.topCategory ?? "₹"}</p>
                 </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Payment Methods</h4>
              <div className="space-y-2.5">
                {[
                  { label: "UPI", count: selectedEntry.upiTransactions, icon: <Smartphone className="h-4 w-4 text-[#9333ea]" />, color: "bg-[#f3e8ff]" },
                  { label: "Card", count: selectedEntry.cardTransactions, icon: <CreditCard className="h-4 w-4 text-[#2563eb]" />, color: "bg-[#eff6ff]" },
                  { label: "Cash", count: selectedEntry.cashTransactions, icon: <Banknote className="h-4 w-4 text-[#0c831f]" />, color: "bg-[#e8f5e9]" },
                ].map((pm) => {
                  const pct = Math.round((pm.count / selectedEntry.orders) * 100);
                  return (
                    <div key={pm.label} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${pm.color}`}>
                        {pm.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1a1a1a]">{pm.label}</span>
                          <span className="text-xs font-bold text-[#666]">{pm.count} ({pct}%)</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-[#f0f0f0]">
                          <div
                            className="h-full rounded-full bg-[#0c831f] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </ReusableDrawer>
    </DashboardLayout>
  );
}

