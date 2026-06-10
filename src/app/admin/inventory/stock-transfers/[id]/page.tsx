"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../../dashboard-layout";
import { ArrowLeft, Edit3, Save, X, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inventoryService } from "@/services/inventory.service";
import type { StockTransfer } from "@/types/inventory";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";

export default function StockTransferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [transfer, setTransfer] = useState<StockTransfer | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ status: StockTransfer["status"] }>({ status: "pending" });
  const [saving, setSaving] = useState(false);

  const fetchTransfer = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getTransfer(id);
      setTransfer(res.data);
    } catch (err) {
      toast.error("Failed to fetch transfer details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTransfer();
    }
  }, [id, fetchTransfer]);

  const handleEditSave = async () => {
    if (!transfer) return;
    setSaving(true);
    try {
      await inventoryService.updateTransferStatus(transfer.id, editForm.status);
      toast.success(`Transfer status updated successfully`);
      setIsEditing(false);
      fetchTransfer();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update transfer.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#0c831f]" />
            <p className="text-sm text-[#999]">Loading transfer…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!transfer) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Truck className="h-16 w-16 text-[#ccc]" />
          <p className="text-base font-bold text-[#1a1a1a]">Transfer not found</p>
          <button onClick={() => router.push("/admin/inventory/stock-transfers")} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all">
            <ArrowLeft className="h-4 w-4" /> Back to Transfers
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-5 p-2 sm:p-4">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e8e8e8] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/inventory/stock-transfers")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Transfer Details</p>
              <h1 className="text-lg font-black text-[#1a1a1a] leading-tight">{transfer.product}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsEditing(true); setEditForm({ status: transfer.status }); }}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all"
            >
              <Edit3 className="h-4 w-4" /> Edit Transfer
            </button>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f9fafb] p-4">
            <div>
              <p className="text-[10px] text-[#999] font-bold uppercase">Product</p>
              <p className="text-sm font-bold text-[#1a1a1a]">{transfer.product}</p>
              <p className="text-[10px] text-[#999]">{transfer.sku}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#999] font-bold uppercase">Transfer Status</p>
              <div className="mt-1">
                <StatusBadge status={transfer.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-[#e8e8e8] p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#0c831f]/30">
              <p className="text-[10px] text-[#666] font-bold uppercase tracking-wider">From Warehouse</p>
              <p className="mt-1.5 text-sm font-bold text-[#1a1a1a]">{transfer.fromWarehouse}</p>
            </div>
            <div className="rounded-xl border border-[#e8e8e8] p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#0c831f]/30">
              <p className="text-[10px] text-[#666] font-bold uppercase tracking-wider">To Warehouse</p>
              <p className="mt-1.5 text-sm font-bold text-[#0c831f]">{transfer.toWarehouse}</p>
            </div>
            <div className="rounded-xl border border-[#e8e8e8] p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#0c831f]/30">
              <p className="text-[10px] text-[#666] font-bold uppercase tracking-wider">Quantity</p>
              <p className="mt-1.5 text-2xl font-black text-[#1a1a1a]">{transfer.quantity}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <p className="text-[10px] text-[#666] font-bold uppercase tracking-wider">Initiated Date</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{transfer.date}</p>
            </div>
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <p className="text-[10px] text-[#666] font-bold uppercase tracking-wider">Estimated Arrival (ETA)</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{transfer.eta || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isEditing ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsEditing(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[400px] max-w-[100vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isEditing ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Edit Transfer</p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">{transfer.product}</h2>
            <p className="text-[10px] text-[#999] mt-0.5">ID: {transfer.id}</p>
          </div>
          <button onClick={() => setIsEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] border-b border-[#e8e8e8] pb-2">Update Status</h3>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ status: e.target.value as StockTransfer["status"] })}
                  className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] bg-white px-6 py-4">
          <button onClick={() => setIsEditing(false)} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all">Cancel</button>
          <button onClick={handleEditSave} disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </aside>
    </DashboardLayout>
  );
}
