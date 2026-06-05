"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { ReusablePageHeader, ReusableDrawer } from "@/components/common";
import { useGSTReports } from "@/hooks/use-reports";
import { Landmark, DollarSign, FileText, AlertTriangle, Download, Eye, ArrowUpRight, X, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import type { GSTReportEntry } from "@/types/reports";

export default function GSTReportsPage() {
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
  } = useGSTReports();
  const [selectedReport, setSelectedReport] = useState<GSTReportEntry | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="GST Reports"
          subtitle="GST returns, input tax credit, and tax compliance filings."
          actions={
            <ReusableExportButton
              onExport={(fmt) => {
                toast.success(`Exporting GST report as ${fmt.toUpperCase()}`);
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
          <ReusableCard title="Total Tax Liability" value={summary ? `?${(summary.totalLiability / 100000).toFixed(1)}L` : "₹"} icon={<Landmark className="h-5 w-5" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Input Credit" value={summary ? `?${(summary.totalInputCredit / 100000).toFixed(1)}L` : "₹"} icon={<DollarSign className="h-5 w-5" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Net Payable" value={summary ? `?${(summary.netPayable / 100000).toFixed(1)}L` : "₹"} icon={<ArrowUpRight className="h-5 w-5" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-wide text-[#666]">Filing Status</span>
            </div>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-[#0c831f]" />
                <span className="text-xs font-bold text-[#1a1a1a]">{summary ? `${mockTotalFiled(summary)} Filed` : "₹"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs font-bold text-[#1a1a1a]">{summary?.pendingReturns ?? 0} Pending</span>
              </div>
              {summary?.overdueReturns ? (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs font-bold text-red-500">{summary.overdueReturns} Overdue</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(val) => updateFilters({ search: val })}
              placeholder="Search GST reports..."
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
              key: "period",
              header: "Period",
              sortable: true,
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eff6ff]">
                    <FileText className="h-4 w-4 text-[#2563eb]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1a1a1a]">{r.period}</span>
                    <span className="block text-[10px] text-[#999]">{r.returnType}</span>
                  </div>
                </div>
              ),
            },
            { key: "gstin", header: "GSTIN", width: "130px", hideOnMobile: true, render: (r) => <span className="text-xs font-mono text-[#666]">{r.gstin}</span> },
            { key: "taxableValue", header: "Taxable Value", width: "120px", align: "right", render: (r) => <span className="font-bold">?{(r.taxableValue / 100000).toFixed(1)}L</span> },
            { key: "totalTaxLiability", header: "Tax Liability", width: "110px", align: "right", render: (r) => <span className="font-bold">?{(r.totalTaxLiability / 100000).toFixed(1)}L</span> },
            { key: "netPayable", header: "Net Payable", width: "110px", align: "right", render: (r) => <span className="font-bold text-[#0c831f]">?{(r.netPayable / 1000).toFixed(1)}K</span> },
            { key: "status", header: "Status", width: "100px", render: (r) => <StatusBadge status={r.status} /> },
            { key: "dueDate", header: "Due Date", width: "100px", hideOnMobile: true },
          ]}
          actions={[
            { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: (r) => setSelectedReport(r) },
            { label: "Download", icon: <Download className="h-3.5 w-3.5" />, onClick: (r) => toast.success(`Downloading ${r.period} GST return`), variant: "success" },
          ]}
        />

        <ReusableDrawer
          open={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title="GST Return Details"
          subtitle={selectedReport?.period}
          width="lg"
        >
          {selectedReport && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Business Name</p>
                    <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedReport.businessName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">GSTIN</p>
                    <p className="mt-1 text-sm font-mono font-bold text-[#1a1a1a]">{selectedReport.gstin}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Return Type</p>
                    <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedReport.returnType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Status</p>
                    <p className="mt-1"><StatusBadge status={selectedReport.status} /></p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-4">
                <h4 className="text-xs font-black uppercase tracking-wide text-[#666] mb-3">Tax Breakdown</h4>
                <div className="space-y-3">
                  {[
                    { label: "Gross Sales", value: `?${(selectedReport.grossSales / 100000).toFixed(2)}L` },
                    { label: "Taxable Value", value: `?${(selectedReport.taxableValue / 100000).toFixed(2)}L` },
                    { label: "CGST", value: `?${(selectedReport.cgst / 1000).toFixed(1)}K` },
                    { label: "SGST", value: `?${(selectedReport.sgst / 1000).toFixed(1)}K` },
                    { label: "IGST", value: `?${(selectedReport.igst / 1000).toFixed(1)}K` },
                    { label: "Total Tax Liability", value: `?${(selectedReport.totalTaxLiability / 100000).toFixed(2)}L`, highlight: true },
                    { label: "Input Tax Credit", value: `?${(selectedReport.inputCredit / 1000).toFixed(1)}K` },
                    { label: "Net Payable", value: `?${(selectedReport.netPayable / 1000).toFixed(1)}K`, highlight: true },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center justify-between py-1 ${item.highlight ? "border-t border-[#e8e8e8] pt-3" : ""}`}>
                      <span className="text-sm text-[#666]">{item.label}</span>
                      <span className={`text-sm ${item.highlight ? "font-black text-[#1a1a1a]" : "font-bold text-[#1a1a1a]"}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {selectedReport.filedDate && (
                <div className="rounded-xl border border-[#e8e8e8] bg-[#e8f5e9]/30 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#0c831f]" />
                    <span className="text-sm font-bold text-[#0c831f]">Filed on {selectedReport.filedDate}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ReusableDrawer>
      </div>
    </DashboardLayout>
  );
}

function mockTotalFiled(summary: { pendingReturns: number; overdueReturns: number }): number {
  return 7 - summary.pendingReturns - summary.overdueReturns;
}

