"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { usePartnerPerformance } from "@/hooks/use-delivery";
import { PerformanceChart } from "@/components/delivery/performance-chart";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  DollarSign,
  MapPin,
  ThumbsUp,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function PartnerPerformancePage() {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const {
    performances,
    selectedPerformance,
    loading,
    error,
    period,
    setPeriod,
    topPerformers,
    refresh,
  } = usePartnerPerformance(selectedPartnerId);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Partner Performance</h1>
              <p className="mt-1.5 text-xs text-[#666]">Analyze delivery partner performance metrics, trends, and ratings.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e8e8e8] border-t-[#0c831f]" />
              <p className="text-sm font-bold text-[#666]">Loading performance data...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-[#dc2626]/20 bg-[#fef2f2] p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-[#dc2626]" />
            <p className="mt-2 text-sm font-bold text-[#dc2626]">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Top Performers */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Leaderboard</p>
              <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Top Performing Partners</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topPerformers.map((perf, idx) => (
                  <button
                    key={perf.partnerId}
                    onClick={() => setSelectedPartnerId(
                      selectedPartnerId === perf.partnerId ? null : perf.partnerId
                    )}
                    className={`rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                      selectedPartnerId === perf.partnerId
                        ? "border-[#0c831f] bg-[#e8f5e9]"
                        : "border-[#e8e8e8] bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-black ${
                        idx === 0 ? "bg-[#fef3c7] text-[#d97706]" :
                        idx === 1 ? "bg-[#f0f0f0] text-[#666]" :
                        idx === 2 ? "bg-[#fde68a]/50 text-[#b45309]" :
                        "bg-[#e8f5e9] text-[#0c831f]"
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1a1a1a] truncate">{perf.partnerName}</p>
                        <div className="flex items-center gap-2 text-xs text-[#666]">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-[#d97706] fill-current" />
                            {perf.avgRating.toFixed(1)}
                          </span>
                          <span>₹</span>
                          <span>{perf.totalDeliveries} deliveries</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-xs font-bold ${
                        perf.trend === "up" ? "text-[#0c831f]" :
                        perf.trend === "down" ? "text-[#dc2626]" : "text-[#666]"
                      }`}>
                        {perf.trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> :
                         perf.trend === "down" ? <TrendingDown className="h-3.5 w-3.5" /> : null}
                        {perf.onTimeRate.toFixed(1)}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Selected Partner Performance Detail */}
            {selectedPerformance && (
              <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Detail</p>
                <h3 className="text-sm font-black text-[#1a1a1a]">{selectedPerformance.partnerName} ₹ Performance</h3>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Deliveries", value: selectedPerformance.totalDeliveries, icon: <Clock className="h-4 w-4" />, color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
                    { label: "On-Time Rate", value: `${selectedPerformance.onTimeRate.toFixed(1)}%`, icon: <TrendingUp className="h-4 w-4" />, color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
                    { label: "Avg Rating", value: selectedPerformance.avgRating.toFixed(1), icon: <Star className="h-4 w-4" />, color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
                    { label: "Earnings", value: `?${(selectedPerformance.totalEarnings / 1000).toFixed(1)}K`, icon: <DollarSign className="h-4 w-4" />, color: "text-[#9333ea]", bg: "bg-[#f3e8ff]" },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-xl ${stat.bg} p-3`}>
                      <div className="flex items-center gap-2">
                        <span className={stat.color}>{stat.icon}</span>
                        <span className="text-[10px] font-bold text-[#666]">{stat.label}</span>
                      </div>
                      <p className={`mt-1 text-lg font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-3">
                    <p className="flex items-center gap-1 text-[10px] text-[#999]"><Clock className="h-3 w-3" /> Avg Time</p>
                    <p className="text-sm font-black text-[#1a1a1a]">{selectedPerformance.avgDeliveryTime}</p>
                  </div>
                  <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-3">
                    <p className="flex items-center gap-1 text-[10px] text-[#999]"><ThumbsUp className="h-3 w-3" /> Complaints</p>
                    <p className="text-sm font-black text-[#1a1a1a]">{selectedPerformance.customerComplaints}</p>
                  </div>
                  <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-3">
                    <p className="flex items-center gap-1 text-[10px] text-[#999]"><MapPin className="h-3 w-3" /> Distance</p>
                    <p className="text-sm font-black text-[#1a1a1a]">{selectedPerformance.distanceCovered}</p>
                  </div>
                  <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-3">
                    <p className="flex items-center gap-1 text-[10px] text-[#999]"><TrendingUp className="h-3 w-3" /> On-Time</p>
                    <p className="text-sm font-black text-[#1a1a1a]">{selectedPerformance.onTimeDeliveries}/{selectedPerformance.totalDeliveries}</p>
                  </div>
                </div>

                {/* Performance Chart */}
                {selectedPerformance.chart.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-[#666] mb-2">Weekly Trend</p>
                    <PerformanceChart
                      data={selectedPerformance.chart}
                      period={period}
                      height={180}
                    />
                  </div>
                )}
              </section>
            )}

            {/* All Partners Performance Table */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">All Partners</p>
              <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Performance Summary</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e8e8]">
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wide text-[#999]">Partner</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wide text-[#999]">Deliveries</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wide text-[#999]">On-Time</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wide text-[#999]">Avg Time</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wide text-[#999]">Rating</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wide text-[#999]">Earnings</th>
                      <th className="pb-3 text-[10px] font-bold uppercase tracking-wide text-[#999]">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performances.map((perf) => (
                      <tr
                        key={perf.partnerId}
                        className="border-b border-[#e8e8e8] last:border-0 cursor-pointer hover:bg-[#f9fafb] transition-colors"
                        onClick={() => setSelectedPartnerId(
                          selectedPartnerId === perf.partnerId ? null : perf.partnerId
                        )}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5e9] text-xs font-bold text-[#0c831f]">
                              {perf.partnerName.charAt(0)}
                            </div>
                            <span className="font-bold text-[#1a1a1a]">{perf.partnerName}</span>
                          </div>
                        </td>
                        <td className="py-3 font-bold">{perf.totalDeliveries}</td>
                        <td className="py-3">
                          <span className={`font-bold ${
                            perf.onTimeRate >= 95 ? "text-[#0c831f]" :
                            perf.onTimeRate >= 90 ? "text-[#d97706]" : "text-[#dc2626]"
                          }`}>
                            {perf.onTimeRate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3 text-[#666]">{perf.avgDeliveryTime}</td>
                        <td className="py-3">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-[#d97706] fill-current" />
                            {perf.avgRating.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-[#0c831f]">?{(perf.totalEarnings / 1000).toFixed(1)}K</td>
                        <td className="py-3">
                          <span className={`flex items-center gap-1 text-xs font-bold ${
                            perf.trend === "up" ? "text-[#0c831f]" :
                            perf.trend === "down" ? "text-[#dc2626]" : "text-[#666]"
                          }`}>
                            {perf.trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> :
                             perf.trend === "down" ? <TrendingDown className="h-3.5 w-3.5" /> :
                             <span className="h-3.5 w-3.5 flex items-center justify-center">₹</span>}
                            {perf.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {performances.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-sm text-[#999]">No performance data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

