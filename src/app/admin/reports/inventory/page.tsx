"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { ReusablePageHeader, ReusableDrawer } from "@/components/common";
import { useInventoryReports } from "@/hooks/use-reports";
import {
  Boxes,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  Warehouse,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { InventoryReportEntry } from "@/types/reports";

const stockStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  healthy: { label: "Healthy", color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
  low: { label: "Low Stock", color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
  critical: { label: "Critical", color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
  out_of_stock: { label: "Out of Stock", color: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
  overstocked: { label: "Overstocked", color: "text-[#9333ea]", bg: "bg-[#f3e8ff]" },
};

export default function InventoryReportsPage() {
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
  } = useInventoryReports();

  const [selectedEntry, setSelectedEntry] = useState<InventoryReportEntry | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="Inventory Reports"
          subtitle="Stock levels, turnover rates, warehouse health, and reorder alerts across all SKUs."
          actions={
            <ReusableExportButton
              onExport={(fmt) => {
                toast.success(`Exporting inventory report as ${fmt.toUpperCase()}`);
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
            title="Total SKUs"
            value={summary?.totalSKUs ?? 0}
            icon={<Boxes className="h-5 w-5" />}
            color="text-[#2563eb]"
            bgColor="bg-[#eff6ff]"
          />
          <ReusableCard
            title="Total Stock Value"
            value={summary ? `?${(summary.totalStockValue / 100000).toFixed(1)}L` : "₹"}
            icon={<DollarSign className="h-5 w-5" />}
            color="text-[#0c831f]"
            bgColor="bg-[#e8f5e9]"
          />
          <ReusableCard
            title="Low / Critical Stock"
            value={summary ? `${summary.lowStockCount} SKUs` : "₹"}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="text-[#d97706]"
            bgColor="bg-[#fffbeb]"
            subtitle={summary ? `${summary.outOfStockCount} out of stock` : undefined}
          />
          <ReusableCard
            title="Avg Turnover Rate"
            value={summary ? `${summary.avgTurnoverRate}x` : "₹"}
            icon={<TrendingUp className="h-5 w-5" />}
            color="text-[#9333ea]"
            bgColor="bg-[#f3e8ff]"
            subtitle={summary ? `${summary.overstockedCount} overstocked` : undefined}
          />
        </div>

        {/* Stock Status Summary Bar */}
        {summary && (
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Stock Health Overview</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Healthy", count: summary.totalSKUs - summary.lowStockCount - summary.outOfStockCount - summary.overstockedCount, color: "bg-[#0c831f]", textColor: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
                { label: "Low / Critical", count: summary.lowStockCount, color: "bg-[#d97706]", textColor: "text-[#d97706]", bg: "bg-[#fffbeb]" },
                { label: "Out of Stock", count: summary.outOfStockCount, color: "bg-[#dc2626]", textColor: "text-[#dc2626]", bg: "bg-[#fef2f2]" },
                { label: "Overstocked", count: summary.overstockedCount, color: "bg-[#9333ea]", textColor: "text-[#9333ea]", bg: "bg-[#f3e8ff]" },
              ].map((item) => (
                <div key={item.label} className={`flex items-center gap-2 rounded-lg ${item.bg} px-3 py-2`}>
                  <div className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className={`text-xs font-bold ${item.textColor}`}>{item.label}</span>
                  <span className={`text-xs font-black ${item.textColor}`}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(val) => updateFilters({ search: val })}
              placeholder="Search SKU, product, category..."
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
              key: "productName",
              header: "Product",
              sortable: true,
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stockStatusConfig[r.stockStatus]?.bg ?? "bg-[#f6f7f6]"}`}>
                    <Package className={`h-4 w-4 ${stockStatusConfig[r.stockStatus]?.color ?? "text-[#666]"}`} />
                  </div>
                  <div>
                    <span className="font-bold text-[#1a1a1a]">{r.productName}</span>
                    <span className="block text-[10px] text-[#999]">{r.sku} ₹ {r.category}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "warehouse",
              header: "Warehouse",
              width: "130px",
              hideOnMobile: true,
              render: (r) => <span className="text-xs text-[#666]">{r.warehouse}</span>,
            },
            {
              key: "available",
              header: "Available",
              align: "right",
              width: "90px",
              sortable: true,
              render: (r) => <span className="font-bold">{r.available.toLocaleString()}</span>,
            },
            {
              key: "daysUntilStockout",
              header: "Days Left",
              align: "right",
              width: "80px",
              sortable: true,
              render: (r) => (
                <span className={`font-bold ${r.daysUntilStockout === 0 ? "text-[#dc2626]" : r.daysUntilStockout <= 7 ? "text-[#d97706]" : "text-[#0c831f]"}`}>
                  {r.daysUntilStockout === 0 ? "OOS" : `${r.daysUntilStockout}d`}
                </span>
              ),
            },
            {
              key: "turnoverRate",
              header: "Turnover",
              align: "right",
              width: "80px",
              hideOnMobile: true,
              render: (r) => <span className="font-bold">{r.turnoverRate}x</span>,
            },
            {
              key: "stockValue",
              header: "Stock Value",
              align: "right",
              width: "100px",
              hideOnMobile: true,
              render: (r) => <span className="font-bold">?{(r.stockValue / 1000).toFixed(1)}K</span>,
            },
            {
              key: "stockStatus",
              header: "Status",
              width: "110px",
              render: (r) => <StatusBadge status={stockStatusConfig[r.stockStatus]?.label ?? r.stockStatus} />,
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
              onClick: (r) => toast.success(`Downloading ${r.sku} report`),
              variant: "success",
            },
          ]}
        />
      </div>

      {/* Detail Drawer */}
      <ReusableDrawer
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title="Inventory Detail"
        subtitle={selectedEntry?.productName}
        width="md"
      >
        {selectedEntry && (
          <div className="space-y-4">
            {/* Product Info */}
            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">SKU</p>
                  <p className="mt-1 text-sm font-mono font-bold text-[#1a1a1a]">{selectedEntry.sku}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Category</p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedEntry.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Warehouse</p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedEntry.warehouse}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Status</p>
                  <p className="mt-1">
                    <StatusBadge status={stockStatusConfig[selectedEntry.stockStatus]?.label ?? selectedEntry.stockStatus} />
                  </p>
                </div>
              </div>
            </div>

            {/* Stock Breakdown */}
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Stock Breakdown</h4>
              <div className="space-y-2.5">
                {[
                  { label: "Total Stock", value: selectedEntry.totalStock.toLocaleString() },
                  { label: "Reserved", value: selectedEntry.reserved.toLocaleString() },
                  { label: "Available", value: selectedEntry.available.toLocaleString(), highlight: true },
                  { label: "Damaged", value: selectedEntry.damaged.toLocaleString() },
                  { label: "Reorder Point", value: selectedEntry.reorderPoint.toLocaleString() },
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
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Performance</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">Days Until Stockout</p>
                  <p className={`mt-1 text-xl font-black ${selectedEntry.daysUntilStockout === 0 ? "text-[#dc2626]" : selectedEntry.daysUntilStockout <= 7 ? "text-[#d97706]" : "text-[#0c831f]"}`}>
                    {selectedEntry.daysUntilStockout === 0 ? "OOS" : `${selectedEntry.daysUntilStockout}d`}
                  </p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">Monthly Velocity</p>
                  <p className="mt-1 text-xl font-bold text-[#1a1a1a]">{selectedEntry.monthlyVelocity}</p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">Turnover Rate</p>
                  <p className="mt-1 text-xl font-black text-[#9333ea]">{selectedEntry.turnoverRate}x</p>
                </div>
                <div className="rounded-lg bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold text-[#666]">Stock Value</p>
                  <p className="mt-1 text-xl font-black text-[#0c831f]">?{(selectedEntry.stockValue / 1000).toFixed(1)}K</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-[#666]" />
                <span className="text-xs font-bold text-[#666]">Last restocked: {selectedEntry.lastRestocked}</span>
              </div>
            </div>
          </div>
        )}
      </ReusableDrawer>
    </DashboardLayout>
  );
}

