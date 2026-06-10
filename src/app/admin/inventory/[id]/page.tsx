"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../dashboard-layout";
import { ArrowLeft, Edit3, Save, X, Package, ArrowRightLeft, History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminToast } from "@/lib/admin-toast";
import { inventoryService } from "@/services/inventory.service";
import type { InventoryItem, StockMovement } from "@/types/inventory";
import type { StockAdjustPayload } from "@/services/inventory.service";
import { validateForm, inventorySchemas } from "@/validation/admin";
import ReusableModal from "@/components/ui/admin/reusable-modal";

export default function InventoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({});
  const [saving, setSaving] = useState(false);

  const [showMovementsModal, setShowMovementsModal] = useState(false);
  const [movementsList, setMovementsList] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const fetchItem = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getInventoryItem(id);
      setItem(res.data);
    } catch (err) {
      adminToast.apiError("Failed to fetch item details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const handleEditSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const payload: StockAdjustPayload = {
        productId: item.id,
        quantity: (editForm.stock as any) === "" ? 0 : (editForm.stock ?? item.stock),
        type: "ADJUSTMENT",
        reason: "Manual stock update via admin panel",
        warehouseId: editForm.warehouseId ?? item.warehouseId,
      };

      const stockChanged = editForm.stock !== undefined && editForm.stock !== item.stock;
      const safetyStockChanged = editForm.safetyStock !== undefined && editForm.safetyStock !== item.safetyStock;

      if (stockChanged) {
        const validation = validateForm(inventorySchemas.adjustStock, payload);
        if (!validation.success) {
          adminToast.validationError(validation.errors);
          setSaving(false);
          return;
        }
        await inventoryService.adjustStock(payload);
      }

      if (safetyStockChanged) {
        await inventoryService.updateSafetyStock(Number(item.id), Number(editForm.safetyStock));
      }

      adminToast.success(`Inventory updated successfully`);
      setIsEditing(false);
      fetchItem();
    } catch (err: any) {
      adminToast.apiError(err?.message || "Failed to update inventory.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenMovements = async () => {
    if (!item) return;
    setShowMovementsModal(true);
    setLoadingMovements(true);
    try {
      const res = await inventoryService.getProductMovements(item.id, { page: 1, pageSize: 20 });
      setMovementsList(res.data || []);
    } catch (err: any) {
      adminToast.apiError("Failed to fetch movement history");
    } finally {
      setLoadingMovements(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#0c831f]" />
            <p className="text-sm text-[#999]">Loading item…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Package className="h-16 w-16 text-[#ccc]" />
          <p className="text-base font-bold text-[#1a1a1a]">Item not found</p>
          <button onClick={() => router.push("/admin/inventory")} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all">
            <ArrowLeft className="h-4 w-4" /> Back to Inventory
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
              onClick={() => router.push("/admin/inventory")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Inventory Item Details</p>
              <h1 className="text-lg font-black text-[#1a1a1a] leading-tight">{item.productName}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenMovements}
              className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-sm font-bold text-purple-600 hover:bg-purple-50 hover:border-purple-200 transition-all"
            >
              <History className="h-4 w-4" /> History
            </button>
            <button
              onClick={() => { setIsEditing(true); setEditForm({ ...item }); }}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all"
            >
              <Edit3 className="h-4 w-4" /> Edit Stock
            </button>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          {/* Status badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${item.status === "in_stock" ? "bg-[#dcfce7] text-[#166534]"
                  : item.status === "low_stock" ? "bg-[#fef9c3] text-[#854d0e]"
                    : item.status === "out_of_stock" ? "bg-[#fee2e2] text-[#991b1b]"
                      : "bg-[#f0fdf4] text-[#166534]"}
              `}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {item.status.replace(/_/g, " ")}
            </span>
            {item.barcode && (
              <span className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[11px] font-mono text-[#555]">
                Barcode: {item.barcode}
              </span>
            )}
          </div>

          {/* Product Information */}
          <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
            <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e8e8e8]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0c831f]">Product Information</p>
            </div>
            <div className="divide-y divide-[#f0f0f0]">
              <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                <div className="px-4 py-3">
                  <p className="text-[10px] text-[#999] font-semibold uppercase">Product Name</p>
                  <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{item.productName}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-[10px] text-[#999] font-semibold uppercase">SKU</p>
                  <p className="mt-0.5 text-sm font-mono font-bold text-[#1a1a1a]">{item.sku}</p>
                </div>
              </div>
              {((item as any).brand || (item as any).weight) && (
                <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                  {(item as any).brand && (
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-[#999] font-semibold uppercase">Brand</p>
                      <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{(item as any).brand}</p>
                    </div>
                  )}
                  {(item as any).weight && (
                    <div className="px-4 py-3">
                      <p className="text-[10px] text-[#999] font-semibold uppercase">Weight / Unit</p>
                      <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">
                        {(item as any).weight}{(item as any).unit ? ` · ${(item as any).unit}` : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {(item as any).description && (
                <div className="px-4 py-3">
                  <p className="text-[10px] text-[#999] font-semibold uppercase">Description</p>
                  <p className="mt-0.5 text-xs text-[#555]">{(item as any).description}</p>
                </div>
              )}
              {(item as any).productStatus && (
                <div className="px-4 py-3">
                  <p className="text-[10px] text-[#999] font-semibold uppercase">Product Status</p>
                  <p className="mt-0.5 text-sm font-bold text-[#0c831f]">{(item as any).productStatus}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          {((item as any).price != null || (item as any).mrp != null) && (
            <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e8e8e8]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0c831f]">Pricing</p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[#f0f0f0]">
                {(item as any).price != null && (
                  <div className="px-4 py-3 text-center">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Sale Price</p>
                    <p className="mt-1 text-lg font-black text-[#0c831f]">₹{(item as any).price}</p>
                  </div>
                )}
                {(item as any).mrp != null && (
                  <div className="px-4 py-3 text-center">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">MRP</p>
                    <p className="mt-1 text-lg font-black text-[#999] line-through">₹{(item as any).mrp}</p>
                  </div>
                )}
                {(item as any).costPrice != null && (
                  <div className="px-4 py-3 text-center">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Cost Price</p>
                    <p className="mt-1 text-lg font-black text-[#555]">₹{(item as any).costPrice}</p>
                  </div>
                )}
              </div>
              {(item as any).taxRate != null && (
                <div className="border-t border-[#f0f0f0] px-4 py-2">
                  <p className="text-[10px] text-[#999]">Tax Rate: <span className="font-bold text-[#1a1a1a]">{(item as any).taxRate}%</span></p>
                </div>
              )}
            </div>
          )}

          {/* Stock Details */}
          <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
            <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e8e8e8]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0c831f]">Stock Details</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-[#f0f0f0] border-b border-[#f0f0f0]">
              <div className="px-4 py-3 text-center">
                <p className="text-[10px] text-[#999] font-semibold uppercase">Total Stock</p>
                <p className="mt-1 text-xl font-black text-[#1a1a1a]">{item.stock}</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-[10px] text-[#999] font-semibold uppercase">Reserved</p>
                <p className="mt-1 text-xl font-black text-[#f59e0b]">{item.reserved}</p>
              </div>
              <div className="px-4 py-3 text-center">
                <p className="text-[10px] text-[#999] font-semibold uppercase">Available</p>
                <p className={`mt-1 text-xl font-black ${item.available <= item.lowStockThreshold ? "text-[#dc2626]" : "text-[#0c831f]"}`}>
                  {item.available}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#f0f0f0] border-b border-[#f0f0f0]">
              <div className="px-4 py-3">
                <p className="text-[10px] text-[#999] font-semibold uppercase">Safety Stock</p>
                <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{item.safetyStock} units</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-[#999] font-semibold uppercase">Reorder Point</p>
                <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{item.lowStockThreshold} units</p>
              </div>
            </div>
            <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
              <div className="px-4 py-3">
                <p className="text-[10px] text-[#999] font-semibold uppercase">Batch Number</p>
                <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{item.batch || "—"}</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-[10px] text-[#999] font-semibold uppercase">Expiry Date</p>
                <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{item.expiryDate || "—"}</p>
              </div>
            </div>
          </div>

          {/* Warehouse Info */}
          <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
            <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e8e8e8]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#0c831f]">Warehouse</p>
            </div>
            <div className="divide-y divide-[#f0f0f0]">
              <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                <div className="px-4 py-3">
                  <p className="text-[10px] text-[#999] font-semibold uppercase">Name</p>
                  <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{item.warehouse}</p>
                </div>
                {(item as any).warehouseType && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Type</p>
                    <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{(item as any).warehouseType}</p>
                  </div>
                )}
              </div>
              {(item as any).warehouseAddress && (
                <div className="px-4 py-3">
                  <p className="text-[10px] text-[#999] font-semibold uppercase">Address</p>
                  <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">{(item as any).warehouseAddress}</p>
                </div>
              )}
              {(item as any).warehouseIsActive != null && (
                <div className="px-4 py-3">
                  <p className="text-[10px] text-[#999] font-semibold uppercase">Active Status</p>
                  <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${(item as any).warehouseIsActive ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#888]"
                    }`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {(item as any).warehouseIsActive ? "Active" : "Inactive"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          {((item as any).productCreatedAt || (item as any).productUpdatedAt) && (
            <div className="rounded-2xl border border-[#e8e8e8] overflow-hidden">
              <div className="bg-[#f9fafb] px-4 py-2.5 border-b border-[#e8e8e8]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0c831f]">Timestamps</p>
              </div>
              <div className="grid grid-cols-2 divide-x divide-[#f0f0f0]">
                {(item as any).productCreatedAt && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Created At</p>
                    <p className="mt-0.5 text-xs font-bold text-[#1a1a1a]">
                      {new Date((item as any).productCreatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                )}
                {(item as any).productUpdatedAt && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-[#999] font-semibold uppercase">Last Updated</p>
                    <p className="mt-0.5 text-xs font-bold text-[#1a1a1a]">
                      {new Date((item as any).productUpdatedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Updated */}
          <p className="text-center text-[10px] text-[#bbb]">
            Last updated: {new Date(item.lastUpdated).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </div>

      {/* Edit Drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isEditing ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsEditing(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isEditing ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Edit Inventory</p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">{item.productName}</h2>
            <p className="text-[10px] text-[#999] mt-0.5">SKU: {item.sku} · {item.warehouse}</p>
          </div>
          <button onClick={() => setIsEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Product Name</label><input type="text" value={editForm.productName ?? ""} disabled className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#888] cursor-not-allowed outline-none transition-colors" /></div>
          <div><label className="mb-1.5 block text-xs font-bold text-[#666]">SKU</label><input type="text" value={editForm.sku ?? ""} disabled className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#888] cursor-not-allowed outline-none transition-colors" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Total Stock</label><input type="number" value={editForm.stock ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value === "" ? ("" as any) : Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" /></div>
            <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Reserved Stock</label><input type="number" value={editForm.reserved ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, reserved: e.target.value === "" ? ("" as any) : Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Low Stock Threshold</label><input type="number" value={editForm.lowStockThreshold ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, lowStockThreshold: e.target.value === "" ? ("" as any) : Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" /></div>
            <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Safety Stock</label><input type="number" value={editForm.safetyStock ?? ""} onChange={(e) => setEditForm((f) => ({ ...f, safetyStock: e.target.value === "" ? ("" as any) : Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" /></div>
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

      {/* Movements Modal */}
      <ReusableModal open={showMovementsModal} onClose={() => setShowMovementsModal(false)} title="Stock Movements" subtitle={`History for ${item.productName}`} size="lg">
        <div className="space-y-4">
          {loadingMovements ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#0c831f]" />
            </div>
          ) : movementsList.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8e8e8] bg-[#f9fafb]">
              <History className="h-8 w-8 text-[#999] mb-2" />
              <p className="text-sm font-semibold text-[#666]">No stock movements found.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-[#e8e8e8]" />
              {movementsList.map((movement) => (
                <div key={movement.id} className="relative flex gap-4">
                  <div className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-sm ${
                    movement.type === "IN" ? "bg-[#dcfce7] text-[#166534]" : 
                    movement.type === "OUT" ? "bg-[#fee2e2] text-[#991b1b]" : 
                    "bg-[#eff6ff] text-[#2563eb]"
                  }`}>
                    {movement.type === "IN" ? <ArrowRightLeft className="h-4 w-4 rotate-90" /> : 
                     movement.type === "OUT" ? <ArrowRightLeft className="h-4 w-4 -rotate-90" /> : 
                     <Edit3 className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 rounded-xl border border-[#e8e8e8] bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            movement.type === "IN" ? "bg-[#f0fdf4] text-[#166534]" : 
                            movement.type === "OUT" ? "bg-[#fef2f2] text-[#991b1b]" : 
                            "bg-[#eff6ff] text-[#2563eb]"
                          }`}>{movement.type}</span>
                          <span className="font-bold text-lg text-[#1a1a1a]">{movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}</span>
                        </div>
                        <p className="text-sm font-medium text-[#1a1a1a] mt-1">{movement.reason || "Manual stock update"}</p>
                      </div>
                      <span className="text-[10px] font-medium text-[#999] bg-[#f9fafb] px-2 py-1 rounded">
                        {new Date(movement.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#f0f0f0] text-xs">
                      <div>
                        <span className="text-[#999] font-medium block">Performed By</span>
                        <span className="text-[#1a1a1a] font-semibold">{movement.performedBy || "System Admin"}</span>
                      </div>
                      <div>
                        <span className="text-[#999] font-medium block">Warehouse</span>
                        <span className="text-[#1a1a1a] font-semibold">{movement.warehouse || movement.warehouseId || "—"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ReusableModal>
    </DashboardLayout>
  );
}
