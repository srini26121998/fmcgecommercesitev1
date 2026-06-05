"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { useFlashSales } from "@/hooks/use-promotions";
import type { FlashSale } from "@/types/promotions";
import { Zap, Plus, Edit3, Clock, Eye, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function FlashSalesPage() {
  const { flashSales, summary, pagination, loading, error, fetchFlashSales, createFlashSale, updateFlashSale, deleteFlashSale, setPage, setPageSize } = useFlashSales();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<FlashSale | null>(null);
  const [editFlashSale, setEditFlashSale] = useState<FlashSale | null>(null);

  // Forms state
  const [createForm, setCreateForm] = useState<Partial<FlashSale>>({
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 0,
    productCount: 0,
    startDate: new Date().toISOString().replace("T", " ").slice(0, 16),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().replace("T", " ").slice(0, 16),
    budget: "₹0",
    status: "scheduled",
  });

  const [editForm, setEditForm] = useState<Partial<FlashSale>>({});

  const filtered = flashSales.filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreate = async () => {
    if (!createForm.name) {
      toast.error("Flash sale name is required");
      return;
    }
    const discountLabel = createForm.discountType === "percentage" ? `${createForm.discountValue}% Off` : `₹${createForm.discountValue} Off`;
    const payload = { ...createForm, discount: discountLabel };
    if (payload.startDate) {
      payload.startDate = payload.startDate.replace(" ", "T");
      if (payload.startDate.length === 16) payload.startDate += ":00";
    }
    if (payload.endDate) {
      payload.endDate = payload.endDate.replace(" ", "T");
      if (payload.endDate.length === 16) payload.endDate += ":00";
    }

    const res = await createFlashSale(payload);
    if (res) {
      toast.success(`Flash sale "${res.name}" created!`);
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        description: "",
        discountType: "percentage",
        discountValue: 0,
        productCount: 0,
        startDate: new Date().toISOString().replace("T", " ").slice(0, 16),
        endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().replace("T", " ").slice(0, 16),
        budget: "₹0",
        status: "scheduled",
      });
    } else {
      toast.error("Failed to create flash sale");
    }
  };

  const handleEditSave = async () => {
    if (!editFlashSale || !editForm.name) return;
    const discountLabel = editForm.discountType === "percentage" ? `${editForm.discountValue}% Off` : `₹${editForm.discountValue} Off`;
    const payload = { ...editForm, discount: discountLabel };
    if (payload.startDate) {
      payload.startDate = payload.startDate.replace(" ", "T");
      if (payload.startDate.length === 16) payload.startDate += ":00";
    }
    if (payload.endDate) {
      payload.endDate = payload.endDate.replace(" ", "T");
      if (payload.endDate.length === 16) payload.endDate += ":00";
    }

    const res = await updateFlashSale(editFlashSale.id, payload);
    if (res) {
      toast.success(`Flash sale "${editForm.name}" updated successfully`);
      setEditFlashSale(null);
      setEditForm({});
    } else {
      toast.error("Failed to update flash sale");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const success = await deleteFlashSale(id);
    if (success) {
      toast.success(`Deleted flash sale "${name}"`);
    } else {
      toast.error("Failed to delete flash sale");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Promotions</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Flash Sales</h1>
              <p className="mt-1.5 text-xs text-[#666]">Time-bound flash sales with countdown timers and limited inventory.</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
              <Plus className="h-4 w-4" /> Create Flash Sale
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Live Now" value={summary.live} icon={<Zap className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Scheduled" value={summary.scheduled} icon={<Clock className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Completed" value={summary.completed} icon={<Clock className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Total Budget" value={summary.totalBudget} icon={<Zap className="h-4 w-4" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        <ReusableSearchBar value={search} onChange={setSearch} placeholder="Search flash sales..." />

        {error && (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-3 text-sm font-bold text-[#dc2626] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => fetchFlashSales()} className="text-xs underline">Retry</button>
          </div>
        )}

        <ReusableTable
          data={filtered}
          keyExtractor={(f) => f.id}
          isLoading={loading}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          columns={[
            { key: "name", header: "Sale Name", sortable: true, render: (f) => (
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-[#d97706]" /><span className="font-bold text-[#1a1a1a]">{f.name}</span></div>
            )},
            { key: "discount", header: "Discount", width: "100px" },
            { key: "productCount", header: "Products", width: "80px", align: "center" },
            { key: "startDate", header: "Start", width: "160px", hideOnMobile: true, render: (f) => <span className="text-xs">{f.startDate}</span> },
            { key: "endDate", header: "End", width: "160px", hideOnMobile: true, render: (f) => <span className="text-xs">{f.endDate}</span> },
            { key: "status", header: "Status", width: "110px", render: (f) => <StatusBadge status={f.status} /> },
          ]}
          actions={[
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (f) => setShowViewModal(f) },
            { label: "Edit", icon: <Edit3 className="h-3.5 w-3.5" />, onClick: (f) => { setEditFlashSale(f); setEditForm({ ...f }); } },
            { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: (f) => handleDelete(f.id, f.name), variant: "danger" },
          ]}
        />
      </div>

      {/* Create Flash Sale Modal */}
      <ReusableModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Flash Sale" subtitle="Set up a time-bound flash sale event" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Sale Name</label>
            <input type="text" value={createForm.name || ""} onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter sale name" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Description</label>
            <input type="text" value={createForm.description || ""} onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Enter description" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Type</label>
              <select value={createForm.discountType || ""} onChange={(e) => setCreateForm(f => ({ ...f, discountType: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Value</label>
              <input type="number" value={createForm.discountValue ?? ""} onChange={(e) => setCreateForm(f => ({ ...f, discountValue: Number(e.target.value) }))} placeholder="0" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Product Count</label>
              <input type="number" value={createForm.productCount ?? ""} onChange={(e) => setCreateForm(f => ({ ...f, productCount: Number(e.target.value) }))} placeholder="0" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Budget (₹)</label>
              <input type="text" value={createForm.budget || ""} onChange={(e) => setCreateForm(f => ({ ...f, budget: e.target.value }))} placeholder="e.g. ₹50K" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Start Date</label>
              <input type="datetime-local" value={createForm.startDate || ""} onChange={(e) => setCreateForm(f => ({ ...f, startDate: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">End Date</label>
              <input type="datetime-local" value={createForm.endDate || ""} onChange={(e) => setCreateForm(f => ({ ...f, endDate: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
            <select value={createForm.status || ""} onChange={(e) => setCreateForm(f => ({ ...f, status: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
              <option value="scheduled">Scheduled</option>
              <option value="live">Live Now</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
          <button onClick={() => setShowCreateModal(false)} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
          <button onClick={handleCreate} className="rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">Create Flash Sale</button>
        </div>
      </ReusableModal>

      {/* View Flash Sale Modal */}
      <ReusableModal open={!!showViewModal} onClose={() => setShowViewModal(null)} title="Flash Sale Details" subtitle={showViewModal?.id} size="md">
        {showViewModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">{showViewModal.name}</h3>
                <p className="text-xs text-[#666]">{showViewModal.description || "No description provided."}</p>
              </div>
              <StatusBadge status={showViewModal.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Discount</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.discount}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Products Count</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.productCount}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Budget</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.budget}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Spent</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.spent}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Start Date</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.startDate}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">End Date</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.endDate}</span>
              </div>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Edit Flash Sale Drawer */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          editFlashSale ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setEditFlashSale(null)}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          editFlashSale ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Edit Flash Sale
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">
              {editFlashSale?.name}
            </h2>
            <p className="text-[10px] text-[#999] mt-0.5">{editFlashSale?.id}</p>
          </div>
          <button
            onClick={() => setEditFlashSale(null)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            aria-label="Close edit panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Sale Name</label>
            <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Description</label>
            <input type="text" value={editForm.description || ""} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Type</label>
              <select value={editForm.discountType || ""} onChange={(e) => setEditForm(f => ({ ...f, discountType: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Value</label>
              <input type="number" value={editForm.discountValue ?? ""} onChange={(e) => setEditForm(f => ({ ...f, discountValue: Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Product Count</label>
              <input type="number" value={editForm.productCount ?? ""} onChange={(e) => setEditForm(f => ({ ...f, productCount: Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Budget</label>
              <input type="text" value={editForm.budget || ""} onChange={(e) => setEditForm(f => ({ ...f, budget: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Start Date</label>
              <input type="datetime-local" value={editForm.startDate || ""} onChange={(e) => setEditForm(f => ({ ...f, startDate: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">End Date</label>
              <input type="datetime-local" value={editForm.endDate || ""} onChange={(e) => setEditForm(f => ({ ...f, endDate: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
            <select value={editForm.status || ""} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
              <option value="scheduled">Scheduled</option>
              <option value="live">Live Now</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] bg-white px-6 py-4">
          <button onClick={() => setEditFlashSale(null)} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all">Cancel</button>
          <button onClick={handleEditSave} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </aside>
    </DashboardLayout>
  );
}

