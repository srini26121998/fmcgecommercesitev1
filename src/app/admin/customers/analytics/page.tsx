"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { useCustomerAnalytics } from "@/hooks/use-customers";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  RefreshCw, 
  AlertCircle, 
  Loader2,
  PieChart
} from "lucide-react";

export default function CustomerAnalyticsPage() {
  const { 
    purchaseBehavior, 
    metrics: apiMetrics, 
    cohortData, 
    acquisitionChannels, 
    loading, 
    error, 
    refresh 
  } = useCustomerAnalytics();

  const [period, setPeriod] = useState("30d");

  // ── Combine static card layout with dynamic analytics endpoints ──
  // ── Combine static card layout with dynamic analytics endpoints ──
  const dynamicMetrics = useMemo(() => {
    // Default values (no static fallback data, only placeholders)
    const base: {
      id: string;
      label: string;
      value: string;
      change: string | undefined;
      trend: "up" | "down" | undefined;
      icon: any;
      color: string;
      bg: string;
    }[] = [
      { id: "clv", label: "Customer Lifetime Value", value: "—", change: undefined, trend: undefined, icon: DollarSign, color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
      { id: "avg_orders", label: "Avg Orders Per Customer", value: "—", change: undefined, trend: undefined, icon: ShoppingCart, color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
      { id: "repeat_rate", label: "Repeat Purchase Rate", value: "—", change: undefined, trend: undefined, icon: TrendingUp, color: "text-[#9333ea]", bg: "bg-[#f3e8ff]" },
      { id: "avg_days", label: "Avg Days Between Orders", value: "—", change: undefined, trend: undefined, icon: Clock, color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
      { id: "churn_rate", label: "Customer Churn Rate", value: "—", change: undefined, trend: undefined, icon: TrendingDown, color: "text-[#ff4f8b]", bg: "bg-[#fff0f6]" },
      { id: "new_customers", label: "New Customers (MTD)", value: "—", change: undefined, trend: undefined, icon: Users, color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
    ];

    const formatCurrency = (val: any) => {
      if (typeof val === "number") {
        return `₹${val.toLocaleString("en-IN")}`;
      }
      return String(val);
    };

    const formatPercent = (val: any) => {
      if (typeof val === "number") {
        return `${val.toFixed(1)}%`;
      }
      if (typeof val === "string" && !val.includes("%")) {
        return `${val}%`;
      }
      return String(val);
    };

    // 1. Process main purchase behavior endpoint GET /api/v1/admin/customers/analytics
    if (purchaseBehavior) {
      // CLV
      const clv = purchaseBehavior.clv ?? purchaseBehavior.customerLifetimeValue ?? purchaseBehavior.behaviorMetrics?.clv;
      if (clv !== undefined && clv !== null) {
        base[0].value = formatCurrency(clv);
      }
      const clvChange = purchaseBehavior.clvChange ?? purchaseBehavior.behaviorMetrics?.clvChange ?? purchaseBehavior.customerLifetimeValueChange ?? purchaseBehavior.clvPercentageChange;
      if (clvChange !== undefined && clvChange !== null) base[0].change = String(clvChange);
      const clvTrend = purchaseBehavior.clvTrend ?? purchaseBehavior.behaviorMetrics?.clvTrend ?? purchaseBehavior.customerLifetimeValueTrend;
      if (clvTrend) base[0].trend = clvTrend;

      // Avg orders
      const avgOrders = purchaseBehavior.avgOrdersPerCustomer ?? purchaseBehavior.purchaseFrequency?.avgOrders ?? purchaseBehavior.purchaseFrequency;
      if (avgOrders !== undefined && avgOrders !== null) {
        base[1].value = typeof avgOrders === "number" ? avgOrders.toFixed(1) : String(avgOrders);
      }
      const avgOrdersChange = purchaseBehavior.avgOrdersChange ?? purchaseBehavior.purchaseFrequency?.avgOrdersChange ?? purchaseBehavior.avgOrdersPerCustomerChange;
      if (avgOrdersChange !== undefined && avgOrdersChange !== null) base[1].change = String(avgOrdersChange);
      const avgOrdersTrend = purchaseBehavior.avgOrdersTrend ?? purchaseBehavior.purchaseFrequency?.avgOrdersTrend ?? purchaseBehavior.avgOrdersPerCustomerTrend;
      if (avgOrdersTrend) base[1].trend = avgOrdersTrend;

      // Repeat Rate
      const repeatRate = purchaseBehavior.repeatPurchaseRate ?? purchaseBehavior.purchaseFrequency?.repeatRate ?? purchaseBehavior.repeatRate;
      if (repeatRate !== undefined && repeatRate !== null) {
        base[2].value = formatPercent(repeatRate);
      }
      const repeatRateChange = purchaseBehavior.repeatPurchaseRateChange ?? purchaseBehavior.purchaseFrequency?.repeatRateChange ?? purchaseBehavior.repeatRateChange;
      if (repeatRateChange !== undefined && repeatRateChange !== null) base[2].change = String(repeatRateChange);
      const repeatRateTrend = purchaseBehavior.repeatPurchaseRateTrend ?? purchaseBehavior.purchaseFrequency?.repeatRateTrend ?? purchaseBehavior.repeatRateTrend;
      if (repeatRateTrend) base[2].trend = repeatRateTrend;

      // Avg Days
      const avgDays = purchaseBehavior.avgDaysBetweenOrders ?? purchaseBehavior.purchaseFrequency?.avgIntervalDays ?? purchaseBehavior.avgIntervalDays;
      if (avgDays !== undefined && avgDays !== null) {
        base[3].value = `${avgDays} days`;
      }
      const avgDaysChange = purchaseBehavior.avgDaysChange ?? purchaseBehavior.purchaseFrequency?.avgIntervalDaysChange ?? purchaseBehavior.avgDaysBetweenOrdersChange;
      if (avgDaysChange !== undefined && avgDaysChange !== null) base[3].change = String(avgDaysChange);
      const avgDaysTrend = purchaseBehavior.avgDaysTrend ?? purchaseBehavior.purchaseFrequency?.avgIntervalDaysTrend ?? purchaseBehavior.avgDaysBetweenOrdersTrend;
      if (avgDaysTrend) base[3].trend = avgDaysTrend;

      // Churn
      const churn = purchaseBehavior.churnRate ?? purchaseBehavior.behaviorMetrics?.churnRate ?? purchaseBehavior.churn;
      if (churn !== undefined && churn !== null) {
        base[4].value = formatPercent(churn);
      }
      const churnChange = purchaseBehavior.churnChange ?? purchaseBehavior.behaviorMetrics?.churnChange ?? purchaseBehavior.churnRateChange;
      if (churnChange !== undefined && churnChange !== null) base[4].change = String(churnChange);
      const churnTrend = purchaseBehavior.churnTrend ?? purchaseBehavior.behaviorMetrics?.churnTrend ?? purchaseBehavior.churnRateTrend;
      if (churnTrend) base[4].trend = churnTrend;

      // New Customers
      const newCust = purchaseBehavior.newCustomers ?? purchaseBehavior.newCustomersMtd ?? purchaseBehavior.behaviorMetrics?.newCustomersMtd;
      if (newCust !== undefined && newCust !== null) {
        base[5].value = newCust.toLocaleString();
      }
      const newCustChange = purchaseBehavior.newCustomersChange ?? purchaseBehavior.behaviorMetrics?.newCustomersChange ?? purchaseBehavior.newCustomersMtdChange;
      if (newCustChange !== undefined && newCustChange !== null) base[5].change = String(newCustChange);
      const newCustTrend = purchaseBehavior.newCustomersTrend ?? purchaseBehavior.behaviorMetrics?.newCustomersTrend ?? purchaseBehavior.newCustomersMtdTrend;
      if (newCustTrend) base[5].trend = newCustTrend;
    }

    // 2. Override with elements from /metrics endpoint (for backward compatibility if populated)
    if (apiMetrics && apiMetrics.length > 0) {
      apiMetrics.forEach((m) => {
        const labelLower = m.label.toLowerCase();
        let targetIdx = -1;
        if (labelLower.includes("lifetime") || labelLower.includes("clv") || m.id === "clv") {
          targetIdx = 0;
        } else if (labelLower.includes("avg orders") || labelLower.includes("orders per") || m.id === "avg-orders") {
          targetIdx = 1;
        } else if (labelLower.includes("repeat") || labelLower.includes("purchase rate") || m.id === "repeat-rate") {
          targetIdx = 2;
        } else if (labelLower.includes("days between") || labelLower.includes("interval") || m.id === "avg-days") {
          targetIdx = 3;
        } else if (labelLower.includes("churn") || m.id === "churn-rate") {
          targetIdx = 4;
        } else if (labelLower.includes("new customers") || labelLower.includes("mtd") || m.id === "new-customers") {
          targetIdx = 5;
        }

        if (targetIdx !== -1) {
          if (m.value !== undefined && m.value !== null) {
            base[targetIdx].value = targetIdx === 0 && typeof m.value === "number" ? formatCurrency(m.value) : String(m.value);
          }
          if (m.change !== undefined && m.change !== null) base[targetIdx].change = m.change;
          if (m.trend === "up" || m.trend === "down" || m.trend === "stable") {
            base[targetIdx].trend = m.trend === "stable" ? "up" : m.trend;
          }
        }
      });
    }

    return base;
  }, [purchaseBehavior, apiMetrics]);

  // ── Process Cohort Acquisition Data ──
  const dynamicCohorts = useMemo(() => {
    const data = cohortData?.length > 0 ? cohortData : (purchaseBehavior?.cohortData || purchaseBehavior?.cohorts);
    if (!data || data.length === 0) {
      return [];
    }
    return data.map((c: any) => ({
      month: c.month,
      count: c.acquired ?? c.count ?? 0,
    }));
  }, [cohortData, purchaseBehavior]);

  const maxCohortCount = useMemo(() => {
    return Math.max(...dynamicCohorts.map((c: any) => c.count), 1);
  }, [dynamicCohorts]);

  // ── Process Cohort Average Retention Rates ──
  const dynamicRetention = useMemo(() => {
    const data = cohortData?.length > 0 ? cohortData : (purchaseBehavior?.cohortData || purchaseBehavior?.cohorts);
    if (!data || data.length === 0) {
      return [];
    }

    const maxMonths = Math.max(...data.map((c: any) => c.retentionRates?.length || 0));
    if (maxMonths === 0) {
      return [];
    }

    const result = [];
    for (let m = 0; m < maxMonths; m++) {
      let sum = 0;
      let count = 0;
      data.forEach((c: any) => {
        if (c.retentionRates && c.retentionRates[m] !== undefined) {
          sum += c.retentionRates[m];
          count++;
        }
      });
      result.push({
        month: `Month ${m + 1}`,
        rate: count > 0 ? Math.round(sum / count) : 0,
      });
    }
    return result.slice(0, 8); // Display first 8 months maximum
  }, [cohortData, purchaseBehavior]);

  // ── Process Acquisition Channels Data ──
  const dynamicAcquisition = useMemo(() => {
    const data = acquisitionChannels?.length > 0 ? acquisitionChannels : (purchaseBehavior?.acquisitionChannels || purchaseBehavior?.acquisition);
    if (!data || data.length === 0) {
      return [];
    }
    const colors = ["bg-[#0c831f]", "bg-[#2563eb]", "bg-[#9333ea]", "bg-[#ff4f8b]", "bg-[#d97706]", "bg-[#06b6d4]"];
    return data.map((ac: any, idx: number) => ({
      channel: ac.channel,
      count: ac.count ?? 0,
      percentage: Math.round(ac.percentage ?? 0),
      revenue: ac.revenue ?? 0,
      dotColor: ac.dotColor || colors[idx % colors.length],
    }));
  }, [acquisitionChannels, purchaseBehavior]);

  return (
    <DashboardLayout>
      <div className="space-y-5 p-3 sm:p-5">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c831f]/10 via-white to-white p-6 shadow-sm">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-[#0c831f]/5 blur-3xl" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#0c831f]">Customers & Cohorts</p>
              <h1 className="mt-1 text-2xl font-black text-[#1a1a1a] tracking-tight">Customer Analytics</h1>
              <p className="mt-1.5 text-xs text-[#666]">
                Deep-dive insights on purchase behavior, acquisition paths, cohort lifetimes, and user value.
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-center">
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-9 rounded-xl border border-[#e8e8e8] bg-white px-3 text-xs font-bold text-[#333] outline-none shadow-sm focus:border-[#0c831f]"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="ytd">Year to Date</option>
              </select>

              <button
                onClick={refresh}
                disabled={loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] bg-white text-[#333] transition-all hover:bg-[#f5f5f5] hover:text-[#0c831f] disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#0c831f]" : ""}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-600">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p>Failed to retrieve the latest live analytics.</p>
              <p className="font-normal mt-0.5 text-red-500/80">{error}</p>
            </div>
            <button 
              onClick={refresh} 
              className="rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-black text-white hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Overlay state for indicators */}
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/40 backdrop-blur-[1px] transition-all duration-300">
              <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-xl border border-[#e8e8e8]">
                <Loader2 className="h-7 w-7 animate-spin text-[#0c831f]" />
                <span className="text-xs font-bold text-[#666]">Refreshing Analytics...</span>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {dynamicMetrics.map((m) => {
              const isDown = m.trend === "down" || (m.change && String(m.change).startsWith("-"));
              const TrendIcon = isDown ? TrendingDown : TrendingUp;
              return (
                <div 
                  key={m.label} 
                  className={`relative overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white p-4 transition-all duration-300 hover:shadow-md hover:border-[#0c831f]/30`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#999]">{m.label}</span>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.bg}`}>
                      <m.icon className={`h-4 w-4 ${m.color}`} />
                    </div>
                  </div>
                  <p className="mt-3 text-xl font-black text-[#1a1a1a] tracking-tight">{m.value}</p>
                  {m.change && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        isDown ? "bg-red-50 text-[#ff4f8b]" : "bg-green-50 text-[#0c831f]"
                      }`}>
                        <TrendIcon className="h-2.5 w-2.5" />
                        {m.change}
                      </span>
                      <span className="text-[9px] text-[#999] font-medium">vs last month</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts and Data Breakdown Section */}
        {(dynamicCohorts.length > 0 || dynamicRetention.length > 0 || dynamicAcquisition.length > 0) && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Cohort Acquisition Chart */}
            {dynamicCohorts.length > 0 && (
              <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Cohorts</p>
                    <h3 className="text-sm font-black text-[#1a1a1a] mt-0.5">Customer Acquisition by Month</h3>
                  </div>
                  <span className="rounded-lg bg-green-50 px-2 py-1 text-[10px] font-bold text-[#0c831f]">Live Cohorts</span>
                </div>
                <div className="mt-5 space-y-4">
                  {dynamicCohorts.map((cohort: any) => {
                    const percent = (cohort.count / maxCohortCount) * 100;
                    return (
                      <div key={cohort.month} className="group flex items-center gap-3">
                        <span className="w-20 text-xs font-bold text-[#666] group-hover:text-[#1a1a1a] transition-colors">{cohort.month}</span>
                        <div className="flex-1 h-5 overflow-hidden rounded-full bg-[#f6f7f6]">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#0c831f] to-[#10b981] transition-all duration-1000 ease-out" 
                            style={{ width: `${percent}%` }} 
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-black text-[#1a1a1a]">{cohort.count.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cohort Retention Chart */}
            {dynamicRetention.length > 0 && (
              <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Retention</p>
                    <h3 className="text-sm font-black text-[#1a1a1a] mt-0.5">Cohort Retention Rates</h3>
                  </div>
                  <span className="rounded-lg bg-blue-50 px-2 py-1 text-[10px] font-bold text-[#2563eb]">Avg Rates</span>
                </div>
                <div className="mt-5 space-y-4">
                  {dynamicRetention.map((ret) => {
                    return (
                      <div key={ret.month} className="group flex items-center gap-3">
                        <span className="w-16 text-xs font-bold text-[#666] group-hover:text-[#1a1a1a] transition-colors">{ret.month}</span>
                        <div className="flex-1 h-5 overflow-hidden rounded-full bg-[#f6f7f6]">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-1000 ease-out" 
                            style={{ width: `${ret.rate}%` }} 
                          />
                        </div>
                        <span className="w-12 text-right text-xs font-black text-[#1a1a1a]">{ret.rate}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Acquisition Channels Premium Table */}
            {dynamicAcquisition.length > 0 && (
              <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm lg:col-span-2 transition-all hover:shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Acquisition Channels</p>
                    <h3 className="text-sm font-black text-[#1a1a1a] mt-0.5">Customer Source & Revenue Breakdown</h3>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-[#9333ea]">
                    <PieChart className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#e8e8e8] text-[#666] font-bold">
                        <th className="pb-3 text-[10px] uppercase tracking-wider">Channel</th>
                        <th className="pb-3 text-right text-[10px] uppercase tracking-wider">Customers</th>
                        <th className="pb-3 text-right text-[10px] uppercase tracking-wider">Percentage</th>
                        <th className="pb-3 text-right text-[10px] uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f5f5f5]">
                      {dynamicAcquisition.map((ch: any) => (
                        <tr key={ch.channel} className="hover:bg-[#fcfcfc] transition-colors group">
                          <td className="py-3 font-bold text-[#1a1a1a] flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${ch.dotColor} group-hover:scale-110 transition-transform`} />
                            {ch.channel}
                          </td>
                          <td className="py-3 text-right font-semibold text-[#666]">{ch.count.toLocaleString()}</td>
                          <td className="py-3 text-right font-black text-[#1a1a1a]">{ch.percentage}%</td>
                          <td className="py-3 text-right font-black text-[#0c831f]">₹{ch.revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
