"use client";

import { useState } from "react";
import DashboardLayout from "../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { usePromotions } from "@/hooks/use-promotions";
import { promotionService } from "@/services/promotions.service";
import type { Promotion } from "@/types/promotions";
import { Percent, Plus, Edit3, Copy, Trash2, Gift, Zap, Clock, Eye, X, Save } from "lucide-react";
import { toast } from "sonner";
import { AnimatedLoader } from "@/components/ui/animated-loader";

export default function PromotionsPage() {
  const { promotions, summary, pagination, loading, error, filters, updateFilters, fetchPromotions, updatePromotion, deletePromotion, setPage, setPageSize } = usePromotions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<Promotion | null>(null);
  const [editPromotion, setEditPromotion] = useState<Promotion | null>(null);
  
  // Forms state
  const [createForm, setCreateForm] = useState<Partial<Promotion>>({
    name: "",
    description: "",
    type: "discount",
    discountType: "percentage",
    discountValue: 0,
    minOrder: 0,
    usageLimit: 1000,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "active",
  });

  const [editForm, setEditForm] = useState<Partial<Promotion>>({});

  const handleCreate = async () => {
    if (!createForm.name) {
      toast.error("Promotion name is required");
      return;
    }
    
    const payload = { ...createForm };
    if (payload.startDate && !payload.startDate.includes("T")) payload.startDate += "T00:00:00";
    if (payload.endDate && !payload.endDate.includes("T")) payload.endDate += "T23:59:59";
    
    setIsSubmitting(true);
    const res = await promotionService.createPromotion(payload);
    setIsSubmitting(false);
    
    if (res) {
      toast.success(`Promotion "${res.name}" created!`);
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        description: "",
        type: "discount",
        discountType: "percentage",
        discountValue: 0,
        minOrder: 0,
        usageLimit: 1000,
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "active",
      });
      fetchPromotions();
    } else {
      toast.error("Failed to create promotion");
    }
  };

  const handleEditSave = async () => {
    if (!editPromotion || !editForm.name) return;
    
    const payload = { ...editForm };
    if (payload.startDate && !payload.startDate.includes("T")) payload.startDate += "T00:00:00";
    if (payload.endDate && !payload.endDate.includes("T")) payload.endDate += "T23:59:59";
    
    setIsSubmitting(true);
    const res = await updatePromotion(editPromotion.id, payload);
    setIsSubmitting(false);
    
    if (res) {
      toast.success(`Promotion "${editForm.name}" updated successfully`);
      setEditPromotion(null);
      setEditForm({});
    } else {
      toast.error("Failed to update promotion");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setIsSubmitting(true);
    const success = await deletePromotion(id);
    setIsSubmitting(false);
    
    if (success) {
      toast.success(`Deleted promotion "${name}"`);
    } else {
      toast.error("Failed to delete promotion");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Promotions</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Offers & Coupons</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                Manage coupons, flash sales, campaigns, and A/B testing for promotions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ReusableExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt.toUpperCase()}`)} />
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
                <Plus className="h-4 w-4" />
                Create Promotion
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Active Promotions" value={summary.active} icon={<Percent className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Scheduled" value={summary.scheduled} icon={<Clock className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Total Uses" value={summary.totalUsage.toLocaleString()} icon={<Zap className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Expired" value={summary.expired} icon={<Clock className="h-4 w-4" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <ReusableSearchBar value={filters.search || ""} onChange={(v) => updateFilters({ search: v })} placeholder="Search promotions..." />
            </div>
            <div className="flex items-center gap-2">
              <select value={filters.type || "all"} onChange={(e) => updateFilters({ type: e.target.value })} className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none">
                <option value="all">All Types</option>
                <option value="coupon">Coupon</option>
                <option value="discount">Discount</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
              <select value={filters.status || "all"} onChange={(e) => updateFilters({ status: e.target.value })} className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="expired">Expired</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-3 text-sm font-bold text-[#dc2626] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => fetchPromotions()} className="text-xs underline">Retry</button>
          </div>
        )}

        <ReusableTable
          data={promotions}
          keyExtractor={(p) => p.id}
          isLoading={loading}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          enableSelection
          columns={[
            { key: "name", header: "Promotion", sortable: true, render: (p) => (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#fff0f6]">
                  {p.type === "coupon" ? <Gift className="h-4 w-4 text-[#ff4f8b]" /> : p.type === "flash_sale" ? <Zap className="h-4 w-4 text-[#d97706]" /> : <Percent className="h-4 w-4 text-[#0c831f]" />}
                </div>
                <div><span className="font-bold text-[#1a1a1a]">{p.name}</span><span className="block text-[10px] text-[#999]">{p.id}</span></div>
              </div>
            )},
            { key: "type", header: "Type", width: "110px", render: (p) => <StatusBadge status={p.type} /> },
            { key: "discountValue", header: "Discount", width: "100px", render: (p) => (
              <span className="font-bold">{p.discountType === "percentage" || p.discountType === "bogo" ? `${p.discountValue}%` : `₹${p.discountValue}`}</span>
            )},
            { key: "status", header: "Status", width: "110px", render: (p) => <StatusBadge status={p.status} /> },
            { key: "usageCount", header: "Used", width: "120px", align: "right", render: (p) => (
              <span>{p.usageCount.toLocaleString()} / {p.usageLimit === 999999 ? '∞' : p.usageLimit.toLocaleString()}</span>
            )},
            { key: "startDate", header: "Start", width: "110px", hideOnMobile: true },
            { key: "endDate", header: "End", width: "110px", hideOnMobile: true },
          ]}
          onRowClick={(p) => setShowViewModal(p)}
        />
      </div>

      {/* Create Promotion Modal */}
      <ReusableModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Promotion" subtitle="Configure a new promotion, coupon, or flash sale" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Promotion Name</label>
            <input type="text" value={createForm.name || ""} onChange={(e) => setCreateForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter promotion name" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Description</label>
            <input type="text" value={createForm.description || ""} onChange={(e) => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Enter description" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Type</label>
              <select value={createForm.type || ""} onChange={(e) => setCreateForm(f => ({ ...f, type: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="discount">Discount</option>
                <option value="coupon">Coupon</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Type</label>
              <select value={createForm.discountType || ""} onChange={(e) => setCreateForm(f => ({ ...f, discountType: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="bogo">BOGO</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Value</label>
              <input type="number" value={createForm.discountValue ?? ""} onChange={(e) => setCreateForm(f => ({ ...f, discountValue: Number(e.target.value) }))} placeholder="0" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Min Order (₹)</label>
              <input type="number" value={createForm.minOrder ?? ""} onChange={(e) => setCreateForm(f => ({ ...f, minOrder: Number(e.target.value) }))} placeholder="0 (optional)" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Max Uses</label>
              <input type="number" value={createForm.usageLimit ?? ""} onChange={(e) => setCreateForm(f => ({ ...f, usageLimit: Number(e.target.value) }))} placeholder="1000" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Start Date</label>
              <input type="date" value={createForm.startDate || ""} onChange={(e) => setCreateForm(f => ({ ...f, startDate: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">End Date</label>
              <input type="date" value={createForm.endDate || ""} onChange={(e) => setCreateForm(f => ({ ...f, endDate: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
            <select value={createForm.status || ""} onChange={(e) => setCreateForm(f => ({ ...f, status: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
          <button onClick={() => setShowCreateModal(false)} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
          <button onClick={handleCreate} className="rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">Create Promotion</button>
        </div>
      </ReusableModal>

      {/* View Promotion Modal */}
      <ReusableModal open={!!showViewModal} onClose={() => setShowViewModal(null)} title="Promotion Details" subtitle={showViewModal?.id} size="md">
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
                <span className="block text-xs font-bold text-[#999] uppercase">Type</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Discount</span>
                <span className="font-semibold text-[#1a1a1a]">
                  {showViewModal.discountType === "percentage" ? `${showViewModal.discountValue}% Off` : `₹${showViewModal.discountValue} Off`}
                </span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Min Order</span>
                <span className="font-semibold text-[#1a1a1a]">₹{showViewModal.minOrder || 0}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Usage</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.usageCount.toLocaleString()} / {showViewModal.usageLimit.toLocaleString()}</span>
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
            
            <div className="mt-6 flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
              <button 
                onClick={() => {
                  setShowViewModal(null);
                  setEditPromotion(showViewModal);
                  setEditForm({ ...showViewModal });
                }} 
                className="flex items-center gap-1.5 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Edit3 className="h-4 w-4" /> Edit
              </button>
              <button 
                onClick={async () => {
                  setIsSubmitting(true);
                  const res = await promotionService.createPromotion({ ...showViewModal, id: undefined, name: `${showViewModal.name} (Copy)` });
                  setIsSubmitting(false);
                  if (res) { 
                    toast.success(`Duplicated "${showViewModal.name}"`); 
                    fetchPromotions(); 
                    setShowViewModal(null); 
                  }
                }} 
                className="flex items-center gap-1.5 rounded-xl bg-purple-50 px-4 py-2 text-sm font-bold text-purple-600 hover:bg-purple-100 transition-colors"
              >
                <Copy className="h-4 w-4" /> Duplicate
              </button>
              <button 
                onClick={() => {
                  handleDelete(showViewModal.id, showViewModal.name);
                  setShowViewModal(null);
                }} 
                className="flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Edit Promotion Drawer */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          editPromotion ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setEditPromotion(null)}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          editPromotion ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Edit Promotion
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">
              {editPromotion?.name}
            </h2>
            <p className="text-[10px] text-[#999] mt-0.5">{editPromotion?.id}</p>
          </div>
          <button
            onClick={() => setEditPromotion(null)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            aria-label="Close edit panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Promotion Name</label>
            <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Description</label>
            <input type="text" value={editForm.description || ""} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Type</label>
              <select value={editForm.type || ""} onChange={(e) => setEditForm(f => ({ ...f, type: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="discount">Discount</option>
                <option value="coupon">Coupon</option>
                <option value="flash_sale">Flash Sale</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Type</label>
              <select value={editForm.discountType || ""} onChange={(e) => setEditForm(f => ({ ...f, discountType: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="bogo">BOGO</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Value</label>
              <input type="number" value={editForm.discountValue ?? ""} onChange={(e) => setEditForm(f => ({ ...f, discountValue: Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Min Order (₹)</label>
              <input type="number" value={editForm.minOrder ?? ""} onChange={(e) => setEditForm(f => ({ ...f, minOrder: Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Max Uses</label>
              <input type="number" value={editForm.usageLimit ?? ""} onChange={(e) => setEditForm(f => ({ ...f, usageLimit: Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Start Date</label>
              <input type="date" value={editForm.startDate || ""} onChange={(e) => setEditForm(f => ({ ...f, startDate: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">End Date</label>
              <input type="date" value={editForm.endDate || ""} onChange={(e) => setEditForm(f => ({ ...f, endDate: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
            <select value={editForm.status || ""} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] bg-white px-6 py-4">
          <button onClick={() => setEditPromotion(null)} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all">Cancel</button>
          <button onClick={handleEditSave} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </aside>

      {isSubmitting && <AnimatedLoader fullScreen text="Processing..." />}
    </DashboardLayout>
  );
}

