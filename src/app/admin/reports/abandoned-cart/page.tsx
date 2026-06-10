"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { ReusablePageHeader, ReusableDrawer } from "@/components/common";
import { useAbandonedCart } from "@/hooks/use-reports";
import { ShoppingCart, RefreshCw, DollarSign, TrendingDown, Eye, Send, X } from "lucide-react";
import { toast } from "sonner";
import type { AbandonedCartEntry } from "@/types/reports";

export default function AbandonedCartPage() {
  const {
    data,
    loading,
    error,
    summary,
    filters,
    meta,
    fetchData,
    updateFilters,
    goToPage,
    changePageSize,
  } = useAbandonedCart();
  const [selectedCart, setSelectedCart] = useState<AbandonedCartEntry | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Reports"
          title="Abandoned Cart Reports"
          subtitle="Monitor cart abandonment, track recovery rates, and recover lost revenue."
          actions={
            <ReusableExportButton
              onExport={(fmt) => {
                toast.success(`Exporting abandoned cart report as ${fmt.toUpperCase()}`);
                fetchData();
              }}
            />
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Abandoned" value={summary?.totalAbandoned ?? 0} icon={<ShoppingCart className="h-5 w-5" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Recovered" value={summary?.totalRecovered ?? 0} icon={<RefreshCw className="h-5 w-5" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" subtitle={`${summary?.recoveryRate ?? 0}% recovery rate`} />
          <ReusableCard title="Lost Revenue" value={summary ? `₹${(summary.lostRevenue / 1000).toFixed(1)}K` : "₹"} icon={<TrendingDown className="h-5 w-5" />} color="text-[#dc2626]" bgColor="bg-[#fef2f2]" />
          <ReusableCard title="Recovered Revenue" value={summary ? `₹${(summary.recoveredRevenue / 1000).toFixed(1)}K` : "₹"} icon={<DollarSign className="h-5 w-5" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(val) => updateFilters({ search: val })}
              placeholder="Search customers..."
            />
          </div>
        </div>

        <ReusableTable
          data={data}
          keyExtractor={(r) => r.id}
          isLoading={loading}
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          columns={[
            {
              key: "customerName",
              header: "Customer",
              sortable: true,
              render: (r) => (
                <div>
                  <span className="font-bold text-[#1a1a1a]">{r.customerName}</span>
                  <span className="block text-[10px] text-[#999]">{r.customerEmail}</span>
                </div>
              ),
            },
            { key: "items", header: "Items", width: "60px", align: "center" },
            { key: "cartValue", header: "Cart Value", width: "110px", align: "right", sortable: true, render: (r) => <span className="font-bold">₹{r.cartValue.toLocaleString()}</span> },
            { key: "status", header: "Status", width: "110px", render: (r) => (
              <StatusBadge status={r.status === "recovered" ? "Recovered" : r.status === "abandoned" ? "Abandoned" : "Lost"} />
            )},
            { key: "abandonedAt", header: "Abandoned", width: "140px", hideOnMobile: true },
            { key: "recoveryMethod", header: "Recovery", width: "110px", hideOnMobile: true, render: (r) => r.recoveryMethod ? <span className="text-xs font-medium text-[#666]">{r.recoveryMethod}</span> : <span className="text-[#ccc]">₹</span> },
          ]}
          actions={[
            { label: "View Items", icon: <Eye className="h-3.5 w-3.5" />, onClick: (r) => setSelectedCart(r) },
            { label: "Send Reminder", icon: <Send className="h-3.5 w-3.5" />, onClick: (r) => toast.success(`Recovery reminder sent to ${r.customerName}`), show: (r) => r.status === "abandoned" },
          ]}
        />

        <ReusableDrawer
          open={!!selectedCart}
          onClose={() => setSelectedCart(null)}
          title="Cart Details"
          subtitle={selectedCart?.customerName}
          width="md"
        >
          {selectedCart && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Customer</p>
                    <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedCart.customerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Status</p>
                    <p className="mt-1"><StatusBadge status={selectedCart.status === "recovered" ? "Recovered" : selectedCart.status === "abandoned" ? "Abandoned" : "Lost"} /></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Cart Value</p>
                    <p className="mt-1 text-sm font-black text-[#1a1a1a]">₹{selectedCart.cartValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Items</p>
                    <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{selectedCart.items} items</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Abandoned At</p>
                    <p className="mt-1 text-xs text-[#666]">{selectedCart.abandonedAt}</p>
                  </div>
                  {selectedCart.recoveredAt && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#666]">Recovered At</p>
                      <p className="mt-1 text-sm text-[#0c831f] font-bold">{selectedCart.recoveredAt}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#e8e8e8] p-4">
                <h4 className="text-xs font-black uppercase tracking-wide text-[#666] mb-3">Items in Cart</h4>
                <ul className="space-y-2">
                  {selectedCart.itemsList.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#0c831f]" />
                      <span className="text-sm text-[#1a1a1a]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedCart.recoveryMethod && (
                <div className="rounded-xl border border-[#e8e8e8] bg-[#e8f5e9]/30 p-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-[#0c831f]" />
                    <span className="text-sm font-bold text-[#0c831f]">Recovered via {selectedCart.recoveryMethod}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ReusableDrawer>
      </div>
    </DashboardLayout>
  );
}

