"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import { ReusablePageHeader, ReusableChart } from "@/components/common";
import { useRevenueAnalytics } from "@/hooks/use-reports";
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PiggyBank, Download, Eye, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export default function RevenueAnalyticsPage() {
  const { data, loading, error, summary, meta, goToPage, changePageSize } = useRevenueAnalytics();
  const [activeMetric, setActiveMetric] = useState<"revenue" | "profit" | "margin">("revenue");

  const chartData = data.map((r) => ({
    label: r.month.split(" ")[0],
    value: activeMetric === "revenue" ? r.revenue : activeMetric === "profit" ? r.netProfit : r.grossMargin,
  }));

  const maxChartValue = Math.max(...chartData.map((d) => d.value));

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="Revenue Analytics"
          subtitle="Detailed revenue breakdown, profitability metrics and financial performance."
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Revenue" value={summary ? `₹${(summary.totalRevenue / 10000000).toFixed(2)}Cr` : "₹"} icon={<DollarSign className="h-5 w-5" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" trend={summary ? { value: `${summary.revenueGrowth}%`, direction: summary.revenueGrowth >= 0 ? "up" : "down" } : undefined} />
          <ReusableCard title="Gross Profit" value={summary ? `₹${(summary.totalGrossProfit / 10000000).toFixed(2)}Cr` : "₹"} icon={<TrendingUp className="h-5 w-5" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Avg Gross Margin" value={summary ? `${summary.avgGrossMargin}%` : "₹"} icon={<BarChart3 className="h-5 w-5" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Net Profit" value={summary ? `₹${(summary.totalNetProfit / 10000000).toFixed(2)}Cr` : "₹"} icon={<PiggyBank className="h-5 w-5" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        <ReusableChart
          title="Financial Performance"
          subtitle="Monthly revenue, profit & margin trends"
          height={280}
          action={
            <div className="flex items-center gap-1 rounded-lg border border-[#e8e8e8] p-0.5">
              {(["revenue", "profit", "margin"] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setActiveMetric(metric)}
                  className={`rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all ${
                    activeMetric === metric ? "bg-[#0c831f] text-white" : "text-[#666] hover:text-[#1a1a1a]"
                  }`}
                >
                  {metric}
                </button>
              ))}
            </div>
          }
        >
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8e8e8] border-t-[#0c831f]" />
            </div>
          ) : (
            <div className="flex h-full items-end gap-2">
              {chartData.map((point) => {
                const heightPct = maxChartValue > 0 ? (point.value / maxChartValue) * 100 : 0;
                return (
                  <div key={point.label} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-bold text-[#666]">
                      {activeMetric === "margin" ? `${point.value}%` : `₹${(point.value / 100000).toFixed(0)}L`}
                    </span>
                    <div
                      className="w-full rounded-t-md transition-all duration-300"
                      style={{
                        height: `${Math.max(heightPct, 4)}%`,
                        backgroundColor: activeMetric === "revenue" ? "#2563eb" : activeMetric === "profit" ? "#0c831f" : "#9333ea",
                        opacity: 0.85,
                      }}
                    />
                    <span className="text-[9px] font-bold text-[#999]">{point.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </ReusableChart>

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
            { key: "month", header: "Month", sortable: true, render: (r) => <span className="font-bold text-[#1a1a1a]">{r.month}</span> },
            { key: "revenue", header: "Revenue", align: "right", sortable: true, render: (r) => <span className="font-bold">₹{(r.revenue / 100000).toFixed(1)}L</span> },
            { key: "cogs", header: "COGS", align: "right", render: (r) => <span className="text-[#666]">₹{(r.cogs / 100000).toFixed(1)}L</span> },
            { key: "grossProfit", header: "Gross Profit", align: "right", render: (r) => <span className="font-bold text-[#0c831f]">₹{(r.grossProfit / 100000).toFixed(1)}L</span> },
            { key: "grossMargin", header: "Margin", align: "right", render: (r) => <span className="font-bold">{r.grossMargin}%</span> },
            { key: "netProfit", header: "Net Profit", align: "right", render: (r) => (
              <span className={`font-bold ${r.netProfit >= 0 ? "text-[#0c831f]" : "text-red-500"}`}>
                ?{(r.netProfit / 100000).toFixed(1)}L
              </span>
            )},
            { key: "ebitda", header: "EBITDA", align: "right", hideOnMobile: true, render: (r) => <span className="font-bold text-[#9333ea]">₹{(r.ebitda / 100000).toFixed(1)}L</span> },
          ]}
          actions={[
            { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: (r) => toast.info(`Viewing details for ${r.month}`) },
            { label: "Export", icon: <Download className="h-3.5 w-3.5" />, onClick: (r) => toast.success(`Exporting ${r.month} data`), variant: "success" },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}

