"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../dashboard-layout";
import { useProductForm } from "@/hooks/use-products";
import type { ProductFormData, ProductMedia } from "@/types/products";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import FileUpload from "@/components/ui/file-upload";
import type { UploadedFile } from "@/components/ui/file-upload";
import { validateForm } from "@/validation/admin";
import { productSchema } from "@/validation/product";
import { adminToast } from "@/lib/admin-toast";

export default function NewProductPage() {
  const router = useRouter();
  const { createProduct, submitting } = useProductForm();
  
  const [form, setForm] = useState<Partial<ProductFormData>>({});
  const [files, setFiles] = useState<UploadedFile[]>([]);

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

  const handleSave = async () => {
    const validation = validateForm(productSchema, form);
    if (!validation.success) {
      adminToast.validationError(validation.errors);
      return;
    }

    const media = filesToMedia(files, form.name || "Product");
    const result = await createProduct({ ...form, media: media.length > 0 ? media : undefined });
    if (result) {
      adminToast.success(`"${form.name}" created successfully`);
      router.push("/admin/products");
    } else {
      adminToast.apiError("Failed to create product");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => router.push("/admin/products")}
              className="group mb-2 flex items-center gap-2 text-sm font-medium text-[#666] transition-colors hover:text-[#0c831f]"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Products
            </button>
            <h1 className="text-2xl font-black tracking-tight text-[#1a1a1a] sm:text-3xl">
              Add New Product
            </h1>
            <p className="mt-1.5 text-sm text-[#666]">
              Fill in the details to create a new product in the catalog.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/products")}
              className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] transition-all hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#0a6a18] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-[#0c831f]/20"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {submitting ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
              <h2 className="text-base font-black text-[#1a1a1a] mb-4">General Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Product Name <span className="text-[#dc2626]">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter product name"
                    value={form.name ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  />
                </div>
                
                {/* ADDED ITEM CODE INPUT HERE */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Item Code</label>
                  <input
                    type="text"
                    placeholder="Enter item code"
                    value={form.itemCode ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, itemCode: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#666]">SKU <span className="text-[#dc2626]">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. PROD-SKU-001"
                      value={form.sku ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#666]">Brand</label>
                    <input
                      type="text"
                      placeholder="Brand name"
                      value={form.brand ?? ""}
                      onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                      className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Product description..."
                    value={form.description ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 py-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10 resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Pricing & Inventory */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
              <h2 className="text-base font-black text-[#1a1a1a] mb-4">Pricing & Inventory</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Price (₹) <span className="text-[#dc2626]">*</span></label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.price ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.mrp ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, mrp: Number(e.target.value) }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Stock <span className="text-[#dc2626]">*</span></label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.stock ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Tax Rate (%)</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={form.taxRate ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, taxRate: Number(e.target.value) }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Organization */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
              <h2 className="text-base font-black text-[#1a1a1a] mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Category <span className="text-[#dc2626]">*</span></label>
                  <select
                    value={form.category ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  >
                    <option value="">Select Category</option>
                    {["Groceries", "Fruits", "Vegetables", "Dairy", "Beverages", "Snacks", "Health", "Personal Care", "Home Care", "Baby Care"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Warehouse</label>
                  <select
                    value={form.warehouse ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, warehouse: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  >
                    <option value="">Select Warehouse</option>
                    {["Mumbai Hub", "Delhi Central", "Pune Cold Storage", "Bangalore Cold Room", "Hyderabad Depot"].map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Weight</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 kg, 500 ml"
                    value={form.weight ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  />
                </div>
              </div>
            </section>

            {/* Status & Options */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
              <h2 className="text-base font-black text-[#1a1a1a] mb-4">Status & Options</h2>
              <div className="space-y-4">
                <label className="flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 cursor-pointer hover:border-[#0c831f] transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Featured</p>
                    <p className="text-[10px] text-[#999]">Show on homepage banners</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isFeatured ?? false}
                    onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                    className="h-4 w-4 rounded border-[#e8e8e8] text-[#0c831f] focus:ring-[#0c831f]"
                  />
                </label>
                <label className="flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 cursor-pointer hover:border-[#ff4f8b] transition-colors">
                  <div>
                    <p className="text-xs font-bold text-[#1a1a1a]">Flash Sale</p>
                    <p className="text-[10px] text-[#999]">Mark as limited-time deal</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isFlashSale ?? false}
                    onChange={(e) => setForm((f) => ({ ...f, isFlashSale: e.target.checked }))}
                    className="h-4 w-4 rounded border-[#e8e8e8] text-[#ff4f8b] focus:ring-[#ff4f8b]"
                  />
                </label>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#666]">Discount %</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="Override %"
                    value={form.discountPercent ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
                    className="h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 text-sm text-[#1a1a1a] outline-none transition-colors placeholder:text-[#999] focus:border-[#0c831f] focus:bg-white focus:ring-4 focus:ring-[#0c831f]/10"
                  />
                </div>
              </div>
            </section>

            {/* Media */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
              <h2 className="text-base font-black text-[#1a1a1a] mb-4">Product Images</h2>
              <FileUpload
                files={files}
                onFilesChange={setFiles}
                maxFiles={5}
                maxSizeMB={5}
                accept="image/*"
                variant="standalone"
              />
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
