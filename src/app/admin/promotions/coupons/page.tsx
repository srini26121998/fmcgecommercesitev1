"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { CouponGenerator } from "@/components/ui/promotions/admin";
import { useCoupons } from "@/hooks/use-promotions";
import type { Coupon } from "@/types/promotions";
import { Gift, Plus, Copy, Edit3, Zap, Eye, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function CouponsPage() {
  const { coupons, summary, pagination, loading, error, filters, updateFilters, generateCoupon, updateCoupon, deleteCoupon, setPage, setPageSize } = useCoupons();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<Coupon | null>(null);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [editForm, setEditForm] = useState<Partial<Coupon>>({});

  const handleEditSave = async () => {
    if (!editCoupon || !editForm.code) return;
    
    // Automatically compute discount label based on value
    const discountLabel = editForm.discountType === "percentage" ? `${editForm.discountValue}% Off`
      : editForm.discountType === "bogo" ? "Buy 1 Get 1" : `₹${editForm.discountValue} Off`;
    
    const payload = { ...editForm, discount: discountLabel };
    if (payload.startDate && !payload.startDate.includes("T")) payload.startDate += "T00:00:00";
    if (payload.endDate && !payload.endDate.includes("T")) payload.endDate += "T23:59:59";

    const res = await updateCoupon(editCoupon.id, payload);
    if (res) {
      toast.success(`Coupon "${editForm.code}" updated successfully`);
      setEditCoupon(null);
      setEditForm({});
    } else {
      toast.error("Failed to update coupon");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    const success = await deleteCoupon(id);
    if (success) {
      toast.success(`Deleted coupon "${code}"`);
    } else {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Promotions</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Coupons</h1>
              <p className="mt-1.5 text-xs text-[#666]">Create and manage discount coupons, promo codes, and special offers.</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
              <Plus className="h-4 w-4" /> Generate Coupon
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Active Coupons" value={summary.active} icon={<Gift className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Scheduled" value={summary.scheduled} icon={<Zap className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Total Uses" value={summary.totalUsed.toLocaleString()} icon={<Copy className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Expired" value={summary.expired} icon={<Gift className="h-4 w-4" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        <ReusableSearchBar value={filters.search || ""} onChange={(v) => updateFilters({ search: v })} placeholder="Search by coupon code or ID..." />

        {error && (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-3 text-sm font-bold text-[#dc2626]">
            {error}
          </div>
        )}

        <ReusableTable
          data={coupons}
          keyExtractor={(c) => c.id}
          isLoading={loading}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          columns={[
            { key: "code", header: "Code", sortable: true, render: (c) => (
              <div className="flex items-center gap-2"><span className="rounded-lg bg-[#e8f5e9] px-2.5 py-1 font-mono text-sm font-bold text-[#0c831f]">{c.code}</span></div>
            )},
            { key: "discount", header: "Discount", width: "120px", render: (c) => <span className="font-bold">{c.discount}</span> },
            { key: "minOrder", header: "Min Order", width: "100px", align: "right", render: (c) => c.minOrder ? `₹${c.minOrder}` : "—" },
            { key: "totalUsed", header: "Uses", width: "140px", align: "right", render: (c) => <span>{c.totalUsed.toLocaleString()} / {c.totalIssued === -1 ? '∞' : c.totalIssued.toLocaleString()}</span> },
            { key: "status", header: "Status", width: "100px", render: (c) => <StatusBadge status={c.status} /> },
            { key: "endDate", header: "Expires", width: "110px", hideOnMobile: true },
          ]}
          actions={[
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (c) => setShowViewModal(c) },
            { label: "Edit", icon: <Edit3 className="h-3.5 w-3.5" />, onClick: (c) => { setEditCoupon(c); setEditForm({ ...c }); } },
            { label: "Copy Code", icon: <Copy className="h-3.5 w-3.5" />, onClick: (c) => { navigator.clipboard.writeText(c.code); toast.success(`Copied ${c.code}!`); } },
            { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: (c) => handleDelete(c.id, c.code), variant: "danger" },
          ]}
        />
      </div>

      {/* Generate Coupon Modal */}
      <ReusableModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Generate Coupon" subtitle="Create a new discount coupon code" size="md">
        <CouponGenerator
          onGenerate={async (data) => {
            const result = await generateCoupon(data);
            if (result) {
              toast.success(`Coupon ${result.code} generated!`);
              setShowCreateModal(false);
            } else {
              toast.error("Failed to generate coupon");
            }
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </ReusableModal>

      {/* View Coupon Modal */}
      <ReusableModal open={!!showViewModal} onClose={() => setShowViewModal(null)} title="Coupon Details" subtitle={showViewModal?.id} size="md">
        {showViewModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
              <div>
                <span className="rounded-lg bg-[#e8f5e9] px-2.5 py-1 font-mono text-sm font-bold text-[#0c831f]">{showViewModal.code}</span>
                <p className="text-xs text-[#666] mt-2">Created by: {showViewModal.createdBy}</p>
              </div>
              <StatusBadge status={showViewModal.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Coupon Type</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.type.toUpperCase()}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Discount</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.discount}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Min Order</span>
                <span className="font-semibold text-[#1a1a1a]">₹{showViewModal.minOrder || 0}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Max Discount</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.maxDiscount ? `₹${showViewModal.maxDiscount}` : "Unlimited"}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Usage</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.totalUsed.toLocaleString()} / {showViewModal.totalIssued === -1 ? 'Unlimited' : showViewModal.totalIssued.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Per User Limit</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.perUserLimit} time(s)</span>
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

      {/* Edit Coupon Drawer */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          editCoupon ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setEditCoupon(null)}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          editCoupon ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Edit Coupon
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] font-mono">
              {editCoupon?.code}
            </h2>
            <p className="text-[10px] text-[#999] mt-0.5">{editCoupon?.id}</p>
          </div>
          <button
            onClick={() => setEditCoupon(null)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            aria-label="Close edit panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Coupon Code</label>
            <input type="text" value={editForm.code || ""} onChange={(e) => setEditForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 font-mono text-sm uppercase text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Coupon Type</label>
              <select value={editForm.type || ""} onChange={(e) => setEditForm(f => ({ ...f, type: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="public">Public</option>
                <option value="new_user">New User</option>
                <option value="vip">VIP</option>
                <option value="loyalty">Loyalty</option>
                <option value="referral">Referral</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Type</label>
              <select value={editForm.discountType || ""} onChange={(e) => setEditForm(f => ({ ...f, discountType: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
                <option value="bogo">BOGO</option>
                <option value="free_delivery">Free Delivery</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount Value</label>
            <input type="number" value={editForm.discountValue ?? ""} onChange={(e) => setEditForm(f => ({ ...f, discountValue: Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Min Order (₹)</label>
              <input type="number" value={editForm.minOrder ?? ""} onChange={(e) => setEditForm(f => ({ ...f, minOrder: Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Max Discount (₹)</label>
              <input type="number" value={editForm.maxDiscount ?? ""} onChange={(e) => setEditForm(f => ({ ...f, maxDiscount: Number(e.target.value) }))} placeholder="Unlimited" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Total Issued</label>
              <input type="number" value={editForm.totalIssued ?? ""} onChange={(e) => setEditForm(f => ({ ...f, totalIssued: Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Per User Limit</label>
              <input type="number" value={editForm.perUserLimit ?? ""} onChange={(e) => setEditForm(f => ({ ...f, perUserLimit: Number(e.target.value) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] bg-white px-6 py-4">
          <button onClick={() => setEditCoupon(null)} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all">Cancel</button>
          <button onClick={handleEditSave} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </aside>
    </DashboardLayout>
  );
}

