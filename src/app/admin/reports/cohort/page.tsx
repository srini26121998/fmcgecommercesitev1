"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableCard from "@/components/ui/admin/reusable-card";
import { ReusablePageHeader, ReusableChart } from "@/components/common";
import { useCohortData } from "@/hooks/use-reports";
import { Users, TrendingUp, Activity, Target, ChevronRight, Info } from "lucide-react";

export default function CohortAnalysisPage() {
  const { data, loading, error, summary, meta, goToPage, changePageSize } = useCohortData();
  const [selectedCohort, setSelectedCohort] = useState<string | null>(null);

  const weekLabels = ["Week 0", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7", "Week 8", "Week 9", "Week 10", "Week 11"];

  const getRetentionColor = (value: number): string => {
    if (value >= 40) return "bg-[#0c831f]";
    if (value >= 30) return "bg-[#16a34a]";
    if (value >= 20) return "bg-[#eab308]";
    if (value >= 10) return "bg-[#f97316]";
    return "bg-[#ef4444]";
  };

  const getRetentionBg = (value: number): string => {
    if (value >= 40) return "bg-[#0c831f]/10";
    if (value >= 30) return "bg-[#16a34a]/10";
    if (value >= 20) return "bg-[#eab308]/10";
    if (value >= 10) return "bg-[#f97316]/10";
    return "bg-[#ef4444]/10";
  };

  const selectedCohortData = useMemo(
    () => data.find((c) => c.id === selectedCohort),
    [data, selectedCohort]
  );

  const allWeeks = useMemo(
    () => data.map((c) => [c.week0, c.week1, c.week2, c.week3, c.week4, c.week5, c.week6, c.week7, c.week8, c.week9, c.week10, c.week11]),
    [data]
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="Cohort Analysis"
          subtitle="User retention cohorts ₹ track how different customer groups engage over time."
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Cohorts" value={summary?.totalCohorts ?? 0} icon={<Users className="h-5 w-5" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Total Users" value={(summary?.totalUsers ?? 0).toLocaleString()} icon={<Activity className="h-5 w-5" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Avg Retention (W1)" value={summary ? `${summary.avgRetentionWeek1}%` : "₹"} icon={<TrendingUp className="h-5 w-5" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Avg Retention (W4)" value={summary ? `${summary.avgRetentionWeek4}%` : "₹"} icon={<Target className="h-5 w-5" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        <ReusableChart title="Cohort Retention Table" subtitle="Weekly retention rates by cohort group (%)" height={420}>
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e8e8e8] border-t-[#0c831f]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-[#e8e8e8]">
                    <th className="sticky left-0 z-10 bg-white px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-wide text-[#666]">Cohort</th>
                    <th className="px-2 py-2.5 text-[10px] font-black uppercase tracking-wide text-[#666]">Users</th>
                    {weekLabels.map((label, i) => (
                      <th key={label} className={`px-2 py-2.5 text-[10px] font-black uppercase tracking-wide text-[#666] ${i > 0 ? "hidden md:table-cell" : ""}`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8e8e8]">
                  {data.map((cohort) => {
                    const weeks = [cohort.week0, cohort.week1, cohort.week2, cohort.week3, cohort.week4, cohort.week5, cohort.week6, cohort.week7, cohort.week8, cohort.week9, cohort.week10, cohort.week11];
                    return (
                      <tr
                        key={cohort.id}
                        className={`cursor-pointer transition-colors hover:bg-[#f6f7f6] ${selectedCohort === cohort.id ? "bg-[#e8f5e9]" : ""}`}
                        onClick={() => setSelectedCohort(selectedCohort === cohort.id ? null : cohort.id)}
                      >
                        <td className="sticky left-0 z-10 bg-white px-3 py-2 text-left">
                          <div className="flex items-center gap-1.5">
                            <ChevronRight className={`h-3 w-3 text-[#999] transition-transform ${selectedCohort === cohort.id ? "rotate-90" : ""}`} />
                            <span className="font-bold text-[#1a1a1a]">{cohort.cohort}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 font-bold text-[#1a1a1a]">{cohort.users}</td>
                        {weeks.map((val, wi) => (
                          <td key={wi} className={`px-2 py-2 ${wi > 0 ? "hidden md:table-cell" : ""}`}>
                            {val > 0 ? (
                              <div className="flex items-center justify-center gap-1">
                                <div className={`h-2.5 w-2.5 rounded-sm ${getRetentionColor(val)}`} />
                                <span className={`font-bold ${val >= 20 ? "text-[#1a1a1a]" : "text-[#999]"}`}>{val}%</span>
                              </div>
                            ) : (
                              <span className="text-[#ccc]">₹</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ReusableChart>

        {selectedCohortData && (
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#1a1a1a]">{selectedCohortData.cohort} ₹ Retention Detail</h3>
              <div className="flex items-center gap-1 text-[10px] text-[#999]">
                <Info className="h-3 w-3" />
                <span>{selectedCohortData.users} users in cohort</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">
              {weekLabels.map((label, i) => {
                const weeks = [selectedCohortData.week0, selectedCohortData.week1, selectedCohortData.week2, selectedCohortData.week3, selectedCohortData.week4, selectedCohortData.week5, selectedCohortData.week6, selectedCohortData.week7, selectedCohortData.week8, selectedCohortData.week9, selectedCohortData.week10, selectedCohortData.week11];
                const val = weeks[i];
                return (
                  <div key={label} className={`rounded-lg p-3 text-center ${getRetentionBg(val)}`}>
                    <p className="text-[10px] font-bold text-[#666]">{label}</p>
                    <p className={`mt-1 text-lg font-black ${val >= 20 ? "text-[#1a1a1a]" : "text-[#999]"}`}>
                      {val > 0 ? `${val}%` : "₹"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {meta.total > meta.pageSize && (
          <div className="flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-white px-4 py-3">
            <span className="text-xs text-[#666]">
              Showing {meta.pageSize} of {meta.total} cohorts
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={meta.page <= 1}
                onClick={() => goToPage(meta.page - 1)}
                className="rounded-lg border border-[#e8e8e8] px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6] disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs font-bold text-[#1a1a1a]">{meta.page} of {meta.totalPages}</span>
              <button
                disabled={meta.page >= meta.totalPages}
                onClick={() => goToPage(meta.page + 1)}
                className="rounded-lg border border-[#e8e8e8] px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6] disabled:opacity-40"
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

