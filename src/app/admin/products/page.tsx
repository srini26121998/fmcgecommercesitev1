"use client";

import { useState, useEffect, Fragment, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../dashboard-layout";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { useProducts, useProductForm, useProduct } from "@/hooks/use-products";
import { productService } from "@/services/products.service";
import type { Product } from "@/types/products";
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  RefreshCw,
  X,
  Package,
  Archive,
  AlertTriangle,
  Tags,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useConfirm } from "@/components/ui/admin/confirm-dialog";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AnimatedLoader } from "@/components/ui/animated-loader";

/* ────────────────────────────────────────────────────────────
   Sub-Accordion Component — Displays related products
   ──────────────────────────────────────────────────────────── */

function SubAccordion({ type, product, onClose }: { type: "brand" | "weight" | "taxRate", product: Product, onClose: () => void }) {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let filters: any = {};
        if (type === "brand") filters.brand = product.brand;
        else if (type === "weight") filters.search = product.name;

        const res = await productService.getProducts(filters, { page: 1, pageSize: 50 });
        let fetchedItems = res.products;

        if (type === "taxRate") {
          const resAll = await productService.getProducts({}, { page: 1, pageSize: 1000 });
          fetchedItems = resAll.products.filter(p => p.taxRate === product.taxRate);
        }

        setItems(fetchedItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [type, product]);

  const titleText = 
    type === "brand" ? "All products by brand" : 
    type === "weight" ? "All sizes for this product" : 
    "All products with this GST";
    
  const subtitleText = 
    type === "brand" ? product.brand : 
    type === "weight" ? product.name : 
    `${product.taxRate}%`;

  const groupedProducts = items.reduce((acc, curr) => {
    const name = curr.name || "Unknown Product";
    if (!acc[name]) acc[name] = { brand: curr.brand, category: curr.category, items: [] };
    acc[name].items.push(curr);
    return acc;
  }, {} as Record<string, { brand: string, category: string, items: Product[] }>);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[11px] text-gray-500 mb-0.5">{titleText}</p>
          <h3 className="text-sm font-bold text-[#1a1a1a]">{subtitleText}</h3>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center gap-2 text-xs font-medium text-[#0c831f] py-4 bg-[#f4fdf4] rounded-xl justify-center border border-[#0c831f]/20">
          <RefreshCw className="h-4 w-4 animate-spin"/> Loading items...
        </div>
      ) : items.length === 0 ? (
        <div className="text-xs text-gray-500 py-4 text-center border border-dashed border-gray-200 rounded-xl bg-white">No items found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {Object.entries(groupedProducts).map(([name, data]) => (
            <div key={name} className="p-3.5 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-gray-300 transition-colors">
              <p className="text-xs font-bold text-[#1a1a1a] mb-2.5">
                {name} <span className="text-gray-400 font-medium">· {data.brand || data.category}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {data.items.map(item => (
                  <div key={item.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${item.id === product.id ? 'border-[#0c831f] text-[#0c831f] bg-[#0c831f]/5 shadow-sm shadow-green-500/10' : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}`}>
                    <span>{item.weight || item.unit || "N/A"}</span>
                    <span className="text-gray-400 font-medium tracking-wide">· {item.itemCode || `ITEM-${item.id.slice(-2)}`}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Expanded Product Row — Light Card Grid
   ──────────────────────────────────────────────────────────── */

function ExpandedProductRow({
  baseProduct,
  onRefresh,
  onDuplicate,
  onDelete,
}: {
  baseProduct: Product;
  onRefresh: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { product, loading } = useProduct(baseProduct.id);
  const p = product || baseProduct;
  const { updateProduct, submitting } = useProductForm();

  const [isEditing, setIsEditing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<"brand" | "weight" | "taxRate" | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});

  useEffect(() => {
    if (p && !isEditing) {
      setEditData({
        name: p.name,
        brand: p.brand,
        sku: p.sku,
        barcode: p.barcode,
        weight: p.weight,
        unit: p.unit,
        taxRate: p.taxRate,
        mrp: p.mrp,
        costPrice: p.costPrice,
        price: p.price,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        warehouse: p.warehouse,
      });
    }
  }, [p, isEditing]);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Ensure the payload includes backend-required fields that might not be in editData
    const payload = {
      ...p,
      ...editData,
      title: editData.name || p.name || (p as any).title,
      itemCode: (p as any).itemCode || (p as any).item_code || `ITEM-${p.id.slice(-2)}`,
      categoryId: (p as any).categoryId || (p as any).category?._id || (p as any).category?.id || p.category,
    };

    const success = await updateProduct(p.id, payload);
    if (success) {
      toast.success("Product updated successfully");
      setIsEditing(false);
      onRefresh();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };

  const handleSectionClick = (section: "brand" | "weight" | "taxRate", e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isEditing) return;
    setExpandedSection(prev => prev === section ? null : section);
  };

  const rawStockStatus = (p as any).stockStatus;
  const formattedStockStatus = rawStockStatus
    ? String(rawStockStatus)
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")
    : p.stock > 0
      ? "In Stock"
      : "Out of Stock";

  const stockStatusColor =
    formattedStockStatus === "In Stock"
      ? "text-emerald-600 bg-emerald-50 border-emerald-200"
      : formattedStockStatus === "Out Of Stock"
        ? "text-red-600 bg-red-50 border-red-200"
        : "text-amber-600 bg-amber-50 border-amber-200";

  const margin =
    p.mrp && p.costPrice
      ? Math.round(((p.mrp - p.costPrice) / p.mrp) * 100)
      : 0;

  const metricCards = [
    { id: "weight", label: "Unit / weight", value: p.weight || p.unit || "—", color: "text-[#0c831f]", isEditable: true, type: "text", isClickable: true },
    { id: "taxRate", label: "GST", value: p.taxRate ? `${p.taxRate}%` : "—", color: "text-[#0c831f]", isEditable: true, type: "number", isClickable: true },
    { id: "mrp", label: "MRP", value: p.mrp ? `₹${p.mrp}` : "—", color: "text-[#1a1a1a]", isEditable: true, type: "number" },
    { id: "margin", label: "Margin", value: margin ? `${margin}%` : "—", color: "text-emerald-600", isEditable: false },
    { id: "costPrice", label: "Purchase price", value: p.costPrice ? `₹${p.costPrice}` : "—", color: "text-[#0c831f]", isEditable: true, type: "number" },
    { id: "price", label: "Selling price", value: p.price ? `₹${p.price}` : "—", color: "text-emerald-600", isEditable: true, type: "number" },
    { id: "stock", label: "Stock quantity", value: String(p.stock ?? 0), color: "text-[#1a1a1a]", isEditable: true, type: "number" },
    { id: "qtyReserved", label: "Quantity reserved", value: String((p as any).quantityReserved ?? (p as any).qtyReserved ?? 0), color: "text-[#1a1a1a]", isEditable: false },
    { id: "lowStockThreshold", label: "Low stock threshold", value: String(p.lowStockThreshold ?? 10), color: "text-[#0c831f]", isEditable: true, type: "number" },
    { id: "highStockThreshold", label: "High stock threshold", value: String((p as any).highStockThreshold ?? 100), color: "text-[#0c831f]", isEditable: false },
    { id: "status", label: "Stock status", value: formattedStockStatus, color: "", isStatus: true, isEditable: false },
    { id: "warehouse", label: "Warehouse", value: p.warehouse || "—", color: "text-[#1a1a1a]", isEditable: true, type: "text" },
  ];

  return (
    <div className="px-4 py-3 sm:px-5 bg-[#f8faf8] flex flex-col gap-3 relative border-t border-gray-200">
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#0c831f] font-semibold text-xs bg-white py-2 px-4 rounded-xl border border-gray-200 shadow-sm">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading details...
          </div>
        </div>
      )}

      {/* Top Info Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
        <div>
          <p className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">Product name</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.name || ""}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-[#1a1a1a] shadow-sm outline-none transition-all placeholder:text-gray-400 focus:outline-none focus:ring-0"
              placeholder="Enter product name"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-sm font-bold text-[#1a1a1a]">{p.name}</p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">Brand</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.brand || ""}
              onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-[#1a1a1a] shadow-sm outline-none transition-all placeholder:text-gray-400 focus:outline-none focus:ring-0"
              placeholder="e.g. Nestle"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p 
              className={`text-sm font-bold transition-colors ${!isEditing && p.brand ? "cursor-pointer hover:underline text-[#0c831f]" : "text-[#0c831f]"}`}
              onClick={(e) => {
                if (!isEditing && p.brand) handleSectionClick("brand", e);
              }}
            >
              {p.brand || "—"}
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">SKU</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.sku || ""}
              onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-[#1a1a1a] shadow-sm outline-none transition-all placeholder:text-gray-400 focus:outline-none focus:ring-0"
              placeholder="Stock Keeping Unit"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-sm font-bold text-[#1a1a1a]">{p.sku}</p>
          )}
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1 font-medium uppercase tracking-wide">Barcode</p>
          {isEditing ? (
            <input
              type="text"
              value={editData.barcode || ""}
              onChange={(e) => setEditData({ ...editData, barcode: e.target.value })}
              className="w-full rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-[#1a1a1a] shadow-sm outline-none transition-all placeholder:text-gray-400 focus:outline-none focus:ring-0"
              placeholder="e.g. 890123456789"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-sm font-bold text-[#1a1a1a]">{p.barcode || "—"}</p>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {metricCards.map((card) => (
          <div
            key={card.id}
            className={`rounded-xl border ${isEditing && card.isEditable ? "border-[#0c831f]/30 bg-[#f4fdf4]" : "border-gray-200 bg-white"
              } px-2.5 py-1.5 shadow-sm transition-colors`}
          >
            <p className={`text-[9px] mb-0.5 uppercase tracking-wider font-semibold ${isEditing && card.isEditable ? "text-[#0c831f]" : "text-gray-400"}`}>
              {card.label}
            </p>
            {card.isEditable && isEditing ? (
              <input
                type={card.type}
                value={(editData as any)[card.id] ?? ""}
                onChange={(e) => setEditData({ ...editData, [card.id]: card.type === "number" ? Number(e.target.value) : e.target.value })}
                className="w-full rounded bg-transparent p-0 text-sm font-bold text-[#1a1a1a] outline-none transition-all focus:outline-none focus:ring-0"
                onClick={(e) => e.stopPropagation()}
              />
            ) : card.isStatus ? (
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded border ${stockStatusColor} inline-block`}
              >
                {card.value}
              </span>
            ) : (
              <p 
                className={`text-sm font-bold transition-colors ${(card as any).isClickable && !isEditing ? `cursor-pointer hover:underline ${card.color}` : card.color}`}
                onClick={(e) => {
                  if ((card as any).isClickable && !isEditing) handleSectionClick(card.id as "weight" | "taxRate", e);
                }}
              >
                {card.value}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0c831f] text-white text-xs font-bold hover:bg-[#0a6e1a] transition-all active:scale-95 shadow-md shadow-green-500/20 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {submitting ? "Saving..." : "Save changes"}
            </button>
            <button
              onClick={handleCancel}
              disabled={submitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 shadow-sm"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-gray-200 text-[#555] text-[11px] font-semibold hover:bg-gray-50 hover:text-[#1a1a1a] hover:border-gray-300 transition-all active:scale-95 shadow-sm"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit product
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(p.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-gray-200 text-[#555] text-[11px] font-semibold hover:bg-gray-50 hover:text-[#1a1a1a] hover:border-gray-300 transition-all active:scale-95 shadow-sm"
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(p.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold hover:bg-red-100 hover:text-red-700 transition-all active:scale-95 shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </>
        )}
      </div>

      {/* Sub Accordion */}
      {expandedSection && !isEditing && (
        <SubAccordion 
          type={expandedSection} 
          product={p} 
          onClose={() => setExpandedSection(null)} 
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Product Management Page
   ──────────────────────────────────────────────────────────── */

export default function ProductsPage() {
  const {
    products,
    loading,
    filters,
    pagination,
    activeFilterCount,
    fetchProducts,
    updateFilters,
    clearFilters,
    setPage,
    setPageSize,
  } = useProducts({ sortBy: "id", sortOrder: "asc" });

  const { createProduct, updateProduct, deleteProduct, submitting } = useProductForm();

  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { confirm, ConfirmDialogElement } = useConfirm({
    title: "Delete Product?",
    description: "Are you sure you want to delete this product? This action cannot be undone.",
    variant: "danger",
    impact: "Deleting this product will remove it from all active categories and might affect historical orders.",
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    updateFilters({ search: value });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    updateFilters({ status: value === "all" ? "" : (value as never) });
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    updateFilters({ category: value === "all" ? "" : (value as never) });
  };

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id);
    const confirmed = await confirm({
      title: `Delete ${product?.name || "Product"}?`,
      impact: `This will permanently remove ${product?.name || "the product"} from the system. Linked order histories may be affected.`,
    });
    if (!confirmed) return;

    const success = await deleteProduct(id);
    if (success) {
      toast.success(`"${product?.name || "Product"}" deleted successfully`);
      fetchProducts();
    } else {
      toast.error("Failed to delete product");
    }
  };

  const handleExport = (fmt: string) => {
    const headers = ["ID", "Name", "SKU", "Barcode", "Brand", "Category", "Price", "MRP", "Stock", "Status"];

    if (fmt === "csv") {
      const csvData = products.map((p) =>
        [
          p.id,
          `"${(p.name || "").replace(/"/g, '""')}"`,
          p.sku,
          p.barcode || "",
          `"${(p.brand || "").replace(/"/g, '""')}"`,
          p.category,
          p.price,
          p.mrp,
          p.stock,
          p.status,
        ].join(",")
      );
      const csvContent = [headers.join(","), ...csvData].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `products_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Products exported as CSV successfully");
    } else if (fmt === "excel") {
      const excelData = products.map((p) => ({
        ID: p.id,
        Name: p.name,
        SKU: p.sku,
        Barcode: p.barcode,
        Brand: p.brand,
        Category: p.category,
        Price: p.price,
        MRP: p.mrp,
        Stock: p.stock,
        Status: p.status,
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      XLSX.writeFile(workbook, `products_export_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Products exported as Excel successfully");
    } else if (fmt === "pdf") {
      const doc = new jsPDF();
      const tableData = products.map((p) => [
        p.id.slice(0, 8),
        p.name,
        p.sku,
        p.category,
        p.price.toString(),
        p.stock.toString(),
        p.status,
      ]);

      autoTable(doc, {
        head: [["ID", "Name", "SKU", "Category", "Price", "Stock", "Status"]],
        body: tableData,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [12, 131, 31] },
      });
      doc.save(`products_export_${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success("Products exported as PDF successfully");
    } else {
      toast.info(`Export as ${fmt.toUpperCase()} is not implemented yet`);
    }
  };

  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
  const outOfStock = products.filter((p) => p.stock === 0).length;
  const categoriesCount = new Set(products.map((p) => p.category)).size;

  const productStats = [
    { label: "Total Products", value: totalProducts.toString(), icon: Package, color: "text-[#0c831f]", bg: "bg-[#0c831f]/10" },
    { label: "Total Stock", value: totalStock.toString(), icon: Archive, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Out of Stock", value: outOfStock.toString(), icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
    { label: "Categories", value: categoriesCount.toString(), icon: Tags, color: "text-violet-600", bg: "bg-violet-50" },
  ];

  const totalPages = pagination.total ? Math.ceil(pagination.total / pagination.pageSize) : 1;

  return (
    <DashboardLayout>
      <div className="space-y-3 p-2 sm:p-3">
        {/* Header */}
        <section className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Products</p>
              <h1 className="mt-0.5 text-lg font-bold text-[#1a1a1a] sm:text-xl">Product Management</h1>
              <p className="mt-0.5 max-w-2xl text-[11px] text-gray-500">
                Manage product catalog, categories, pricing, media, and SEO. {pagination.total} products total.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchProducts}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-[#555] hover:bg-[#f6f7f6] hover:text-[#1a1a1a] transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <ReusableExportButton onExport={handleExport} />
              <button
                onClick={() => router.push("/admin/products/new")}
                className="flex items-center gap-1.5 rounded-lg bg-[#0c831f] px-3 py-2 text-xs font-bold text-white hover:bg-[#0a6e1a] transition-all shadow-md shadow-green-500/15"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="flex flex-col gap-2 mb-3 mt-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 w-full sm:max-w-xl [&>div]:!mb-0">
              <ReusableSearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search products by name or SKU..."
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center p-1 bg-[#f6f7f6] rounded-xl overflow-x-auto hide-scrollbar shrink-0 border border-gray-200">
              {[
                { label: "All Status", value: "all" },
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusFilter(status.value)}
                  className={`px-3.5 py-1.5 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all ${statusFilter === status.value
                      ? "bg-white text-[#0c831f] shadow-sm"
                      : "text-gray-500 hover:text-[#1a1a1a] hover:bg-white/50"
                    }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center justify-center h-8 px-3 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors focus:outline-none shrink-0 border border-red-200"
                title="Clear Filters"
              >
                <span className="text-[11px] font-bold mr-1">Clear</span>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>


        </div>

        {/* Advanced Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Advanced Filters:</span>
          </div>
          
          <div className="relative">
            <select
              value={filters.stockStatus || ""}
              onChange={(e) => updateFilters({ stockStatus: e.target.value })}
              className="appearance-none rounded-lg border border-gray-200 bg-[#f8faf8] pl-3 pr-8 py-1.5 text-xs font-bold text-[#1a1a1a] outline-none hover:border-gray-300 focus:border-[#0c831f] focus:ring-2 focus:ring-[#0c831f]/10 cursor-pointer shadow-sm transition-all"
            >
              <option value="">All Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="high_stock">High Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.sortBy ? `${filters.sortBy}-${filters.sortOrder}` : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  updateFilters({ sortBy: "", sortOrder: "asc" });
                  return;
                }
                const [by, order] = val.split("-");
                updateFilters({ sortBy: by, sortOrder: order as "asc" | "desc" });
              }}
              className="appearance-none rounded-lg border border-gray-200 bg-[#f8faf8] pl-3 pr-8 py-1.5 text-xs font-bold text-[#1a1a1a] outline-none hover:border-gray-300 focus:border-[#0c831f] focus:ring-2 focus:ring-[#0c831f]/10 cursor-pointer shadow-sm transition-all"
            >
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Product Table */}
        {loading ? (
          <AnimatedLoader text="Loading products..." />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f7f6]">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-500">No products found</p>
          </div>
        ) : (
          <div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-[#f8faf8]">
                    <th className="px-4 py-2.5 w-[40%]">Product name</th>
                    <th className="px-4 py-2.5 w-[25%]">Category</th>
                    <th className="px-4 py-2.5 w-[25%]">Item code</th>
                    <th className="px-4 py-2.5 w-[10%] text-right" />
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    products.reduce((acc, p) => {
                      const key = p.name || "Unknown Product";
                      if (!acc.has(key)) acc.set(key, []);
                      acc.get(key)!.push(p);
                      return acc;
                    }, new Map<string, typeof products>()).entries()
                  ).map(([name, variants]) => {
                    const isExpanded = expandedIds.has(name);
                    const firstVariant = variants[0];
                    return (
                      <Fragment key={name}>
                        <tr
                          className={`border-b border-gray-100 cursor-pointer transition-colors duration-150 ${isExpanded ? "bg-[#f8faf8]" : "hover:bg-[#f8faf8]/60"
                            }`}
                          onClick={() => toggleExpand(name)}
                        >
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-semibold text-[#1a1a1a]">{name}</span>
                            {variants.length > 1 && (
                               <span className="ml-2 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full bg-[#0c831f]/10 text-[10px] font-bold text-[#0c831f]">
                                 {variants.length} variants
                               </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="text-[11px] font-medium text-gray-600">{firstVariant.category || "—"}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            {variants.length === 1 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-[#0c831f] border border-[#0c831f]/25 bg-[#0c831f]/5">
                                {firstVariant.itemCode || `ITEM-${firstVariant.id.slice(-2)}`}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-500 font-medium">{variants.length} items grouped</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-gray-400 inline-block" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-400 inline-block" />
                            )}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={4} className="p-0 border-b border-gray-200">
                              <div className="flex flex-col bg-[#f8faf8]">
                                {variants.map((v, index) => (
                                  <div key={v.id} className={index > 0 ? "border-t-[4px] border-gray-200/60" : ""}>
                                    <ExpandedProductRow
                                      baseProduct={v}
                                      onRefresh={fetchProducts}
                                      onDuplicate={(id) => router.push(`/admin/products/new?duplicate=${id}`)}
                                      onDelete={handleDelete}
                                    />
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total && pagination.total > pagination.pageSize && (
              <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Rows per page:</span>
                  <div className="relative">
                    <select
                      value={pagination.pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="appearance-none rounded-lg border border-gray-200 bg-white pl-2.5 pr-7 py-1 text-xs font-bold text-[#1a1a1a] outline-none transition-all hover:border-gray-300 hover:bg-gray-50 focus:border-[#0c831f] focus:ring-2 focus:ring-[#0c831f]/10 cursor-pointer shadow-sm"
                    >
                      {[10, 25, 50, 100].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="mr-2 text-xs text-gray-500">{pagination.total} results</span>
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(pagination.page - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-[#f6f7f6] disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="min-w-[60px] text-center text-xs font-bold text-[#1a1a1a]">
                    {pagination.page} of {totalPages}
                  </span>
                  <button
                    disabled={pagination.page >= totalPages}
                    onClick={() => setPage(pagination.page + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-[#f6f7f6] disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Dialog Element */}
      {ConfirmDialogElement}
    </DashboardLayout>
  );
}
