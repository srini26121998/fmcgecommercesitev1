"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { ReusablePageHeader, ReusableDrawer } from "@/components/common";
import { useVendorOnboarding } from "@/hooks/use-vendors";
import {
  UserPlus, CheckCircle, Clock, XCircle, Eye, FileText,
  AlertTriangle, Users, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { VendorOnboarding } from "@/types/vendors";

const docStatusConfig: Record<string, { color: string; bg: string; label: string }> = {
  uploaded:  { color: "text-[#2563eb]", bg: "bg-[#eff6ff]", label: "Uploaded" },
  verified:  { color: "text-[#0c831f]", bg: "bg-[#e8f5e9]", label: "Verified" },
  rejected:  { color: "text-[#dc2626]", bg: "bg-[#fef2f2]", label: "Rejected" },
  pending:   { color: "text-[#999]",    bg: "bg-[#f6f7f6]", label: "Pending" },
};

export default function VendorOnboardingPage() {
  const {
    data, loading, error, summary, filters, meta,
    fetchData, updateFilters, approveVendor, rejectVendor,
    goToPage, changePageSize,
  } = useVendorOnboarding();

  const [selectedApp, setSelectedApp] = useState<VendorOnboarding | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string; company: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async (id: string, company: string) => {
    setActionLoading(true);
    try {
      await approveVendor(id);
      toast.success(`${company} has been approved`);
      setSelectedApp(null);
    } catch {
      toast.error("Failed to approve vendor");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setActionLoading(true);
    try {
      await rejectVendor(rejectModal.id, rejectReason);
      toast.success(`${rejectModal.company} application rejected`);
      setRejectModal(null);
      setRejectReason("");
      setSelectedApp(null);
    } catch {
      toast.error("Failed to reject vendor");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Vendors"
          title="Vendor Onboarding"
          subtitle="Review, verify documents, and approve new vendor applications."
          actions={
            <div className="flex items-center gap-2">
              <button onClick={fetchData} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <button className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
                <UserPlus className="h-4 w-4" /> Invite Vendor
              </button>
            </div>
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Applications" value={summary?.total ?? 0} icon={<Users className="h-5 w-5" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Pending Review" value={summary?.pendingReview ?? 0} icon={<Clock className="h-5 w-5" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" subtitle={summary ? `${summary.pendingDocuments} pending docs` : undefined} />
          <ReusableCard title="Approved" value={summary?.approved ?? 0} icon={<CheckCircle className="h-5 w-5" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Rejected" value={summary?.rejected ?? 0} icon={<XCircle className="h-5 w-5" />} color="text-[#dc2626]" bgColor="bg-[#fef2f2]" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(v) => updateFilters({ search: v })}
              placeholder="Search by company, owner, ID..."
            />
          </div>
          <select
            value={filters.status ?? "all"}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending_review">Pending Review</option>
            <option value="pending_documents">Pending Documents</option>
            <option value="processing">Processing</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Applications Table */}
        <ReusableTable
          data={data}
          keyExtractor={(a) => a.id}
          isLoading={loading}
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          columns={[
            {
              key: "company", header: "Company", sortable: true,
              render: (a) => (
                <div>
                  <span className="font-bold text-[#1a1a1a]">{a.company}</span>
                  <span className="block text-[10px] text-[#999]">{a.id} ₹ {a.owner}</span>
                </div>
              ),
            },
            { key: "category", header: "Category", width: "130px", hideOnMobile: true },
            {
              key: "documents", header: "Documents", width: "160px",
              render: (a) => (
                <div className="flex flex-wrap gap-1">
                  {a.documents.map((doc) => (
                    <span
                      key={doc.type}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${docStatusConfig[doc.status]?.bg} ${docStatusConfig[doc.status]?.color}`}
                    >
                      {doc.type}
                    </span>
                  ))}
                </div>
              ),
            },
            { key: "status", header: "Status", width: "130px", render: (a) => <StatusBadge status={a.status} /> },
            { key: "appliedDate", header: "Applied", width: "100px", hideOnMobile: true },
            {
              key: "city", header: "Location", width: "120px", hideOnMobile: true,
              render: (a) => <span className="text-xs text-[#666]">{a.city}, {a.state}</span>,
            },
          ]}
          actions={[
            { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: (a) => setSelectedApp(a) },
            {
              label: "Approve",
              icon: <CheckCircle className="h-3.5 w-3.5" />,
              onClick: (a) => handleApprove(a.id, a.company),
              variant: "success",
              show: (a) => a.status === "pending_review" || a.status === "processing",
            },
            {
              label: "Reject",
              icon: <XCircle className="h-3.5 w-3.5" />,
              onClick: (a) => setRejectModal({ id: a.id, company: a.company }),
              variant: "danger",
              show: (a) => a.status === "pending_review" || a.status === "pending_documents",
            },
          ]}
        />
      </div>

      {/* Application Detail Drawer */}
      <ReusableDrawer
        open={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Details"
        subtitle={selectedApp?.company}
        width="lg"
      >
        {selectedApp && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedApp.status} />
              <span className="text-xs text-[#999]">Applied: {selectedApp.appliedDate}</span>
            </div>

            {/* Applicant Info */}
            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Applicant Information</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Owner", value: selectedApp.owner },
                  { label: "Email", value: selectedApp.email },
                  { label: "Phone", value: selectedApp.phone },
                  { label: "Category", value: selectedApp.category },
                  { label: "City", value: `${selectedApp.city}, ${selectedApp.state}` },
                  { label: "Expected Volume", value: selectedApp.expectedMonthlyVolume ? `₹${(selectedApp.expectedMonthlyVolume / 1000).toFixed(0)}K/mo` : "₹" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">{f.label}</p>
                    <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Document Verification</h4>
              <div className="space-y-2.5">
                {selectedApp.documents.map((doc) => {
                  const cfg = docStatusConfig[doc.status];
                  return (
                    <div key={doc.type} className="flex items-center justify-between rounded-lg border border-[#e8e8e8] p-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cfg.bg}`}>
                          <FileText className={`h-4 w-4 ${cfg.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1a1a1a]">{doc.type}</p>
                          {doc.uploadedAt && <p className="text-[10px] text-[#999]">Uploaded: {doc.uploadedAt}</p>}
                          {doc.rejectionReason && <p className="text-[10px] text-red-500">{doc.rejectionReason}</p>}
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rejection reason if rejected */}
            {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-700">Rejection Reason</p>
                    <p className="mt-1 text-sm text-red-600">{selectedApp.rejectionReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {(selectedApp.status === "pending_review" || selectedApp.status === "processing") && (
              <div className="flex gap-3 border-t border-[#e8e8e8] pt-4">
                <button
                  onClick={() => { setSelectedApp(null); setRejectModal({ id: selectedApp.id, company: selectedApp.company }); }}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedApp.id, selectedApp.company)}
                  disabled={actionLoading}
                  className="ml-auto flex items-center gap-1.5 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" /> Approve Vendor
                </button>
              </div>
            )}
          </div>
        )}
      </ReusableDrawer>

      {/* Reject Confirmation Modal */}
      <ReusableModal
        open={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectReason(""); }}
        title="Reject Application"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#666]">
            Rejecting <span className="font-bold text-[#1a1a1a]">{rejectModal?.company}</span>. Please provide a reason.
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Rejection Reason *</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete documentation, FSSAI license missing..."
              rows={3}
              className="w-full rounded-xl border border-[#e8e8e8] bg-white px-3 py-2.5 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#dc2626]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setRejectModal(null); setRejectReason(""); }}
              className="rounded-xl border border-[#e8e8e8] px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading || !rejectReason.trim()}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {actionLoading ? "Rejecting..." : "Reject Application"}
            </button>
          </div>
        </div>
      </ReusableModal>
    </DashboardLayout>
  );
}

