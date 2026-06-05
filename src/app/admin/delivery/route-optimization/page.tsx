"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { Navigation, MapPin, Clock, Fuel, TrendingDown, Zap, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const routes = [
  { zone: "North Zone", deliveries: 28, distance: "45 km", time: "3.2 hrs", fuel: "2.1 L", status: "optimized", savings: "12%" },
  { zone: "South Zone", deliveries: 22, distance: "38 km", time: "2.8 hrs", fuel: "1.8 L", status: "optimized", savings: "8%" },
  { zone: "East Zone", deliveries: 35, distance: "52 km", time: "4.1 hrs", fuel: "2.6 L", status: "pending", savings: "₹" },
  { zone: "West Zone", deliveries: 18, distance: "32 km", time: "2.2 hrs", fuel: "1.5 L", status: "optimized", savings: "15%" },
  { zone: "Central Zone", deliveries: 15, distance: "28 km", time: "1.9 hrs", fuel: "1.3 L", status: "pending", savings: "₹" },
];

export default function RouteOptimizationPage() {
  const [optimizing, setOptimizing] = useState(false);

  const handleOptimizeAll = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      toast.success("All routes optimized successfully! Estimated 11% fuel savings.");
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Route Optimization</h1>
              <p className="mt-1.5 text-xs text-[#666]">Optimize delivery routes for maximum efficiency and minimum fuel consumption.</p>
            </div>
            <button
              onClick={handleOptimizeAll}
              disabled={optimizing}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${optimizing ? "animate-spin" : ""}`} />
              {optimizing ? "Optimizing..." : "Optimize All Routes"}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ReusableCard title="Total Routes" value="5" icon={<Navigation className="h-5 w-5" />} color="text-[#2563eb]" trend={{ value: "active zones", direction: "up" }} />
          <ReusableCard title="Total Deliveries" value="118" icon={<MapPin className="h-5 w-5" />} color="text-[#0c831f]" trend={{ value: "today", direction: "up" }} />
          <ReusableCard title="Avg Time/Route" value="2.8 hrs" icon={<Clock className="h-5 w-5" />} color="text-[#d97706]" trend={{ value: "target", direction: "down" }} />
          <ReusableCard title="Fuel Savings" value="11%" icon={<Fuel className="h-5 w-5" />} color="text-[#0c831f]" trend={{ value: "estimated", direction: "up" }} />
        </div>

        <div className="space-y-3">
          {routes.map((r) => (
            <div key={r.zone} className="rounded-xl border border-[#e8e8e8] bg-white p-4 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f5e9]">
                    <Navigation className="h-4 w-4 text-[#0c831f]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a]">{r.zone}</p>
                    <p className="text-xs text-[#666]">{r.deliveries} deliveries ₹ {r.distance}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 rounded-xl bg-[#f9fafb] p-3">
                <div>
                  <p className="text-[10px] text-[#999]">Est. Time</p>
                  <p className="flex items-center gap-1 text-xs font-bold text-[#1a1a1a]"><Clock className="h-3 w-3" /> {r.time}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#999]">Fuel Used</p>
                  <p className="flex items-center gap-1 text-xs font-bold text-[#1a1a1a]"><Fuel className="h-3 w-3" /> {r.fuel}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#999]">Savings</p>
                  <p className={`flex items-center gap-1 text-xs font-bold ${r.savings !== "₹" ? "text-[#0c831f]" : "text-[#999]"}`}>
                    <TrendingDown className="h-3 w-3" /> {r.savings !== "₹" ? r.savings : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

