"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { ReusablePageHeader, ReusableDrawer } from "@/components/common";
import { useVendorReports } from "@/hooks/use-reports";
import {
  Store,
  DollarSign,
  TrendingUp,
  Star,
  Eye,
  Download,
  Banknote,
  Clock,
  Package,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { VendorReportEntry } from "@/types/reports";

const performanceConfig: Record<string, { color: string; bg: string }> = {
  excellent: { color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
  good: { color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
  average: { color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
  poor: { color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
};

export default function VendorReportsPage() {
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
  } = useVendorReports();

  const [selectedVendor, setSelectedVendor] = useState<VendorReportEntry | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="Vendor Reports"
          subtitle="Vendor performance, payout summaries, commission tracking, and delivery analytics."
          actions={
            <ReusableExportButton
              onExport={(fmt) => {
                toast.success(`Exporting vendor report as ${fmt.toUpperCase()}`);
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
            title="Active Vendors"
            value={summary?.totalVendors ?? 0}
            icon={<Store className="h-5 w-5" />}
            color="text-[#2563eb]"
            bgColor="bg-[#eff6ff]"
            subtitle={summary ? `${summary.excellentCount} excellent` : undefined}
          />
          <ReusableCard
            title="Total Gross Sales"
            value={summary ? `?${(summary.totalGrossSales / 10000000).toFixed(2)}Cr` : "₹"}
            icon={<TrendingUp className="h-5 w-5" />}
            color="text-[#0c831f]"
            bgColor="bg-[#e8f5e9]"
          />
          <ReusableCard
            title="Total Commission"
            value={summary ? `?${(summary.totalCommission / 100000).toFixed(1)}L` : "₹"}
            icon={<DollarSign className="h-5 w-5" />}
            color="text-[#9333ea]"
            bgColor="bg-[#f3e8ff]"
          />
          <ReusableCard
            title="Pending Payouts"
            value={summary ? `?${(summary.totalPendingPayout / 1000).toFixed(1)}K` : "₹"}
            icon={<Banknote className="h-5 w-5" />}
            color="text-[#d97706]"
            bgColor="bg-[#fffbeb]"
            subtitle={summary ? `Avg rating: ${summary.avgRating}?` : undefined}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(val) => updateFilters({ search: val })}
              placeholder="Search vendor name or category..."
            />
          </div>
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
              key: "vendorName",
              header: "Vendor",
              sortable: true,
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${performanceConfig[r.performance]?.bg ?? "bg-[#f6f7f6]"}`}>
                    <Store className={`h-4 w-4 ${performanceConfig[r.performance]?.color ?? "text-[#666]"}`} />
                  </div>
                  <div>
                    <span className="font-bold text-[#1a1a1a]">{r.vendorName}</span>
                    <span className="block text-[10px] text-[#999]">{r.vendorId} ₹ {r.category}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "grossSales",
              header: "Gross Sales",
              align: "right",
              sortable: true,
              render: (r) => <span className="font-bold">?{(r.grossSales / 100000).toFixed(1)}L</span>,
            },
            {
              key: "commission",
              header: "Commission",
              align: "right",
              width: "110px",
              render: (r) => (
                <div className="text-right">
                  <span className="font-bold text-[#9333ea]">?{(r.commission / 1000).toFixed(1)}K</span>
                  <span className="block text-[10px] text-[#999]">{r.commissionRate}%</span>
                </div>
              ),
            },
            {
              key: "netPayout",
              header: "Net Payout",
              align: "right",
              width: "110px",
              hideOnMobile: true,
              render: (r) => <span className="font-bold text-[#0c831f]">?{(r.netPayout / 100000).toFixed(1)}L</span>,
            },
            {
              key: "rating",
              header: "Rating",
              align: "center",
              width: "80px",
              sortable: true,
              render: (r) => (
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{r.rating}</span>
                </div>
              ),
            },
            {
              key: "onTimeDeliveryRate",
              header: "On-Time",
              align: "right",
              width: "80px",
              hideOnMobile: true,
              render: (r) => (
                <span className={`font-bold ${r.onTimeDeliveryRate >= 95 ? "text-[#0c831f]" : r.onTimeDeliveryRate >= 90 ? "text-[#d97706]" : "text-[#dc2626]"}`}>
                  {r.onTimeDeliveryRate}%
                </span>
              ),
            },
            {
              key: "performance",
              header: "Performance",
              width: "110px",
              render: (r) => <StatusBadge status={r.performance} />,
            },
          ]}
          actions={[
            {
              label: "View Details",
              icon: <Eye className="h-3.5 w-3.5" />,
              onClick: (r) => setSelectedVendor(r),
            },
            {
              label: "Download",
              icon: <Download className="h-3.5 w-3.5" />,
              onClick: (r) => toast.success(`Downloading ${r.vendorName} report`),
              variant: "success",
            },
          ]}
        />
      </div>

      {/* Detail Drawer */}
      <ReusableDrawer
        open={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        title="Vendor Report Detail"
        subtitle={selectedVendor?.vendorName}
        width="lg"
      >
        {selectedVendor && (
          <div className="space-y-4">
            {/* Vendor Info */}
            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Vendor ID</p>
                  <p className="mt-1 text-sm font-mono font-bold text-[#1a1a1a]">{selectedVendor.vendorId}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Category</p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedVendor.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Joined</p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedVendor.joinedDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Performance</p>
                  <p className="mt-1"><StatusBadge status={selectedVendor.performance} /></p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Financial Summary</h4>
              <div className="space-y-2.5">
                {[
                  { label: "Gross Sales", value: `?${(selectedVendor.grossSales / 100000).toFixed(2)}L` },
                  { label: `Commission (${selectedVendor.commissionRate}%)`, value: `-?${(selectedVendor.commission / 1000).toFixed(1)}K` },
                  { label: "Net Payout", value: `?${(selectedVendor.netPayout / 100000).toFixed(2)}L`, highlight: true },
                  { label: "Pending Payout", value: `?${(selectedVendor.pendingPayout / 1000).toFixed(1)}K` },
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

            {/* Performance Metrics */}
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">Total Orders</p>
                  <p className="mt-1 text-xl font-bold text-[#1a1a1a]">{selectedVendor.totalOrders.toLocaleString()}</p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">Active Products</p>
                  <p className="mt-1 text-xl font-black text-[#2563eb]">{selectedVendor.activeProducts}</p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">On-Time Delivery</p>
                  <p className={`mt-1 text-xl font-black ${selectedVendor.onTimeDeliveryRate >= 95 ? "text-[#0c831f]" : "text-[#d97706]"}`}>
                    {selectedVendor.onTimeDeliveryRate}%
                  </p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">Return Rate</p>
                  <p className={`mt-1 text-xl font-black ${selectedVendor.returnRate <= 2 ? "text-[#0c831f]" : selectedVendor.returnRate <= 5 ? "text-[#d97706]" : "text-[#dc2626]"}`}>
                    {selectedVendor.returnRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#666]" />
                <span className="text-xs font-bold text-[#666]">Last payout: {selectedVendor.lastPayoutDate}</span>
              </div>
            </div>
          </div>
        )}
      </ReusableDrawer>
    </DashboardLayout>
  );
}

