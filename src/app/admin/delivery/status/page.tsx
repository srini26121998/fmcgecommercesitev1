"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { useDeliveryStatuses } from "@/hooks/use-delivery";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableCard from "@/components/ui/admin/reusable-card";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
  AlertTriangle,
  Truck,
  Eye,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const statusSummaryColors: Record<string, string> = {
  assigned: "text-[#2563eb]",
  picked_up: "text-[#d97706]",
  in_transit: "text-[#9333ea]",
  out_for_delivery: "text-[#0c831f]",
  delivered: "text-[#0c831f]",
  failed: "text-[#dc2626]",
};

export default function DeliveryStatusPage() {
  const {
    entries, loading, error,
    search, setSearch,
    statusFilter, setStatusFilter,
    zoneFilter, setZoneFilter,
    pagination, setPage, setPageSize,
    summary, refresh, updateStatus,
  } = useDeliveryStatuses();

  const [showViewModal, setShowViewModal] = useState<any>(null);
  const [editStatus, setEditStatus] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleSaveStatus = async () => {
    if (!editStatus || !editForm.status) return;
    const res = await updateStatus({
      deliveryId: editStatus.id,
      status: editForm.status,
      note: editForm.note,
    });
    if (res) {
      toast.success(`Successfully updated status for Order ${editStatus.orderId}`);
      setEditStatus(null);
    } else {
      toast.error("Failed to update delivery status");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Delivery Status</h1>
              <p className="mt-1.5 text-xs text-[#666]">Track and manage delivery status for all orders in real-time.</p>
            </div>
            <ReusableExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt.toUpperCase()}`)} />
          </div>
        </section>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Active" value={summary.assigned + summary.pickedUp + summary.inTransit + summary.outForDelivery} icon={<Clock className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Delivered" value={summary.delivered} icon={<CheckCircle2 className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Delayed" value={summary.delayed} icon={<AlertTriangle className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Failed/Cancelled" value={summary.failed + summary.cancelled} icon={<XCircle className="h-4 w-4" />} color="text-[#dc2626]" bgColor="bg-[#fef2f2]" />
        </div>

        {/* Status Breakdown */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Breakdown</p>
          <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Current Status Distribution</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {[
              { label: "Assigned", value: summary.assigned, color: "bg-[#2563eb]" },
              { label: "Picked Up", value: summary.pickedUp, color: "bg-[#d97706]" },
              { label: "In Transit", value: summary.inTransit, color: "bg-[#9333ea]" },
              { label: "Out for Delivery", value: summary.outForDelivery, color: "bg-[#0c831f]" },
              { label: "Delivered", value: summary.delivered, color: "bg-[#059669]" },
              { label: "Failed", value: summary.failed, color: "bg-[#dc2626]" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-3 text-center">
                <p className={`text-xl font-black ${item.color.replace("bg-", "text-")}`}>
                  {item.value}
                </p>
                <p className="text-[10px] font-bold text-[#666]">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
          <ReusableSearchBar value={search} onChange={(v) => setSearch(v)} placeholder="Search by Order ID, customer, or partner..." />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="picked_up">Picked Up</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out For Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>

            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
            >
              <option value="">All Zones</option>
              <option value="Mumbai Metro">Mumbai Metro</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Pune City">Pune City</option>
              <option value="Bangalore Central">Bangalore Central</option>
            </select>
          </div>
        </section>

        {/* Table */}
        <ReusableTable
          data={entries}
          keyExtractor={(e) => e.id}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          isLoading={loading}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          emptyMessage="No delivery entries found matching your filters"
          columns={[
            {
              key: "orderId",
              header: "Order",
              sortable: true,
              render: (e) => (
                <div>
                  <span className="font-black text-xs text-[#1a1a1a]">{e.orderId}</span>
                  <span className="block text-[10px] text-[#999]">{e.customer}</span>
                </div>
              ),
            },
            {
              key: "partner",
              header: "Partner",
              render: (e) => (
                <div>
                  <span className="font-bold text-[#1a1a1a]">{e.partner || "Unassigned"}</span>
                  {e.zone && <span className="block text-[10px] text-[#999]">{e.zone}</span>}
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              width: "120px",
              render: (e) => <StatusBadge status={e.status} />,
            },
            {
              key: "slaStatus",
              header: "SLA",
              width: "100px",
              render: (e) => (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  e.slaStatus === "on_time" ? "bg-[#e8f5e9] text-[#0c831f]" :
                  e.slaStatus === "delayed" ? "bg-[#fffbeb] text-[#d97706]" :
                  e.slaStatus === "critical" ? "bg-[#fef2f2] text-[#dc2626]" :
                  "bg-[#f6f7f6] text-[#666]"
                }`}>
                  {e.slaStatus?.replace("_", " ")}
                </span>
              ),
            },
            {
              key: "assignedAt",
              header: "Assigned",
              width: "100px",
              render: (e) => (
                <span className="text-xs text-[#666]">
                  {e.assignedAt ? new Date(e.assignedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "₹"}
                </span>
              ),
            },
          ]}
          actions={[
            {
              label: "View Details",
              icon: <Eye className="h-3.5 w-3.5" />,
              onClick: (e) => setShowViewModal(e),
            },
            {
              label: "Update Status",
              icon: <ArrowLeftRight className="h-3.5 w-3.5" />,
              onClick: (e) => {
                setEditStatus(e);
                setEditForm({ ...e });
              },
            },
          ]}
        />
      </div>

      {/* View Details Modal */}
      <ReusableModal
        open={!!showViewModal}
        onClose={() => setShowViewModal(null)}
        title="Delivery Details"
        subtitle={`Order: ${showViewModal?.orderId}`}
        size="md"
      >
        {showViewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f9fafb] p-4">
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Order ID</span>
                <span className="text-sm font-black text-[#1a1a1a]">{showViewModal.orderId}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Customer</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{showViewModal.customer}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Partner</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{showViewModal.partner || "Unassigned"}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Zone</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{showViewModal.zone || "₹"}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="mb-1 block text-[10px] font-bold text-[#666] uppercase">Status</span>
                <StatusBadge status={showViewModal.status} />
              </div>
              <div>
                <span className="mb-1 block text-[10px] font-bold text-[#666] uppercase">SLA Status</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  showViewModal.slaStatus === "on_time" ? "bg-[#e8f5e9] text-[#0c831f]" :
                  showViewModal.slaStatus === "delayed" ? "bg-[#fffbeb] text-[#d97706]" :
                  showViewModal.slaStatus === "critical" ? "bg-[#fef2f2] text-[#dc2626]" :
                  "bg-[#f6f7f6] text-[#666]"
                }`}>
                  {showViewModal.slaStatus?.replace("_", " ") || "₹"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Assigned At</span>
                <span className="text-xs text-[#1a1a1a]">
                  {showViewModal.assignedAt ? new Date(showViewModal.assignedAt).toLocaleString("en-IN") : "₹"}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Delay</span>
                <span className="text-xs font-bold text-[#1a1a1a]">
                  {showViewModal.delayMinutes > 0 ? `${showViewModal.delayMinutes} min` : "No delay"}
                </span>
              </div>
            </div>

            {showViewModal.note && (
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Notes</span>
                <p className="mt-1 rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 font-medium">
                  {showViewModal.note}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowViewModal(null)}
                className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Update Delivery Status Modal */}
      <ReusableModal
        open={!!editStatus}
        onClose={() => setEditStatus(null)}
        title="Update Delivery Status"
        subtitle={`Order: ${editStatus?.orderId}`}
        size="md"
      >
        {editStatus && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
              <select
                value={editForm.status || ""}
                onChange={(e) => setEditForm((f: any) => ({ ...f, status: e.target.value as any }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              >
                <option value="assigned">Assigned</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Note / Reason</label>
              <textarea
                value={editForm.note || ""}
                onChange={(e) => setEditForm((f: any) => ({ ...f, note: e.target.value }))}
                placeholder="Add status details or delay reasons here..."
                rows={3}
                className="w-full rounded-xl border border-[#e8e8e8] bg-white p-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f] resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditStatus(null)}
                className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="rounded-xl bg-[#0c831f] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a6a18]"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </ReusableModal>
    </DashboardLayout>
  );
}

