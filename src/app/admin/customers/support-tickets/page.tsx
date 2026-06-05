"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { MessageSquare, Eye, Reply, CheckCircle, Clock, AlertTriangle, RefreshCw, Filter, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useSupportTickets } from "@/hooks/use-customers";
import type { SupportTicket } from "@/types/customers";

export default function SupportTicketsPage() {
  const {
    tickets, loading, error, search, setSearch,
    statusFilter, setStatusFilter, priorityFilter, setPriorityFilter,
    pagination, summary, setPage, setPageSize, fetchTickets,
    updateTicketStatus, createTicket, updateTicket,
  } = useSupportTickets();
  const [showDetailModal, setShowDetailModal] = useState<SupportTicket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<SupportTicket | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  // Form states for Create
  const [createForm, setCreateForm] = useState({
    userId: 0,
    userName: "",
    userEmail: "",
    subject: "",
    description: "",
    status: "open",
    priority: "medium"
  });

  // Form states for Edit
  const [editForm, setEditForm] = useState({
    status: "",
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...createForm,
      userId: Number(createForm.userId)
    };
    const success = await createTicket(payload);
    if (success) {
      toast.success("Ticket created successfully");
      setShowCreateModal(false);
      setCreateForm({ userId: 0, userName: "", userEmail: "", subject: "", description: "", status: "open", priority: "medium" });
    }
  };

  const openEditModal = (ticket: SupportTicket) => {
    setEditForm({ status: ticket.status });
    setShowEditModal(ticket);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    const success = await updateTicket(showEditModal.id, editForm);
    if (success) {
      toast.success("Ticket updated successfully");
      setShowEditModal(null);
    }
  };

  const handleAssign = async (ticketId: string) => {
    setAssigning(ticketId);
    const success = await updateTicketStatus(ticketId, "in_progress", "Support Agent");
    if (success) {
      toast.success("Ticket assigned to Support Agent");
    } else {
      toast.error("Failed to assign ticket");
    }
    setAssigning(null);
  };

  const handleResolve = async (ticketId: string) => {
    const success = await updateTicketStatus(ticketId, "resolved");
    if (success) {
      toast.success("Ticket resolved");
    } else {
      toast.error("Failed to resolve ticket");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Customers</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Support Tickets</h1>
              <p className="mt-1.5 text-xs text-[#666]">Manage customer support requests, assign agents, and track resolution.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-1.5 rounded-xl bg-[#0c831f] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0a6a18]">
                <Plus className="h-3.5 w-3.5" /> Create Ticket
              </button>
              <button onClick={fetchTickets} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>
          </div>
        </section>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Open" value={summary.open} icon={<MessageSquare className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="In Progress" value={summary.inProgress} icon={<Clock className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Resolved" value={summary.resolved} icon={<CheckCircle className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Urgent" value={summary.urgent} icon={<AlertTriangle className="h-4 w-4" />} color="text-[#dc2626]" bgColor="bg-[#fef2f2]" />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search tickets by customer or subject..." />
          </div>
          <div className="flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none">
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0c831f] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-4 text-sm font-bold text-[#dc2626]">{error}</div>
        ) : (
          <>
            {/* Tickets Table */}
            <ReusableTable
              data={tickets}
              keyExtractor={(t: SupportTicket) => t.id}
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); }}
              columns={[
                { key: "id", header: "Ticket", width: "100px", render: (t: any) => <span className="font-semibold text-[#0c831f]">{t.id}</span> },
                { key: "customer", header: "Customer", render: (t: any) => (
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#1a1a1a]">{t.userName || t.customer}</span>
                    <span className="text-[10px] text-[#666]">{t.userEmail || t.email} {t.userId ? `(ID: ${t.userId})` : ''}</span>
                  </div>
                )},
                { key: "subject", header: "Subject", render: (t: any) => (
                  <div className="flex flex-col">
                    <span className="font-medium text-[#1a1a1a]">{t.subject}</span>
                    <span className="text-xs text-[#666] truncate max-w-[200px]" title={t.description}>{t.description}</span>
                  </div>
                )},
                { key: "priority", header: "Priority", width: "90px", render: (t: any) => <StatusBadge status={t.priority || "medium"} /> },
                { key: "status", header: "Status", width: "110px", render: (t: any) => <StatusBadge status={t.status || "open"} /> },
                { key: "createdAt", header: "Created", width: "130px", hideOnMobile: true, render: (t: any) => (
                  <span className="text-xs text-[#666]">{t.createdAt ? t.createdAt.split('T')[0] : '—'}</span>
                )},
              ]}
              actions={[
                { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (t: SupportTicket) => setShowDetailModal(t) },
                { label: "Edit", icon: <Pencil className="h-3.5 w-3.5" />, onClick: (t: SupportTicket) => openEditModal(t) },
                { label: "Assign", icon: <Reply className="h-3.5 w-3.5" />, onClick: (t: SupportTicket) => handleAssign(t.id), show: (t: SupportTicket) => t.status === "open" },
                { label: "Resolve", icon: <CheckCircle className="h-3.5 w-3.5" />, onClick: (t: SupportTicket) => handleResolve(t.id), show: (t: SupportTicket) => t.status === "in_progress" },
              ]}
            />

            {/* Empty State */}
            {!loading && !error && (!tickets || tickets.length === 0) && (
              <div className="rounded-2xl border border-[#e8e8e8] bg-white p-12 text-center">
                <MessageSquare className="mx-auto h-8 w-8 text-[#ccc]" />
                <p className="mt-2 text-sm font-bold text-[#666]">No tickets match your filters</p>
                <p className="mt-1 text-xs text-[#999]">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Ticket Detail Modal */}
      <ReusableModal open={!!showDetailModal} onClose={() => setShowDetailModal(null)} title={`${showDetailModal?.id} — ${showDetailModal?.subject}`} subtitle={showDetailModal?.customer} size="lg">
        {showDetailModal && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Customer", value: showDetailModal.customer },
                { label: "Email", value: showDetailModal.email },
                { label: "Priority", value: <StatusBadge status={showDetailModal.priority} /> },
                { label: "Status", value: <StatusBadge status={showDetailModal.status} /> },
                { label: "Assigned To", value: showDetailModal.assignedTo || <span className="text-[#999]">Unassigned</span> },
                { label: "Category", value: showDetailModal.category || "—" },
                { label: "Created", value: showDetailModal.createdAt },
                { label: "Updated", value: showDetailModal.updatedAt },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">{f.label}</p>
                  <div className="mt-1 text-sm font-bold text-[#1a1a1a]">{f.value as React.ReactNode}</div>
                </div>
              ))}
            </div>

            {showDetailModal.description && (
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#666]">Description</p>
                <p className="rounded-xl bg-[#f9fafb] p-3 text-sm text-[#1a1a1a]">{showDetailModal.description}</p>
              </div>
            )}

            {/* Messages */}
            {showDetailModal.messages && showDetailModal.messages.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#666]">Conversation</p>
                <div className="space-y-2">
                  {showDetailModal.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderRole === "customer" ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[80%] rounded-xl p-3 ${
                        msg.senderRole === "customer"
                          ? "bg-[#f6f7f6] text-[#1a1a1a]"
                          : msg.senderRole === "agent"
                          ? "bg-[#0c831f] text-white"
                          : "bg-[#fffbeb] text-[#1a1a1a]"
                      }`}>
                        <p className={`text-xs font-bold ${msg.senderRole === "agent" ? "text-white/80" : "text-[#666]"} mb-0.5`}>
                          {msg.sender}
                        </p>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-0.5 ${msg.senderRole === "agent" ? "text-white/60" : "text-[#999]"}`}>
                          {msg.createdAt.includes("T") ? msg.createdAt.split("T").join(" ") : msg.createdAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
              {showDetailModal.status === "open" && (
                <button onClick={() => { handleAssign(showDetailModal.id); }} className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-bold text-white hover:bg-[#1d4ed8]">
                  Assign & Reply
                </button>
              )}
              {showDetailModal.status === "in_progress" && (
                <button onClick={() => { handleResolve(showDetailModal.id); setShowDetailModal(null); }} className="rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]">
                  Mark Resolved
                </button>
              )}
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Create Ticket Modal */}
      <ReusableModal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Support Ticket" size="md">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#666]">User ID</label>
              <input required type="number" value={createForm.userId} onChange={(e) => setCreateForm({ ...createForm, userId: Number(e.target.value) })} className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 outline-none focus:border-[#0c831f]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#666]">User Name</label>
              <input required type="text" value={createForm.userName} onChange={(e) => setCreateForm({ ...createForm, userName: e.target.value })} className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 outline-none focus:border-[#0c831f]" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666]">User Email</label>
            <input required type="email" value={createForm.userEmail} onChange={(e) => setCreateForm({ ...createForm, userEmail: e.target.value })} className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 outline-none focus:border-[#0c831f]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666]">Subject</label>
            <input required type="text" value={createForm.subject} onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })} className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 outline-none focus:border-[#0c831f]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666]">Description</label>
            <textarea required value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} rows={3} className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 outline-none focus:border-[#0c831f]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#666]">Status</label>
              <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })} className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 outline-none focus:border-[#0c831f]">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#666]">Priority</label>
              <select value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })} className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 outline-none focus:border-[#0c831f]">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCreateModal(false)} className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]">Create Ticket</button>
          </div>
        </form>
      </ReusableModal>

      {/* Edit Ticket Modal */}
      <ReusableModal open={!!showEditModal} onClose={() => setShowEditModal(null)} title="Edit Support Ticket" size="sm">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#666]">Status</label>
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2 outline-none focus:border-[#0c831f]">
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowEditModal(null)} className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
            <button type="submit" className="rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]">Save Changes</button>
          </div>
        </form>
      </ReusableModal>
    </DashboardLayout>
  );
}

