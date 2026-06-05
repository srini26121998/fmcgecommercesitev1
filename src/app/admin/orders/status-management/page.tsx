"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { ArrowUpDown, CheckCircle, XCircle, Clock, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useOrders, useOrderActions } from "@/hooks/use-orders";
import type { Order } from "@/types/orders";

const statusFlow = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"];

function SearchParamHandler({ setSearch }: { setSearch: (search: string) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const initialSearch = searchParams.get("search");
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [searchParams, setSearch]);
  return null;
}

export default function StatusManagementPage() {
  const {
    orders, loading, search, setSearch,
    pagination, summary,
    setPage, setPageSize, fetchOrders,
  } = useOrders();
  const { updateStatus, updating } = useOrderActions();
  const [showStatusModal, setShowStatusModal] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState<string>("");

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (showStatusModal) {
      setSelectedStatus(showStatusModal.status);
      setStatusNotes("");
    }
  }, [showStatusModal]);

  const handleStatusUpdate = async () => {
    if (!showStatusModal || !selectedStatus) return;
    const success = await updateStatus({
      orderId: showStatusModal.id,
      backendId: showStatusModal.backendId,
      newStatus: selectedStatus as Order["status"],
      notes: statusNotes || undefined,
    });
    if (success) {
      toast.success(`Order ${showStatusModal.id} updated to ${selectedStatus.replace(/_/g, " ")}`);
      setShowStatusModal(null);
      fetchOrders();
    } else {
      toast.error("Failed to update status");
    }
  };

  const isUpdating = showStatusModal ? updating[showStatusModal.id] : false;

  return (
    <DashboardLayout>
      <Suspense fallback={null}>
        <SearchParamHandler setSearch={setSearch} />
      </Suspense>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Orders</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Status Management</h1>
              <p className="mt-1.5 text-xs text-[#666]">Update order statuses across the fulfillment workflow.</p>
            </div>
            <button onClick={fetchOrders} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Pending" value={summary.pending} icon={<Clock className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Confirmed" value={summary.confirmed} icon={<CheckCircle className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Preparing" value={summary.preparing} icon={<RefreshCw className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Out for Delivery" value={summary.outForDelivery} icon={<ArrowUpDown className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
        </div>

        <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by order ID or customer..." />

        <ReusableTable
          data={orders}
          keyExtractor={(o: Order) => o.id}
          isLoading={loading}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          onRowClick={(o: Order) => setShowStatusModal(o)}
          columns={[
            { key: "id", header: "Order ID", width: "110px", render: (o) => <span className="font-bold text-[#0c831f]">{(o as Order).id}</span> },
            { key: "customer", header: "Customer", width: "150px", sortable: true, render: (o) => (
              <span className="font-bold text-[#1a1a1a] block truncate max-w-[140px]">{(o as Order).customer}</span>
            )},
            { key: "items", header: "Items", width: "60px", align: "center", render: (o) => String((o as Order).items.reduce((s, i) => s + i.quantity, 0)) },
            { key: "total", header: "Total", width: "90px", align: "right", render: (o) => <span className="font-bold">{(o as Order).total.toLocaleString("en-IN")}</span> },
            { key: "status", header: "Status", width: "140px", render: (o) => <StatusBadge status={(o as Order).status} /> },
            { key: "paymentStatus", header: "Payment", width: "100px", render: (o) => <StatusBadge status={(o as Order).paymentStatus} /> },
          ]}
          actions={[
            { label: "Update Status", icon: <ArrowUpDown className="h-3.5 w-3.5" />, onClick: (o: Order) => setShowStatusModal(o) },
          ]}
        />
      </div>

      <ReusableModal open={!!showStatusModal} onClose={() => setShowStatusModal(null)} title={`Update Status - ${showStatusModal?.id}`} subtitle={`Customer: ${showStatusModal?.customer}`} size="md">
        {showStatusModal && (
          <div className="space-y-4">
            <p className="text-xs font-bold text-[#666]">
              Current Status: <StatusBadge status={showStatusModal.status} />
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#666]">New Status</label>
              <div className="grid grid-cols-2 gap-2">
                {statusFlow.map((s) => (
                  <button
                    key={s}
                    disabled={isUpdating}
                    onClick={() => setSelectedStatus(s)}
                    className={`rounded-xl border p-3 text-left text-sm font-bold transition-all hover:border-[#0c831f] disabled:opacity-50 ${
                      selectedStatus === s ? "border-[#0c831f] bg-[#e8f5e9]" : "border-[#e8e8e8]"
                    }`}
                  >
                    {s.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#666]">Notes <span className="font-normal text-[#999]">(optional)</span></label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add notes for this status update..."
                disabled={isUpdating}
                rows={3}
                className="w-full rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#999] outline-none transition-all focus:border-[#0c831f] focus:bg-white focus:ring-2 focus:ring-[#0c831f]/10 disabled:opacity-50"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#e8e8e8]">
              <button onClick={() => setShowStatusModal(null)} disabled={isUpdating} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] disabled:opacity-50">Cancel</button>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || selectedStatus === showStatusModal.status}
                className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#0a6e1a] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        )}
      </ReusableModal>
    </DashboardLayout>
  );
}
