"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { usePushNotifications } from "@/hooks/use-promotions";
import type { PushNotification } from "@/types/promotions";
import { Bell, Plus, Eye, Send, Clock, Smartphone, Trash2, Save, X, Edit3 } from "lucide-react";
import { toast } from "sonner";

export default function PushNotificationsPage() {
  const { notifications, summary, pagination, loading, error, fetchNotifications, createNotification, updateNotification, deleteNotification, setPage, setPageSize } = usePushNotifications();
  const [search, setSearch] = useState("");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<PushNotification | null>(null);
  const [editNotification, setEditNotification] = useState<PushNotification | null>(null);

  // Forms state
  const [createForm, setCreateForm] = useState<Partial<PushNotification>>({
    title: "",
    body: "",
    audience: "All Users",
    audienceTarget: "all_users",
    deepLink: "",
    status: "draft",
  });
  
  const [editForm, setEditForm] = useState<Partial<PushNotification>>({});

  const filtered = notifications.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  const handleCompose = async () => {
    if (!createForm.title || !createForm.body) {
      toast.error("Title and body are required");
      return;
    }
    const res = await createNotification(createForm);
    if (res) {
      toast.success("Notification created successfully!");
      setShowComposeModal(false);
      setCreateForm({
        title: "",
        body: "",
        audience: "All Users",
        audienceTarget: "all_users",
        deepLink: "",
        status: "draft",
      });
    } else {
      toast.error("Failed to compose notification");
    }
  };

  const handleEditSave = async () => {
    if (!editNotification || !editForm.title || !editForm.body) return;
    const res = await updateNotification(editNotification.id, editForm);
    if (res) {
      toast.success("Notification updated successfully!");
      setEditNotification(null);
      setEditForm({});
    } else {
      toast.error("Failed to update notification");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const success = await deleteNotification(id);
    if (success) {
      toast.success(`Deleted notification "${title}"`);
    } else {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Promotions</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Push Notifications</h1>
              <p className="mt-1.5 text-xs text-[#666]">Send and schedule push notifications to engage users with timely updates.</p>
            </div>
            <button onClick={() => setShowComposeModal(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
              <Plus className="h-4 w-4" /> Compose
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Sent" value={summary.sent} icon={<Send className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Scheduled" value={summary.scheduled} icon={<Clock className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Drafts" value={summary.drafts} icon={<Bell className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Avg Open Rate" value={summary.avgOpenRate} icon={<Smartphone className="h-4 w-4" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        <ReusableSearchBar value={search} onChange={setSearch} placeholder="Search notifications..." />

        {error && (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-3 text-sm font-bold text-[#dc2626] flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => fetchNotifications()} className="text-xs underline">Retry</button>
          </div>
        )}

        <ReusableTable
          data={filtered}
          keyExtractor={(p) => p.id}
          isLoading={loading}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          columns={[
            { key: "title", header: "Notification", sortable: true, render: (p) => (
              <div className="flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-[#0c831f]" /><span className="font-bold text-[#1a1a1a]">{p.title}</span></div>
            )},
            { key: "audience", header: "Audience", width: "130px" },
            { key: "sent", header: "Sent", width: "80px", align: "right" },
            { key: "opened", header: "Opened", width: "80px", align: "right", hideOnMobile: true },
            { key: "clicked", header: "Clicked", width: "80px", align: "right", hideOnMobile: true },
            { key: "status", header: "Status", width: "100px", render: (p) => <StatusBadge status={p.status} /> },
          ]}
          actions={[
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (p) => setShowViewModal(p) },
            { label: "Edit", icon: <Edit3 className="h-3.5 w-3.5" />, onClick: (p) => { setEditNotification(p); setEditForm({ ...p }); } },
            { label: "Delete", icon: <Trash2 className="h-3.5 w-3.5" />, onClick: (p) => handleDelete(p.id, p.title), variant: "danger" },
          ]}
        />
      </div>

      {/* Compose Notification Modal */}
      <ReusableModal open={showComposeModal} onClose={() => setShowComposeModal(false)} title="Compose Notification" subtitle="Create a new push notification" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Title</label>
            <input type="text" value={createForm.title || ""} onChange={(e) => setCreateForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Body</label>
            <textarea rows={3} value={createForm.body || ""} onChange={(e) => setCreateForm(f => ({ ...f, body: e.target.value }))} placeholder="Notification body text" className="w-full rounded-xl border border-[#e8e8e8] bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Audience</label>
              <select value={createForm.audience || ""} onChange={(e) => setCreateForm(f => ({ ...f, audience: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                {["All Users", "Active Users", "New Users", "VIP Members", "Abandoned Carts"].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
              <select value={createForm.status || ""} onChange={(e) => setCreateForm(f => ({ ...f, status: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent Now</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Deep Link (optional)</label>
            <input type="text" value={createForm.deepLink || ""} onChange={(e) => setCreateForm(f => ({ ...f, deepLink: e.target.value }))} placeholder="e.g., /promotions/summer-sale" className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
          <button onClick={() => setShowComposeModal(false)} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
          <button onClick={handleCompose} className="rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">Send Notification</button>
        </div>
      </ReusableModal>

      {/* View Notification Modal */}
      <ReusableModal open={!!showViewModal} onClose={() => setShowViewModal(null)} title="Notification Details" subtitle={showViewModal?.id} size="md">
        {showViewModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">{showViewModal.title}</h3>
                <p className="text-xs text-[#666]">{showViewModal.body}</p>
              </div>
              <StatusBadge status={showViewModal.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Audience Target</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.audience}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Deep Link</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.deepLink || "₹"}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Sent Count</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.sent}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Opened / Clicked</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.opened} / {showViewModal.clicked}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Scheduled At</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.scheduledAt || "₹"}</span>
              </div>
              <div>
                <span className="block text-xs font-bold text-[#999] uppercase">Sent At</span>
                <span className="font-semibold text-[#1a1a1a]">{showViewModal.sentAt || "₹"}</span>
              </div>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Edit Notification Drawer */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          editNotification ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setEditNotification(null)}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          editNotification ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Edit Push Notification
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">
              {editNotification?.title}
            </h2>
            <p className="text-[10px] text-[#999] mt-0.5">{editNotification?.id}</p>
          </div>
          <button
            onClick={() => setEditNotification(null)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            aria-label="Close edit panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Title</label>
            <input type="text" value={editForm.title || ""} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Body</label>
            <textarea rows={4} value={editForm.body || ""} onChange={(e) => setEditForm(f => ({ ...f, body: e.target.value }))} className="w-full rounded-xl border border-[#e8e8e8] bg-white px-3 py-2 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Audience</label>
              <select value={editForm.audience || ""} onChange={(e) => setEditForm(f => ({ ...f, audience: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                {["All Users", "Active Users", "New Users", "VIP Members", "Abandoned Carts"].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
              <select value={editForm.status || ""} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Sent Now</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Deep Link</label>
            <input type="text" value={editForm.deepLink || ""} onChange={(e) => setEditForm(f => ({ ...f, deepLink: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] bg-white px-6 py-4">
          <button onClick={() => setEditNotification(null)} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all">Cancel</button>
          <button onClick={handleEditSave} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </aside>
    </DashboardLayout>
  );
}

