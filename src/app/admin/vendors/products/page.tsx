"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { ReusablePageHeader, ReusableDrawer } from "@/components/common";
import { useVendorProducts } from "@/hooks/use-vendors";
import {
  Package, Eye, Edit3, TrendingUp, DollarSign,
  AlertTriangle, BarChart3, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import type { VendorProduct } from "@/types/vendors";

export default function VendorProductsPage() {
  const {
    data, loading, error, summary, filters, meta,
    fetchData, updateFilters, goToPage, changePageSize,
  } = useVendorProducts();

  const [selectedProduct, setSelectedProduct] = useState<VendorProduct | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Vendors"
          title="Vendor Products"
          subtitle="View and manage all products supplied by vendors — stock, pricing, margins, and performance."
          actions={
            <div className="flex items-center gap-2">
              <button onClick={fetchData} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <ReusableExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt.toUpperCase()}`)} />
            </div>
          }
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">{error}</div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Products" value={summary?.totalProducts ?? 0} icon={<Package className="h-5 w-5" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" subtitle={summary ? `${summary.activeProducts} active` : undefined} />
          <ReusableCard title="Out of Stock" value={summary?.outOfStockCount ?? 0} icon={<AlertTriangle className="h-5 w-5" />} color="text-[#dc2626]" bgColor="bg-[#fef2f2]" subtitle={summary ? `${summary.inactiveCount} inactive` : undefined} />
          <ReusableCard title="Avg Margin" value={summary ? `${summary.avgMargin}%` : "—"} icon={<TrendingUp className="h-5 w-5" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Total Stock Value" value={summary ? `₹${(summary.totalStockValue / 100000).toFixed(1)}L` : "—"} icon={<DollarSign className="h-5 w-5" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <ReusableSearchBar
              value={filters.search ?? ""}
              onChange={(v) => updateFilters({ search: v })}
              placeholder="Search product name, SKU, vendor..."
            />
          </div>
          <select
            value={filters.status ?? "all"}
            onChange={(e) => updateFilters({ status: e.target.value })}
            className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>

        {/* Products Table */}
        <ReusableTable
          data={data}
          keyExtractor={(p) => p.id}
          isLoading={loading}
          page={meta.page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          columns={[
            {
              key: "productName", header: "Product", sortable: true,
              render: (p) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f6f7f6]">
                    <Package className="h-4 w-4 text-[#666]" />
                  </div>
                  <div>
                    <span className="font-bold text-[#1a1a1a]">{p.productName}</span>
                    <span className="block text-[10px] font-mono text-[#999]">{p.sku}</span>
                  </div>
                </div>
              ),
            },
            { key: "vendorName", header: "Vendor", width: "150px", hideOnMobile: true, render: (p) => <span className="text-xs text-[#666]">{p.vendorName}</span> },
            {
              key: "price", header: "Price", width: "80px", align: "right", sortable: true,
              render: (p) => (
                <div className="text-right">
                  <span className="font-bold">₹{p.price}</span>
                  <span className="block text-[10px] text-[#999]">MRP ₹{p.mrp}</span>
                </div>
              ),
            },
            {
              key: "margin", header: "Margin", width: "80px", align: "right",
              render: (p) => (
                <span className={`font-bold ${p.margin >= 25 ? "text-[#0c831f]" : p.margin >= 20 ? "text-[#d97706]" : "text-[#666]"}`}>
                  {p.margin}%
                </span>
              ),
            },
            {
              key: "stock", header: "Stock", width: "80px", align: "right", sortable: true,
              render: (p) => (
                <span className={`font-bold ${p.stock === 0 ? "text-[#dc2626]" : p.stock < 50 ? "text-[#d97706]" : "text-[#0c831f]"}`}>
                  {p.stock}
                </span>
              ),
            },
            { key: "sold", header: "Sold", width: "70px", align: "right", sortable: true, render: (p) => <span>{p.sold.toLocaleString()}</span> },
            {
              key: "returnRate", header: "Returns", width: "80px", align: "right", hideOnMobile: true,
              render: (p) => (
                <span className={`font-bold ${p.returnRate > 5 ? "text-[#dc2626]" : p.returnRate > 2 ? "text-[#d97706]" : "text-[#0c831f]"}`}>
                  {p.returnRate}%
                </span>
              ),
            },
            { key: "status", header: "Status", width: "110px", render: (p) => <StatusBadge status={p.status} /> },
          ]}
          actions={[
            { label: "View Details", icon: <Eye className="h-3.5 w-3.5" />, onClick: (p) => setSelectedProduct(p) },
            { label: "Edit", icon: <Edit3 className="h-3.5 w-3.5" />, onClick: (p) => toast.info(`Editing ${p.productName}`) },
            { label: "Analytics", icon: <BarChart3 className="h-3.5 w-3.5" />, onClick: (p) => toast.info(`Analytics for ${p.sku}`), variant: "success" },
          ]}
        />
      </div>

      {/* Product Detail Drawer */}
      <ReusableDrawer
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Product Details"
        subtitle={selectedProduct?.sku}
        width="md"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={selectedProduct.status} />
              <span className="text-xs text-[#999]">by {selectedProduct.vendorName}</span>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Pricing</h4>
              <div className="space-y-2">
                {[
                  { label: "Selling Price", value: `₹${selectedProduct.price}` },
                  { label: "MRP", value: `₹${selectedProduct.mrp}` },
                  { label: "Cost Price", value: `₹${selectedProduct.costPrice}` },
                  { label: "Gross Margin", value: `${selectedProduct.margin}%`, highlight: true },
                ].map((item) => (
                  <div key={item.label} className={`flex justify-between py-1 ${item.highlight ? "border-t border-[#e8e8e8] pt-2" : ""}`}>
                    <span className="text-sm text-[#666]">{item.label}</span>
                    <span className={`text-sm ${item.highlight ? "font-black text-[#0c831f]" : "font-bold text-[#1a1a1a]"}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <h4 className="mb-3 text-xs font-black uppercase tracking-wide text-[#666]">Inventory & Sales</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "In Stock", value: selectedProduct.stock, color: selectedProduct.stock === 0 ? "text-[#dc2626]" : "text-[#0c831f]" },
                  { label: "Reserved", value: selectedProduct.reserved, color: "text-[#d97706]" },
                  { label: "Total Sold", value: selectedProduct.sold.toLocaleString(), color: "text-[#2563eb]" },
                  { label: "Return Rate", value: `${selectedProduct.returnRate}%`, color: selectedProduct.returnRate > 5 ? "text-[#dc2626]" : "text-[#0c831f]" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg bg-[#f9fafb] p-3">
                    <p className="text-[10px] font-bold text-[#666]">{m.label}</p>
                    <p className={`mt-1 text-xl font-black ${m.color}`}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-[#999]">Category</p>
                  <p className="mt-0.5 font-bold text-[#1a1a1a]">{selectedProduct.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#999]">Last Restocked</p>
                  <p className="mt-0.5 font-bold text-[#1a1a1a]">{selectedProduct.lastRestocked}</p>
                </div>
                {selectedProduct.rating && (
                  <div>
                    <p className="text-[10px] font-bold text-[#999]">Rating</p>
                    <p className="mt-0.5 font-bold text-amber-500">? {selectedProduct.rating}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ReusableDrawer>
    </DashboardLayout>
  );
}

