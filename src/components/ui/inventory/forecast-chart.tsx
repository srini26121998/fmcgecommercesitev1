"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DemandForecast } from "@/types/inventory";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { AnimatedLoader } from "@/components/ui/animated-loader";

interface ForecastChartProps {
  forecasts: DemandForecast[];
  isLoading?: boolean;
}

function ForecastCard({ forecast }: { forecast: DemandForecast }) {
  const diff = forecast.predictedDemand - forecast.currentStock;
  const isUp = forecast.trend === "up";
  const isDown = forecast.trend === "down";
  const pctOfPredicted = forecast.predictedDemand > 0
    ? Math.min((forecast.currentStock / forecast.predictedDemand) * 100, 100)
    : 0;

  const barColor =
    diff < 0
      ? "bg-[#0c831f]" // overstocked
      : diff < forecast.currentStock * 0.3
      ? "bg-[#d97706]" // slightly under
      : "bg-[#dc2626]"; // critically under

  return (
    <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#1a1a1a] truncate">{forecast.product}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#666]">
            <span>
              Current: <span className="font-bold text-[#1a1a1a]">{forecast.currentStock}</span>
            </span>
            <span>
              Predicted:{" "}
              <span className="font-bold text-[#0c831f]">{forecast.predictedDemand}</span>
            </span>
            {forecast.confidence && (
              <span>
                Confidence:{" "}
                <span className="font-bold">{forecast.confidence}%</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <div className="flex items-center gap-1">
            {isUp ? (
              <TrendingUp className="h-4 w-4 text-[#0c831f]" />
            ) : isDown ? (
              <TrendingDown className="h-4 w-4 text-[#dc2626]" />
            ) : (
              <Minus className="h-4 w-4 text-[#d97706]" />
            )}
            <span
              className={`text-lg font-black ${
                diff >= 0 ? "text-[#dc2626]" : "text-[#0c831f]"
              }`}
            >
              {diff >= 0 ? "+" : ""}
              {diff}
            </span>
          </div>
          {forecast.nextOrderDate && (
            <p className="text-[10px] text-[#999] mt-0.5">Next order: {forecast.nextOrderDate}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] text-[#999]">
          <span>Stock vs Predicted Demand</span>
          <span>{pctOfPredicted.toFixed(0)}%</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#e8e8e8]">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pctOfPredicted}%` }}
          />
        </div>
      </div>

      {/* Confidence indicator */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-[10px] text-[#999]">
          <span>Forecast confidence</span>
          <span className="font-bold">{forecast.confidence}%</span>
        </div>
        <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-[#e8e8e8]">
          <div
            className={`h-full rounded-full ${
              forecast.confidence >= 85
                ? "bg-[#0c831f]"
                : forecast.confidence >= 70
                ? "bg-[#d97706]"
                : "bg-[#dc2626]"
            }`}
            style={{ width: `${forecast.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ForecastChart({ forecasts, isLoading }: ForecastChartProps) {
  if (isLoading) {
    return <AnimatedLoader text="Loading forecast data..." />;
  }

  if (forecasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f7f6]">
          <TrendingUp className="h-6 w-6 text-[#999]" />
        </div>
        <p className="text-sm font-bold text-[#666]">No forecast data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {forecasts.map((f) => (
        <ForecastCard key={f.id || f.product} forecast={f} />
      ))}
    </div>
  );
}
