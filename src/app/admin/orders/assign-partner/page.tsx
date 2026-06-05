"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { AssignPartnerModal } from "@/components/ui/orders/admin";
import { Truck, UserPlus, MapPin, RefreshCw } from "lucide-react";
import { useUnassignedOrders, useDeliveryPartners } from "@/hooks/use-orders";
import type { Order } from "@/types/orders";

export default function AssignPartnerPage() {
  const {
    orders,
    loading,
    search,
    setSearch,
    setPage,
    filterType,
    setFilterType,
    unassignedCount,
    assignedCount,
    fetchOrders,
  } = useUnassignedOrders();
  const { partners, onlineCount, zones, fetchPartners } = useDeliveryPartners();
  const [showAssignModal, setShowAssignModal] = useState<Order | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Orders</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Assign Delivery Partner</h1>
              <p className="mt-1.5 text-xs text-[#666]">Assign delivery partners to orders based on zone and availability.</p>
            </div>
            <button onClick={() => { fetchOrders(); fetchPartners(); }} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Unassigned" value={unassignedCount} icon={<Truck className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Available Partners" value={onlineCount} icon={<UserPlus className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Total Partners" value={partners.length} icon={<Truck className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Delivery Zones" value={zones.length} icon={<MapPin className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
        </div>

        {/* Tabs to switch between Unassigned and Assigned */}
        <div className="flex border-b border-[#e8e8e8] gap-4">
          <button
            onClick={() => { setFilterType("unassigned"); setPage(1); }}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              filterType === "unassigned"
                ? "border-[#0c831f] text-[#0c831f]"
                : "border-transparent text-[#666] hover:text-[#1a1a1a]"
            }`}
          >
            Unassigned Orders ({unassignedCount})
          </button>
          <button
            onClick={() => { setFilterType("assigned"); setPage(1); }}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
              filterType === "assigned"
                ? "border-[#0c831f] text-[#0c831f]"
                : "border-transparent text-[#666] hover:text-[#1a1a1a]"
            }`}
          >
            Assigned Orders ({assignedCount})
          </button>
        </div>

        <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by order ID or customer..." />

        <ReusableTable
          data={orders}
          keyExtractor={(o: Order) => o.id}
          isLoading={loading}
          page={1}
          pageSize={10}
          total={orders.length}
          onPageChange={setPage}
          columns={[
            { key: "id", header: "Order ID", width: "110px", render: (o) => <span className="font-bold text-[#0c831f]">{(o as Order).id}</span> },
            { key: "customer", header: "Customer", width: "150px", sortable: true, render: (o) => (
              <span className="font-bold text-[#1a1a1a] block truncate max-w-[140px]">{(o as Order).customer}</span>
            )},
            { key: "zone", header: "Zone", width: "130px", render: (o) => (o as Order).zone || "—" },
            { key: "status", header: "Status", width: "130px", render: (o) => <StatusBadge status={(o as Order).status} /> },
            { key: "deliveryPartner", header: "Partner", width: "130px", render: (o) => {
              const partner = (o as Order).deliveryPartner;
              return partner ? <span className="font-bold text-[#0c831f]">{partner}</span> : <span className="text-[#999]">—</span>;
            }},
            { key: "total", header: "Total", width: "90px", align: "right", render: (o) => <span className="font-bold">₹{(o as Order).total}</span> },
          ]}
          actions={[
            {
              label: filterType === "assigned" ? "Reassign Partner" : "Assign Partner",
              icon: <UserPlus className="h-3.5 w-3.5" />,
              onClick: (o: Order) => setShowAssignModal(o)
            },
          ]}
        />
      </div>

      <AssignPartnerModal
        open={!!showAssignModal}
        onClose={() => setShowAssignModal(null)}
        order={showAssignModal}
        onAssigned={() => { fetchOrders(); fetchPartners(); }}
      />
    </DashboardLayout>
  );
}

