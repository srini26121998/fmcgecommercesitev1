"use client";

import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { ReusablePageHeader } from "@/components/common";
import { useCustomerReports } from "@/hooks/use-reports";
import { Users, TrendingUp, DollarSign, Heart, AlertTriangle, Download, Eye } from "lucide-react";
import { toast } from "sonner";

export default function CustomerReportsPage() {
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
  } = useCustomerReports();

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="Customer Reports"
          subtitle="Customer segmentation, lifetime value, retention analysis behavior."
          actions={
            <ReusableExportButton
              onExport={(fmt) => {
                toast.success(`Exporting customer report as ${fmt.toUpperCase()}`);
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

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Customers" value={summary?.totalCustomers ?? 0} icon={<Users className="h-5 w-5" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Total Revenue" value={summary ? `₹${(summary.totalRevenue / 100000).toFixed(1)}L` : "₹"} icon={<DollarSign className="h-5 w-5" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Avg Retention Rate" value={summary ? `${summary.avgRetentionRate}%` : "₹"} icon={<Heart className="h-5 w-5" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
          <ReusableCard title="Platinum Customers" value={summary?.platinumCount ?? 0} icon={<TrendingUp className="h-5 w-5" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" subtitle={summary ? `${summary.atRiskCount} at risk` : undefined} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(val) => updateFilters({ search: val })}
              placeholder="Search customers..."
            />
          </div>
        </div>

<ReusableTable
           data={data}
           keyExtractor={(r) => r.customerId}
          isLoading={loading}
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          columns={[
            {
              key: "name",
              header: "Customer",
              sortable: true,
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f6f7f6] text-xs font-bold text-[#666]">
                    {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-[#1a1a1a]">{r.name}</span>
                    <span className="block text-[10px] text-[#999]">{r.email}</span>
                  </div>
                </div>
              ),
            },
            { key: "totalOrders", header: "Orders", width: "80px", align: "right", sortable: true },
            {
              key: "totalSpent",
              header: "Total Spent",
              width: "110px",
              align: "right",
              sortable: true,
              render: (r) => <span className="font-bold">₹{(r.totalSpent / 1000).toFixed(1)}K</span>,
            },
            { key: "segment", header: "Segment", width: "100px", render: (r) => <StatusBadge status={r.segment} /> },
            { key: "acquisitionChannel", header: "Source", width: "110px", hideOnMobile: true },
            { key: "retentionRate", header: "Retention", width: "90px", align: "right", sortable: true, render: (r) => <span className="font-bold text-[#0c831f]">{r.retentionRate}%</span> },
            { key: "city", header: "City", width: "100px", hideOnMobile: true },
          ]}
          actions={[
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (r) => toast.info(`Viewing ${r.name}`) },
            { label: "Export", icon: <Download className="h-3.5 w-3.5" />, onClick: (r) => toast.success(`Exporting ${r.name}`), variant: "success" },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}

