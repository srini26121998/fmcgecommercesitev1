"use client";

import { useState, useMemo, useEffect } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { CalendarDays, AlertTriangle, CheckCircle, Clock, Eye, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useFEFO } from "@/hooks/use-inventory";
import type { FEFOBatch } from "@/types/inventory";
import ReusableModal from "@/components/ui/admin/reusable-modal";

export default function FEFOPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { batches, loading, error, refresh } = useFEFO();

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const [viewBatch, setViewBatch] = useState<FEFOBatch | null>(null);

  const filtered = useMemo(
    () =>
      batches.filter(
        (b) =>
          !search ||
          b.product.toLowerCase().includes(search.toLowerCase()) ||
          b.batch.toLowerCase().includes(search.toLowerCase()),
      ),
    [batches, search],
  );

  const kpis = useMemo(() => {
    return {
      total: batches.length,
      fresh: batches.filter((b) => b.status === "fresh").length,
      expiringSoon: batches.filter((b) => b.daysLeft <= 7).length,
      expired: batches.filter((b) => b.daysLeft <= 0).length,
    };
  }, [batches]);

  const pageData = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Inventory</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">FEFO Dashboard</h1>
              <p className="mt-1.5 text-xs text-[#666]">First Expiry, First Out — track batch expirations and prioritize dispatch of near-expiry stock.</p>
            </div>
            <button onClick={() => refresh()} className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Batches" value={kpis.total} icon={<CalendarDays className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Fresh" value={kpis.fresh} icon={<CheckCircle className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Expiring ≤7 Days" value={kpis.expiringSoon} icon={<Clock className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Expired" value={kpis.expired} icon={<AlertTriangle className="h-4 w-4" />} color="text-[#dc2626]" bgColor="bg-[#fef2f2]" />
        </div>

        <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by product or batch ID..." />

        <ReusableTable
          data={pageData}
          isLoading={loading}
          keyExtractor={(b: FEFOBatch) => b.id}
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          columns={[
            { key: "product", header: "Product", sortable: true, render: (b: FEFOBatch) => (
              <div><span className="font-bold text-[#1a1a1a]">{b.product}</span><span className="block text-[10px] text-[#999]">{b.sku}</span></div>
            )},
            { key: "batch", header: "Batch", width: "130px", render: (b: FEFOBatch) => <span className="font-mono text-xs font-bold">{b.batch}</span> },
            { key: "expiry", header: "Expiry", width: "110px", render: (b: FEFOBatch) => (
              <span className={b.daysLeft <= 7 ? "text-[#dc2626] font-bold" : "text-[#666]"}>{b.expiry}</span>
            )},
            { key: "daysLeft", header: "Days Left", width: "100px", align: "right", sortable: true, render: (b: FEFOBatch) => {
              const color = b.daysLeft <= 0 ? "text-[#dc2626]" : b.daysLeft <= 7 ? "text-[#d97706]" : "text-[#0c831f]";
              return <span className={`font-bold ${color}`}>{b.daysLeft}d</span>;
            }},
            { key: "quantity", header: "Qty", width: "70px", align: "right" },
            { key: "warehouse", header: "Warehouse", width: "140px", hideOnMobile: true },
            { key: "status", header: "Status", width: "110px", render: (b: FEFOBatch) => <StatusBadge status={b.status} /> },
          ]}
          actions={[
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (b: FEFOBatch) => setViewBatch(b) },
          ]}
        />
      </div>
      {/* View Modal */}
      <ReusableModal
        open={!!viewBatch}
        onClose={() => setViewBatch(null)}
        title="Batch Expiry Details"
        subtitle={`Batch ID: ${viewBatch?.batch || ""}`}
        size="md"
      >
        {viewBatch && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f9fafb] p-4">
              <div>
                <p className="text-[10px] text-[#999] font-bold uppercase">Product</p>
                <p className="text-sm font-bold text-[#1a1a1a]">{viewBatch.product}</p>
                <p className="text-[10px] text-[#999]">{viewBatch.sku}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#999] font-bold uppercase">Status</p>
                <div className="mt-1">
                  <StatusBadge status={viewBatch.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#e8e8e8] p-3 text-center">
                <p className="text-[10px] text-[#666]">Quantity</p>
                <p className="mt-1 text-base font-black text-[#1a1a1a]">{viewBatch.quantity}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-3 text-center">
                <p className="text-[10px] text-[#666]">Expiry Date</p>
                <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{viewBatch.expiry}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-3 text-center">
                <p className="text-[10px] text-[#666]">Days Left</p>
                <p className={`mt-1 text-base font-black ${viewBatch.daysLeft <= 0 ? 'text-[#dc2626]' : viewBatch.daysLeft <= 7 ? 'text-[#d97706]' : 'text-[#0c831f]'}`}>
                  {viewBatch.daysLeft}d
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] p-3">
              <p className="text-[10px] text-[#666]">Warehouse Location</p>
              <p className="mt-0.5 text-xs font-bold text-[#1a1a1a]">{viewBatch.warehouse}</p>
            </div>
          </div>
        )}
      </ReusableModal>
    </DashboardLayout>
  );
}

