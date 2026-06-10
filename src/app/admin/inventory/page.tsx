"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { RefreshCw, ArrowRightLeft, Package, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useInventoryItems, useWarehouses, useInventoryReport } from "@/hooks/use-inventory";
import { inventoryService } from "@/services/inventory.service";
import { InventoryOverviewCards, WarehouseCards } from "@/components/ui/inventory";
import StockTransferForm from "@/components/ui/inventory/stock-transfer-form";
import type { InventoryItem, StockTransfer } from "@/types/inventory";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { adminToast } from "@/lib/admin-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function InventoryPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("productName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItem[]>([]);
  const [loadingOutOfStock, setLoadingOutOfStock] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [lowStockItemsList, setLowStockItemsList] = useState<InventoryItem[]>([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);

  const { items, loading, pagination, refresh: refreshItems } = useInventoryItems({ page, pageSize, search, sortBy, sortOrder });
  const { warehouses } = useWarehouses();
  const { report } = useInventoryReport();



  const handleOpenOutOfStock = async () => {
    setShowOutOfStockModal(true);
    setLoadingOutOfStock(true);
    try {
      const res = await inventoryService.getOutOfStockItems();
      setOutOfStockItems(res.data || []);
    } catch (err: any) {
      adminToast.apiError("Failed to fetch out of stock items");
    } finally {
      setLoadingOutOfStock(false);
    }
  };

  const handleOpenLowStock = async () => {
    setShowLowStockModal(true);
    setLoadingLowStock(true);
    try {
      const res = await inventoryService.getLowStockItems();
      setLowStockItemsList(res.data || []);
    } catch (err: any) {
      adminToast.apiError("Failed to fetch low stock items");
    } finally {
      setLoadingLowStock(false);
    }
  };



  const createTransfer = useCallback(
    async (data: Omit<StockTransfer, "id" | "status" | "createdAt">) => {
      const res = await inventoryService.createTransfer(data);
      return res.data;
    },
    [],
  );

  const allItems = useMemo(() => items, [items]);

  const totalStock = report?.totalProducts ?? allItems.reduce((s, i) => s + i.stock, 0);
  const totalAvailable = report?.inStockCount ?? allItems.reduce((s, i) => s + i.available, 0);
  const lowStockCount = report?.lowStockCount ?? allItems.filter(
    (i) => i.available <= i.lowStockThreshold || i.status === "low_stock" || i.status === "out_of_stock",
  ).length;

  const warehouseList = useMemo(
    () => warehouses.map((w) => ({ name: w.name, id: w.id })),
    [warehouses],
  );
  const productList = useMemo(
    () => allItems.map((i) => ({ name: i.productName, sku: i.sku, id: i.id })),
    [allItems],
  );

  const handleCreateTransfer = useCallback(
    async (data: Parameters<typeof createTransfer>[0]) => {
      await createTransfer(data);
      toast.success("Stock transfer initiated");
    },
    [createTransfer],
  );

  const handleExport = (fmt: string) => {
    const headers = ["ID", "Product Name", "SKU", "Barcode", "Warehouse", "Stock", "Reserved", "Available", "Safety Stock", "Reorder Pt.", "Status"];

    if (fmt === "csv") {
      const csvData = allItems.map((p) =>
        [
          p.id,
          `"${(p.productName || "").replace(/"/g, '""')}"`,
          p.sku,
          p.barcode || "",
          `"${(p.warehouse || "").replace(/"/g, '""')}"`,
          p.stock,
          p.reserved,
          p.available,
          p.safetyStock,
          p.lowStockThreshold,
          p.status,
        ].join(",")
      );
      const csvContent = [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `inventory_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Inventory exported as CSV successfully");
    } else if (fmt === "xlsx") {
      const excelData = allItems.map((p) => ({
        ID: p.id,
        "Product Name": p.productName,
        SKU: p.sku,
        Barcode: p.barcode,
        Warehouse: p.warehouse,
        Stock: p.stock,
        Reserved: p.reserved,
        Available: p.available,
        "Safety Stock": p.safetyStock,
        "Reorder Pt.": p.lowStockThreshold,
        Status: p.status,
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
      XLSX.writeFile(workbook, `inventory_export_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Inventory exported as Excel successfully");
    } else if (fmt === "pdf") {
      const doc = new jsPDF();
      const tableData = allItems.map((p) => [
        p.id.slice(0, 8),
        p.productName,
        p.sku,
        p.warehouse || "—",
        p.stock.toString(),
        p.available.toString(),
        p.status,
      ]);

      autoTable(doc, {
        head: [["ID", "Name", "SKU", "Warehouse", "Stock", "Available", "Status"]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [12, 131, 31] },
      });
      doc.save(`inventory_export_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Inventory exported as PDF successfully");
    } else {
      toast.info(`Export as ${fmt.toUpperCase()} is not implemented yet`);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full space-y-6 px-2 sm:px-4 lg:px-8">
        {/* Header */}
        <section className="flex flex-col gap-4 rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-black text-[#1a1a1a]">Inventory Management</h1>
            <p className="mt-1 text-sm text-[#999]">
              Monitor stock levels, set reorder points, and manage warehouse allocations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenLowStock}
              className="flex items-center gap-2 rounded-xl border border-[#fef08a] bg-[#fef9c3] px-4 py-2 text-sm font-bold text-[#854d0e] hover:bg-[#fef08a] transition-all"
            >
              <AlertTriangle className="h-4 w-4" />
              Low Stock
            </button>
            <button
              onClick={handleOpenOutOfStock}
              className="flex items-center gap-2 rounded-xl border border-[#fee2e2] bg-[#fef2f2] px-4 py-2 text-sm font-bold text-[#991b1b] hover:bg-[#fee2e2] transition-all"
            >
              <AlertTriangle className="h-4 w-4" />
              Out of Stock
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transfer Stock
            </button>
            <div className="flex items-center gap-2">
              <ReusableExportButton
                onExport={handleExport}
                fileName="inventory_export"
              />
              <button
                onClick={() => refreshItems()}
                disabled={loading}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] disabled:opacity-50 transition-all"
                aria-label="Refresh inventory"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="sr-only">Refresh</span>
              </button>
            </div>
          </div>
        </section>

        {/* KPI Strip */}
        <InventoryOverviewCards
          totalStock={totalStock}
          totalAvailable={totalAvailable}
          warehouseCount={warehouses.length}
          lowStockCount={lowStockCount}
        />

        {/* Warehouses */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Warehouses</p>
              <h3 className="text-sm font-black text-[#1a1a1a]">Storage Facilities</h3>
            </div>
          </div>
          <WarehouseCards warehouses={warehouses} />
        </section>

        {/* Search */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
          <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search inventory by product name or SKU..." />
        </section>

        {/* Table */}
        <ReusableTable
          data={items}
          isLoading={loading}
          keyExtractor={(i: InventoryItem) => i.id}
          page={page}
          pageSize={pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          sortKey={sortBy}
          sortDir={sortOrder}
          onSortChange={(key, dir) => { setSortBy(key); setSortOrder(dir); setPage(1); }}
          onRowClick={(i: InventoryItem) => router.push(`/admin/inventory/${i.id}`)}
          columns={[
            {
              key: "productName", header: "Product", sortable: true, render: (i: InventoryItem) => (
                <div>
                  <span className="font-bold text-[#1a1a1a]">{i.productName}</span>
                  <span className="block text-[10px] text-[#999]">{i.sku}</span>
                  {((i as any).brand || (i as any).weight) && (
                    <span className="block text-[10px] text-[#bbb]">
                      {(i as any).brand}{(i as any).brand && (i as any).weight ? " · " : ""}{(i as any).weight}
                    </span>
                  )}
                </div>
              )
            },
            {
              key: "warehouse", header: "Warehouse", width: "150px", hideOnMobile: true, sortable: true, render: (i: InventoryItem) => (
                <div>
                  <span className="font-semibold text-[#1a1a1a] text-xs">{i.warehouse || "—"}</span>
                  {(i as any).warehouseAddress && (
                    <span className="block text-[10px] text-[#999] truncate max-w-[130px]">{(i as any).warehouseAddress}</span>
                  )}
                </div>
              )
            },
            {
              key: "stock", header: "Stock", width: "80px", align: "right", sortable: true, render: (i: InventoryItem) => (
                <span className="font-bold">{i.stock}</span>
              )
            },
            { key: "reserved", header: "Reserved", width: "90px", align: "right", hideOnMobile: true, sortable: true },
            {
              key: "available", header: "Available", width: "90px", align: "right", sortable: true, render: (i: InventoryItem) => (
                <span className={`font-bold ${i.available <= i.lowStockThreshold ? "text-[#dc2626]" : "text-[#0c831f]"}`}>{i.available}</span>
              )
            },
            {
              key: "safetyStock", header: "Safety Stock", width: "100px", align: "right", hideOnMobile: true, sortable: true, render: (i: InventoryItem) => (
                <span className="text-[#555] font-semibold">{i.safetyStock ?? "—"}</span>
              )
            },
            {
              key: "lowStockThreshold", header: "Reorder.", width: "95px", align: "right", hideOnMobile: true, sortable: true, render: (i: InventoryItem) => (
                <span className="text-[#999]">{i.lowStockThreshold}</span>
              )
            },
            {
              key: "productDetails", header: "Product Details", width: "160px", hideOnMobile: true, render: (i: InventoryItem) => (
                <div>
                  {(i as any).description ? (
                    <span className="block text-[10px] text-[#555] line-clamp-2" title={(i as any).description}>{(i as any).description}</span>
                  ) : (
                    <span className="block text-[10px] text-[#999] italic">—</span>
                  )}
                  {(i as any).barcode && (
                    <span className="block mt-1 text-[9px] font-mono text-[#888]">BC: {(i as any).barcode}</span>
                  )}
                </div>
              )
            },
            {
              key: "seo", header: "SEO", width: "160px", hideOnMobile: true, render: (i: InventoryItem) => (
                <div>
                  {(i as any).seoTitle ? (
                    <span className="block text-[11px] font-bold text-[#1a1a1a] truncate" title={(i as any).seoTitle}>{(i as any).seoTitle}</span>
                  ) : (
                    <span className="block text-[10px] text-[#999] italic">No SEO Title</span>
                  )}
                  {(i as any).seoDescription && (
                    <span className="block text-[10px] text-[#555] truncate mt-0.5" title={(i as any).seoDescription}>{(i as any).seoDescription}</span>
                  )}
                </div>
              )
            },
            {
              key: "status", header: "Status", width: "110px", hideOnMobile: true, sortable: true, render: (i: InventoryItem) => {
                const cfg: Record<string, { bg: string; text: string; label: string }> = {
                  in_stock: { bg: "#dcfce7", text: "#166534", label: "In Stock" },
                  low_stock: { bg: "#fef9c3", text: "#854d0e", label: "Low Stock" },
                  out_of_stock: { bg: "#fee2e2", text: "#991b1b", label: "Out of Stock" },
                };
                const c = cfg[i.status] ?? { bg: "#f0fdf4", text: "#166534", label: i.status };
                return (
                  <span style={{ background: c.bg, color: c.text }} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {c.label}
                  </span>
                );
              },
            },
          ]}
        />
      </div>

      {/* Transfer Modal */}
      <StockTransferForm
        open={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSubmit={handleCreateTransfer}
        warehouses={warehouseList}
        products={productList}
      />
      <ReusableModal
        open={showOutOfStockModal}
        onClose={() => setShowOutOfStockModal(false)}
        title="Out of Stock Items"
        subtitle="Products currently requiring restock"
        size="lg"
      >
        <div className="space-y-4">
          {loadingOutOfStock ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#0c831f]" />
            </div>
          ) : outOfStockItems.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8e8e8] bg-[#f9fafb]">
              <Package className="h-8 w-8 text-[#999] mb-2" />
              <p className="text-sm font-semibold text-[#666]">No items are currently out of stock.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {outOfStockItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm relative overflow-hidden transition-all hover:border-[#dc2626]/30 hover:shadow-md">
                  {/* Red status indicator stripe */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#dc2626]"></div>
                  
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3 pl-2.5">
                    <div>
                      <h4 className="font-black text-[#1a1a1a] text-lg leading-tight">{item.productName}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs font-mono bg-[#f3f4f6] px-1.5 py-0.5 rounded text-[#555] border border-[#e8e8e8]">{item.sku}</span>
                        {item.barcode && <span className="text-[10px] text-[#888] flex items-center gap-1"><span className="text-[#ccc]">|</span> BC: {item.barcode}</span>}
                        {(item as any).brand && <span className="text-[10px] text-[#0c831f] font-bold bg-[#dcfce7] px-1.5 py-0.5 rounded border border-[#bbf7d0]">{(item as any).brand}</span>}
                        {(item as any).productStatus && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${(item as any).productStatus === "ACTIVE" ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]" : "bg-[#f3f4f6] text-[#555] border-[#e8e8e8]"}`}>{(item as any).productStatus}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fee2e2] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#991b1b] border border-[#fecaca]">
                        <span className="h-2 w-2 rounded-full bg-[#dc2626] animate-pulse" />
                        Out of Stock
                      </span>
                    </div>
                  </div>

                  <div className="pl-2.5 mb-4">
                    {(item as any).description ? (
                      <p className="text-xs text-[#666] line-clamp-2">{(item as any).description}</p>
                    ) : (
                      <p className="text-xs text-[#aaa] italic">No description available.</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-[#f9fafb] rounded-xl border border-[#f0f0f0] overflow-hidden">
                    {/* Inventory Details */}
                    <div className="p-3.5 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                      <p className="text-[10px] font-black uppercase text-[#0c831f] tracking-widest mb-2 flex items-center gap-1.5">
                        <Package className="w-3 h-3" /> Stock
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Available</span>
                          <span className="font-black text-[#dc2626] bg-[#fee2e2] px-1.5 py-0.5 rounded text-[13px]">{item.available}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Reserved</span>
                          <span className="font-bold text-[#f59e0b]">{item.reserved}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Safety Stock</span>
                          <span className="font-bold text-[#1a1a1a]">{item.safetyStock}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Reorder Pt.</span>
                          <span className="font-bold text-[#1a1a1a]">{item.lowStockThreshold}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="p-3.5 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                      <p className="text-[10px] font-black uppercase text-[#0c831f] tracking-widest mb-2">Pricing</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Sale Price</span>
                          <span className="font-black text-[#0c831f] text-[13px]">₹{(item as any).price ?? "—"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">MRP</span>
                          <span className="font-semibold text-[#999] line-through">₹{(item as any).mrp ?? "—"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Cost Price</span>
                          <span className="font-semibold text-[#1a1a1a]">₹{(item as any).costPrice ?? "—"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Tax Rate</span>
                          <span className="font-semibold text-[#1a1a1a]">{(item as any).taxRate != null ? `${(item as any).taxRate}%` : "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location & Specs */}
                    <div className="p-3.5">
                      <p className="text-[10px] font-black uppercase text-[#0c831f] tracking-widest mb-2">Location & Specs</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between items-start text-xs">
                            <span className="text-[#666] font-medium whitespace-nowrap mr-2">Warehouse</span>
                            <span className="font-bold text-[#1a1a1a] text-right leading-tight">{item.warehouse || "—"}</span>
                          </div>
                          {((item as any).warehouseType || (item as any).warehouseAddress) && (
                            <div className="text-right mt-0.5">
                              {(item as any).warehouseType && <span className="text-[9px] uppercase tracking-wide text-[#888] block">{(item as any).warehouseType}</span>}
                              {(item as any).warehouseAddress && <span className="text-[10px] text-[#888] block truncate" title={(item as any).warehouseAddress}>{(item as any).warehouseAddress}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-[#f0f0f0]/60">
                          <span className="text-[#666] font-medium">Weight/Vol</span>
                          <span className="font-semibold text-[#1a1a1a]">
                            {(item as any).weight || "—"} {(item as any).unit || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ReusableModal>

      {/* Low Stock Modal */}
      <ReusableModal
        open={showLowStockModal}
        onClose={() => setShowLowStockModal(false)}
        title="Low Stock Items"
        subtitle="Products below safety stock or reorder points"
        size="lg"
      >
        <div className="space-y-4">
          {loadingLowStock ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#0c831f]" />
            </div>
          ) : lowStockItemsList.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8e8e8] bg-[#f9fafb]">
              <Package className="h-8 w-8 text-[#999] mb-2" />
              <p className="text-sm font-semibold text-[#666]">No items are currently in low stock.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {lowStockItemsList.map((item) => (
                <div key={item.id} className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm relative overflow-hidden transition-all hover:border-[#f59e0b]/30 hover:shadow-md">
                  {/* Yellow status indicator stripe */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#f59e0b]"></div>
                  
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3 pl-2.5">
                    <div>
                      <h4 className="font-black text-[#1a1a1a] text-lg leading-tight">{item.productName}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs font-mono bg-[#f3f4f6] px-1.5 py-0.5 rounded text-[#555] border border-[#e8e8e8]">{item.sku}</span>
                        {item.barcode && <span className="text-[10px] text-[#888] flex items-center gap-1"><span className="text-[#ccc]">|</span> BC: {item.barcode}</span>}
                        {(item as any).brand && <span className="text-[10px] text-[#0c831f] font-bold bg-[#dcfce7] px-1.5 py-0.5 rounded border border-[#bbf7d0]">{(item as any).brand}</span>}
                        {(item as any).productStatus && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${(item as any).productStatus === "ACTIVE" ? "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]" : "bg-[#f3f4f6] text-[#555] border-[#e8e8e8]"}`}>{(item as any).productStatus}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef9c3] px-3 py-1 text-[11px] font-black uppercase tracking-widest text-[#854d0e] border border-[#fef08a]">
                        <span className="h-2 w-2 rounded-full bg-[#f59e0b] animate-pulse" />
                        Low Stock
                      </span>
                    </div>
                  </div>

                  <div className="pl-2.5 mb-4">
                    {(item as any).description ? (
                      <p className="text-xs text-[#666] line-clamp-2">{(item as any).description}</p>
                    ) : (
                      <p className="text-xs text-[#aaa] italic">No description available.</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-[#f9fafb] rounded-xl border border-[#f0f0f0] overflow-hidden">
                    {/* Inventory Details */}
                    <div className="p-3.5 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                      <p className="text-[10px] font-black uppercase text-[#0c831f] tracking-widest mb-2 flex items-center gap-1.5">
                        <Package className="w-3 h-3" /> Stock
                      </p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Available</span>
                          <span className="font-black text-[#854d0e] bg-[#fef9c3] px-1.5 py-0.5 rounded text-[13px]">{item.available}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Reserved</span>
                          <span className="font-bold text-[#f59e0b]">{item.reserved}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Safety Stock</span>
                          <span className="font-bold text-[#1a1a1a]">{item.safetyStock}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Reorder Pt.</span>
                          <span className="font-bold text-[#1a1a1a]">{item.lowStockThreshold}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Details */}
                    <div className="p-3.5 border-b md:border-b-0 md:border-r border-[#f0f0f0]">
                      <p className="text-[10px] font-black uppercase text-[#0c831f] tracking-widest mb-2">Pricing</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Sale Price</span>
                          <span className="font-black text-[#0c831f] text-[13px]">₹{(item as any).price ?? "—"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">MRP</span>
                          <span className="font-semibold text-[#999] line-through">₹{(item as any).mrp ?? "—"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Cost Price</span>
                          <span className="font-semibold text-[#1a1a1a]">₹{(item as any).costPrice ?? "—"}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#666] font-medium">Tax Rate</span>
                          <span className="font-semibold text-[#1a1a1a]">{(item as any).taxRate != null ? `${(item as any).taxRate}%` : "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location & Specs */}
                    <div className="p-3.5">
                      <p className="text-[10px] font-black uppercase text-[#0c831f] tracking-widest mb-2">Location & Specs</p>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between items-start text-xs">
                            <span className="text-[#666] font-medium whitespace-nowrap mr-2">Warehouse</span>
                            <span className="font-bold text-[#1a1a1a] text-right leading-tight">{item.warehouse || "—"}</span>
                          </div>
                          {((item as any).warehouseType || (item as any).warehouseAddress) && (
                            <div className="text-right mt-0.5">
                              {(item as any).warehouseType && <span className="text-[9px] uppercase tracking-wide text-[#888] block">{(item as any).warehouseType}</span>}
                              {(item as any).warehouseAddress && <span className="text-[10px] text-[#888] block truncate" title={(item as any).warehouseAddress}>{(item as any).warehouseAddress}</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between items-center text-xs pt-1 border-t border-[#f0f0f0]/60">
                          <span className="text-[#666] font-medium">Weight/Vol</span>
                          <span className="font-semibold text-[#1a1a1a]">
                            {(item as any).weight || "—"} {(item as any).unit || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ReusableModal>
    </DashboardLayout>
  );
}
