"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { ReusablePageHeader, ReusableDrawer } from "@/components/common";
import { useTaxReports } from "@/hooks/use-reports";
import {
  FileText,
  Landmark,
  DollarSign,
  AlertTriangle,
  Calendar,
  Eye,
  Download,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { TaxReportEntry } from "@/types/reports";

const typeColors: Record<string, string> = {
  "GSTR-1": "bg-[#eff6ff] text-[#2563eb]",
  "GSTR-3B": "bg-[#e8f5e9] text-[#0c831f]",
  "GSTR-9": "bg-[#f3e8ff] text-[#9333ea]",
  TDS: "bg-[#fffbeb] text-[#d97706]",
  ITC: "bg-[#fff0f6] text-[#ff4f8b]",
  Annual: "bg-[#f6f7f6] text-[#666]",
};

export default function TaxReportsPage() {
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
  } = useTaxReports();

  const [selectedReport, setSelectedReport] = useState<TaxReportEntry | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="Tax Reports"
          subtitle="GST filings, TDS certificates, ITC claims, and tax compliance reports for regulatory requirements."
          actions={
            <ReusableExportButton
              onExport={(fmt) => {
                toast.success(`Exporting tax report as ${fmt.toUpperCase()}`);
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
            title="Generated Reports"
            value={summary?.generatedReports ?? 0}
            icon={<FileText className="h-5 w-5" />}
            color="text-[#2563eb]"
            bgColor="bg-[#eff6ff]"
          />
          <ReusableCard
            title="Completed Filings"
            value={summary?.completedFilings ?? 0}
            icon={<CheckCircle className="h-5 w-5" />}
            color="text-[#0c831f]"
            bgColor="bg-[#e8f5e9]"
          />
          <ReusableCard
            title="Pending Filings"
            value={summary?.pendingFilings ?? 0}
            icon={<Clock className="h-5 w-5" />}
            color="text-[#d97706]"
            bgColor="bg-[#fffbeb]"
          />
          <ReusableCard
            title="Upcoming Liability"
            value={summary?.upcomingTaxLiability !== undefined ? `₹${summary.upcomingTaxLiability.toLocaleString("en-IN")}` : "₹"}
            icon={<Landmark className="h-5 w-5" />}
            color="text-[#9333ea]"
            bgColor="bg-[#f3e8ff]"
            subtitle={summary?.nextDeadline ? `Due: ${summary.nextDeadline}` : undefined}
          />
        </div>

        {/* Filing Status Banner */}
        {summary && summary.pendingFilings > 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-bold text-amber-700">
                {summary.pendingFilings} filing{summary.pendingFilings > 1 ? "s" : ""} pending
              </p>
              <p className="text-xs text-amber-600">Next due: {summary.nextDeadline} ({summary.nextDeadlineType})</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(val) => updateFilters({ search: val })}
              placeholder="Search report title, period, type..."
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
              key: "reportTitle",
              header: "Report",
              sortable: true,
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${typeColors[r.type]?.split(" ")[0] ?? "bg-[#f6f7f6]"}`}>
                    <FileText className={`h-4 w-4 ${typeColors[r.type]?.split(" ")[1] ?? "text-[#666]"}`} />
                  </div>
                  <div>
                    <span className="font-bold text-[#1a1a1a]">{r.reportTitle}</span>
                    <span className="block text-[10px] text-[#999]">{r.id} ₹ {r.period}</span>
                  </div>
                </div>
              ),
            },
            {
              key: "type",
              header: "Type",
              width: "90px",
              render: (r) => (
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${typeColors[r.type] ?? "bg-[#f6f7f6] text-[#666]"}`}>
                  {r.type}
                </span>
              ),
            },
            {
              key: "totalTaxAmount",
              header: "Tax Amount",
              align: "right",
              width: "120px",
              sortable: true,
              render: (r) => (
                <span className="font-bold">
                  {r.totalTaxAmount > 0 ? `₹${(r.totalTaxAmount / 100000).toFixed(2)}L` : "₹"}
                </span>
              ),
            },
            {
              key: "format",
              header: "Format",
              width: "70px",
              render: (r) => <span className="font-bold uppercase text-[#666]">{r.format}</span>,
            },
            {
              key: "status",
              header: "Status",
              width: "110px",
              render: (r) => <StatusBadge status={r.status} />,
            },
            {
              key: "dueDate",
              header: "Due Date",
              width: "110px",
              hideOnMobile: true,
              render: (r) => (
                <span className={r.dueDate !== "₹" && r.status === "pending" ? "font-bold text-[#d97706]" : "text-[#666]"}>
                  {r.dueDate}
                </span>
              ),
            },
          ]}
          actions={[
            {
              label: "View Details",
              icon: <Eye className="h-3.5 w-3.5" />,
              onClick: (r) => setSelectedReport(r),
            },
            {
              label: "Download",
              icon: <Download className="h-3.5 w-3.5" />,
              onClick: (r) => {
                if (r.status === "pending" || r.status === "generating") {
                  toast.error("Report not ready for download yet");
                } else {
                  toast.success(`Downloading ${r.reportTitle}`);
                }
              },
              variant: "success",
            },
          ]}
        />
      </div>

      {/* Detail Drawer */}
      <ReusableDrawer
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Tax Report Details"
        subtitle={selectedReport?.reportTitle}
        width="lg"
      >
        {selectedReport && (
          <div className="space-y-4">
            {/* Report Info */}
            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Report ID</p>
                  <p className="mt-1 text-sm font-mono font-bold text-[#1a1a1a]">{selectedReport.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Type</p>
                  <p className="mt-1">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${typeColors[selectedReport.type] ?? "bg-[#f6f7f6] text-[#666]"}`}>
                      {selectedReport.type}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Period</p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedReport.period}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Status</p>
                  <p className="mt-1"><StatusBadge status={selectedReport.status} /></p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Due Date</p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedReport.dueDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Format / Size</p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a] uppercase">{selectedReport.format} ₹ {selectedReport.fileSize}</p>
                </div>
              </div>
            </div>

            {/* Tax Breakdown */}
            {selectedReport.totalTaxAmount > 0 && (
              <div className="rounded-xl border border-[#e8e8e8] p-4">
                <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Tax Breakdown</h4>
                <div className="space-y-2.5">
                  {[
                    { label: "Taxable Value", value: selectedReport.taxableValue > 0 ? `₹${(selectedReport.taxableValue / 100000).toFixed(2)}L` : "₹" },
                    { label: "CGST", value: selectedReport.cgst > 0 ? `₹${(selectedReport.cgst / 1000).toFixed(1)}K` : "₹" },
                    { label: "SGST", value: selectedReport.sgst > 0 ? `₹${(selectedReport.sgst / 1000).toFixed(1)}K` : "₹" },
                    { label: "IGST", value: selectedReport.igst > 0 ? `₹${(selectedReport.igst / 1000).toFixed(1)}K` : "₹" },
                    { label: "TDS", value: selectedReport.tds > 0 ? `₹${(selectedReport.tds / 1000).toFixed(1)}K` : "₹" },
                    { label: "Total Tax Amount", value: `₹${(selectedReport.totalTaxAmount / 100000).toFixed(2)}L`, highlight: true },
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
            )}

            {/* Filing Status */}
            <div className={`rounded-xl border p-4 ${
              selectedReport.status === "filed"
                ? "border-[#0c831f]/20 bg-[#e8f5e9]/30"
                : selectedReport.status === "pending"
                ? "border-amber-200 bg-amber-50"
                : "border-[#e8e8e8] bg-[#f9fafb]"
            }`}>
              <div className="flex items-center gap-2">
                {selectedReport.status === "filed" ? (
                  <CheckCircle className="h-4 w-4 text-[#0c831f]" />
                ) : selectedReport.status === "pending" ? (
                  <Clock className="h-4 w-4 text-amber-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-[#dc2626]" />
                )}
                <span className={`text-sm font-bold ${
                  selectedReport.status === "filed" ? "text-[#0c831f]" :
                  selectedReport.status === "pending" ? "text-amber-700" : "text-[#dc2626]"
                }`}>
                  {selectedReport.status === "filed"
                    ? `Filed on ${selectedReport.filedDate}`
                    : selectedReport.status === "pending"
                    ? `Pending ₹ due ${selectedReport.dueDate}`
                    : `Status: ${selectedReport.status}`}
                </span>
              </div>
              {selectedReport.generatedAt !== "₹" && (
                <p className="mt-1 text-xs text-[#999]">Generated: {selectedReport.generatedAt}</p>
              )}
            </div>
          </div>
        )}
      </ReusableDrawer>
    </DashboardLayout>
  );
}

