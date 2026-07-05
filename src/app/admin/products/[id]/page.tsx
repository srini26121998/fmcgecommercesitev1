"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import DashboardLayout from "../../dashboard-layout";
import { useProduct, useProductForm } from "@/hooks/use-products";
import { useConfirm } from "@/components/ui/admin/confirm-dialog";
import FileUpload from "@/components/ui/file-upload";
import type { UploadedFile } from "@/components/ui/file-upload";
import { validateForm } from "@/validation/admin";
import { productSchema } from "@/validation/product";
import { adminToast } from "@/lib/admin-toast";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import type { ProductStatus, ProductMedia } from "@/types/products";
import {
  ArrowLeft, Edit3, Trash2, Copy, Save, X,
  Package, Tag, DollarSign, Layers, Warehouse,
  Truck, Star, Zap, ShieldCheck, BarChart2,
  CheckCircle, AlertCircle, Clock, Archive,
} from "lucide-react";

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    active:   { label: "Active",   cls: "bg-emerald-100 text-emerald-700 border border-emerald-200",  icon: <CheckCircle className="w-3.5 h-3.5" /> },
    inactive: { label: "Inactive", cls: "bg-gray-100 text-gray-600 border border-gray-200",            icon: <AlertCircle className="w-3.5 h-3.5" /> },
    draft:    { label: "Draft",    cls: "bg-amber-100 text-amber-700 border border-amber-200",         icon: <Clock className="w-3.5 h-3.5" /> },
    archived: { label: "Archived", cls: "bg-red-100 text-red-600 border border-red-200",               icon: <Archive className="w-3.5 h-3.5" /> },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

function InfoCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#f0f0f0] bg-white p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${accent ?? "bg-[#f0fdf4]"}`}>
        {icon}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#aaa]">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-[#1a1a1a] truncate">{value}</p>
    </div>
  );
}



