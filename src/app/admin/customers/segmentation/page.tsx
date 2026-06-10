"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { useSegments } from "@/hooks/use-customers";
import { formatDate } from "@/utils/formatDate";
import { 
  Users, 
  Star, 
  Shield, 
  Zap, 
  TrendingUp, 
  Plus, 
  Edit2, 
  Eye, 
  Loader2, 
  AlertCircle,
  X,
  Sparkles,
  Settings
} from "lucide-react";

export default function SegmentationPage() {
  const { 
    segments, 
    loading, 
    error, 
    totalCustomers, 
    createSegment, 
    updateSegment 
  } = useSegments();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    criteria: "",
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Helpers
  const getSegmentDetails = (name: string) => {
    const lowercase = (name || "").toLowerCase();
    if (lowercase.includes("vip")) {
      return { color: "bg-[#9333ea]", textColor: "text-[#9333ea]", border: "border-[#9333ea]", icon: Star };
    } else if (lowercase.includes("regular")) {
      return { color: "bg-[#2563eb]", textColor: "text-[#2563eb]", border: "border-[#2563eb]", icon: Users };
    } else if (lowercase.includes("new")) {
      return { color: "bg-[#0c831f]", textColor: "text-[#0c831f]", border: "border-[#0c831f]", icon: Zap };
    } else if (lowercase.includes("risk")) {
      return { color: "bg-[#d97706]", textColor: "text-[#d97706]", border: "border-[#d97706]", icon: Shield };
    } else if (lowercase.includes("churn")) {
      return { color: "bg-[#dc2626]", textColor: "text-[#dc2626]", border: "border-[#dc2626]", icon: TrendingUp };
    }
    return { color: "bg-[#4b5563]", textColor: "text-[#4b5563]", border: "border-[#4b5563]", icon: Settings };
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", criteria: "", description: "" });
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (seg: any) => {
    setSelectedSegment(seg);
    setFormData({
      name: seg.name || "",
      criteria: typeof seg.criteria === "string" ? seg.criteria : JSON.stringify(seg.criteria) || "",
      description: seg.description || "",
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const handleOpenView = (seg: any) => {
    setSelectedSegment(seg);
    setIsViewOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.criteria.trim()) {
      setFormError("Name and Criteria are required fields.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await createSegment(formData);
      setIsAddOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create segment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSegment) return;
    if (!formData.name.trim() || !formData.criteria.trim()) {
      setFormError("Name and Criteria are required fields.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await updateSegment(selectedSegment.id, formData);
      setIsEditOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update segment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        {/* Top Header Card */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Customers</p>
            <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Segmentation</h1>
            <p className="mt-1.5 text-xs text-[#666]">
              Customer segments based on buying behavior, order frequency, and lifetime value.
            </p>
          </div>
          <div>
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 rounded-xl bg-[#0c831f] hover:bg-[#0a6c1a] text-white text-xs font-bold px-4 py-2.5 shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Segment
            </button>
          </div>
        </section>

        {/* Dynamic Metric Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-xl border border-[#e8e8e8] bg-white p-4 animate-pulse">
                <div className="mx-auto h-10 w-10 rounded-xl bg-[#f3f4f6]" />
                <div className="mx-auto mt-3 h-4 w-12 rounded bg-[#f3f4f6]" />
                <div className="mx-auto mt-2 h-3 w-20 rounded bg-[#f3f4f6]" />
                <div className="mt-3 h-1.5 w-full rounded-full bg-[#f3f4f6]" />
              </div>
            ))}
          </div>
        ) : segments.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {segments.slice(0, 5).map((seg) => {
              const details = getSegmentDetails(seg.name);
              const IconComp = details.icon;
              const count = seg.customerCount || 0;
              return (
                <div key={seg.id} className="rounded-xl border border-[#e8e8e8] bg-white p-4 transition-all hover:shadow-md">
                  <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${details.color} bg-opacity-10`}>
                    <IconComp className={`h-5 w-5 ${details.textColor}`} />
                  </div>
                  <p className="mt-3 text-center text-lg font-black text-[#1a1a1a]">{count}</p>
                  <p className="text-center text-xs font-bold text-[#666] truncate">{seg.name}</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#e8e8e8]">
                    <div 
                      className={`h-full rounded-full ${details.color}`} 
                      style={{ width: `${totalCustomers > 0 ? (count / totalCustomers) * 100 : 0}%` }} 
                    />
                  </div>
                  <div className="mt-2 text-center text-[10px] text-[#999] line-clamp-1">
                    {seg.description || "No description provided"}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#e8e8e8] bg-white py-8 px-4 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[#ccc]" />
            <p className="mt-2 text-xs font-bold text-[#666]">No segments active</p>
            <p className="text-[10px] text-[#999] mt-0.5">Click Add Segment to define custom customer groups.</p>
          </div>
        )}

        {/* Segments Table */}
        <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Analytics</p>
            <h3 className="text-sm font-black text-[#1a1a1a]">Segment Breakdown</h3>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-[#0c831f] animate-spin" />
              <p className="text-xs text-[#666] mt-2">Loading customer segments...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
              <p className="mt-2 text-xs font-bold text-red-700">Error loading segments</p>
              <p className="text-[10px] text-red-500 mt-0.5">{error}</p>
            </div>
          ) : segments.length === 0 ? (
            <div className="text-center py-12 text-[#999] text-xs">
              No segments found. Use the Add Segment button above to create one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f9fafb] text-left text-[10px] font-black uppercase tracking-wide text-[#666]">
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Segment Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Criteria</th>
                    <th className="px-4 py-3">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8]">
                  {segments.map((seg) => {
                    const details = getSegmentDetails(seg.name);
                    const criteriaStr = typeof seg.criteria === "string" 
                      ? seg.criteria 
                      : JSON.stringify(seg.criteria);

                    return (
                      <tr key={seg.id} className="text-sm hover:bg-[#f9fafb] cursor-pointer" onClick={() => handleOpenView(seg)}>
                        <td className="px-4 py-3 font-semibold text-[#666]">#{seg.id}</td>
                        <td className="px-4 py-3 font-bold text-[#1a1a1a]">{seg.name}</td>
                        <td className="px-4 py-3 text-[#666] text-xs max-w-[200px] truncate" title={seg.description}>
                          {seg.description || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-[10px] bg-gray-50 text-gray-700 px-2 py-1 rounded border border-gray-100 max-w-[250px] inline-block truncate" title={criteriaStr}>
                            {criteriaStr || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#666] text-xs">
                          {seg.createdAt ? formatDate(seg.createdAt) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e8e8e8] animate-in fade-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-[#1a1a1a]">Add New Segment</h3>
            <p className="text-xs text-[#666] mt-1">Create a dynamic group based on custom filter criteria.</p>

            {formError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Segment Name *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm focus:border-[#0c831f] focus:outline-none"
                  placeholder="e.g. VIP High Spenders"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Criteria *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm focus:border-[#0c831f] focus:outline-none font-mono"
                  placeholder="e.g. minSpent > 50000"
                  value={formData.criteria}
                  onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Description</label>
                <textarea
                  className="w-full rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm focus:border-[#0c831f] focus:outline-none"
                  placeholder="e.g. Customers who purchased items worth more than 50,000"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e8e8e8]">
                <button
                  type="button"
                  className="rounded-lg border border-[#e8e8e8] px-4 py-2 text-xs font-semibold text-[#666] hover:bg-[#f9fafb]"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1 rounded-lg bg-[#0c831f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a6c1a] disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  {submitting ? "Adding..." : "Add Segment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e8e8e8] animate-in fade-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-bold text-[#1a1a1a]">Edit Segment Criteria</h3>
            <p className="text-xs text-[#666] mt-1">Modify filters for segment #{selectedSegment?.id}.</p>

            {formError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Segment Name *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm focus:border-[#0c831f] focus:outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Criteria *</label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm focus:border-[#0c831f] focus:outline-none font-mono"
                  value={formData.criteria}
                  onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1a1a1a] mb-1">Description</label>
                <textarea
                  className="w-full rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm focus:border-[#0c831f] focus:outline-none"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e8e8e8]">
                <button
                  type="button"
                  className="rounded-lg border border-[#e8e8e8] px-4 py-2 text-xs font-semibold text-[#666] hover:bg-[#f9fafb]"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1 rounded-lg bg-[#0c831f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a6c1a] disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewOpen && selectedSegment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#e8e8e8] animate-in fade-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsViewOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-opacity-10 ${getSegmentDetails(selectedSegment.name).color}`}>
                {(() => {
                  const Icon = getSegmentDetails(selectedSegment.name).icon;
                  return <Icon className={`h-5 w-5 ${getSegmentDetails(selectedSegment.name).textColor}`} />;
                })()}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">{selectedSegment.name}</h3>
                <p className="text-[10px] text-[#999]">Segment ID: #{selectedSegment.id}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5 border-t border-[#e8e8e8] pt-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#999] block mb-1">Description</span>
                <p className="text-xs text-[#1a1a1a] bg-gray-50 p-2.5 rounded-lg border border-gray-100 min-h-[50px]">
                  {selectedSegment.description || "No description provided."}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#999] block mb-1">Filter Criteria</span>
                <pre className="font-mono text-xs bg-gray-50 text-gray-700 p-2.5 rounded-lg border border-gray-100 overflow-x-auto">
                  {typeof selectedSegment.criteria === "string" 
                    ? selectedSegment.criteria 
                    : JSON.stringify(selectedSegment.criteria, null, 2)}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#999] block">Created At</span>
                  <span className="font-medium text-[#1a1a1a]">
                    {selectedSegment.createdAt ? formatDate(selectedSegment.createdAt) : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#999] block">Updated At</span>
                  <span className="font-medium text-[#1a1a1a]">
                    {selectedSegment.updatedAt ? formatDate(selectedSegment.updatedAt) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-5 mt-4 border-t border-[#e8e8e8]">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg border border-[#e8e8e8] px-4 py-2 text-xs font-semibold text-[#666] hover:bg-[#f9fafb] hover:text-[#0c831f] transition-all"
                onClick={() => {
                  setIsViewOpen(false);
                  handleOpenEdit(selectedSegment);
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#e8e8e8] bg-gray-50 px-4 py-2 text-xs font-semibold text-[#1a1a1a] hover:bg-gray-100"
                onClick={() => setIsViewOpen(false)}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
