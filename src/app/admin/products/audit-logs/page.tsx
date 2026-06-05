"use client";

import DashboardLayout from "../../dashboard-layout";
import AuditTimeline from "@/components/ui/products/admin/audit-timeline";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import { useAuditLogs } from "@/hooks/use-products";
import { RefreshCw } from "lucide-react";

export default function AuditLogsPage() {
  const {
    logs,
    pagination,
    loading,
    error,
    search,
    setSearch,
    actionFilter,
    setActionFilter,
    fetchLogs,
    setPage,
    setPageSize,
  } = useAuditLogs();

  const filteredLogs = logs;

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Products</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Audit Logs</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                Track all product changes including price updates, stock adjustments, and status changes. {pagination.total} total entries.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
              >
                <option value="">All Actions</option>
                <option value="Product Created">Created</option>
                <option value="Price Updated">Price Updated</option>
                <option value="Stock Adjusted">Stock Adjusted</option>
                <option value="Status Changed">Status Changed</option>
                <option value="Product Deleted">Deleted</option>
              </select>
              <button
                onClick={fetchLogs}
                className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </section>

        <ReusableSearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search by product or action..."
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            {error}
          </div>
        )}

        <AuditTimeline entries={filteredLogs} isLoading={loading} />

        {/* Pagination */}
        {pagination.total > pagination.pageSize && (
          <div className="flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-white px-4 py-3">
            <span className="text-xs text-[#666]">
              Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] transition hover:bg-[#f6f7f6] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className="rounded-lg border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] transition hover:bg-[#f6f7f6] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