export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const { product, loading, error } = useProduct(id);
  const { updateProduct, deleteProduct, createProduct, submitting } = useProductForm();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});
  const [editFiles, setEditFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { confirm, ConfirmDialogElement } = useConfirm({
    title: "Delete Product?",
    description: "This action cannot be undone.",
    variant: "danger",
    impact: "Deleting this product will remove it from all active categories.",
  });

  const startEdit = () => {
    if (!product) return;
    setEditForm({ ...product });
    setEditFiles([]);
    setErrors({});
    setIsEditing(true);
  };

  useEffect(() => {
    if (searchParams?.get("edit") === "true" && product && !isEditing && Object.keys(editForm).length === 0) {
      startEdit();
    }
  }, [searchParams, product, isEditing, editForm]);

  const cancelEdit = () => { 
    setIsEditing(false); 
    setEditForm({}); 
    setErrors({}); 
    if (searchParams?.get("edit") === "true") {
      router.replace(`/admin/products/${product?.id}`);
    }
  };

  const handleSave = async () => {
    if (!product) return;
    const validation = validateForm(productSchema, editForm);
    if (!validation.success) { 
      adminToast.validationError(validation.errors); 
      setErrors(validation.errors);
      return; 
    }
    setErrors({});
    
    // Upload files to backend directly
    const uploadedMediaUrls: string[] = [];
    for (const f of editFiles) {
      const formData = new FormData();
      formData.append("file", f.file);
      try {
        const res = await apiClient.post<any>("/api/v1/admin/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (res?.data?.url) {
          uploadedMediaUrls.push(res.data.url);
        } else if (res?.url) { // fallback
          uploadedMediaUrls.push(res.url);
        }
      } catch (err) {
        console.error("Failed to upload file to backend", err);
      }
    }

    const newMedia: ProductMedia[] = uploadedMediaUrls.map((url, i) => ({
      id: `media-${Date.now()}-${i}`,
      productId: product.id,
      type: "image",
      url,
      alt: (editForm.name as string) || product.name,
      isPrimary: i === 0 && (!product.media || product.media.length === 0),
      uploadedAt: new Date().toISOString(),
    }));

    const mergedMedia = newMedia.length > 0 ? [...(product.media || []), ...newMedia] : undefined;
    const result = await updateProduct(product.id, { ...editForm, ...(mergedMedia ? { media: mergedMedia } : {}) });
    if (result) {
      adminToast.success(`"${editForm.name}" updated successfully`);
      setIsEditing(false);
      router.refresh();
    } else {
      adminToast.apiError("Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    const confirmed = await confirm({ title: `Delete "${product.name}"?`, impact: "This will permanently remove the product." });
    if (!confirmed) return;
    const ok = await deleteProduct(product.id);
    if (ok) { toast.success("Product deleted"); router.push("/admin/products"); }
    else toast.error("Failed to delete product");
  };

  const handleDuplicate = async () => {
    if (!product) return;
    const { id: _id, createdAt, updatedAt, media, variants, ...rest } = product;
    const result = await createProduct({ ...rest, name: `${product.name} (Copy)`, sku: `${product.sku}-COPY` });
    if (result) { toast.success("Product duplicated"); router.push(`/admin/products/${result.id}`); }
    else toast.error("Failed to duplicate product");
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#0c831f] border-t-transparent animate-spin" />
          <p className="text-sm text-[#999]">Loading product…</p>
        </div>
      </div>
    </DashboardLayout>
  );

  if (error || !product) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-base font-bold text-[#1a1a1a]">Product not found</p>
        <button onClick={() => router.push("/admin/products")} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </button>
      </div>
    </DashboardLayout>
  );

  const f = editForm as Record<string, unknown>;
  const inp = "h-12 w-full rounded-xl border border-[#e8e8e8] bg-white px-4 text-sm text-[#1a1a1a] outline-none shadow-sm hover:shadow focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 focus:shadow-md transition-all duration-200";

  return (
    <DashboardLayout>
      <div className="space-y-5 p-2 sm:p-4">

        {/* ── Top bar ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#e8e8e8] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/products")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Product Details</p>
              <h1 className="text-lg font-black text-[#1a1a1a] leading-tight">{product.name}</h1>
              <p className="text-[11px] text-[#999]">{product.sku} · {product.category}</p>
            </div>
          </div>

          {/* Action Buttons */}
          {!isEditing ? (
            <div className="flex flex-wrap items-center gap-2">
              {/* Edit */}
              <button
                onClick={startEdit}
                className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] shadow-sm hover:shadow-md transition-all"
              >
                <Edit3 className="w-4 h-4" /> Edit Product
              </button>
              {/* Duplicate */}
              <button
                onClick={handleDuplicate}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 hover:border-amber-200 shadow-sm transition-all disabled:opacity-50"
              >
                <Copy className="w-4 h-4" /> Duplicate
              </button>
              {/* Delete */}
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 shadow-sm transition-all disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={cancelEdit} className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all">
                <X className="w-4 h-4" /> Cancel
              </button>
              <button onClick={handleSave} disabled={submitting} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] shadow-md transition-all disabled:opacity-50">
                <Save className={`w-4 h-4 ${submitting ? "animate-spin" : ""}`} />
                {submitting ? "Saving…" : "Save Changes"}
              </button>
            </div>
          )}
        </div>

        {/* ── View mode ── */}
        {!isEditing && (
          <>
            {/* Hero strip */}
            <div className="rounded-2xl border border-[#e8e8e8] bg-gradient-to-r from-[#f0fdf4] to-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow border border-[#e8e8e8]">
                <Package className="w-8 h-8 text-[#0c831f]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black text-[#1a1a1a] truncate">{product.name}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StatusChip status={product.status} />
                  {product.isFeatured && <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 border border-yellow-200 px-2.5 py-0.5 text-[11px] font-bold text-yellow-700"><Star className="w-3 h-3" />Featured</span>}
                  {product.isFlashSale && <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 border border-pink-200 px-2.5 py-0.5 text-[11px] font-bold text-pink-600"><Zap className="w-3 h-3" />Flash Sale</span>}
                </div>
                {product.description && <p className="mt-2 text-xs text-[#666] line-clamp-2">{product.description}</p>}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-2xl font-black text-[#0c831f]">₹{product.price}</p>
                <p className="text-sm text-[#999] line-through">MRP ₹{product.mrp}</p>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <InfoCard icon={<Tag className="w-4 h-4 text-[#1565c0]" />} label="Item Code" value={product.itemCode || "—"} accent="bg-blue-50" />
              <InfoCard icon={<Tag className="w-4 h-4 text-[#1565c0]" />} label="Brand" value={product.brand || "—"} accent="bg-blue-50" />
              <InfoCard icon={<Layers className="w-4 h-4 text-purple-600" />} label="Category" value={product.category} accent="bg-purple-50" />
              <InfoCard icon={<DollarSign className="w-4 h-4 text-[#0c831f]" />} label="Cost Price" value={`₹${product.costPrice}`} accent="bg-emerald-50" />
              <InfoCard icon={<ShieldCheck className="w-4 h-4 text-amber-600" />} label="Tax Rate" value={`${product.taxRate}%`} accent="bg-amber-50" />
              <InfoCard icon={<Package className="w-4 h-4 text-[#0c831f]" />} label="Stock" value={product.stock.toString()} accent={product.stock === 0 ? "bg-red-50" : "bg-emerald-50"} />
              <InfoCard icon={<BarChart2 className="w-4 h-4 text-[#1565c0]" />} label="Unit" value={product.unit || "—"} accent="bg-blue-50" />
              <InfoCard icon={<Truck className="w-4 h-4 text-purple-600" />} label="Weight" value={product.weight || "—"} accent="bg-purple-50" />
              <InfoCard icon={<Warehouse className="w-4 h-4 text-amber-600" />} label="Warehouse" value={product.warehouse || "—"} accent="bg-amber-50" />
              <InfoCard icon={<Truck className="w-4 h-4 text-[#666]" />} label="Supplier" value={product.supplier || "—"} accent="bg-gray-50" />
              <InfoCard icon={<BarChart2 className="w-4 h-4 text-[#666]" />} label="Barcode" value={product.barcode || "—"} accent="bg-gray-50" />
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#999]">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((t) => (
                    <span key={t} className="rounded-full bg-[#e8f5e9] px-3 py-1 text-xs font-medium text-[#0c831f]">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#999]">Variants</p>
                <div className="space-y-2">
                  {product.variants.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-xl bg-[#f9fafb] px-4 py-2.5">
                      <span className="text-sm font-bold text-[#1a1a1a]">{v.name}</span>
                      <span className="text-xs text-[#666]">₹{v.price} · Stock: {v.stock}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Edit mode ── */}
        {isEditing && (
          <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm space-y-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0c831f]">Editing Product</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Product Name <span className="text-red-500">*</span></label><input className={inp} value={(f.name as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />{errors.name && <p className="mt-1.5 text-[11px] font-bold text-red-500">{errors.name}</p>}</div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">SKU <span className="text-red-500">*</span></label><input className={inp} value={(f.sku as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, sku: e.target.value }))} />{errors.sku && <p className="mt-1.5 text-[11px] font-bold text-red-500">{errors.sku}</p>}</div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Item Code</label><input className={inp} value={(f.itemCode as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, itemCode: e.target.value }))} /></div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Barcode</label><input className={inp} value={(f.barcode as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, barcode: e.target.value }))} /></div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Brand</label><input className={inp} value={(f.brand as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, brand: e.target.value }))} /></div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Category <span className="text-red-500">*</span></label>
                <select className={inp} value={(f.category as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))}>
                  {["Groceries","Fruits","Vegetables","Dairy","Beverages","Snacks","Health","Personal Care","Home Care","Baby Care"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="mt-1.5 text-[11px] font-bold text-red-500">{errors.category}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Status <span className="text-red-500">*</span></label>
                <select className={inp} value={(f.status as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as ProductStatus }))}>
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="draft">Draft</option><option value="archived">Archived</option>
                </select>
              </div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Price (₹) <span className="text-red-500">*</span></label><input type="number" className={inp} value={(f.price as number) ?? ""} onChange={e => setEditForm(p => ({ ...p, price: Number(e.target.value) }))} />{errors.price && <p className="mt-1.5 text-[11px] font-bold text-red-500">{errors.price}</p>}</div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">MRP (₹)</label><input type="number" className={inp} value={(f.mrp as number) ?? ""} onChange={e => setEditForm(p => ({ ...p, mrp: Number(e.target.value) }))} /></div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Cost Price (₹)</label><input type="number" className={inp} value={(f.costPrice as number) ?? ""} onChange={e => setEditForm(p => ({ ...p, costPrice: Number(e.target.value) }))} /></div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Tax Rate (%)</label>
                <select className={inp + " appearance-none cursor-pointer"} value={(f.taxRate as number) ?? ""} onChange={e => setEditForm(p => ({ ...p, taxRate: Number(e.target.value) }))}>
                  <option value="">Select Tax Rate</option>
                  {[0, 5, 12, 18, 28].map((rate) => <option key={rate} value={rate}>GST {rate}%</option>)}
                </select>
              </div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Stock Qty <span className="text-red-500">*</span></label><input type="number" className={inp} value={(f.stock as number) ?? ""} onChange={e => setEditForm(p => ({ ...p, stock: Number(e.target.value) }))} />{errors.stock && <p className="mt-1.5 text-[11px] font-bold text-red-500">{errors.stock}</p>}</div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Unit</label>
                <select className={inp + " appearance-none cursor-pointer"} value={(f.unit as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, unit: e.target.value }))}>
                  <option value="">Select Unit</option>
                  {["piece", "pack", "box", "bottle", "can", "jar", "kg", "g", "L", "ml"].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Weight</label>
                <select className={inp + " appearance-none cursor-pointer"} value={(f.weight as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, weight: e.target.value }))}>
                  <option value="">Select Weight</option>
                  {["50 g", "100 g", "200 g", "250 g", "500 g", "1 kg", "2 kg", "5 kg", "10 kg", "25 kg", "50 ml", "100 ml", "200 ml", "250 ml", "500 ml", "1 L", "2 L", "5 L"].map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Warehouse</label>
                <select className={inp} value={(f.warehouse as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, warehouse: e.target.value }))}>
                  <option value="">Select Warehouse</option>
                  {["Mumbai Hub","Delhi Central","Pune Cold Storage","Bangalore Cold Room","Hyderabad Depot"].map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Supplier</label><input className={inp} value={(f.supplier as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, supplier: e.target.value }))} /></div>
              <div><label className="mb-1.5 block text-xs font-bold text-[#666]">Discount %</label><input type="number" min={0} max={100} className={inp} value={(f.discountPercent as number) ?? ""} onChange={e => setEditForm(p => ({ ...p, discountPercent: Number(e.target.value) }))} /></div>

              <div className="sm:col-span-3">
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Description</label>
                <textarea rows={4} className="w-full rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none shadow-sm hover:shadow focus:border-[#0c831f] focus:ring-4 focus:ring-[#0c831f]/10 focus:shadow-md transition-all duration-200 resize-none" value={(f.description as string) ?? ""} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="sm:col-span-3">
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Keywords (comma separated)</label>
                <input className={inp} value={((f.tags as string[]) ?? []).join(", ")} onChange={e => setEditForm(p => ({ ...p, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))} />
              </div>

              {/* Toggles */}
              <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                <label className="flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 cursor-pointer shadow-sm hover:shadow focus-within:ring-4 focus-within:ring-[#0c831f]/10 hover:border-[#0c831f] transition-all duration-200">
                  <input type="checkbox" checked={(f.isFeatured as boolean) ?? false} onChange={e => setEditForm(p => ({ ...p, isFeatured: e.target.checked }))} className="h-4 w-4 rounded text-[#0c831f]" />
                  <div><p className="text-xs font-bold text-[#1a1a1a]">Featured</p><p className="text-[10px] text-[#999]">Show on homepage</p></div>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 cursor-pointer shadow-sm hover:shadow focus-within:ring-4 focus-within:ring-[#ff4f8b]/10 hover:border-[#ff4f8b] transition-all duration-200">
                  <input type="checkbox" checked={(f.isFlashSale as boolean) ?? false} onChange={e => setEditForm(p => ({ ...p, isFlashSale: e.target.checked }))} className="h-4 w-4 rounded text-[#ff4f8b]" />
                  <div><p className="text-xs font-bold text-[#1a1a1a]">Flash Sale</p><p className="text-[10px] text-[#999]">Limited-time deal</p></div>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Product Images</label>
              <FileUpload files={editFiles} onFilesChange={setEditFiles} maxFiles={5} maxSizeMB={5} accept="image/*" variant="standalone" />
            </div>
          </div>
        )}
      </div>
      {ConfirmDialogElement}
    </DashboardLayout>
  );
}
