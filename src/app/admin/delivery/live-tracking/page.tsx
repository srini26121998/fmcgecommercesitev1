"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { MapPin, Truck, Clock, Package, CheckCircle, Navigation } from "lucide-react";

const liveOrders = [
  { id: "ORD-003", customer: "Kavita Reddy", address: "Plot 42, Sector 12, Rohini", partner: "Rahul Verma", status: "out_for_delivery", distance: "1.2 km", eta: "8 min", items: 4 },
  { id: "ORD-004", customer: "Mohan Das", address: "House 7, Block C, GK II", partner: "Priya Mehta", status: "picked_up", distance: "2.5 km", eta: "15 min", items: 2 },
  { id: "ORD-005", customer: "Suman Joshi", address: "Apt 301, Tower 4, Dwarka", partner: "Amit Singh", status: "out_for_delivery", distance: "3.8 km", eta: "22 min", items: 6 },
  { id: "ORD-006", customer: "Deepak Sharma", address: "Shop 5, Market Complex, Malviya Nagar", partner: "Sunita Yadav", status: "out_for_delivery", distance: "0.8 km", eta: "5 min", items: 3 },
];

export default function LiveTrackingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
          <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Live Tracking</h1>
          <p className="mt-1.5 text-xs text-[#666]">Real-time tracking of active deliveries with partner locations and ETAs.</p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ReusableCard title="Active Deliveries" value="24" icon={<Truck className="h-5 w-5" />} color="text-[#0c831f]" trend={{ value: "today", direction: "up" }} />
          <ReusableCard title="Out for Delivery" value="18" icon={<Package className="h-5 w-5" />} color="text-[#2563eb]" trend={{ value: "currently", direction: "up" }} />
          <ReusableCard title="Avg ETA" value="12 min" icon={<Clock className="h-5 w-5" />} color="text-[#d97706]" trend={{ value: "improved", direction: "down" }} />
          <ReusableCard title="Delivered Today" value="342" icon={<CheckCircle className="h-5 w-5" />} color="text-[#0c831f]" trend={{ value: "so far", direction: "up" }} />
        </div>

        {/* Map Placeholder */}
        <div className="flex h-64 items-center justify-center rounded-2xl border border-[#e8e8e8] bg-[#f9fafb]">
          <div className="text-center">
            <MapPin className="mx-auto h-10 w-10 text-[#0c831f]" />
            <p className="mt-2 text-sm font-bold text-[#1a1a1a]">Live Map View</p>
            <p className="text-xs text-[#999]">Real-time delivery tracking map would render here</p>
          </div>
        </div>

        {/* Live Orders List */}
        <div className="space-y-3">
          <h3 className="text-sm font-black text-[#1a1a1a]">Active Deliveries</h3>
          {liveOrders.map((o) => (
            <div key={o.id} className="rounded-xl border border-[#e8e8e8] bg-white p-4 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8f5e9]">
                    <Truck className="h-4 w-4 text-[#0c831f]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#0c831f]">{o.id}</span>
                      <span className="text-sm font-bold text-[#1a1a1a]">{o.customer}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="text-xs text-[#999]">{o.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#0c831f]">{o.eta}</p>
                  <p className="text-[10px] text-[#999]">{o.distance}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-4 border-t border-[#e8e8e8] pt-2 text-xs text-[#666]">
                <span className="flex items-center gap-1"><Navigation className="h-3 w-3 text-[#2563eb]" /> {o.partner}</span>
                <span>{o.items} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

