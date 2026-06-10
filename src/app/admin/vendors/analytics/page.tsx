"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableCard from "@/components/ui/admin/reusable-card";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { TrendingUp, DollarSign, Package, Star, ShoppingBag, Activity, Eye } from "lucide-react";

const vendorAnalytics = [
  { vendor: "Fresh Farms Ltd.", totalSales: 45800, orders: 234, products: 12, rating: 4.5, returns: 8, growth: "+12.3%" },
  { vendor: "Daily Dairy Co.", totalSales: 76200, orders: 412, products: 8, rating: 4.8, returns: 5, growth: "+18.7%" },
  { vendor: "Spice World", totalSales: 28400, orders: 156, products: 25, rating: 4.2, returns: 12, growth: "+5.1%" },
  { vendor: "Organic Harvest", totalSales: 12300, orders: 67, products: 6, rating: 4.6, returns: 2, growth: "+22.4%" },
  { vendor: "Baker's Delight", totalSales: 18900, orders: 98, products: 15, rating: 4.4, returns: 6, growth: "+8.9%" },
];

export default function VendorAnalyticsPage() {
  const [search, setSearch] = useState("");
  const filtered = vendorAnalytics.filter(v => !search || v.vendor.toLowerCase().includes(search.toLowerCase()));

  const totalSales = filtered.reduce((s, v) => s + v.totalSales, 0);
  const totalOrders = filtered.reduce((s, v) => s + v.orders, 0);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Vendors</p>
          <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Vendor Analytics</h1>
          <p className="mt-1.5 text-xs text-[#666]">Performance metrics across all vendors on the platform.</p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ReusableCard title="Total Sales" value={`₹${totalSales.toLocaleString()}`} icon={<DollarSign className="h-5 w-5" />} color="text-[#0c831f]" trend={{ value: "vs last month", direction: "up" }} />
          <ReusableCard title="Total Orders" value={totalOrders.toString()} icon={<ShoppingBag className="h-5 w-5" />} color="text-[#2563eb]" trend={{ value: "vs last month", direction: "up" }} />
          <ReusableCard title="Active Vendors" value={filtered.length.toString()} icon={<Star className="h-5 w-5" />} color="text-[#9333ea]" trend={{ value: "on platform", direction: "up" }} />
          <ReusableCard title="Avg Rating" value="4.5 ?" icon={<Activity className="h-5 w-5" />} color="text-[#d97706]" trend={{ value: "overall", direction: "up" }} />
        </div>

        <ReusableSearchBar value={search} onChange={setSearch} placeholder="Search vendors..." />

        <div className="space-y-3">
          {filtered.map((v) => (
            <div key={v.vendor} className="rounded-xl border border-[#e8e8e8] bg-white p-4 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1a1a1a]">{v.vendor}</span>
                    <span className="flex items-center gap-0.5 rounded bg-[#fffbeb] px-2 py-0.5 text-xs font-bold text-[#d97706]">
                      <Star className="h-3 w-3 fill-current" /> {v.rating}
                    </span>
                    <span className="rounded bg-[#e8f5e9] px-2 py-0.5 text-xs font-bold text-[#0c831f]">{v.growth}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#666]">
                    <span>₹{v.totalSales.toLocaleString()} sales</span>
                    <span>{v.orders} orders</span>
                    <span>{v.products} products</span>
                    <span>{v.returns} returns ({((v.returns / v.orders) * 100).toFixed(1)}% return rate)</span>
                  </div>
                </div>
                <button className="rounded-lg bg-[#f6f7f6] p-2 text-[#666] hover:bg-[#e8e8e8]">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              {/* Mini bar chart */}
              <div className="mt-3 flex h-2 gap-1">
                {[v.totalSales / 1000, v.orders / 10, v.products * 10, v.rating * 50].map((val, i) => (
                  <div key={i} className="flex-1 rounded-full bg-[#e8e8e8]">
                    <div className="h-full rounded-full bg-[#0c831f] transition-all" style={{ width: `${Math.min(100, val)}%` }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

