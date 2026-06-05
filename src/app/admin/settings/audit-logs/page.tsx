"use client";

import { useAuditLogs } from "@/hooks/use-settings";
import DashboardLayout from "../../dashboard-layout";
import AuditLogTable from "@/components/settings/audit-log-table";
import { ReusablePageHeader } from "@/components/common";
import { History, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

export default function AuditLogsPage() {
  const {
    logs,
    loading,
    error,
    search,
    setSearch,
    actionFilter,
    setActionFilter,
    entityFilter,
    setEntityFilter,
    pagination,
    setPage,
    setPageSize,
    uniqueActions,
    uniqueEntities,
    refresh,
  } = useAuditLogs();

  const handleExport = () => {
    toast.success("Audit log export started. You will receive an email when ready.");
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Settings"
          title="Audit Logs"
          subtitle="Track all configuration changes, user activities, and system events with full audit trail."
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
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[#0c831f]" />
              <span className="text-xs text-[#666]">Total Events</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">{pagination.total}</p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-[#e8f5e9] flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-[#0c831f]" />
              </div>
              <span className="text-xs text-[#666]">Successful</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">
              {logs.filter((l) => l.status === "success").length}
            </p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-[#fef2f2] flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-red-500" />
              </div>
              <span className="text-xs text-[#666]">Failed</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">
              {logs.filter((l) => l.status === "failure").length}
            </p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-[#fffbeb] flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
              <span className="text-xs text-[#666]">Pending</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">
              {logs.filter((l) => l.status === "pending").length}
            </p>
          </div>
        </div>

        <AuditLogTable
          logs={logs}
          loading={loading}
          error={error}
          search={search}
          onSearchChange={setSearch}
          actionFilter={actionFilter}
          onActionFilterChange={setActionFilter}
          entityFilter={entityFilter}
          onEntityFilterChange={setEntityFilter}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          uniqueActions={uniqueActions}
          uniqueEntities={uniqueEntities}
        />
      </div>
    </DashboardLayout>
  );
}

