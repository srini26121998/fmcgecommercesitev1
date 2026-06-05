"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { CampaignForm } from "@/components/ui/promotions/admin";
import { useCampaigns } from "@/hooks/use-promotions";
import type { Campaign } from "@/types/promotions";
import { Megaphone, Plus, Edit3, Users, CalendarDays, Eye, Trash2, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function CampaignBuilderPage() {
  const { campaigns, summary, loading, error, createCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<Campaign | null>(null);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Promotions</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Campaign Builder</h1>
              <p className="mt-1.5 text-xs text-[#666]">Create multi-channel marketing campaigns with targeting, scheduling, and budget management.</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
              <Plus className="h-4 w-4" /> New Campaign
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Active Campaigns" value={summary.active} icon={<Megaphone className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Scheduled" value={summary.scheduled} icon={<CalendarDays className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Drafts" value={summary.drafts} icon={<Edit3 className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Total Reach" value={summary.totalReach} icon={<Users className="h-4 w-4" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        {error && (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-3 text-sm font-bold text-[#dc2626]">{error}</div>
        )}

        <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="mb-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Campaigns</p><h3 className="text-sm font-black text-[#1a1a1a]">All Campaigns</h3></div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="h-24 skeleton-shimmer rounded-xl" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#999]">No campaigns found</div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((camp) => (
                <div key={camp.id} className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4 transition-all hover:shadow-sm cursor-pointer" onClick={() => setShowViewModal(camp)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff0f6]"><Megaphone className="h-4 w-4 text-[#ff4f8b]" /></div>
                      <div>
                        <p className="text-sm font-bold text-[#1a1a1a]">{camp.name}</p>
                        <p className="text-xs text-[#999]">{camp.audience} ₹ Budget: {camp.budget}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1.5">
                      <StatusBadge status={camp.status} />
                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowViewModal(camp);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e8e8e8] bg-white text-[#666] hover:bg-[#f6f7f6]"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditCampaign(camp);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#e8e8e8] bg-white text-[#666] hover:bg-[#f6f7f6]"
                          title="Edit Campaign"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const success = await deleteCampaign(camp.id);
                            if (success) toast.success(`Campaign "${camp.name}" deleted`);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]"
                          title="Delete Campaign"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {camp.channels.map((ch) => (
                      <span key={ch} className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#666] border border-[#e8e8e8]">{ch.toUpperCase()}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Campaign Modal */}
      <ReusableModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Campaign" subtitle="Create a multi-channel marketing campaign" size="lg">
        <CampaignForm
          onSubmit={async (data) => {
            const result = await createCampaign(data);
            if (result) {
              toast.success(`Campaign "${result.name}" created!`);
              setShowCreateModal(false);
            } else {
              toast.error("Failed to create campaign");
            }
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </ReusableModal>

      {/* View Campaign Modal */}
      <ReusableModal open={!!showViewModal} onClose={() => setShowViewModal(null)} title="Campaign Details" subtitle={showViewModal?.id} size="md">
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
                <span className="block text-xs font-bold text-[#999] uppercase">Target Audience</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.audience}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Budget</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.budget}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Sent Reach</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.sent}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Opens / Clicks</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.opens} / {showViewModal.clicks}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Channels</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.channels.map(c => c.toUpperCase()).join(", ")}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Timeline</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.startDate} to {showViewModal.endDate}</span>
              </div>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Edit Campaign Drawer */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          editCampaign ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setEditCampaign(null)}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          editCampaign ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Edit Campaign
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">
              {editCampaign?.name}
            </h2>
            <p className="text-[10px] text-[#999] mt-0.5">{editCampaign?.id}</p>
          </div>
          <button
            onClick={() => setEditCampaign(null)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            aria-label="Close edit panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {editCampaign && (
            <CampaignForm
              initial={editCampaign}
              onSubmit={async (data) => {
                const res = await updateCampaign(editCampaign.id, data);
                if (res) {
                  toast.success(`Campaign "${data.name}" updated successfully`);
                  setEditCampaign(null);
                } else {
                  toast.error("Failed to update campaign");
                }
              }}
              onCancel={() => setEditCampaign(null)}
            />
          )}
        </div>
      </aside>
    </DashboardLayout>
  );
}

