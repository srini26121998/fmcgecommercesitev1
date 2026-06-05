"use client";

import { useCallback } from "react";
import { useSystemConfigs } from "@/hooks/use-settings";
import DashboardLayout from "../../dashboard-layout";
import ConfigForm from "@/components/settings/config-form";
import { ReusablePageHeader } from "@/components/common";
import type { UpdateConfigFormData } from "@/types/settings";

export default function SystemConfigurationsPage() {
  const {
    configs,
    loading,
    error,
    categoryFilter,
    setCategoryFilter,
    search,
    setSearch,
    updateConfig,
    refresh,
  } = useSystemConfigs();

  const handleUpdate = useCallback(
    async (key: string, value: string | number | boolean): Promise<boolean> => {
      return updateConfig({ key, value } as UpdateConfigFormData);
    },
    [updateConfig]
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Settings"
          title="System Configurations"
          subtitle="Manage system-wide settings, security policies, performance tuning, and integrations."
          actions={
            <button
              onClick={refresh}
              className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          }
        />

        <ConfigForm
          configs={configs}
          loading={loading}
          error={error}
          onUpdate={handleUpdate}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          search={search}
          onSearchChange={setSearch}
        />
      </div>
    </DashboardLayout>
  );
}

