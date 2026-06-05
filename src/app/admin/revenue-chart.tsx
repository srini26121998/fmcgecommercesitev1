"use client";

import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ChartContainer from "@/components/ui/chart-container";

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 7000 },
  { month: "Mar", revenue: 9000 },
  { month: "Apr", revenue: 12000 },
  { month: "May", revenue: 18000 },
];

export default function RevenueChart() {
  return (
    <div className="rounded-xl bg-white border border-[#e8e8e8] p-4 sm:p-6 shadow-sm h-[280px] sm:h-[320px] transition-all duration-200 hover:shadow-md">

      <div className="mb-4 sm:mb-6">
        <p className="text-xs font-bold text-[#0c831f] uppercase tracking-widest">
          Analytics
        </p>
        <h2 className="text-base sm:text-lg font-black text-[#1a1a1a] mt-1">
          Revenue Overview
        </h2>
      </div>

      <ChartContainer className="h-[75%]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#999" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#0c831f"
              strokeWidth={2.5}
              dot={{ fill: "#0c831f", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

    </div>
  );
}

