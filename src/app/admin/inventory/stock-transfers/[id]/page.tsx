"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../../dashboard-layout";
import { ArrowLeft, Edit3, Save, X, Truck, Loader2, CheckCircle } from "lucide-react";
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

  const [savingStatus, setSavingStatus] = useState<string | null>(null);

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

  const handleStatusChange = async (newStatus: StockTransfer["status"]) => {
    if (!transfer) return;
    setSavingStatus(newStatus);
    try {
      await inventoryService.updateTransferStatus(transfer.id, newStatus);
      toast.success(`Transfer marked as ${newStatus}`);
      fetchTransfer();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update transfer.");
    } finally {
      setSavingStatus(null);
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
            {(transfer.status === "pending" || transfer.status === "in_transit") && (
              <>
                <button
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={savingStatus !== null}
                  className="flex items-center gap-2 rounded-xl bg-white border border-[#e8e8e8] px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-all disabled:opacity-60"
                >
                  {savingStatus === "cancelled" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange("completed")}
                  disabled={savingStatus !== null}
                  className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all disabled:opacity-60"
                >
                  {savingStatus === "completed" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Accept Stock
                </button>
              </>
            )}
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

    </DashboardLayout>
  );
}
