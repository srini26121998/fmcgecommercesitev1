"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "../../../dashboard-layout";
import { ArrowLeft, Edit3, Save, X, Building2, Store, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { inventoryService } from "@/services/inventory.service";
import type { Warehouse } from "@/types/inventory";

export default function WarehouseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Warehouse>>({});
  const [saving, setSaving] = useState(false);

  const fetchWarehouse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getWarehouse(id);
      setWarehouse(res.data);
    } catch (err) {
      toast.error("Failed to fetch warehouse details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWarehouse();
  }, [fetchWarehouse]);

  const handleEditSave = async () => {
    if (!warehouse) return;
    setSaving(true);
    try {
      await inventoryService.updateWarehouse(warehouse.id, editForm);
      toast.success(`Warehouse updated successfully`);
      setIsEditing(false);
      fetchWarehouse();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update warehouse.");
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
            <p className="text-sm text-[#999]">Loading warehouse…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!warehouse) {
    return (
      <DashboardLayout>
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <Building2 className="h-16 w-16 text-[#ccc]" />
          <p className="text-base font-bold text-[#1a1a1a]">Warehouse not found</p>
          <button onClick={() => router.push("/admin/inventory/warehouses")} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all">
            <ArrowLeft className="h-4 w-4" /> Back to Warehouses
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
              onClick={() => router.push("/admin/inventory/warehouses")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Warehouse Details</p>
              <h1 className="text-lg font-black text-[#1a1a1a] leading-tight">{warehouse.name}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsEditing(true); setEditForm({ ...warehouse }); }}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all"
            >
              <Edit3 className="h-4 w-4" /> Edit Warehouse
            </button>
          </div>
        </div>

        <div className="space-y-5 rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          {/* Status badge */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${warehouse.isActive ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#888]"}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {warehouse.isActive ? "Active" : "Inactive"}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${warehouse.type === "STORE" ? "bg-[#fff3e0] text-[#e65100]" : "bg-[#e8f5e9] text-[#0c831f]"}`}>
              {warehouse.type === "STORE" ? <Store className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
              {warehouse.type}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-2xl bg-[#f8f9fa] border border-[#f0f0f0] p-5 transition-all duration-300 hover:shadow-md hover:border-[#0c831f]/20 hover:bg-white group cursor-default">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#999] transition-colors group-hover:text-[#0c831f]">Warehouse ID</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">#{warehouse.id}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#999] transition-colors group-hover:text-[#0c831f]">Location Name</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{warehouse.location || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#999] transition-colors group-hover:text-[#0c831f]">Created At</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">
                {warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Full Address</p>
            <div className="flex items-center gap-2 mt-1.5">
              <MapPin className="h-4 w-4 shrink-0 text-[#999] transition-colors group-hover:text-[#0c831f]" />
              <p className="text-sm font-bold text-[#1a1a1a]">{warehouse.address || warehouse.location || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">City</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{warehouse.city || "—"}</p>
            </div>
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">State</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{warehouse.state || "—"}</p>
            </div>
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Pincode</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{warehouse.pincode || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Capacity</p>
              <p className="mt-1.5 text-2xl font-black text-[#1a1a1a]">{warehouse.capacity > 0 ? warehouse.capacity.toLocaleString() : "N/A"}</p>
            </div>
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Used Capacity</p>
              <p className="mt-1.5 text-2xl font-black text-[#1a1a1a]">{warehouse.used > 0 ? warehouse.used.toLocaleString() : "0"}</p>
            </div>
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Utilization</p>
              <p className="mt-1.5 text-2xl font-black text-[#1a1a1a]">{warehouse.capacity > 0 ? `${warehouse.utilization.toFixed(1)}%` : "N/A"}</p>
            </div>
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Total Products</p>
              <p className="mt-1.5 text-2xl font-black text-[#1a1a1a]">{warehouse.products}</p>
            </div>
          </div>

          {(warehouse.manager || warehouse.contact) && (
            <div className="grid grid-cols-2 gap-4">
              {warehouse.manager && (
                <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Warehouse Manager</p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{warehouse.manager}</p>
                </div>
              )}
              {warehouse.contact && (
                <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Contact Number</p>
                  <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{warehouse.contact}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Staff Count</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{warehouse.staffCount || 0}</p>
            </div>
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#0c831f]/30 group cursor-default">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#666] transition-colors group-hover:text-[#0c831f]">Operating Hours</p>
              <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{warehouse.operatingHours || "—"}</p>
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
        className={`fixed right-0 top-0 z-[70] flex h-full w-[650px] max-w-[100vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isEditing ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Edit Warehouse</p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">{warehouse.name}</h2>
            <p className="text-[10px] text-[#999] mt-0.5">ID: {warehouse.id} · {warehouse.location}</p>
          </div>
          <button onClick={() => setIsEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {/* General Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] border-b border-[#e8e8e8] pb-2">General Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Warehouse Name</label>
                  <input
                    type="text"
                    value={editForm.name ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Type</label>
                  <select
                    value={editForm.type ?? "WAREHOUSE"}
                    onChange={(e) => setEditForm((f) => ({ ...f, type: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors bg-white"
                  >
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="STORE">Store</option>
                    <option value="hub">Hub</option>
                    <option value="cold_storage">Cold Storage</option>
                    <option value="depot">Depot</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
                  <select
                    value={editForm.status ?? "active"}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as any }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="full">Full</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer h-10 px-1 hover:bg-[#f6f7f6] rounded-xl transition-colors">
                    <input
                      type="checkbox"
                      checked={editForm.isActive ?? true}
                      onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.checked }))}
                      className="h-4 w-4 rounded border-[#e8e8e8] text-[#0c831f] focus:ring-[#0c831f] cursor-pointer"
                    />
                    <span className="text-sm font-bold text-[#1a1a1a]">Is Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] border-b border-[#e8e8e8] pb-2">Location Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Short Location / Title</label>
                  <input
                    type="text"
                    value={editForm.location ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Koramangala, Bangalore"
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Full Address</label>
                  <input
                    type="text"
                    value={editForm.address ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="123 Main St..."
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">City</label>
                  <input
                    type="text"
                    value={editForm.city ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">State</label>
                  <input
                    type="text"
                    value={editForm.state ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Pincode</label>
                  <input
                    type="text"
                    value={editForm.pincode ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, pincode: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Operations */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] border-b border-[#e8e8e8] pb-2">Capacity & Operations</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Total Capacity</label>
                  <input
                    type="number"
                    value={editForm.capacity ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, capacity: e.target.value === "" ? ("" as any) : Number(e.target.value) }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Used Capacity</label>
                  <input
                    type="number"
                    value={editForm.used ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, used: e.target.value === "" ? ("" as any) : Number(e.target.value) }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Staff Count</label>
                  <input
                    type="number"
                    value={editForm.staffCount ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, staffCount: e.target.value === "" ? ("" as any) : Number(e.target.value) }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Operating Hours</label>
                  <input
                    type="text"
                    value={editForm.operatingHours ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, operatingHours: e.target.value }))}
                    placeholder="e.g. 9 AM - 6 PM"
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Manager Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a] border-b border-[#e8e8e8] pb-2">Manager Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Manager Name</label>
                  <input
                    type="text"
                    value={editForm.manager ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, manager: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Contact Number</label>
                  <input
                    type="text"
                    value={editForm.contact ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, contact: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
                  />
                </div>
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
