"use client";
import { useState } from "react";
import { Image, Plus, Save, Trash2, Archive } from "lucide-react";

const tabs = [
  { id: "basic", label: "Basic Info" },
  { id: "media", label: "Media" },
  { id: "seo", label: "SEO & GST" },
  { id: "featured", label: "Featured Products" },
];

export default function CategoryForm() {
  const [activeTab, setActiveTab] = useState<typeof tabs[0]["id"]>("basic");

  return (
    <div className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
      <div className="border-b border-[#e8e8e8] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-wide text-[#0c831f]">
          Category Management
        </p>
        <h2 className="mt-0.5 text-sm font-black text-[#1a1a1a]">
          Add / Edit Category
        </h2>
      </div>

      <div className="flex flex-wrap border-b border-[#e8e8e8] bg-[#fafafa]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-bold transition ${
              activeTab === tab.id
                ? "border-b-2 border-[#0c831f] text-[#0c831f]"
                : "text-[#666] hover:text-[#1a1a1a]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-[#666]">Category Name *</label>
              <input placeholder="Enter category name" className={fieldClassName} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-[#666]">Parent Category</label>
              <select className={fieldClassName}>
                <option>None (Top Level)</option>
                <option>Groceries</option>
                <option>Fruits</option>
                <option>Snacks</option>
                <option>Dairy</option>
                <option>Beverages</option>
                <option>Health</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold text-[#666]">Description</label>
              <textarea
                placeholder="Enter category description"
                className="h-28 w-full rounded-2xl border border-[#e8e8e8] bg-[#f6f7f6] px-3 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#0c831f] resize-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-[#666]">Status *</label>
              <select className={fieldClassName}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-[#666]">Display Order</label>
              <input placeholder="Enter display order" className={fieldClassName} type="number" />
            </div>
          </div>
        )}

        {activeTab === "media" && (
          <div className="grid grid-cols-1 gap-4">
            <div className="rounded-3xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#1a1a1a]">Category Icon</p>
                  <p className="text-xs text-[#666]">Upload an icon that represents the category.</p>
                </div>
                <div className="rounded-3xl bg-[#e8f5e9] p-3 text-[#0c831f]">
                  <Image className="h-5 w-5" />
                </div>
              </div>
              <button className="mt-4 w-full rounded-2xl border border-[#e8e8e8] bg-white px-4 py-3 text-sm font-semibold text-[#1a1a1a] hover:bg-[#f8f9fa]">
                Upload Icon
              </button>
            </div>

            <div className="rounded-3xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#1a1a1a]">Banner Image</p>
                  <p className="text-xs text-[#666]">Add a banner for the category landing page.</p>
                </div>
                <div className="rounded-3xl bg-[#eff7ff] p-3 text-[#0c63ff]">
                  <Image className="h-5 w-5" />
                </div>
              </div>
              <button className="mt-4 w-full rounded-2xl border border-[#e8e8e8] bg-white px-4 py-3 text-sm font-semibold text-[#1a1a1a] hover:bg-[#f8f9fa]">
                Upload Banner
              </button>
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-[#666]">Meta Title</label>
              <input placeholder="Enter SEO title" className={fieldClassName} />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-[#666]">Meta Description</label>
              <textarea
                placeholder="Enter SEO description"
                className="h-28 w-full rounded-2xl border border-[#e8e8e8] bg-[#f6f7f6] px-3 py-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#0c831f] resize-none"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold text-[#666]">URL Slug</label>
                <input placeholder="category-url-slug" className={fieldClassName} />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold text-[#666]">GST Rate (%)</label>
                <input placeholder="Enter GST rate" className={fieldClassName} type="number" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold text-[#666]">Tags</label>
              <input placeholder="Add tags separated by commas" className={fieldClassName} />
            </div>
          </div>
        )}

        {activeTab === "featured" && (
          <div className="rounded-3xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-[#1a1a1a]">Featured Products</p>
                <p className="text-xs text-[#666]">Pin important products for this category.</p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-[#e8e8e8] bg-white px-3 py-2 text-sm font-semibold text-[#1a1a1a] hover:bg-[#f8f9fa]">
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Fresh Mangoes", "Organic Shampoo", "Protein Bars"].map((product) => (
                <span key={product} className="rounded-full border border-[#e8e8e8] bg-white px-3 py-2 text-xs font-semibold text-[#1a1a1a]">
                  {product}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-[#e8e8e8] bg-[#f9fafb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          <button className="flex items-center gap-1.5 rounded-lg border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-semibold text-[#1a1a1a] hover:bg-[#f8f9fa]">
            <Archive className="w-3 h-3" />
            Archive
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-[#ff4f8b] bg-white px-3 py-1.5 text-xs font-semibold text-[#ff4f8b] hover:bg-[#fff0f6]">
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
        <button className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0c831f] px-4 py-2 text-xs font-bold text-white hover:bg-[#0a6a18]">
          <Save className="w-3 h-3" />
          Save Category
        </button>
      </div>
    </div>
  );
}

const fieldClassName =
  "h-11 w-full rounded-2xl border border-[#e8e8e8] bg-[#f6f7f6] px-3 text-sm text-[#1a1a1a] outline-none transition focus:border-[#0c831f] placeholder:text-[#999]";
