"use client";

import { useState, useMemo, useCallback } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { ArrowRightLeft, Plus, Eye, Truck, CheckCircle, Clock, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { useStockTransfers, useWarehouses, useInventoryItems } from "@/hooks/use-inventory";
import StockTransferForm from "@/components/ui/inventory/stock-transfer-form";
import type { StockTransfer } from "@/types/inventory";
import ReusableModal from "@/components/ui/admin/reusable-modal";

export default function StockTransfersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewTransfer, setViewTransfer] = useState<StockTransfer | null>(null);

  const { transfers, loading, pagination, refresh: refreshTransfers, createTransfer } = useStockTransfers({ page, pageSize, search });
  const { warehouses } = useWarehouses();
  const { items } = useInventoryItems();

  const warehouseList = useMemo(
    () => warehouses.map((w) => ({ name: w.name, id: w.id })),
    [warehouses],
  );
  const productList = useMemo(
    () => items.map((i) => ({ name: i.productName, sku: i.sku, id: i.id })),
    [items],
  );

  const handleCreateTransfer = useCallback(
    async (data: Parameters<typeof createTransfer>[0]) => {
      await createTransfer(data);
      toast.success("Stock transfer initiated");
    },
    [createTransfer],
  );

  const kpis = useMemo(() => {
    const all = transfers;
    return {
      total: all.length,
      inTransit: all.filter((t) => t.status === "in_transit").length,
      completed: all.filter((t) => t.status === "completed").length,
      pending: all.filter((t) => t.status === "pending").length,
    };
  }, [transfers]);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Inventory</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Stock Transfers</h1>
              <p className="mt-1.5 text-xs text-[#666]">Transfer stock between warehouses, track in-transit shipments, and manage inter-warehouse logistics.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => refreshTransfers()} className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
                <Plus className="h-4 w-4" /> New Transfer
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Transfers" value={kpis.total} icon={<ArrowRightLeft className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="In Transit" value={kpis.inTransit} icon={<Truck className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="Completed" value={kpis.completed} icon={<CheckCircle className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="Pending" value={kpis.pending} icon={<Clock className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
        </div>

        <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by product or transfer ID..." />

        <ReusableTable
          data={transfers}
          isLoading={loading}
          keyExtractor={(t: StockTransfer) => t.id}
          page={page}
          pageSize={pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          columns={[
            { key: "product", header: "Product", sortable: true, render: (t: StockTransfer) => (
              <div><span className="font-bold text-[#1a1a1a]">{t.product}</span><span className="block text-[10px] text-[#999]">{t.sku}</span></div>
            )},
            { key: "fromWarehouse", header: "From", width: "130px", hideOnMobile: true, render: (t: StockTransfer) => <span className="text-[#666]">{t.fromWarehouse}</span> },
            { key: "toWarehouse", header: "To", width: "150px", render: (t: StockTransfer) => <span className="text-[#0c831f] font-semibold">{t.toWarehouse}</span> },
            { key: "quantity", header: "Qty", width: "70px", align: "right", sortable: true },
            { key: "status", header: "Status", width: "110px", render: (t: StockTransfer) => <StatusBadge status={t.status} /> },
            { key: "date", header: "Date", width: "110px", hideOnMobile: true },
            { key: "eta", header: "ETA", width: "110px", hideOnMobile: true, render: (t: StockTransfer) => <span>{t.eta || "—"}</span> },
          ]}
          actions={[
            { label: "Track", icon: <Truck className="h-3.5 w-3.5" />, onClick: (t: StockTransfer) => toast.info(`Tracking transfer ${t.id}`), variant: "success" },
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (t: StockTransfer) => setViewTransfer(t) },
          ]}
        />
      </div>

      <StockTransferForm
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTransfer}
        warehouses={warehouseList}
        products={productList}
      />

      {/* View Modal */}
      <ReusableModal
        open={!!viewTransfer}
        onClose={() => setViewTransfer(null)}
        title="Stock Transfer Details"
        subtitle={`Transfer ID: ${viewTransfer?.id || ""}`}
        size="md"
      >
        {viewTransfer && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f9fafb] p-4">
              <div>
                <p className="text-[10px] text-[#999] font-bold uppercase">Product</p>
                <p className="text-sm font-bold text-[#1a1a1a]">{viewTransfer.product}</p>
                <p className="text-[10px] text-[#999]">{viewTransfer.sku}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#999] font-bold uppercase">Transfer Status</p>
                <div className="mt-1">
                  <StatusBadge status={viewTransfer.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#e8e8e8] p-3">
                <p className="text-[10px] text-[#666]">From Warehouse</p>
                <p className="mt-1 text-xs font-bold text-[#1a1a1a]">{viewTransfer.fromWarehouse}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-3">
                <p className="text-[10px] text-[#666]">To Warehouse</p>
                <p className="mt-1 text-xs font-bold text-[#0c831f]">{viewTransfer.toWarehouse}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-3 text-center">
                <p className="text-[10px] text-[#666]">Quantity</p>
                <p className="mt-1 text-base font-black text-[#1a1a1a]">{viewTransfer.quantity}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#e8e8e8] p-3">
                <p className="text-[10px] text-[#666]">Initiated Date</p>
                <p className="mt-0.5 text-xs font-bold text-[#1a1a1a]">{viewTransfer.date}</p>
              </div>
              <div className="rounded-xl border border-[#e8e8e8] p-3">
                <p className="text-[10px] text-[#666]">Estimated Arrival (ETA)</p>
                <p className="mt-0.5 text-xs font-bold text-[#1a1a1a]">{viewTransfer.eta || "—"}</p>
              </div>
            </div>
          </div>
        )}
      </ReusableModal>
    </DashboardLayout>
  );
}

