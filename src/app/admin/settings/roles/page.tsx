"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { Shield, CheckCircle, XCircle, Plus, Eye } from "lucide-react";
import { toast } from "sonner";

const roles = [
  { id: "ROL-001", name: "Super Admin", users: 2, permissions: ["All Access"], description: "Full system access including settings and user management", protected: true },
  { id: "ROL-002", name: "Admin", users: 4, permissions: ["Dashboard", "Products", "Orders", "Customers"], description: "Operational admin with most features enabled", protected: false },
  { id: "ROL-003", name: "Manager", users: 8, permissions: ["Products", "Inventory", "Reports"], description: "Department-level management access", protected: false },
  { id: "ROL-004", name: "Operator", users: 15, permissions: ["Orders", "Delivery", "Support"], description: "Day-to-day operational tasks", protected: false },
  { id: "ROL-005", name: "Viewer", users: 6, permissions: ["Dashboard", "Reports (Read Only)"], description: "Read-only access to dashboards and reports", protected: false },
  { id: "ROL-006", name: "Finance", users: 3, permissions: ["Finance", "Reports", "Settlements"], description: "Financial operations and payout management", protected: false },
];

const allPermissions = [
  "Dashboard", "Products", "Inventory", "Orders", "Customers",
  "Promotions", "Reports", "Vendors", "Delivery", "Settings",
  "Finance", "User Management", "Audit Logs",
];

export default function RolesPage() {
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Settings</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Roles & Permissions</h1>
              <p className="mt-1.5 text-xs text-[#666]">Define roles and configure granular permissions for each role.</p>
            </div>
            <button onClick={() => setShowAddRole(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
              <Plus className="h-4 w-4" /> Create Role
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {roles.map((role) => (
            <div key={role.id} className="rounded-xl border border-[#e8e8e8] bg-white p-4 transition-all hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f5e9]">
                    <Shield className="h-4 w-4 text-[#0c831f]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#1a1a1a]">{role.name}</p>
                      {role.protected && <span className="rounded bg-[#fffbeb] px-1.5 py-0.5 text-[10px] font-bold text-[#d97706]">Protected</span>}
                    </div>
                    <p className="text-xs text-[#999]">{role.description}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#666]">{role.users} users</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {role.permissions.map((p) => (
                  <span key={p} className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    p === "All Access" ? "bg-purple-100 text-purple-700" : "bg-[#f6f7f6] text-[#666]"
                  }`}>{p}</span>
                ))}
              </div>
              <div className="mt-3 flex justify-end">
                <button className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Available Permissions Matrix */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-black text-[#1a1a1a]">Available Permissions</h3>
          <p className="mt-1 text-xs text-[#666]">These permissions can be assigned to any role.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {allPermissions.map((p) => (
              <span key={p} className="rounded-full bg-[#f6f7f6] px-3 py-1.5 text-xs font-semibold text-[#666]">{p}</span>
            ))}
          </div>
        </section>

        {showAddRole && (
          <ReusableModal open={true} onClose={() => setShowAddRole(false)} title="Create New Role" size="md">
            <div className="space-y-4">
              <input placeholder="Role name" className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]" />
              <textarea placeholder="Role description" className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]" rows={3} />
              <div>
                <p className="mb-2 text-xs font-bold text-[#666]">Assign Permissions</p>
                <div className="flex flex-wrap gap-2">
                  {allPermissions.map((p) => (
                    <label key={p} className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#e8e8e8] px-3 py-1.5 text-xs font-semibold hover:bg-[#f6f7f6]">
                      <input type="checkbox" className="accent-[#0c831f]" />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddRole(false)} className="rounded-lg border border-[#e8e8e8] px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
                <button className="rounded-lg bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]">Create Role</button>
              </div>
            </div>
          </ReusableModal>
        )}
      </div>
    </DashboardLayout>
  );
}

