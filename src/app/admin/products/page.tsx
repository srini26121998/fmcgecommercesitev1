"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { useProducts, useProductForm } from "@/hooks/use-products";
import type { Product, ProductStatus, ProductMedia, ProductFormData } from "@/types/products";
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  RefreshCw,
  Filter,
  X,
  Save,
  Package,
  Archive,
  AlertTriangle,
  Tags,
} from "lucide-react";
import { toast } from "sonner";
import FileUpload from "@/components/ui/file-upload";
import type { UploadedFile } from "@/components/ui/file-upload";
import { useConfirm } from "@/components/ui/admin/confirm-dialog";
import { validateForm } from "@/validation/admin";
import { productSchema } from "@/validation/product";
import { adminToast } from "@/lib/admin-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

  const [editFiles, setEditFiles] = useState<UploadedFile[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const { confirm, ConfirmDialogElement } = useConfirm({
    title: "Delete Product?",
    description: "Are you sure you want to delete this product? This action cannot be undone.",
    variant: "danger",
    impact: "Deleting this product will remove it from all active categories and might affect historical orders.",
  });

  // -- Edit Drawer ------------------------------------------
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  const openEditDrawer = (p: Product) => {
    setEditProduct(p);
    setEditForm({ ...p });
    setEditFiles([]);
  };

  const closeEditDrawer = () => {
    setEditProduct(null);
    setEditForm({});
  };

  const handleEditSave = async () => {
    if (!editProduct) return;

    const validation = validateForm(productSchema, editForm);
    if (!validation.success) {
      adminToast.validationError(validation.errors);
      return;
    }

    // Merge newly uploaded files with existing media
    const newMedia = filesToMedia(editFiles, editForm.name || editProduct.name);
    const mergedMedia = newMedia.length > 0
      ? [...(editForm.media || editProduct.media || []), ...newMedia]
      : undefined;
    const result = await updateProduct(editProduct.id, {
      ...editForm,
      ...(mergedMedia ? { media: mergedMedia } : {}),
    });
    if (result) {
      adminToast.success(`"${editForm.name}" updated successfully`);
      closeEditDrawer();
      fetchProducts();
    } else {
      adminToast.apiError("Failed to update product");
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    updateFilters({ search: value });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    updateFilters({ status: value === "all" ? "" : value as never });
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    updateFilters({ category: value === "all" ? "" : value as never });
  };



  // -- Image handling helpers --------------------------------
  function filesToMedia(files: UploadedFile[], productName: string): ProductMedia[] {
    return files.map((f, i) => ({
      id: f.id,
      productId: "", // will be set by the service after ID generation
      type: f.type === "image" ? "image" : "document" as const,
      url: f.preview || "",
      alt: productName,
      isPrimary: i === 0,
      uploadedAt: new Date().toISOString(),
    }));
  }



  const handleDelete = async (id: string) => {
    const product = products.find((p) => p.id === id);
    const confirmed = await confirm({
      title: `Delete ${product?.name || "Product"}?`,
      impact: `This will permanently remove ${product?.name || "the product"} from the system. Linked order histories may be affected.`
    });
    if (!confirmed) return;

    const success = await deleteProduct(id);
    if (success) {
      toast.success(`"${product?.name || 'Product'}" deleted successfully`);
      fetchProducts();
    } else {
      toast.error("Failed to delete product");
    }
  };



  const handleExport = (fmt: string) => {
    const headers = ["ID", "Name", "SKU", "Barcode", "Brand", "Category", "Price", "MRP", "Stock", "Status"];

    if (fmt === "csv") {
      const csvData = products.map(p =>
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
          p.status
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
      const excelData = products.map(p => ({
        ID: p.id,
        Name: p.name,
        SKU: p.sku,
        Barcode: p.barcode,
        Brand: p.brand,
        Category: p.category,
        Price: p.price,
        MRP: p.mrp,
        Stock: p.stock,
        Status: p.status
      }));
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
      XLSX.writeFile(workbook, `products_export_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast.success("Products exported as Excel successfully");
    } else if (fmt === "pdf") {
      const doc = new jsPDF();
      const tableData = products.map(p => [
        p.id.slice(0, 8),
        p.name,
        p.sku,
        p.category,
        p.price.toString(),
        p.stock.toString(),
        p.status
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
  const outOfStock = products.filter(p => p.stock === 0).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;

  const productStats = [
    { label: "Total Products", value: totalProducts.toString(), icon: Package, color: "text-[#1565c0]", bg: "bg-[#e3f2fd]" },
    { label: "Total Stock", value: totalStock.toString(), icon: Archive, color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
    { label: "Out of Stock", value: outOfStock.toString(), icon: AlertTriangle, color: "text-[#dc2626]", bg: "bg-[#fee2e2]" },
    { label: "Categories", value: categoriesCount.toString(), icon: Tags, color: "text-[#ff4f8b]", bg: "bg-[#fff0f6]" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Products</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Product Management</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                Manage product catalog, categories, pricing, media, and SEO. {pagination.total} products total.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={fetchProducts}
                className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <ReusableExportButton onExport={handleExport} />
              <button
                onClick={() => router.push("/admin/products/new")}
                className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <ReusableSearchBar
                value={search}
                onChange={handleSearch}
                placeholder="Search products by name or SKU..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#999]" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none"
              >
                <option value="all">All Categories</option>
                {["Groceries", "Fruits", "Vegetables", "Dairy", "Beverages", "Snacks", "Health", "Personal Care", "Home Care", "Baby Care"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-[#0c831f] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {productStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-[#e8e8e8] p-3 flex items-center gap-3 hover:shadow-sm transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-[#999] font-medium">{stat.label}</p>
                <p className="text-base font-black text-[#1a1a1a]">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <ReusableTable
          data={products}
          keyExtractor={(p) => p.id}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          isLoading={loading}
          enableSelection
          onRowClick={(p) => router.push(`/admin/products/${p.id}`)}
          bulkActions={[
            {
              label: "Delete",
              icon: <Trash2 className="h-3.5 w-3.5" />,
              onClick: async (ids) => {
                const confirmed = await confirm({
                  title: `Delete ${ids.length} Products?`,
                  impact: `You are about to permanently delete ${ids.length} products. This cannot be undone.`
                });
                if (!confirmed) return;

                ids.forEach((id) => deleteProduct(id));
                toast.success(`${ids.length} products deleted`);
                fetchProducts();
              },
              variant: "danger",
            },
          ]}
          columns={[
            { key: "id", header: "ID", width: "60px", hideOnMobile: true, sortable: true },
            {
              key: "name",
              header: "Product Name",
              width: "180px",
              sortable: true,
              render: (p) => (
                <div className="truncate max-w-[160px]" title={p.name}>
                  <span className="font-bold text-[#1a1a1a]">{p.name}</span>
                  <span className="block text-[10px] text-[#999]">{p.sku}</span>
                </div>
              ),
            },
            // { key: "barcode", header: "Barcode", width: "100px", hideOnMobile: true, sortable: true, render: (p) => <span className="text-[11px] text-[#666]">{p.barcode || "—"}</span> },
            { key: "brand", header: "Brand", width: "100px", hideOnMobile: true, sortable: true, render: (p) => <span className="text-[11px]">{p.brand || "—"}</span> },
            { key: "category", header: "Category", width: "110px", hideOnMobile: true, sortable: true, render: (p) => <span className="text-[11px]">{p.category}</span> },
            // { key: "shortDescription", header: "Short Desc", width: "120px", hideOnMobile: true, render: (p) => <span className="text-[11px] text-[#666] truncate max-w-[100px] block" title={p.shortDescription}>{p.shortDescription || "—"}</span> },
            { key: "description", header: "Description", width: "150px", hideOnMobile: true, sortable: true, render: (p) => <span className="text-[11px] text-[#666] truncate max-w-[130px] block" title={p.description}>{p.description || "—"}</span> },
            // { key: "tags", header: "Tags", width: "120px", hideOnMobile: true, render: (p) => <span className="text-[11px] text-[#666] truncate max-w-[100px] block" title={p.tags?.join(", ")}>{p.tags?.join(", ") || "—"}</span> },
            {
              key: "price",
              header: "Price",
              width: "70px",
              align: "center",
              sortable: true,
              render: (p) => <span className="font-bold text-[11px]">₹{p.price}</span>,
            },
            { key: "mrp", header: "MRP", width: "70px", align: "center", sortable: true, hideOnMobile: true, render: (p) => <span className="text-[11px] text-[#999] line-through">₹{p.mrp}</span> },
            { key: "costPrice", header: "Cost", width: "70px", align: "center", sortable: true, hideOnMobile: true, render: (p) => <span className="text-[11px] text-[#666]">₹{p.costPrice}</span> },
            { key: "taxRate", header: "Tax", width: "60px", align: "center", sortable: true, hideOnMobile: true, render: (p) => <span className="text-[11px] text-[#666]">{p.taxRate}%</span> },
            { key: "unit", header: "Unit", width: "60px", sortable: true, hideOnMobile: true, render: (p) => <span className="text-[11px] text-[#666]">{p.unit}</span> },
            { key: "weight", header: "Weight", width: "70px", align: "center", sortable: true, hideOnMobile: true, render: (p) => <span className="text-[11px] text-[#666]">{p.weight}</span> },
            {
              key: "stock",
              header: "Stock",
              width: "70px",
              align: "center",
              sortable: true,
              render: (p) => (
                <span
                  className={`font-bold text-[11px] ${p.stock === 0
                    ? "text-[#dc2626]"
                    : p.stock <= p.lowStockThreshold
                      ? "text-[#d97706]"
                      : "text-[#0c831f]"
                    }`}
                >
                  {p.stock}
                </span>
              ),
            },
            {
              key: "status",
              header: "Status",
              width: "80px",
              sortable: true,
              render: (p) => <StatusBadge status={p.status} />,
            },
            { key: "warehouse", header: "Warehouse", width: "100px", hideOnMobile: true, sortable: true, render: (p) => <span className="text-[11px] truncate max-w-[90px] block" title={p.warehouse}>{p.warehouse || "—"}</span> },
            { key: "supplier", header: "Supplier", width: "100px", hideOnMobile: true, sortable: true, render: (p) => <span className="text-[11px] truncate max-w-[90px] block" title={p.supplier}>{p.supplier || "—"}</span> },
            // { key: "createdAt", header: "Created", width: "120px", hideOnMobile: true, render: (p) => <span className="text-[10px] text-[#999]">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</span> },
            // { key: "updatedAt", header: "Updated", width: "120px", hideOnMobile: true, render: (p) => <span className="text-[10px] text-[#999]">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "—"}</span> },
          ]}
        />
      </div>

      {/* Confirm Dialog Element */}
      {ConfirmDialogElement}

      {/* -- Edit Product Drawer -- */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${editProduct ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={closeEditDrawer}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${editProduct ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Edit Product
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a] truncate max-w-xs">
              {editProduct?.name}
            </h2>
            <p className="text-[10px] text-[#999] mt-0.5">{editProduct?.sku}</p>
          </div>
          <button
            onClick={closeEditDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            aria-label="Close edit panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* Product Name */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Product Name</label>
            <input
              type="text"
              value={editForm.name ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
          </div>

          {/* SKU, Item Code & Barcode */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">SKU</label>
              <input
                type="text"
                value={editForm.sku ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, sku: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Item Code</label>
              <input
                type="text"
                value={editForm.itemCode ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, itemCode: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Barcode</label>
              <input
                type="text"
                value={editForm.barcode ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, barcode: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Category</label>
              <select
                value={editForm.category ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              >
                {["Groceries", "Fruits", "Vegetables", "Dairy", "Beverages", "Snacks", "Health", "Personal Care", "Home Care", "Baby Care"].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Brand</label>
              <input
                type="text"
                value={editForm.brand ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, brand: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
          </div>

          {/* Price / MRP / Cost Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Price (?)</label>
              <input
                type="number"
                value={editForm.price ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, price: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">MRP (?)</label>
              <input
                type="number"
                value={editForm.mrp ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, mrp: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Cost (?)</label>
              <input
                type="number"
                value={editForm.costPrice ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, costPrice: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
          </div>

          {/* Stock */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Stock Qty</label>
            <input
              type="number"
              value={editForm.stock ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
          </div>

          {/* Weight / Unit / Tax Rate */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Weight</label>
              <input
                type="text"
                value={editForm.weight ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, weight: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Unit</label>
              <input
                type="text"
                value={editForm.unit ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Tax Rate (%)</label>
              <input
                type="number"
                value={editForm.taxRate ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, taxRate: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
            <select
              value={editForm.status ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value as ProductStatus }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Warehouse & Supplier */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Warehouse</label>
              <select
                value={editForm.warehouse ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, warehouse: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              >
                {["Mumbai Hub", "Delhi Central", "Pune Cold Storage", "Bangalore Cold Room", "Hyderabad Depot"].map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Supplier</label>
              <input
                type="text"
                value={editForm.supplier ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, supplier: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Short Description</label>
            <input
              type="text"
              value={editForm.shortDescription ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, shortDescription: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Description</label>
            <textarea
              rows={4}
              value={editForm.description ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl border border-[#e8e8e8] px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Tags (comma separated)</label>
            <input
              type="text"
              value={(editForm.tags ?? []).join(", ")}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                }))
              }
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors"
            />
          </div>

          {/* Featured / Flash Sale / Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 cursor-pointer hover:border-[#0c831f] transition-colors">
              <input
                type="checkbox"
                checked={editForm.isFeatured ?? false}
                onChange={(e) => setEditForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="h-4 w-4 rounded border-[#e8e8e8] text-[#0c831f] focus:ring-[#0c831f]"
              />
              <div>
                <p className="text-xs font-bold text-[#1a1a1a]">Featured</p>
                <p className="text-[10px] text-[#999]">Show on homepage banners</p>
              </div>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 cursor-pointer hover:border-[#0c831f] transition-colors">
              <input
                type="checkbox"
                checked={editForm.isFlashSale ?? false}
                onChange={(e) => setEditForm((f) => ({ ...f, isFlashSale: e.target.checked }))}
                className="h-4 w-4 rounded border-[#e8e8e8] text-[#ff4f8b] focus:ring-[#ff4f8b]"
              />
              <div>
                <p className="text-xs font-bold text-[#1a1a1a]">Flash Sale</p>
                <p className="text-[10px] text-[#999]">Mark as limited-time deal</p>
              </div>
            </label>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount %</label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="Override %"
                value={editForm.discountPercent ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f]"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Product Images</label>
            <FileUpload
              files={editFiles}
              onFilesChange={setEditFiles}
              maxFiles={5}
              maxSizeMB={5}
              accept="image/*"
              variant="standalone"
            />
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] bg-white px-6 py-4">
          <button
            onClick={closeEditDrawer}
            className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleEditSave}
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className={`h-4 w-4 ${submitting ? "animate-spin" : ""}`} />
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </aside>
    </DashboardLayout>
  );
}

