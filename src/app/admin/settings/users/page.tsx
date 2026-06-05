"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { Users, UserPlus, Shield, Edit3, Trash2, Eye } from "lucide-react";

const users = [
  { id: "USR-001", name: "Admin User", email: "admin@blinkit-like.com", role: "super_admin", team: "Management", status: "active", lastLogin: "2026-05-21 14:30", mfa: true },
  { id: "USR-002", name: "Rohit Sharma", email: "rohit@blinkit-like.com", role: "admin", team: "Operations", status: "active", lastLogin: "2026-05-21 12:15", mfa: true },
  { id: "USR-003", name: "Priya Patel", email: "priya@blinkit-like.com", role: "manager", team: "Inventory", status: "active", lastLogin: "2026-05-21 10:00", mfa: false },
  { id: "USR-004", name: "Amit Kumar", email: "amit@blinkit-like.com", role: "operator", team: "Orders", status: "active", lastLogin: "2026-05-20 16:45", mfa: false },
  { id: "USR-005", name: "Neha Singh", email: "neha@blinkit-like.com", role: "viewer", team: "Finance", status: "inactive", lastLogin: "2026-05-15 09:30", mfa: false },
];

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  manager: "bg-green-100 text-green-700",
  operator: "bg-amber-100 text-amber-700",
  viewer: "bg-gray-100 text-gray-700",
};

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Settings</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">User Management</h1>
              <p className="mt-1.5 text-xs text-[#666]">Manage admin users, roles, and access permissions.</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
              <UserPlus className="h-4 w-4" /> Add User
            </button>
          </div>
        </section>

        <ReusableSearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />

        <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] text-left text-[10px] font-black uppercase tracking-wide text-[#666]">
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">MFA</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Login</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              {filtered.map((u) => (
                <tr key={u.id} className="text-sm hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 font-bold text-[#0c831f]">{u.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0c831f] text-[10px] font-bold text-white">
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-bold text-[#1a1a1a]">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#666]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${roleColors[u.role]}`}>
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#666]">{u.team}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold ${u.mfa ? "text-[#0c831f]" : "text-[#999]"}`}>{u.mfa ? "Enabled" : "Disabled"}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-xs text-[#999]">{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]"><Eye className="h-4 w-4" /></button>
                      <button className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]"><Edit3 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddModal && (
          <ReusableModal open={true} onClose={() => setShowAddModal(false)} title="Add User" size="md">
            <div className="space-y-4">
              <input placeholder="Full name" className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]" />
              <input placeholder="Email address" className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]" />
              <select className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]">
                <option>Select Role</option>
                <option>Super Admin</option>
                <option>Admin</option>
                <option>Manager</option>
                <option>Operator</option>
                <option>Viewer</option>
              </select>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddModal(false)} className="rounded-lg border border-[#e8e8e8] px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
                <button className="rounded-lg bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]">Add User</button>
              </div>
            </div>
          </ReusableModal>
        )}
      </div>
    </DashboardLayout>
  );
}

