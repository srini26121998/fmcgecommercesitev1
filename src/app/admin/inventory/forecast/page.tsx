"use client";

import { useMemo, useEffect } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableCard from "@/components/ui/admin/reusable-card";
import { TrendingUp, TrendingDown, Package, BarChart3, RefreshCw } from "lucide-react";
import { useDemandForecasts } from "@/hooks/use-inventory";
import ForecastChart from "@/components/ui/inventory/forecast-chart";
import { toast } from "sonner";

export default function ForecastPage() {
  const { forecasts, loading, error, refresh } = useDemandForecasts();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const kpis = useMemo(() => {
    const avgConfidence =
      forecasts.length > 0
        ? Math.round(forecasts.reduce((s, f) => s + f.confidence, 0) / forecasts.length)
        : 0;
    return {
      total: forecasts.length,
      avgConfidence: `${avgConfidence}%`,
      up: forecasts.filter((f) => f.trend === "up").length,
      down: forecasts.filter((f) => f.trend === "down").length,
    };
  }, [forecasts]);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Inventory</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Demand Forecast</h1>
              <p className="mt-1.5 text-xs text-[#666]">AI-powered demand forecasting for optimal stock planning and reorder scheduling.</p>
            </div>
            <button onClick={() => refresh()} className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Products Tracked" value={kpis.total} icon={<Package className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Avg Confidence" value={kpis.avgConfidence} icon={<BarChart3 className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Upward Trend" value={kpis.up} icon={<TrendingUp className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Downward Trend" value={kpis.down} icon={<TrendingDown className="h-4 w-4" />} color="text-[#ff4f8b]" bgColor="bg-[#fff0f6]" />
        </div>

        <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Forecast</p>
            <h3 className="text-sm font-black text-[#1a1a1a]">Predicted Demand vs Current Stock</h3>
          </div>
          <ForecastChart forecasts={forecasts} isLoading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
}

