"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { Building2, Store, Plus, MapPin, RefreshCw, X, Save } from "lucide-react";
import { toast } from "sonner";
import { useWarehouses } from "@/hooks/use-inventory";
import { WarehouseOverviewCards } from "@/components/ui/inventory";
import type { Warehouse } from "@/types/inventory";
import { inventoryService } from "@/services/inventory.service";
import { Loader2 } from "lucide-react";

export default function WarehousesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Warehouse>>({});
  const [saving, setSaving] = useState(false);
  
  const { warehouses, loading, refresh, createWarehouse } = useWarehouses();
  const router = useRouter();

  const isDrawerOpen = showAddModal;

  const openAddDrawer = () => {
    setEditForm({ type: "WAREHOUSE", status: "active", isActive: true });
    setShowAddModal(true);
  };

  const closeEditDrawer = () => {
    setEditForm({});
    setShowAddModal(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (showAddModal) {
        await createWarehouse(editForm);
        toast.success(`Warehouse "${editForm.name}" created successfully`);
      }
      closeEditDrawer();
      refresh();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save warehouse");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(
    () =>
      warehouses.filter(
        (w) =>
          !search ||
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          (w.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (w.address ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [warehouses, search],
  );

  const totalCapacity = warehouses.reduce((s, w) => s + w.capacity, 0);
  const totalUsed = warehouses.reduce((s, w) => s + w.used, 0);
  const totalProducts = warehouses.reduce((s, w) => s + w.products, 0);

  const pageData = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Inventory</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Warehouses</h1>
              <p className="mt-1.5 text-xs text-[#666]">Manage warehouse facilities, capacities, and utilization across locations.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => refresh()} className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button onClick={openAddDrawer} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
                <Plus className="h-4 w-4" /> Add Warehouse
              </button>
            </div>
          </div>
        </section>

        <WarehouseOverviewCards
          totalWarehouses={warehouses.length}
          totalCapacity={totalCapacity}
          totalUsed={totalUsed}
          totalProducts={totalProducts}
        />

        <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search warehouses by name or location..." />

        <ReusableTable
          data={pageData}
          isLoading={loading}
          keyExtractor={(w: Warehouse) => w.id}
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          onRowClick={(w: Warehouse) => router.push(`/admin/inventory/warehouses/${w.id}`)}
          columns={[
            { key: "name", header: "Warehouse", sortable: true, render: (w: Warehouse) => (
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f5e9]">
                  {w.type === "STORE" ? <Store className="h-4 w-4 text-[#0c831f]" /> : <Building2 className="h-4 w-4 text-[#0c831f]" />}
                </div>
                <div><span className="font-bold text-[#1a1a1a]">{w.name}</span><span className="block text-[10px] text-[#999]">#{w.id}</span></div>
              </div>
            )},
            { key: "type", header: "Type", width: "110px", render: (w: Warehouse) => (
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                w.type === "STORE" ? "bg-[#fff3e0] text-[#e65100]" : "bg-[#e8f5e9] text-[#0c831f]"
              }`}>
                {w.type === "STORE" ? <Store className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                {w.type}
              </span>
            )},
            { key: "location", header: "Address", width: "160px", hideOnMobile: true, render: (w: Warehouse) => (
              <div className="flex items-center gap-1 text-xs text-[#555]">
                <MapPin className="h-3 w-3 shrink-0 text-[#999]" />
                <span className="line-clamp-2">{w.address || w.location || "—"}</span>
              </div>
            )},
            { key: "status", header: "Status", width: "110px", render: (w: Warehouse) => <StatusBadge status={w.status} /> },
            { key: "capacity", header: "Capacity", width: "100px", align: "right", sortable: true, render: (w: Warehouse) => (
              <span className="font-bold">{w.capacity > 0 ? w.capacity.toLocaleString() : <span className="text-[#bbb] text-xs">N/A</span>}</span>
            )},
            { key: "utilization", header: "Utilization", width: "120px", render: (w: Warehouse) => {
              if (w.capacity === 0) return <span className="text-[#bbb] text-xs">N/A</span>;
              const barColor = w.utilization > 90 ? "bg-[#dc2626]" : w.utilization > 75 ? "bg-[#d97706]" : "bg-[#0c831f]";
              return (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-[#e8e8e8]">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${w.utilization}%` }} />
                  </div>
                  <span className="text-xs font-bold">{w.utilization.toFixed(0)}%</span>
                </div>
              );
            }},
            { key: "manager", header: "Manager", width: "130px", hideOnMobile: true, render: (w: Warehouse) => (
              <span>{w.manager ?? <span className="text-[#bbb] text-xs">—</span>}</span>
            )},
          ]}
        />
      </div>

      {/* Add Drawer */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeEditDrawer}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[650px] max-w-[100vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Add Warehouse
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">
              {editForm?.name || "New Warehouse"}
            </h2>
          </div>
          <button
            onClick={closeEditDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            aria-label="Close edit panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable fields */}
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

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] bg-white px-6 py-4">
          <button
            onClick={closeEditDrawer}
            className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </aside>
    </DashboardLayout>
  );
}

