"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { useDeliveryAnalytics } from "@/hooks/use-delivery";
import { PerformanceChart } from "@/components/delivery/performance-chart";
import {
  TrendingUp,
  Clock,
  DollarSign,
  MapPin,
  Truck,
  Package,
  Fuel,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function DeliveryAnalyticsPage() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const { analytics, loading, error, period, setPeriod, refresh } = useDeliveryAnalytics();

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Delivery Analytics</h1>
              <p className="mt-1.5 text-xs text-[#666]">Comprehensive analytics on delivery operations, zones, and trends.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as "7d" | "30d" | "90d")}
                className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={() => toast.success("Exporting analytics report...")}
                className="rounded-xl bg-[#0c831f] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0a6a18] transition-colors"
              >
                Export Report
              </button>
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e8e8e8] border-t-[#0c831f]" />
              <p className="text-sm font-bold text-[#666]">Loading analytics...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-[#dc2626]/20 bg-[#fef2f2] p-6 text-center">
            <XCircle className="mx-auto h-8 w-8 text-[#dc2626]" />
            <p className="mt-2 text-sm font-bold text-[#dc2626]">{error}</p>
          </div>
        )}

        {!loading && !error && analytics && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Total", value: analytics.summary.totalDeliveries.toLocaleString(), sub: "Deliveries", icon: <Package className="h-4 w-4" />, color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
                { label: "Successful", value: analytics.summary.successfulDeliveries.toLocaleString(), sub: `${((analytics.summary.successfulDeliveries / analytics.summary.totalDeliveries) * 100).toFixed(1)}%`, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
                { label: "On-Time", value: analytics.summary.onTimeDeliveries.toLocaleString(), sub: `${((analytics.summary.onTimeDeliveries / analytics.summary.totalDeliveries) * 100).toFixed(1)}%`, icon: <TrendingUp className="h-4 w-4" />, color: "text-[#059669]", bg: "bg-[#ecfdf5]" },
                { label: "Delayed", value: analytics.summary.delayedDeliveries.toLocaleString(), sub: `${((analytics.summary.delayedDeliveries / analytics.summary.totalDeliveries) * 100).toFixed(1)}%`, icon: <AlertTriangle className="h-4 w-4" />, color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
                { label: "Avg Time", value: analytics.summary.avgDeliveryTime, sub: `?${(analytics.summary.revenue / analytics.summary.totalDeliveries).toFixed(0)}/del`, icon: <Clock className="h-4 w-4" />, color: "text-[#9333ea]", bg: "bg-[#f3e8ff]" },
                { label: "Revenue", value: `?${(analytics.summary.revenue / 100000).toFixed(2)}L`, sub: `${analytics.summary.totalDistance}`, icon: <DollarSign className="h-4 w-4" />, color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
              ].map((stat) => (
                <div key={stat.label} className={`rounded-xl ${stat.bg} p-3`}>
                  <div className="flex items-center gap-1.5">
                    <span className={stat.color}>{stat.icon}</span>
                    <span className="text-[10px] font-bold text-[#666]">{stat.label}</span>
                  </div>
                  <p className={`mt-1 text-lg font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-[10px] text-[#999]">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Daily Trend Chart */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Trends</p>
              <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Daily Delivery Trend</h3>
              <PerformanceChart
                data={analytics.dailyTrend.map((d) => ({
                  label: d.date,
                  deliveries: d.deliveries,
                  onTime: d.onTime,
                }))}
                period={period}
                height={200}
              />
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Zone Performance */}
              <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Zones</p>
                <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Zone Performance</h3>
                <div className="space-y-3">
                  {analytics.zonePerformance.map((zone) => (
                    <button
                      key={zone.zone}
                      onClick={() => setSelectedZone(selectedZone === zone.zone ? null : zone.zone)}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${
                        selectedZone === zone.zone
                          ? "border-[#0c831f] bg-[#e8f5e9]"
                          : "border-[#e8e8e8] bg-[#f9fafb] hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className={`h-4 w-4 ${selectedZone === zone.zone ? "text-[#0c831f]" : "text-[#2563eb]"}`} />
                          <span className="text-sm font-bold text-[#1a1a1a]">{zone.zone}</span>
                        </div>
                        <span className={`text-xs font-bold ${
                          zone.onTimeRate >= 93 ? "text-[#0c831f]" :
                          zone.onTimeRate >= 90 ? "text-[#d97706]" : "text-[#dc2626]"
                        }`}>
                          {zone.onTimeRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#666]">
                        <span>{zone.deliveries} deliveries</span>
                        <span>{zone.avgTime} avg</span>
                        <span>{zone.partners} partners</span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="mt-2 h-1.5 rounded-full bg-[#e8e8e8] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            zone.onTimeRate >= 93 ? "bg-[#0c831f]" :
                            zone.onTimeRate >= 90 ? "bg-[#d97706]" : "bg-[#dc2626]"
                          }`}
                          style={{ width: `${zone.onTimeRate}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Hourly Distribution */}
              <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Timing</p>
                <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Hourly Delivery Distribution</h3>
                <div className="relative" style={{ height: 220 }}>
                  <div className="flex h-full items-end gap-1.5">
                    {analytics.hourlyDistribution.map((item) => {
                      const maxDeliveries = Math.max(...analytics.hourlyDistribution.map((h) => h.deliveries), 1);
                      const height = (item.deliveries / maxDeliveries) * 100;
                      return (
                        <div key={item.hour} className="group relative flex flex-1 flex-col items-center justify-end h-full">
                          <div
                            className="w-full rounded-t-sm bg-[#0c831f] transition-all group-hover:bg-[#0a6a18]"
                            style={{ height: `${height}%` }}
                          />
                          <span className="mt-1 text-[8px] font-bold text-[#999] rotate-90 sm:rotate-0 origin-left whitespace-nowrap">
                            {item.hour}
                          </span>
                          {/* Tooltip */}
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block z-10">
                            <div className="whitespace-nowrap rounded-lg bg-[#1a1a1a] px-2 py-1 text-[10px] text-white">
                              {item.hour}: {item.deliveries} deliveries
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <p className="mt-3 text-[10px] text-[#999]">
                  Peak delivery time:{" "}
                  <span className="font-bold text-[#1a1a1a]">
                    {analytics.hourlyDistribution.reduce((max, item) =>
                      item.deliveries > max.deliveries ? item : max
                    ).hour}
                  </span>
                  {" ₹ "}
                  {analytics.hourlyDistribution.reduce((sum, item) => sum + item.deliveries, 0).toLocaleString()} total
                </p>
              </section>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Status Distribution */}
              <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Status</p>
                <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Delivery Status Distribution</h3>
                <div className="space-y-3">
                  {analytics.statusDistribution.map((item) => {
                    const total = analytics.statusDistribution.reduce((s, i) => s + i.count, 0);
                    const percentage = total > 0 ? (item.count / total) * 100 : 0;
                    return (
                      <div key={item.status}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="font-bold text-[#1a1a1a] capitalize">{item.status}</span>
                          <span className="text-xs text-[#666]">{item.count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#f0f0f0] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${percentage}%`, backgroundColor: item.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Vehicle Utilization */}
              <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Fleet</p>
                <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Vehicle Utilization</h3>
                <div className="space-y-4">
                  {analytics.vehicleUtilization.map((vehicle) => {
                    const utilizationRate = vehicle.total > 0 ? (vehicle.active / vehicle.total) * 100 : 0;
                    return (
                      <div key={vehicle.type}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-[#0c831f]" />
                            <span className="text-sm font-bold text-[#1a1a1a]">{vehicle.type}</span>
                          </div>
                          <span className="text-xs font-bold text-[#666]">
                            {vehicle.active}/{vehicle.total} active
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#f0f0f0] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              utilizationRate >= 80 ? "bg-[#0c831f]" :
                              utilizationRate >= 60 ? "bg-[#d97706]" : "bg-[#dc2626]"
                            }`}
                            style={{ width: `${utilizationRate}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[#999] mt-0.5">{utilizationRate.toFixed(0)}% utilization</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Additional Metrics */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Metrics</p>
              <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Operational Metrics</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Total Distance", value: analytics.summary.totalDistance, icon: <MapPin className="h-5 w-5" /> },
                  { label: "Fuel Cost", value: `?${(analytics.summary.totalFuelCost / 1000).toFixed(1)}K`, icon: <Fuel className="h-5 w-5" /> },
                  { label: "Failed Rate", value: `${((analytics.summary.failedDeliveries / analytics.summary.totalDeliveries) * 100).toFixed(1)}%`, icon: <XCircle className="h-5 w-5" /> },
                  { label: "Avg Delivery", value: analytics.summary.avgDeliveryTime, icon: <Clock className="h-5 w-5" /> },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5e9] text-[#0c831f]">
                      {metric.icon}
                    </div>
                    <p className="mt-2 text-lg font-black text-[#1a1a1a]">{metric.value}</p>
                    <p className="text-xs font-bold text-[#666]">{metric.label}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

