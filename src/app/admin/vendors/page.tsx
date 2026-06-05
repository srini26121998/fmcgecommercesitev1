"use client";

import { useState } from "react";
import DashboardLayout from "../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { ReusablePageHeader, ReusableDrawer } from "@/components/common";
import { useVendors } from "@/hooks/use-vendors";
import { vendorsService } from "@/services/vendors.service";
import {
  Store, Eye, Edit3, Star, DollarSign, Package, TrendingUp,
  Plus, Phone, RefreshCw, ShieldAlert, CheckCircle, XCircle,
  MapPin, CreditCard, Activity, Loader2, Trash2
} from "lucide-react";
import { toast } from "sonner";
import type { Vendor } from "@/types/vendors";

const CATEGORIES = ["Groceries", "Fruits & Veg", "Dairy", "Snacks", "Health & Wellness", "Spices", "Frozen Foods", "Beverages"];

export default function VendorsPage() {
  const {
    data, loading, error, summary, filters, meta,
    fetchData, updateFilters, goToPage, changePageSize,
    createVendor, updateVendorStatus, updateVendor, deleteVendor,
    approveVendor, rejectVendor
  } = useVendors();

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", category: "", city: "", state: "", commissionRate: "10", contactPerson: "" });
  const [addLoading, setAddLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Vendor>>({});
  const [editLoading, setEditLoading] = useState(false);

  const handleAddVendor = async () => {
    if (!addForm.name || !addForm.email || !addForm.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    setAddLoading(true);
    try {
      await createVendor({ ...addForm, commissionRate: Number(addForm.commissionRate) });
      toast.success(`${addForm.name} has been onboarded successfully`);
      setShowAddModal(false);
      setAddForm({ name: "", email: "", phone: "", category: "", city: "", state: "", commissionRate: "10", contactPerson: "" });
      fetchData();
    } catch {
      toast.error("Failed to onboard vendor");
    } finally {
      setAddLoading(false);
    }
  };

  const handleStatusChange = async (vendor: Vendor, status: Vendor["status"]) => {
    try {
      await updateVendorStatus(vendor.id, status);
      toast.success(`${vendor.name} status updated to ${status}`);
      fetchData();
    } catch {
      toast.error("Failed to update vendor status");
    }
  };

  const handleViewVendor = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setViewLoading(true);
    try {
      const fullVendor = await vendorsService.getVendorById(vendor.id);
      if (fullVendor) {
        setSelectedVendor(fullVendor);
      }
    } catch (err) {
      toast.error("Failed to fetch full vendor details");
    } finally {
      setViewLoading(false);
    }
  };

  const handleEditVendorClick = async (vendor: Vendor) => {
    setEditForm({ ...vendor }); // Initial fallback
    setShowEditModal(true);
    setEditLoading(true);
    try {
      const fullVendor = await vendorsService.getVendorById(vendor.id);
      if (fullVendor) {
        setEditForm({
          id: fullVendor.id,
          name: fullVendor.name,
          email: fullVendor.email,
          phone: fullVendor.phone,
          category: fullVendor.category,
          city: fullVendor.city,
          state: fullVendor.state,
          commissionRate: fullVendor.commissionRate,
          contactPerson: fullVendor.contactPerson,
          status: fullVendor.status,
          gstin: fullVendor.gstin,
        });
      }
    } catch (err) {
      toast.error("Failed to fetch vendor details for editing");
    } finally {
      setEditLoading(false);
    }
  };

  const submitEditVendor = async () => {
    if (!editForm.id) return;
    setEditLoading(true);
    try {
      await updateVendor(editForm.id, editForm);
      toast.success("Vendor updated successfully");
      setShowEditModal(false);
    } catch {
      toast.error("Failed to update vendor");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (window.confirm(`Are you sure you want to delete ${vendor.name || 'this vendor'}?`)) {
      try {
        await deleteVendor(vendor.id);
        toast.success("Vendor deleted successfully");
      } catch {
        toast.error("Failed to delete vendor");
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Vendors"
          title="Vendor Management"
          subtitle="Onboard, manage, and track vendor performance, products, settlements, and analytics."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <ReusableExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt.toUpperCase()}`)} />
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]"
              >
                <Plus className="h-4 w-4" /> Add Vendor
              </button>
            </div>
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard
            title="Total Vendors"
            value={summary?.totalVendors ?? 0}
            icon={<Store className="h-5 w-5" />}
            color="text-[#0c831f]" bgColor="bg-[#e8f5e9]"
            subtitle={summary ? `${summary.activeVendors} active` : undefined}
          />
          <ReusableCard
            title="Total Products"
            value={summary?.totalProducts.toLocaleString() ?? 0}
            icon={<Package className="h-5 w-5" />}
            color="text-[#2563eb]" bgColor="bg-[#eff6ff]"
          />
          <ReusableCard
            title="Total Sales"
            value={summary ? `?${(summary.totalSales / 10000000).toFixed(2)}Cr` : "-"}
            icon={<TrendingUp className="h-5 w-5" />}
            color="text-[#9333ea]" bgColor="bg-[#f3e8ff]"
          />
          <ReusableCard
            title="Pending Payouts"
            value={summary ? `?${(summary.pendingPayouts / 100000).toFixed(1)}L` : "-"}
            icon={<DollarSign className="h-5 w-5" />}
            color="text-[#d97706]" bgColor="bg-[#fffbeb]"
            subtitle={summary ? `${summary.pendingVendors} pending approval` : undefined}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white p-4">
          <div className="flex-1 min-w-[200px]">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(v) => updateFilters({ search: v })}
              placeholder="Search vendors by name, email, ID..."
            />
          </div>
          <select
            value={filters.status ?? "all"}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filters.category ?? "all"}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={filters.performance ?? "all"}
            onChange={(e) => updateFilters({ performance: e.target.value })}
            className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
          >
            <option value="all">All Performance</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="average">Average</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        {/* Vendor Table */}
        <ReusableTable
          data={data}
          keyExtractor={(v) => v.id}
          isLoading={loading}
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          enableSelection
          columns={[
            {
              key: "name", header: "Vendor", sortable: true,
              render: (v) => {
                const businessName = (v as any).businessName || v.name || "Unknown";
                return (
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c831f]/10 text-xs font-black text-[#0c831f]">
                      {businessName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-[#1a1a1a]">{businessName}</span>
                      <span className="block text-[10px] text-[#999]">{v.email}</span>
                    </div>
                  </div>
                );
              },
            },
            { key: "contactPerson", header: "Contact Person", width: "130px", hideOnMobile: true, render: (v) => <span>{(v as any).contactName || v.contactPerson || "N/A"}</span> },
            { key: "phone", header: "Phone", width: "120px", hideOnMobile: true },
            { key: "gstin", header: "GST Number", width: "130px", hideOnMobile: true, render: (v) => <span className="font-mono">{(v as any).gstNumber || v.gstin || "N/A"}</span> },
            { key: "status", header: "Status", width: "100px", render: (v) => <StatusBadge status={v.status} /> },
            {
              key: "commissionRate", header: "Commission", width: "100px", align: "right",
              render: (v) => <span className="font-bold text-[#0c831f]">{v.commissionRate}%</span>,
            },
            {
              key: "joinedDate", header: "Joined", width: "100px",
              render: (v) => {
                const dateStr = (v as any).createdAt || v.joinedDate;
                if (!dateStr) return <span>N/A</span>;
                try {
                  const date = new Date(dateStr);
                  return <span className="text-sm font-medium">{date.toLocaleDateString()}</span>;
                } catch {
                  return <span>{dateStr}</span>;
                }
              }
            },
          ]}
          actions={[
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: handleViewVendor },
            { label: "Edit", icon: <Edit3 className="h-3.5 w-3.5" />, onClick: handleEditVendorClick },
            { label: "Call", icon: <Phone className="h-3.5 w-3.5" />, onClick: (v) => toast.success(`Calling ${v.phone}`) },
            {
              label: "Approve",
              icon: <CheckCircle className="h-3.5 w-3.5" />,
              onClick: async (v) => {
                try {
                  await approveVendor(v.id);
                  toast.success(`${v.name || 'Vendor'} approved successfully`);
                } catch {
                  toast.error("Failed to approve vendor");
                }
              },
              variant: "success",
              show: (v) => v.status !== "active",
            },
            {
              label: "Reject",
              icon: <XCircle className="h-3.5 w-3.5" />,
              onClick: async (v) => {
                const reason = window.prompt("Reason for rejection:");
                if (reason !== null) {
                  try {
                    await rejectVendor(v.id, reason || "Rejected by admin");
                    toast.success(`${v.name || 'Vendor'} rejected successfully`);
                  } catch {
                    toast.error("Failed to reject vendor");
                  }
                }
              },
              variant: "danger",
              show: (v) => v.status !== "rejected",
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-3.5 w-3.5" />,
              onClick: handleDeleteVendor,
              variant: "danger",
            },
          ]}
        />
      </div>

      {/* Vendor Detail Drawer */}
      <ReusableDrawer
        open={!!selectedVendor}
        onClose={() => setSelectedVendor(null)}
        title={((selectedVendor as any)?.businessName || selectedVendor?.name) ?? ""}
        subtitle={((selectedVendor as any)?.id?.toString() || selectedVendor?.vendorId) ?? ""}
        width="lg"
      >
        {viewLoading && (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0c831f]" />
          </div>
        )}
        {selectedVendor && !viewLoading && (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedVendor.status} />
            </div>

            {/* Contact Information */}
            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Contact Information</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Contact Person", value: (selectedVendor as any).contactName || selectedVendor.contactPerson },
                  { label: "Phone", value: selectedVendor.phone },
                  { label: "Email", value: selectedVendor.email },
                  { label: "Joined", value: (selectedVendor as any).createdAt || selectedVendor.joinedDate },
                  { label: "Last Updated", value: (selectedVendor as any).updatedAt },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">{f.label}</p>
                    <p className="mt-0.5 text-sm font-bold text-[#1a1a1a]">
                      {f.value ? (typeof f.value === "string" && f.value.includes("T") ? new Date(f.value).toLocaleString() : f.value) : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Details */}
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Business Details</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Business Name", value: (selectedVendor as any).businessName || selectedVendor.name },
                  { label: "GST Number", value: (selectedVendor as any).gstNumber || selectedVendor.gstin },
                  { label: "Commission Rate", value: selectedVendor.commissionRate ? `${selectedVendor.commissionRate}%` : "N/A" },
                ].map((f) => (
                  <div key={f.label}>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">{f.label}</p>
                    <p className="mt-0.5 text-sm font-mono font-bold text-[#1a1a1a]">{f.value || "N/A"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-[#e8e8e8] pt-4">
              {selectedVendor.status !== "active" && (
                <button
                  onClick={async () => {
                    try {
                      await approveVendor(selectedVendor.id);
                      toast.success(`${selectedVendor.name || 'Vendor'} approved successfully`);
                      setSelectedVendor(null);
                    } catch {
                      toast.error("Failed to approve vendor");
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-[#0c831f]/20 bg-[#e8f5e9] px-4 py-2 text-sm font-bold text-[#0c831f] hover:bg-[#d0f0d4]"
                >
                  <CheckCircle className="h-4 w-4" /> Approve
                </button>
              )}
              {selectedVendor.status !== "rejected" && (
                <button
                  onClick={async () => {
                    const reason = window.prompt("Reason for rejection:");
                    if (reason !== null) {
                      try {
                        await rejectVendor(selectedVendor.id, reason || "Rejected by admin");
                        toast.success(`${selectedVendor.name || 'Vendor'} rejected successfully`);
                        setSelectedVendor(null);
                      } catch {
                        toast.error("Failed to reject vendor");
                      }
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-100"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedVendor(null);
                  handleEditVendorClick(selectedVendor);
                }}
                className="ml-auto rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]"
              >
                Edit Vendor
              </button>
            </div>
          </div>
        )}
      </ReusableDrawer>

      {/* Add Vendor Modal */}
      <ReusableModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Onboard New Vendor"
        subtitle="Add a new vendor to the platform"
        size="md"
      >
        <div className="space-y-4">
          {[
            { key: "name", label: "Vendor Name *", placeholder: "Enter company name" },
            { key: "email", label: "Email *", placeholder: "vendor@example.com", type: "email" },
            { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
            { key: "contactPerson", label: "Contact Person", placeholder: "Owner / Manager name" },
            { key: "city", label: "City", placeholder: "City" },
            { key: "state", label: "State", placeholder: "State" },
          ].map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">{field.label}</label>
              <input
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                value={addForm[field.key as keyof typeof addForm]}
                onChange={(e) => setAddForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
              />
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Category *</label>
            <select
              value={addForm.category}
              onChange={(e) => setAddForm((prev) => ({ ...prev, category: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Commission Rate (%)</label>
            <input
              type="number"
              min="1" max="30"
              value={addForm.commissionRate}
              onChange={(e) => setAddForm((prev) => ({ ...prev, commissionRate: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
          <button
            onClick={() => setShowAddModal(false)}
            className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
          >
            Cancel
          </button>
          <button
            onClick={handleAddVendor}
            disabled={addLoading}
            className="rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
          >
            {addLoading ? "Onboarding..." : "Onboard Vendor"}
          </button>
        </div>
      </ReusableModal>

      {/* Edit Vendor Modal */}
      <ReusableModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Vendor"
        subtitle="Update vendor details"
        size="md"
      >
        {editLoading && !editForm.id ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0c831f]" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {[
                { key: "name", label: "Business Name *", placeholder: "Enter company name" },
                { key: "contactPerson", label: "Contact Person", placeholder: "Owner / Manager name" },
                { key: "email", label: "Email *", placeholder: "vendor@example.com", type: "email" },
                { key: "phone", label: "Phone", placeholder: "+91 98765 43210" },
                { key: "gstin", label: "GST Number", placeholder: "GSTIN" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">{field.label}</label>
                  <input
                    type={field.type ?? "text"}
                    placeholder={field.placeholder}
                    value={(editForm as any)[field.key] || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Status *</label>
                <select
                  value={editForm.status || "active"}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as Vendor["status"] }))}
                  className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Commission Rate (%)</label>
                <input
                  type="number"
                  min="0" max="100"
                  value={editForm.commissionRate || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, commissionRate: Number(e.target.value) }))}
                  className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
              >
                Cancel
              </button>
              <button
                onClick={submitEditVendor}
                disabled={editLoading}
                className="rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </ReusableModal>
    </DashboardLayout>
  );
}




