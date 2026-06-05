"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { AlertTriangle, Shield, TrendingUp, Edit3, Eye, RefreshCw, X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSafetyStock } from "@/hooks/use-inventory";
import type { SafetyStockRule } from "@/types/inventory";
import ReusableModal from "@/components/ui/admin/reusable-modal";

export default function SafetyStockPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [saving, setSaving] = useState(false);

  const { rules, loading, refresh, updateSafetyStock } = useSafetyStock(statusFilter !== "all" ? statusFilter : undefined);

  const [viewRule, setViewRule] = useState<SafetyStockRule | null>(null);
  const [editRule, setEditRule] = useState<SafetyStockRule | null>(null);
  const [editForm, setEditForm] = useState<Partial<SafetyStockRule>>({});

  const openEditDrawer = (rule: SafetyStockRule) => {
    setEditRule(rule);
    setEditForm({ ...rule });
  };

  const closeEditDrawer = () => {
    setEditRule(null);
    setEditForm({});
  };

  const handleEditSave = async () => {
    if (!editRule || editForm.safetyLevel === undefined) return;
    setSaving(true);
    try {
      await updateSafetyStock(Number(editRule.id), Number(editForm.safetyLevel));
      toast.success(`Safety stock configuration for "${editForm.product}" updated successfully`);
      closeEditDrawer();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update safety stock. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(
    () =>
      rules.filter((i) => {
        const matchesSearch =
          !search ||
          i.product.toLowerCase().includes(search.toLowerCase()) ||
          i.sku.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
      }),
    [rules, search],
  );

  const kpis = useMemo(() => {
    return {
      safe: rules.filter((r) => r.status === "safe").length,
      warning: rules.filter((r) => r.status === "warning").length,
      critical: rules.filter((r) => r.status === "critical").length,
      avgLeadTime: rules.length > 0
        ? Math.round(rules.reduce((s, r) => s + r.leadTime, 0) / rules.length)
        : 0,
    };
  }, [rules]);

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
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Safety Stock</h1>
              <p className="mt-1.5 text-xs text-[#666]">Configure safety stock levels and reorder points to prevent stockouts.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => refresh()} className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none">
                <option value="all">All Items</option>
                <option value="safe">Safe</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Safe Items" value={kpis.safe} icon={<Shield className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Warning" value={kpis.warning} icon={<AlertTriangle className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Critical" value={kpis.critical} icon={<AlertTriangle className="h-4 w-4" />} color="text-[#dc2626]" bgColor="bg-[#fef2f2]" />
          <ReusableCard title="Avg Lead Time" value={`${kpis.avgLeadTime} days`} icon={<TrendingUp className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
        </div>

        <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." />

        <ReusableTable
          data={pageData}
          isLoading={loading}
          keyExtractor={(i: SafetyStockRule) => i.id}
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          columns={[
            { key: "product", header: "Product", sortable: true, render: (i: SafetyStockRule) => (
              <div><span className="font-bold text-[#1a1a1a]">{i.product}</span><span className="block text-[10px] text-[#999]">{i.sku}</span></div>
            )},
            { key: "currentStock", header: "Stock", width: "80px", align: "right", sortable: true },
            { key: "safetyLevel", header: "Safety Level", width: "110px", align: "right" },
            { key: "reorderPoint", header: "Reorder At", width: "100px", align: "right" },
            { key: "leadTime", header: "Lead Time", width: "90px", align: "right", hideOnMobile: true, render: (i: SafetyStockRule) => <span>{i.leadTime} days</span> },
            { key: "status", header: "Status", width: "100px", render: (i: SafetyStockRule) => <StatusBadge status={i.status} /> },
          ]}
          actions={[
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (i: SafetyStockRule) => setViewRule(i) },
            { label: "Edit", icon: <Edit3 className="h-3.5 w-3.5" />, onClick: (i: SafetyStockRule) => openEditDrawer(i) },
          ]}
        />
      </div>
      {/* View Modal */}
      <ReusableModal
        open={!!viewRule}
        onClose={() => setViewRule(null)}
        title="Safety Stock Details"
        subtitle={`Information for ${viewRule?.product || ""}`}
        size="md"
      >
        {viewRule && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f9fafb] p-4">
              <div>
                <p className="text-[10px] text-[#999] font-bold uppercase">SKU</p>
                <p className="text-sm font-bold text-[#1a1a1a]">{viewRule.sku}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#999] font-bold uppercase">Status</p>
                <div className="mt-1">
                  <StatusBadge status={viewRule.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="rounded-xl border border-[#e8e8e8] p-3 text-center">
                <p className="text-[10px] text-[#666]">Current Stock</p>
                <p className="mt-1 text-base font-black text-[#1a1a1a]">{viewRule.currentStock}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-3 text-center">
                <p className="text-[10px] text-[#666]">Safety Level</p>
                <p className="mt-1 text-base font-black text-[#1a1a1a]">{viewRule.safetyLevel}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-3 text-center">
                <p className="text-[10px] text-[#666]">Reorder Point</p>
                <p className="mt-1 text-base font-black text-[#0c831f]">{viewRule.reorderPoint}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-3 text-center">
                <p className="text-[10px] text-[#666]">Lead Time</p>
                <p className="mt-1 text-base font-black text-[#1a1a1a]">{viewRule.leadTime}d</p>
              </div>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Edit Drawer */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${editRule ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeEditDrawer}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${editRule ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Edit Safety Stock
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">
              {editRule?.product}
            </h2>
            <p className="text-[10px] text-[#999] mt-0.5">
              SKU: {editRule?.sku}
            </p>
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
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Product Name</label>
            <input
              type="text"
              value={editForm.product ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, product: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">SKU</label>
            <input
              type="text"
              value={editForm.sku ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Current Stock</label>
              <input
                type="number"
                value={editForm.currentStock ?? 0}
                onChange={(e) => setEditForm((f) => ({ ...f, currentStock: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Safety Level</label>
              <input
                type="number"
                value={editForm.safetyLevel ?? 0}
                onChange={(e) => setEditForm((f) => ({ ...f, safetyLevel: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Reorder Point</label>
              <input
                type="number"
                value={editForm.reorderPoint ?? 0}
                onChange={(e) => setEditForm((f) => ({ ...f, reorderPoint: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Lead Time (days)</label>
              <input
                type="number"
                value={editForm.leadTime ?? 0}
                onChange={(e) => setEditForm((f) => ({ ...f, leadTime: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
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
            onClick={handleEditSave}
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

