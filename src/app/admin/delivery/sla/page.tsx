"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { useSLADashboard } from "@/hooks/use-delivery";
import { SLACard } from "@/components/delivery/sla-card";
import { PerformanceChart } from "@/components/delivery/performance-chart";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Activity,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const healthConfig = {
  good: {
    icon: CheckCircle2,
    label: "Good",
    color: "text-[#0c831f]",
    bg: "bg-[#e8f5e9]",
    desc: "All SLA targets are being met",
  },
  fair: {
    icon: AlertTriangle,
    label: "Fair",
    color: "text-[#d97706]",
    bg: "bg-[#fffbeb]",
    desc: "Some SLA targets need attention",
  },
  critical: {
    icon: XCircle,
    label: "Critical",
    color: "text-[#dc2626]",
    bg: "bg-[#fef2f2]",
    desc: "SLA targets are at risk of breach",
  },
};

export default function SLADashboardPage() {
  const { slaData, loading, error, refresh } = useSLADashboard();

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">SLA Dashboard</h1>
              <p className="mt-1.5 text-xs text-[#666]">
                Service Level Agreement monitoring and compliance tracking for delivery operations.
              </p>
            </div>
            <button
              onClick={() => {
                refresh();
                toast.success("SLA data refreshed");
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-xs font-bold text-[#666] hover:bg-[#f9fafb] transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e8e8e8] border-t-[#0c831f]" />
              <p className="text-sm font-bold text-[#666]">Loading SLA Dashboard...</p>
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

        {!loading && !error && slaData && (
          <>
            {/* Overall Health & Compliance Rate */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {/* Health Card */}
              <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm lg:col-span-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f] mb-3">Health</p>
                {(() => {
                  const health = healthConfig[slaData.overallHealth] || healthConfig.fair;
                  const HealthIcon = health.icon;
                  return (
                    <div className="text-center">
                      <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${health.bg}`}>
                        <HealthIcon className={`h-8 w-8 ${health.color}`} />
                      </div>
                      <p className={`mt-3 text-lg font-black ${health.color}`}>{health.label}</p>
                      <p className="text-xs text-[#666]">{health.desc}</p>
                    </div>
                  );
                })()}

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-[#f9fafb] p-3 text-center">
                    <p className="text-xl font-bold text-[#1a1a1a]">{slaData.slaComplianceRate.toFixed(1)}%</p>
                    <p className="text-[10px] font-bold text-[#666]">SLA Compliance Rate</p>
                  </div>
                  <div className="rounded-xl bg-[#fef2f2] p-3 text-center">
                    <p className="text-xl font-bold text-[#dc2626]">{slaData.criticalDelays}</p>
                    <p className="text-[10px] font-bold text-[#666]">Critical Delays</p>
                  </div>
                </div>
              </section>

              {/* Summary KPIs */}
              <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm lg:col-span-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f] mb-3">Summary</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Total Orders", value: slaData.totalOrders.toLocaleString(), icon: <Activity className="h-4 w-4" />, color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
                    { label: "On-Time", value: slaData.onTimeDeliveries.toLocaleString(), icon: <CheckCircle2 className="h-4 w-4" />, color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
                    { label: "Delayed", value: slaData.delayedDeliveries.toLocaleString(), icon: <AlertTriangle className="h-4 w-4" />, color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
                    { label: "Avg Delay", value: slaData.avgDelayTime, icon: <Clock className="h-4 w-4" />, color: "text-[#9333ea]", bg: "bg-[#f3e8ff]" },
                  ].map((stat) => (
                    <div key={stat.label} className={`rounded-xl ${stat.bg} p-3`}>
                      <div className="flex items-center gap-1.5">
                        <span className={stat.color}>{stat.icon}</span>
                        <span className="text-[10px] font-bold text-[#666]">{stat.label}</span>
                      </div>
                      <p className={`mt-1 text-lg font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Zone Compliance */}
                <div className="mt-4">
                  <p className="text-xs font-bold text-[#666] mb-2">Zone Compliance</p>
                  <div className="space-y-2">
                    {slaData.zoneCompliance.map((zone) => (
                      <div key={zone.zone}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-[#2563eb]" />
                            <span className="font-bold text-[#1a1a1a]">{zone.zone}</span>
                          </div>
                          <span className={`font-bold ${
                            zone.complianceRate >= 93 ? "text-[#0c831f]" :
                            zone.complianceRate >= 90 ? "text-[#d97706]" : "text-[#dc2626]"
                          }`}>
                            {zone.complianceRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${zone.complianceRate}%`, backgroundColor: zone.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Daily Compliance Trend */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Trend</p>
              <h3 className="text-sm font-black text-[#1a1a1a] mb-3">Daily SLA Compliance Rate</h3>
              <PerformanceChart
                data={slaData.dailyCompliance.map((d) => ({
                  label: d.date,
                  deliveries: 100,
                  onTime: Math.round(d.rate),
                }))}
                period="7d"
                height={200}
              />
            </section>

            {/* SLA Metrics Grid */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Metrics</p>
              <h3 className="text-sm font-black text-[#1a1a1a] mb-4">SLA Metrics by Zone</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {slaData.metrics.map((metric) => (
                  <SLACard key={metric.id} metric={metric} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

