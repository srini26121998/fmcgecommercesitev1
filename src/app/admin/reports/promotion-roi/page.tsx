"use client";

import { useMemo } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { ReusablePageHeader, ReusableChart } from "@/components/common";
import { usePromotionROI } from "@/hooks/use-reports";
import { Percent, TrendingUp, DollarSign, Target, Download, Eye, Zap } from "lucide-react";
import { toast } from "sonner";
import type { PromotionROIEntry } from "@/types/reports";

export default function PromotionROIPage() {
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
  } = usePromotionROI();

  const roiChartData = useMemo(
    () => data.map((p) => ({ label: p.promotionName.length > 20 ? p.promotionName.slice(0, 18) + "..." : p.promotionName, value: p.roi })),
    [data]
  );

  const maxRoi = Math.max(...roiChartData.map((d) => d.value), 1);

  const typeColors: Record<string, string> = {
    percentage: "bg-[#2563eb]",
    fixed: "bg-[#0c831f]",
    bogo: "bg-[#9333ea]",
    free_shipping: "bg-[#d97706]",
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="Promotion ROI Reports"
          subtitle="Analyze promotion performance, ROI, conversion rates and campaign effectiveness."
          actions={
            <ReusableExportButton
              onExport={(fmt) => {
                toast.success(`Exporting promotion ROI report as ${fmt.toUpperCase()}`);
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
          <ReusableCard title="Total Promotions" value={summary?.totalPromotions ?? 0} icon={<Percent className="h-5 w-5" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Total Cost" value={summary ? `?${(summary.totalCost / 100000).toFixed(1)}L` : "₹"} icon={<DollarSign className="h-5 w-5" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Revenue Generated" value={summary ? `?${(summary.totalRevenue / 10000000).toFixed(2)}Cr` : "₹"} icon={<TrendingUp className="h-5 w-5" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Avg ROI" value={summary ? `${summary.avgROI}%` : "₹"} icon={<Target className="h-5 w-5" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" subtitle={summary ? `Best: ${summary.bestPromotion}` : undefined} />
        </div>

        <ReusableChart title="ROI by Promotion" subtitle="Return on investment percentage per campaign" height={260}>
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8e8e8] border-t-[#0c831f]" />
            </div>
          ) : (
            <div className="flex h-full items-end gap-2">
              {roiChartData.map((item) => {
                const heightPct = (item.value / maxRoi) * 100;
                return (
                  <div key={item.label} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-bold text-[#0c831f]">{item.value}%</span>
                    <div
                      className="w-full max-w-[40px] rounded-t-md transition-all duration-300"
                      style={{ height: `${Math.max(heightPct, 4)}%`, backgroundColor: "#0c831f", opacity: 0.8 }}
                    />
                    <span className="text-[8px] font-bold text-[#999] text-center leading-tight max-w-[60px] truncate" title={item.label}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ReusableChart>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(val) => updateFilters({ search: val })}
              placeholder="Search promotions..."
            />
          </div>
        </div>

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
              key: "promotionName",
              header: "Promotion",
              sortable: true,
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${typeColors[r.type]} bg-opacity-20`}>
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1a1a1a]">{r.promotionName}</span>
                    <span className="block text-[10px] text-[#999] capitalize">{r.type.replace("_", " ")}</span>
                  </div>
                </div>
              ),
            },
            { key: "cost", header: "Cost", align: "right", width: "90px", render: (r) => <span>?{(r.cost / 1000).toFixed(0)}K</span> },
            { key: "revenueGenerated", header: "Revenue", align: "right", width: "110px", sortable: true, render: (r) => <span className="font-bold">?{(r.revenueGenerated / 100000).toFixed(1)}L</span> },
            { key: "roi", header: "ROI", align: "right", width: "70px", sortable: true, render: (r) => (
              <span className={`font-bold ${r.roi >= 400 ? "text-[#0c831f]" : r.roi >= 300 ? "text-[#d97706]" : "text-[#666]"}`}>{r.roi}%</span>
            )},
            { key: "redemptionCount", header: "Redemptions", align: "right", width: "100px", hideOnMobile: true },
            { key: "conversionRate", header: "Conv. Rate", align: "right", width: "90px", hideOnMobile: true, render: (r) => <span className="font-bold">{r.conversionRate}%</span> },
            { key: "status", header: "Status", width: "100px", render: (r) => <StatusBadge status={r.status} /> },
          ]}
          actions={[
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (r) => toast.info(`Viewing ${r.promotionName}`) },
            { label: "Download", icon: <Download className="h-3.5 w-3.5" />, onClick: (r) => toast.success(`Downloading ${r.promotionName} report`), variant: "success" },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}

