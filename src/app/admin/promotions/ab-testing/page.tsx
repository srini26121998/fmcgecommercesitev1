"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { ABTestBuilder } from "@/components/ui/promotions/admin";
import { useABTests } from "@/hooks/use-promotions";
import type { ABTest } from "@/types/promotions";
import { BarChart3, Plus, TrendingUp, Users, Target, Eye, Trash2, Edit3, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function ABTestingPage() {
  const { tests, summary, loading, error, filters, updateFilters, fetchTests, createTest, updateTest, deleteTest } = useABTests();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<ABTest | null>(null);
  const [editTest, setEditTest] = useState<ABTest | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Promotions</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">A/B Testing</h1>
              <p className="mt-1.5 text-xs text-[#666]">Run A/B tests on promotions, notifications, pricing, and checkout flows.</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
              <Plus className="h-4 w-4" /> New Test
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Tests" value={summary.total} icon={<BarChart3 className="h-5 w-5" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Running" value={summary.running} icon={<Target className="h-5 w-5" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Completed" value={summary.completed} icon={<TrendingUp className="h-5 w-5" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Total Impressions" value={summary.totalImpressions.toLocaleString()} icon={<Users className="h-5 w-5" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        {error && (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-3 text-sm font-bold text-[#dc2626] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => fetchTests()} className="text-xs underline">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => (
              <div key={i} className="h-32 skeleton-shimmer rounded-2xl" />
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f7f6]">
              <BarChart3 className="h-6 w-6 text-[#999]" />
            </div>
            <p className="text-sm font-bold text-[#666]">No A/B tests found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test) => (
              <div key={test.id} className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3e8ff]"><BarChart3 className="h-4 w-4 text-[#9333ea]" /></div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{test.name}</p>
                      <p className="text-xs text-[#999]">{test.audience} ₹ {test.totalImpressions.toLocaleString()} impressions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={test.status} />
                    <button
                      onClick={() => setShowViewModal(test)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e8e8e8] bg-white text-[#666] hover:bg-[#f6f7f6]"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditTest(test)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e8e8e8] bg-white text-[#666] hover:bg-[#f6f7f6]"
                      title="Edit Test"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={async () => {
                        const success = await deleteTest(test.id);
                        if (success) toast.success(`Deleted test "${test.name}"`);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]"
                      title="Delete Test"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl bg-[#f9fafb] p-3">
                    <p className="text-[10px] font-bold uppercase text-[#999]">Variant A</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{test.variantA.label}</p>
                    <p className="text-xs text-[#0c831f]">{test.variantA.conversionRate}</p>
                  </div>
                  <div className="rounded-xl bg-[#f9fafb] p-3">
                    <p className="text-[10px] font-bold uppercase text-[#999]">Variant B</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{test.variantB.label}</p>
                    <p className="text-xs text-[#0c831f]">{test.variantB.conversionRate}</p>
                  </div>
                  <div className="rounded-xl bg-[#f9fafb] p-3">
                    <p className="text-[10px] font-bold uppercase text-[#999]">Winner</p>
                    <p className="text-sm font-bold">{test.winner ? `Variant ${test.winner}` : "In progress"}</p>
                  </div>
                  <div className="rounded-xl bg-[#f9fafb] p-3">
                    <p className="text-[10px] font-bold uppercase text-[#999]">Period</p>
                    <p className="text-xs font-bold text-[#666]">{test.startedAt} ₹ {test.endedAt || "Ongoing"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Test Modal */}
      <ReusableModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New A/B Test" subtitle="Set up a new split test" size="lg">
        <ABTestBuilder
          onSubmit={async (data) => {
            const result = await createTest(data);
            if (result) {
              toast.success(`A/B test "${result.name}" created!`);
              setShowCreateModal(false);
            } else {
              toast.error("Failed to create A/B test");
            }
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </ReusableModal>

      {/* View A/B Test Modal */}
      <ReusableModal open={!!showViewModal} onClose={() => setShowViewModal(null)} title="A/B Test Details" subtitle={showViewModal?.id} size="lg">
        {showViewModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">{showViewModal.name}</h3>
                <p className="text-xs text-[#666]">{showViewModal.description || "No description provided."}</p>
              </div>
              <StatusBadge status={showViewModal.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl border border-[#e8e8e8] p-4 bg-[#eff6ff]">
                <h4 className="font-black text-[#2563eb] text-sm uppercase">Variant A: {showViewModal.variantA.label}</h4>
                {showViewModal.variantA.description && <p className="text-[#666] mt-0.5">{showViewModal.variantA.description}</p>}
                <div className="mt-3 space-y-1.5 font-semibold text-sm">
                  <p><span className="text-[#999]">Impressions:</span> {showViewModal.variantA.impressions}</p>
                  <p><span className="text-[#999]">Conversions:</span> {showViewModal.variantA.conversions}</p>
                  <p><span className="text-[#999]">Revenue:</span> {showViewModal.variantA.revenue}</p>
                  <p><span className="text-[#999]">Conv. Rate:</span> <span className="text-[#0c831f] font-black">{showViewModal.variantA.conversionRate}</span></p>
                </div>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-4 bg-[#f3e8ff]">
                <h4 className="font-black text-[#9333ea] text-sm uppercase">Variant B: {showViewModal.variantB.label}</h4>
                {showViewModal.variantB.description && <p className="text-[#666] mt-0.5">{showViewModal.variantB.description}</p>}
                <div className="mt-3 space-y-1.5 font-semibold text-sm">
                  <p><span className="text-[#999]">Impressions:</span> {showViewModal.variantB.impressions}</p>
                  <p><span className="text-[#999]">Conversions:</span> {showViewModal.variantB.conversions}</p>
                  <p><span className="text-[#999]">Revenue:</span> {showViewModal.variantB.revenue}</p>
                  <p><span className="text-[#999]">Conv. Rate:</span> <span className="text-[#0c831f] font-black">{showViewModal.variantB.conversionRate}</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="rounded-xl bg-[#f9fafb] p-3">
                <span className="block text-[10px] font-bold text-[#999] uppercase">Audience Split</span>
                <span className="font-semibold text-[#1a1a1a] text-sm">{showViewModal.audience}</span>
              </div>
              <div className="rounded-xl bg-[#f9fafb] p-3">
                <span className="block text-[10px] font-bold text-[#999] uppercase">Winner Variant</span>
                <span className="font-semibold text-[#1a1a1a] text-sm">{showViewModal.winner ? `Variant ${showViewModal.winner}` : "In Progress"}</span>
              </div>
              <div className="rounded-xl bg-[#f9fafb] p-3">
                <span className="block text-[10px] font-bold text-[#999] uppercase">Confidence</span>
                <span className="font-semibold text-[#1a1a1a] text-sm">{showViewModal.confidence}%</span>
              </div>
              <div className="rounded-xl bg-[#f9fafb] p-3">
                <span className="block text-[10px] font-bold text-[#999] uppercase">Timeline</span>
                <span className="font-semibold text-[#1a1a1a] text-xs leading-5">{showViewModal.startedAt} to {showViewModal.endedAt || "Ongoing"}</span>
              </div>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Edit A/B Test Drawer */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          editTest ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setEditTest(null)}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          editTest ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Edit A/B Test
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">
              {editTest?.name}
            </h2>
            <p className="text-[10px] text-[#999] mt-0.5">{editTest?.id}</p>
          </div>
          <button
            onClick={() => setEditTest(null)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            aria-label="Close edit panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {editTest && (
            <ABTestBuilder
              initial={editTest}
              onSubmit={async (data) => {
                const res = await updateTest(editTest.id, data);
                if (res) {
                  toast.success(`A/B test "${data.name}" updated successfully`);
                  setEditTest(null);
                } else {
                  toast.error("Failed to update A/B test");
                }
              }}
              onCancel={() => setEditTest(null)}
            />
          )}
        </div>
      </aside>
    </DashboardLayout>
  );
}

