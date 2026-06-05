"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { OrderTimelineCard } from "@/components/ui/orders/admin";
import { Clock, RefreshCw } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";

export default function TimelinePage() {
  const { orders, loading, error, search, setSearch, fetchOrders } = useOrders();

  const filteredOrders = useMemo(
    () => orders.filter((o) => o.timeline && o.timeline.length > 0),
    [orders]
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 p-2 sm:p-4">
          <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Orders</p>
            <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Order Timeline</h1>
            <p className="mt-1.5 text-xs text-[#666]">Loading timeline data...</p>
          </section>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-[#f6f7f6]" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Orders</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Order Timeline</h1>
              <p className="mt-1.5 text-xs text-[#666]">
                View the complete event timeline for each order from placement to delivery.
              </p>
            </div>
            <button onClick={fetchOrders} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </section>

        <ReusableSearchBar
          value={search}
          onChange={(v) => { setSearch(v); }}
          placeholder="Search by order ID or customer..."
        />

        {error && (
          <div className="rounded-xl bg-[#fef2f2] border border-[#fecaca] p-4">
            <p className="text-sm font-bold text-[#dc2626]">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f7f6]">
                <Clock className="h-6 w-6 text-[#999]" />
              </div>
              <p className="text-sm font-bold text-[#666]">No order timelines found</p>
              <p className="mt-1 text-xs text-[#999]">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderTimelineCard key={order.id} order={order} />
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

