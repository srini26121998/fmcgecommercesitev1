"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { ReusablePageHeader, ReusableDrawer } from "@/components/common";
import { useVendorSettlements } from "@/hooks/use-vendors";
import {
  DollarSign, Send, Eye, Download, Banknote,
  Clock, CheckCircle, RefreshCw, AlertTriangle, FileText,
} from "lucide-react";
import { toast } from "sonner";
import type { VendorSettlement } from "@/types/vendors";

export default function VendorSettlementsPage() {
  const {
    data, loading, error, summary, filters, meta,
    fetchData, updateFilters, processSettlement,
    goToPage, changePageSize,
  } = useVendorSettlements();

  const [selectedSettlement, setSelectedSettlement] = useState<VendorSettlement | null>(null);
  const [payModal, setPayModal] = useState<VendorSettlement | null>(null);
  const [payLoading, setPayLoading] = useState(false);

  const handleProcess = async (settlement: VendorSettlement) => {
    setPayLoading(true);
    try {
      await processSettlement(settlement.id);
      toast.success(`Payment of ₹${settlement.netPayable.toLocaleString()} initiated for ${settlement.vendorName}`);
      setPayModal(null);
      setSelectedSettlement(null);
    } catch {
      toast.error("Failed to process settlement");
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Vendors"
          title="Vendor Settlements"
          subtitle="Process vendor payouts, track settlement history, and manage payment cycles."
          actions={
            <div className="flex items-center gap-2">
              <button onClick={fetchData} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <ReusableExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt.toUpperCase()}`)} />
            </div>
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard
            title="Total Net Payable"
            value={summary ? `₹${(summary.totalNetPayable / 100000).toFixed(1)}L` : "—"}
            icon={<DollarSign className="h-5 w-5" />}
            color="text-[#0c831f]" bgColor="bg-[#e8f5e9]"
          />
          <ReusableCard
            title="Pending Amount"
            value={summary ? `₹${(summary.pendingAmount / 100000).toFixed(1)}L` : "—"}
            icon={<Clock className="h-5 w-5" />}
            color="text-[#d97706]" bgColor="bg-[#fffbeb]"
            subtitle={summary ? `${summary.pendingCount} settlements` : undefined}
          />
          <ReusableCard
            title="Total Commission"
            value={summary ? `₹${(summary.totalCommission / 100000).toFixed(1)}L` : "—"}
            icon={<Banknote className="h-5 w-5" />}
            color="text-[#9333ea]" bgColor="bg-[#f3e8ff]"
          />
          <ReusableCard
            title="Completed"
            value={summary?.completedCount ?? 0}
            icon={<CheckCircle className="h-5 w-5" />}
            color="text-[#2563eb]" bgColor="bg-[#eff6ff]"
            subtitle={summary ? `${summary.processingCount} processing` : undefined}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(v) => updateFilters({ search: v })}
              placeholder="Search by vendor or settlement ID..."
            />
          </div>
          <select
            value={filters.status ?? "all"}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Settlements Table */}
        <ReusableTable
          data={data}
          keyExtractor={(s) => s.id}
          isLoading={loading}
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          columns={[
            {
              key: "id", header: "Settlement ID", width: "120px",
              render: (s) => (
                <div>
                  <span className="font-mono text-xs font-bold text-[#0c831f]">{s.id}</span>
                  <span className="block text-[10px] text-[#999]">{s.period}</span>
                </div>
              ),
            },
            {
              key: "vendorName", header: "Vendor", sortable: true,
              render: (s) => (
                <div>
                  <span className="font-bold text-[#1a1a1a]">{s.vendorName}</span>
                  <span className="block text-[10px] text-[#999]">{s.vendorId}</span>
                </div>
              ),
            },
            { key: "totalOrders", header: "Orders", width: "70px", align: "center" },
            {
              key: "grossSales", header: "Gross Sales", width: "110px", align: "right", sortable: true,
              render: (s) => <span className="font-bold">₹{(s.grossSales / 1000).toFixed(1)}K</span>,
            },
            {
              key: "commission", header: "Commission", width: "110px", align: "right",
              render: (s) => <span className="text-[#ff4f8b]">-₹{(s.commission / 1000).toFixed(1)}K</span>,
            },
            {
              key: "netPayable", header: "Net Payable", width: "110px", align: "right", sortable: true,
              render: (s) => <span className="font-bold text-[#0c831f]">₹{(s.netPayable / 1000).toFixed(1)}K</span>,
            },
            { key: "status", header: "Status", width: "110px", render: (s) => <StatusBadge status={s.status} /> },
            {
              key: "dueDate", header: "Due Date", width: "100px", hideOnMobile: true,
              render: (s) => (
                <span className={s.status === "pending" ? "font-bold text-[#d97706]" : "text-[#666]"}>
                  {s.dueDate}
                </span>
              ),
            },
          ]}
          actions={[
            { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: (s) => setSelectedSettlement(s) },
            {
              label: "Process Payment",
              icon: <Send className="h-3.5 w-3.5" />,
              onClick: (s) => setPayModal(s),
              variant: "success",
              show: (s) => s.status === "pending",
            },
            {
              label: "Download",
              icon: <Download className="h-3.5 w-3.5" />,
              onClick: (s) => toast.success(`Downloading settlement ${s.id}`),
              show: (s) => s.status === "completed",
            },
          ]}
        />
      </div>

      {/* Settlement Detail Drawer */}
      <ReusableDrawer
        open={!!selectedSettlement}
        onClose={() => setSelectedSettlement(null)}
        title="Settlement Details"
        subtitle={selectedSettlement?.id}
        width="md"
      >
        {selectedSettlement && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedSettlement.status} />
              <span className="text-xs text-[#999]">{selectedSettlement.period}</span>
            </div>

            {/* Vendor Info */}
            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-[#999]">Vendor</p>
                  <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{selectedSettlement.vendorName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#999]">Total Orders</p>
                  <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{selectedSettlement.totalOrders}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#999]">Period</p>
                  <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{selectedSettlement.periodStart} - {selectedSettlement.periodEnd}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#999]">Due Date</p>
                  <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{selectedSettlement.dueDate}</p>
                </div>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Financial Breakdown</h4>
              <div className="space-y-2.5">
                {[
                  { label: "Gross Sales", value: `₹${(selectedSettlement.grossSales / 1000).toFixed(2)}K` },
                  { label: "Returns", value: `-₹${(selectedSettlement.returns / 1000).toFixed(2)}K` },
                  { label: "Net Sales", value: `₹${(selectedSettlement.netSales / 1000).toFixed(2)}K` },
                  { label: `Commission (${selectedSettlement.commissionRate}%)`, value: `-₹${(selectedSettlement.commission / 1000).toFixed(2)}K` },
                  { label: "Tax (GST)", value: `-₹${(selectedSettlement.tax / 1000).toFixed(2)}K` },
                  { label: "Adjustments", value: selectedSettlement.adjustments !== 0 ? `₹${(selectedSettlement.adjustments / 1000).toFixed(2)}K` : "—" },
                  { label: "Net Payable", value: `₹${(selectedSettlement.netPayable / 1000).toFixed(2)}K`, highlight: true },
                ].map((item) => (
                  <div key={item.label} className={`flex justify-between py-1 ${item.highlight ? "border-t border-[#e8e8e8] pt-2.5" : ""}`}>
                    <span className="text-sm text-[#666]">{item.label}</span>
                    <span className={`text-sm ${item.highlight ? "font-black text-[#0c831f]" : "font-bold text-[#1a1a1a]"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Banking */}
            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <h4 className="mb-2 text-xs font-black uppercase tracking-wide text-[#666]">Payment Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-[#999]">Account</p>
                  <p className="font-mono font-bold text-[#1a1a1a]">{selectedSettlement.bankAccount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#999]">IFSC</p>
                  <p className="font-mono font-bold text-[#1a1a1a]">{selectedSettlement.ifsc}</p>
                </div>
                {selectedSettlement.paidDate && (
                  <div>
                    <p className="text-[10px] font-bold text-[#999]">Paid On</p>
                    <p className="font-bold text-[#0c831f]">{selectedSettlement.paidDate}</p>
                  </div>
                )}
                {selectedSettlement.paymentRef && (
                  <div>
                    <p className="text-[10px] font-bold text-[#999]">Reference</p>
                    <p className="font-mono text-xs font-bold text-[#1a1a1a]">{selectedSettlement.paymentRef}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedSettlement.notes && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                  <p className="text-sm text-amber-700">{selectedSettlement.notes}</p>
                </div>
              </div>
            )}

            {selectedSettlement.status === "pending" && (
              <div className="flex gap-3 border-t border-[#e8e8e8] pt-4">
                <button
                  onClick={() => { setSelectedSettlement(null); setPayModal(selectedSettlement); }}
                  className="ml-auto flex items-center gap-1.5 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]"
                >
                  <Send className="h-4 w-4" /> Process Payment
                </button>
              </div>
            )}
          </div>
        )}
      </ReusableDrawer>

      {/* Pay Confirmation Modal */}
      <ReusableModal
        open={!!payModal}
        onClose={() => setPayModal(null)}
        title="Confirm Payout"
        size="sm"
      >
        {payModal && (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#f9fafb] p-4 space-y-2">
              {[
                { label: "Settlement", value: payModal.id },
                { label: "Vendor", value: payModal.vendorName },
                { label: "Period", value: payModal.period },
                { label: "Account", value: payModal.bankAccount },
              ].map((f) => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span className="text-[#666]">{f.label}:</span>
                  <span className="font-bold text-[#1a1a1a]">{f.value}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-[#e8e8e8] pt-2 text-base">
                <span className="text-[#666]">Amount:</span>
                <span className="font-black text-[#0c831f]">₹{payModal.netPayable.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-[#999]">Amount will be transferred via NEFT/IMPS to the vendor's registered bank account.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPayModal(null)} className="rounded-xl border border-[#e8e8e8] px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">
                Cancel
              </button>
              <button
                onClick={() => handleProcess(payModal)}
                disabled={payLoading}
                className="flex items-center gap-1.5 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {payLoading ? "Processing..." : "Initiate Payment"}
              </button>
            </div>
          </div>
        )}
      </ReusableModal>
    </DashboardLayout>
  );
}

