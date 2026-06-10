"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { RefreshCw, Eye, CheckCircle, XCircle, Package } from "lucide-react";
import { toast } from "sonner";
import { useSubstitutions } from "@/hooks/use-orders";
import type { Substitution } from "@/types/orders";

export default function SubstitutionsPage() {
  const {
    substitutions, loading, error,
    search, setSearch, statusFilter, setStatusFilter,
    pagination, decideSubstitution,
    setPage, setPageSize, fetchSubstitutions,
  } = useSubstitutions();

  const [viewSubstitution, setViewSubstitution] = useState<Substitution | null>(null);

  const statusCounts = useMemo(() => ({
    total: substitutions.length,
    accepted: substitutions.filter((s) => s.status === "accepted").length,
    pending: substitutions.filter((s) => s.status === "pending").length,
    rejected: substitutions.filter((s) => s.status === "rejected").length,
  }), [substitutions]);

  const handleDecide = async (sub: Substitution, status: "accepted" | "rejected") => {
    const success = await decideSubstitution({ substitutionId: sub.id, status, decidedBy: "Super Admin" });
    if (success) {
      toast.success(`Substitution ${sub.id} ${status}`);
    } else {
      toast.error("Failed to update substitution");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Orders</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Substitutions</h1>
              <p className="mt-1.5 text-xs text-[#666]">Manage product substitutions when ordered items are unavailable.</p>
            </div>
            <div className="flex items-center gap-2">
              {statusFilter && (
                <button onClick={() => setStatusFilter("")} className="text-xs font-bold text-[#999] hover:text-[#666]">
                  Clear filter
                </button>
              )}
              <button onClick={fetchSubstitutions} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Substitutions" value={statusCounts.total} icon={<RefreshCw className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Accepted" value={statusCounts.accepted} icon={<CheckCircle className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Pending" value={statusCounts.pending} icon={<Package className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Rejected" value={statusCounts.rejected} icon={<XCircle className="h-4 w-4" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "accepted", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === "all" ? "" : s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                (s === "all" && !statusFilter) || statusFilter === s
                  ? "bg-[#0c831f] text-white"
                  : "border border-[#e8e8e8] bg-white text-[#666] hover:border-[#0c831f]/30"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by product or order ID..." />

        <ReusableTable
          data={substitutions}
          keyExtractor={(s: Substitution) => s.id}
          isLoading={loading}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          columns={[
            { key: "orderId", header: "Order", width: "100px", render: (s) => <span className="font-bold text-[#0c831f]">{(s as Substitution).orderId}</span> },
            { key: "original", header: "Original Item", sortable: true, render: (s) => <span className="font-bold text-[#1a1a1a]">{(s as Substitution).original}</span> },
            { key: "substitute", header: "Substituted With", render: (s) => <span className="text-[#0c831f] font-semibold">{(s as Substitution).substitute}</span> },
            { key: "reason", header: "Reason", width: "120px", hideOnMobile: true, render: (s) => (s as Substitution).reason || "₹" },
            { key: "status", header: "Status", width: "110px", render: (s) => <StatusBadge status={(s as Substitution).status} /> },
            { key: "amount", header: "Amount", width: "90px", align: "right", render: (s) => <span className="font-bold">₹{(s as Substitution).amount}</span> },
          ]}
          onRowClick={(s: Substitution) => setViewSubstitution(s)}
        />

        {error && (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-4">
            <p className="text-sm font-bold text-[#dc2626]">{error}</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      <ReusableModal
        open={!!viewSubstitution}
        onClose={() => setViewSubstitution(null)}
        title="Substitution Details"
        subtitle={`Details for substitution ID ${viewSubstitution?.id}`}
        size="md"
      >
        {viewSubstitution && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 border-b border-[#e8e8e8] pb-3">
              <div>
                <p className="text-[10px] text-[#999] font-medium uppercase">Substitution ID</p>
                <p className="font-semibold text-[#1a1a1a]">{viewSubstitution.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#999] font-medium uppercase">Order ID</p>
                <p className="font-semibold text-[#0c831f]">{viewSubstitution.orderId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-[#e8e8e8] pb-3">
              <div>
                <p className="text-[10px] text-[#999] font-medium uppercase">Original Item</p>
                <p className="font-semibold text-[#dc2626]">{viewSubstitution.original}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#999] font-medium uppercase">Substituted With</p>
                <p className="font-semibold text-[#0c831f]">{viewSubstitution.substitute}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-b border-[#e8e8e8] pb-3">
              <div>
                <p className="text-[10px] text-[#999] font-medium uppercase">Status</p>
                <div className="mt-0.5"><StatusBadge status={viewSubstitution.status} /></div>
              </div>
              <div>
                <p className="text-[10px] text-[#999] font-medium uppercase">Amount</p>
                <p className="font-semibold text-[#1a1a1a]">₹{viewSubstitution.amount}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#999] font-medium uppercase">Reason</p>
                <p className="font-semibold text-[#666]">{viewSubstitution.reason || "₹"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-[#999] font-medium uppercase">Decided By</p>
                <p className="font-semibold text-[#666]">{viewSubstitution.decidedBy || "₹"}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#999] font-medium uppercase">Decided At</p>
                <p className="font-semibold text-[#666]">{viewSubstitution.decidedAt || "₹"}</p>
              </div>
            </div>

            {viewSubstitution.status === "pending" && (
              <div className="flex gap-3 border-t border-[#e8e8e8] pt-4 mt-4">
                <button
                  onClick={() => {
                    handleDecide(viewSubstitution, "accepted");
                    setViewSubstitution(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-[#0c831f]/20 bg-[#e8f5e9] px-4 py-2 text-sm font-bold text-[#0c831f] hover:bg-[#d0f0d4]"
                >
                  <CheckCircle className="h-4 w-4" /> Accept
                </button>
                <button
                  onClick={() => {
                    handleDecide(viewSubstitution, "rejected");
                    setViewSubstitution(null);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </ReusableModal>
    </DashboardLayout>
  );
}

