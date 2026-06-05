"use client";
import { useState } from "react";
import { ImagePlus, Video, Copy, Archive, Trash2, Save } from "lucide-react";

const tabs = [
  { id: "basic", label: "Basic Info" },
  { id: "media", label: "Media" },
  { id: "seo", label: "SEO & Tags" },
  { id: "variants", label: "Variants" },
];

export default function ProductForm() {
  const [activeTab, setActiveTab] = useState<typeof tabs[0]["id"]>("basic");

  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[#e8e8e8] px-5 py-4">
        <p className="text-xs font-black uppercase tracking-wide text-[#0c831f]">
          Product Management
        </p>
        <h2 className="mt-1 text-lg font-black text-[#1a1a1a]">
          Add / Edit Product
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e8e8e8]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-bold transition ${
              activeTab === tab.id
                ? "border-b-2 border-[#0c831f] text-[#0c831f]"
                : "text-[#666] hover:text-[#1a1a1a]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="p-5">
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Product Name *</label>
              <input placeholder="Enter product name" className={fieldClassName} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Product ID</label>
              <input placeholder="Auto-generated" className={fieldClassName} disabled />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">SKU *</label>
              <input placeholder="Enter SKU" className={fieldClassName} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Barcode</label>
              <input placeholder="Enter barcode" className={fieldClassName} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Brand *</label>
              <input placeholder="Enter brand name" className={fieldClassName} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Category *</label>
              <select className={fieldClassName}>
                <option>Select Category</option>
                <option>Groceries</option>
                <option>Fruits</option>
                <option>Snacks</option>
                <option>Dairy</option>
                <option>Beverages</option>
                <option>Health</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">MRP *</label>
              <input placeholder="₹0.00" className={fieldClassName} type="number" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Selling Price *</label>
              <input placeholder="₹0.00" className={fieldClassName} type="number" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Warehouse *</label>
              <select className={fieldClassName}>
                <option>Select warehouse</option>
                <option>Mumbai Hub</option>
                <option>Pune Cold Storage</option>
                <option>Bangalore Cold Room</option>
                <option>Hyderabad Depot</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Stock Quantity *</label>
              <input placeholder="0" className={fieldClassName} type="number" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Reserved Stock</label>
              <input placeholder="0" className={fieldClassName} type="number" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Damaged Stock</label>
              <input placeholder="0" className={fieldClassName} type="number" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Expiry Date</label>
              <input placeholder="Select expiry date" className={fieldClassName} type="date" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Status *</label>
              <select className={fieldClassName}>
                <option>Active</option>
                <option>Inactive</option>
                <option>Archived</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-[#666]">Product Images (Max 5)</label>
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-[#e8e8e8] bg-[#f6f7f6] flex items-center justify-center cursor-pointer hover:border-[#0c831f]">
                    <ImagePlus className="w-6 h-6 text-[#ccc]" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-[#666]">Product Video (Optional)</label>
              <div className="rounded-xl border-2 border-dashed border-[#e8e8e8] bg-[#f6f7f6] flex items-center justify-center h-32 cursor-pointer hover:border-[#0c831f]">
                <Video className="w-8 h-8 text-[#ccc]" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Meta Title</label>
              <input placeholder="Enter SEO title" className={fieldClassName} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Meta Description</label>
              <textarea placeholder="Enter SEO description" className="h-20 w-full rounded-xl border border-[#e8e8e8] bg-[#f6f7f6] px-3 py-2 text-sm outline-none focus:border-[#0c831f]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">URL Slug</label>
              <input placeholder="product-url-slug" className={fieldClassName} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-[#666]">Tags</label>
              <input placeholder="Add tags separated by commas" className={fieldClassName} />
            </div>
          </div>
        )}

        {activeTab === "variants" && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#e8e8e8] p-4">
              <p className="text-sm font-bold text-[#666] mb-2">Variant Options</p>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Size (e.g., 500g, 1L)" className={fieldClassName} />
                <input placeholder="Price" className={fieldClassName} />
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-[#e8e8e8] bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] hover:bg-[#f8f9fa]">
              <Copy className="w-4 h-4" />
              Duplicate Variant
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-[#e8e8e8] bg-[#f9fafb] px-5 py-4">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-[#e8e8e8] bg-white px-4 py-2 text-sm font-semibold text-[#1a1a1a] hover:bg-[#f8f9fa]">
            <Archive className="w-4 h-4" />
            Archive
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-[#ff4f8b] bg-white px-4 py-2 text-sm font-semibold text-[#ff4f8b] hover:bg-[#fff0f6]">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
          <Save className="w-4 h-4" />
          Save Product
        </button>
      </div>
    </div>
  );
}

const fieldClassName =
  "h-11 w-full rounded-xl border border-[#e8e8e8] bg-[#f6f7f6] px-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#0c831f] placeholder:text-[#999]";
