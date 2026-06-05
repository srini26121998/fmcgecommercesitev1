"use client";

import { useState, useCallback } from "react";
import { useApiKeys } from "@/hooks/use-settings";
import DashboardLayout from "../../dashboard-layout";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusablePagination from "@/components/ui/admin/reusable-pagination";
import { ReusablePageHeader } from "@/components/common";
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Globe,
  Clock,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-[#e8f5e9] text-[#0c831f]",
  expired: "bg-[#fef2f2] text-red-600",
  revoked: "bg-[#f6f7f6] text-[#999]",
};

const availablePermissions = [
  "orders.read", "orders.write",
  "products.read", "products.write",
  "delivery.read", "delivery.write",
  "reports.read",
  "customers.read",
  "inventory.read", "inventory.write",
  "vendors.read",
];

export default function ApiKeysPage() {
  const {
    keys,
    loading,
    error,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    pagination,
    setPage,
    setPageSize,
    activeCount,
    revokeKey,
    refresh,
  } = useApiKeys();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const [newKeyForm, setNewKeyForm] = useState({
    name: "",
    permissions: [] as string[],
    rateLimit: 1000,
    allowedIPs: "",
    expiresAt: "",
  });

  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setNewKeyForm({
      name: "",
      permissions: [],
      rateLimit: 1000,
      allowedIPs: "",
      expiresAt: "",
    });
    setCreatedKey(null);
  }, []);

  const handleCreateKey = useCallback(async () => {
    if (!newKeyForm.name.trim()) {
      toast.error("Key name is required");
      return;
    }
    // Simulate key creation for now
    const fakeKey = `fmcg_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 14)}`;
    setCreatedKey(fakeKey);
    toast.success("API key created successfully");
    // Refresh the list after creation
    setTimeout(() => {
      refresh();
      setShowCreateModal(false);
      resetForm();
    }, 1500);
  }, [newKeyForm, refresh, resetForm]);

  const handleCopyKey = useCallback((key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  }, []);

  const handleRevokeKey = useCallback(async (keyId: string) => {
    await revokeKey(keyId);
    toast.success("API key revoked successfully");
    setShowRevokeModal(null);
  }, [revokeKey]);

  const togglePermission = (perm: string) => {
    setNewKeyForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Settings"
          title="API Keys"
          subtitle="Manage API keys for external integrations, SDKs, and third-party services."
          actions={
            <div className="flex gap-2">
              <button
                onClick={refresh}
                className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => { resetForm(); setShowCreateModal(true); }}
                className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]"
              >
                <Plus className="h-4 w-4" />
                Create Key
              </button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-[#0c831f]" />
              <span className="text-xs text-[#666]">Total Keys</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">{pagination.total}</p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#2563eb]" />
              <span className="text-xs text-[#666]">Active</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">{activeCount}</p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#9333ea]" />
              <span className="text-xs text-[#666]">Avg Rate Limit</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">
              {keys.length > 0
                ? Math.round(keys.reduce((s, k) => s + k.rateLimit, 0) / keys.length).toLocaleString()
                : "₹"}
            </p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#d97706]" />
              <span className="text-xs text-[#666]">Total Usage</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">
              {keys.length > 0
                ? keys.reduce((s, k) => s + k.usageCount, 0).toLocaleString()
                : "₹"}
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <ReusableSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by key name or prefix..."
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm font-semibold text-[#666] focus:border-[#0c831f] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        {/* Keys Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Key className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-sm font-bold text-red-600">Failed to load API keys</p>
              <p className="mt-1 text-xs text-red-400">{error}</p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#0c831f] border-t-transparent" />
              <p className="mt-1.5 text-xs text-[#666]">Loading API keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f6f7f6]">
                <Key className="h-6 w-6 text-[#ccc]" />
              </div>
              <p className="text-sm font-bold text-[#666]">No API keys found</p>
              <p className="mt-1 text-xs text-[#999]">
                {search || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Create your first API key to get started."}
              </p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f9fafb] text-left text-[10px] font-black uppercase tracking-wide text-[#666]">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">API Key</th>
                    <th className="px-4 py-3">Permissions</th>
                    <th className="px-4 py-3">Rate Limit</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8]">
                  {keys.map((key) => (
                    <tr key={key.id} className="text-sm hover:bg-[#f9fafb] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f5e9]">
                            <Key className="h-3.5 w-3.5 text-[#0c831f]" />
                          </div>
                          <div>
                            <p className="font-bold text-[#1a1a1a]">{key.name}</p>
                            {key.prefix && (
                              <code className="text-[10px] font-mono text-[#999]">{key.prefix}*</code>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <code className="rounded bg-[#f6f7f6] px-2 py-1 text-[10px] font-mono text-[#666]">
                            {visibleKeys[key.id] ? key.key : `${key.key.slice(0, 12)}₹₹₹₹₹₹${key.key.slice(-4)}`}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="text-[#999] hover:text-[#1a1a1a]"
                          >
                            {visibleKeys[key.id] ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCopyKey(key.key)}
                            className="text-[#999] hover:text-[#0c831f]"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {key.permissions.slice(0, 3).map((p) => (
                            <span
                              key={p}
                              className="rounded bg-[#f6f7f6] px-1.5 py-0.5 text-[10px] font-mono text-[#666]"
                            >
                              {p}
                            </span>
                          ))}
                          {key.permissions.length > 3 && (
                            <span className="text-[10px] text-[#999]">+{key.permissions.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#666]">
                        {key.rateLimit.toLocaleString()}/hr
                      </td>
                      <td className="px-4 py-3 text-xs text-[#666]">
                        {key.usageCount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusColors[key.status]}`}>
                          {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px] text-[#999]">
                        {new Date(key.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCopyKey(key.key)}
                            className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]"
                            title="Copy key"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          {key.status === "active" && (
                            <button
                              onClick={() => setShowRevokeModal(key.id)}
                              className="rounded-lg bg-[#fef2f2] p-1.5 text-red-500 hover:bg-[#fee2e2]"
                              title="Revoke key"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <ReusablePagination
                page={pagination.page}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
              />
            </>
          )}
        </div>

        {/* Create Key Modal */}
        {showCreateModal && (
          <ReusableModal
            open={true}
            onClose={() => { setShowCreateModal(false); resetForm(); }}
            title={createdKey ? "API Key Created" : "Create New API Key"}
            size="lg"
          >
            {createdKey ? (
              <div className="space-y-4">
                <div className="rounded-xl bg-[#e8f5e9] p-4 text-center">
                  <Key className="mx-auto h-8 w-8 text-[#0c831f]" />
                  <p className="mt-2 text-sm font-bold text-[#0c831f]">API Key Created Successfully</p>
                  <p className="mt-1 text-xs text-[#666]">
                    Make sure to copy this key now. You won&apos;t be able to see it again.
                  </p>
                </div>
                <div className="relative">
                  <code className="block break-all rounded-xl bg-[#f6f7f6] p-4 text-sm font-mono text-[#1a1a1a]">
                    {createdKey}
                  </code>
                  <button
                    onClick={() => handleCopyKey(createdKey)}
                    className="absolute right-3 top-3 rounded-lg bg-white p-1.5 text-[#666] shadow-sm hover:text-[#0c831f]"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Key Name *</label>
                  <input
                    value={newKeyForm.name}
                    onChange={(e) => setNewKeyForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Production Gateway"
                    className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Permissions</label>
                  <div className="flex flex-wrap gap-2">
                    {availablePermissions.map((perm) => (
                      <label
                        key={perm}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                          newKeyForm.permissions.includes(perm)
                            ? "border-[#0c831f] bg-[#e8f5e9] text-[#0c831f]"
                            : "border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newKeyForm.permissions.includes(perm)}
                          onChange={() => togglePermission(perm)}
                          className="sr-only"
                        />
                        {perm}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#666]">Rate Limit (requests/hr)</label>
                    <input
                      type="number"
                      value={newKeyForm.rateLimit}
                      onChange={(e) => setNewKeyForm((f) => ({ ...f, rateLimit: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#666]">Expires At</label>
                    <input
                      type="date"
                      value={newKeyForm.expiresAt}
                      onChange={(e) => setNewKeyForm((f) => ({ ...f, expiresAt: e.target.value }))}
                      className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Allowed IPs (CIDR, one per line)</label>
                  <textarea
                    value={newKeyForm.allowedIPs}
                    onChange={(e) => setNewKeyForm((f) => ({ ...f, allowedIPs: e.target.value }))}
                    placeholder="103.25.48.0/24"
                    className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                    className="rounded-lg border border-[#e8e8e8] px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateKey}
                    disabled={!newKeyForm.name.trim()}
                    className="rounded-lg bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
                  >
                    Create Key
                  </button>
                </div>
              </div>
            )}
          </ReusableModal>
        )}

        {/* Revoke Confirmation Modal */}
        {showRevokeModal && (
          <ReusableModal
            open={true}
            onClose={() => setShowRevokeModal(null)}
            title="Revoke API Key"
            size="sm"
          >
            <div className="space-y-4">
              <div className="rounded-xl bg-[#fef2f2] p-4">
                <p className="text-sm text-red-600">
                  Are you sure you want to revoke this API key? This action cannot be undone.
                  Any services using this key will immediately lose access.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowRevokeModal(null)}
                  className="rounded-lg border border-[#e8e8e8] px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRevokeKey(showRevokeModal)}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600"
                >
                  Revoke Key
                </button>
              </div>
            </div>
          </ReusableModal>
        )}
      </div>
    </DashboardLayout>
  );
}

