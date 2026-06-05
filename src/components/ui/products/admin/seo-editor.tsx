"use client";

import { useState } from "react";
import { Save, X, Search, Hash, Globe, Image } from "lucide-react";
import { toast } from "sonner";

interface SEOItem {
  productId: string;
  productName: string;
  sku: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  slug: string;
  canonicalUrl?: string;
  ogImage: string;
}

interface SEOEditorProps {
  items: SEOItem[];
  onUpdate?: (
    productId: string,
    data: {
      metaTitle?: string;
      metaDescription?: string;
      metaKeywords?: string[];
      slug?: string;
      canonicalUrl?: string;
      ogImage?: string;
    }
  ) => Promise<boolean>;
  onSearch?: (search: string) => void;
  searchValue?: string;
  isLoading?: boolean;
}

const inputClass =
  "h-9 w-full rounded-lg border border-[#e8e8e8] bg-white px-3 text-xs text-[#1a1a1a] outline-none transition focus:border-[#0c831f] placeholder:text-[#999]";
const textareaClass =
  "w-full rounded-lg border border-[#e8e8e8] bg-white px-3 py-2 text-xs text-[#1a1a1a] outline-none transition focus:border-[#0c831f] placeholder:text-[#999]";

export default function SEOEditor({
  items,
  onUpdate,
  onSearch,
  searchValue = "",
  isLoading,
}: SEOEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    items.length > 0 ? items[0].productId : null
  );
  const [editValues, setEditValues] = useState<Record<string, SEOItem>>({});
  const [saving, setSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  const selected = items.find((i) => i.productId === selectedId) || items[0];
  const vals = selected && editValues[selected.productId]
    ? editValues[selected.productId]
    : selected;

  const selectProduct = (id: string) => {
    setSelectedId(id);
    if (selected) {
      setEditValues((prev) => ({
        ...prev,
        [id]: { ...(prev[id] || selected) },
      }));
    }
  };

  const updateField = (field: keyof SEOItem, value: string | string[]) => {
    if (!selected) return;
    setEditValues((prev) => ({
      ...prev,
      [selected.productId]: {
        ...(prev[selected.productId] || selected),
        [field]: value,
      },
    }));
  };

  const addKeyword = () => {
    if (!newKeyword.trim() || !selected) return;
    const current = vals?.metaKeywords || [];
    updateField("metaKeywords", [...current, newKeyword.trim()]);
    setNewKeyword("");
  };

  const removeKeyword = (index: number) => {
    const current = vals?.metaKeywords || [];
    updateField("metaKeywords", current.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selected || !vals) return;
    setSaving(true);
    try {
      const success = await onUpdate?.(selected.productId, {
        metaTitle: vals.metaTitle,
        metaDescription: vals.metaDescription,
        metaKeywords: vals.metaKeywords,
        slug: vals.slug,
        canonicalUrl: vals.canonicalUrl,
        ogImage: vals.ogImage,
      });
      if (success === false) {
        toast.error(`Failed to update SEO for ${selected.productName}`);
      } else {
        toast.success(`SEO settings saved for ${selected.productName}`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save SEO settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#e8e8e8] bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-8 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e8e8e8] bg-white p-12 text-center shadow-sm">
        <Globe className="mx-auto h-8 w-8 text-[#ccc]" />
        <p className="mt-2 text-sm font-bold text-[#666]">No products found</p>
        <p className="mt-1 text-xs text-[#999]">Search for a product to edit its SEO settings</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Product Selector */}
      <div className="rounded-xl border border-[#e8e8e8] bg-white p-3 shadow-sm">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
          <input
            value={searchValue}
            onChange={(e) => onSearch?.(e.target.value)}
            placeholder="Search products..."
            className="h-9 w-full rounded-lg border border-[#e8e8e8] bg-white pl-9 pr-3 text-xs outline-none transition focus:border-[#0c831f] placeholder:text-[#999]"
          />
        </div>
        <div className="max-h-[500px] space-y-1 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.productId}
              onClick={() => selectProduct(item.productId)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                selected?.productId === item.productId
                  ? "bg-[#e8f5e9] text-[#0c831f]"
                  : "text-[#666] hover:bg-[#f9fafb]"
              }`}
            >
              <p className="font-bold">{item.productName}</p>
              <p className="mt-0.5 text-[10px] text-[#999]">{item.sku}</p>
            </button>
          ))}
        </div>
      </div>

      {/* SEO Form */}
      {selected && vals && (
        <div className="lg:col-span-2 rounded-xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="mb-4 border-b border-[#e8e8e8] pb-3">
            <p className="text-sm font-bold text-[#1a1a1a]">{selected.productName}</p>
            <p className="text-[10px] text-[#999]">{selected.sku}</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#666]">Meta Title</label>
                <input
                  value={vals.metaTitle}
                  onChange={(e) => updateField("metaTitle", e.target.value)}
                  className={inputClass}
                  maxLength={70}
                />
                <p className="mt-1 text-[10px] text-[#999]">{vals.metaTitle.length}/70 characters</p>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#666]">URL Slug</label>
                <input
                  value={vals.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#666]">Canonical URL</label>
                <input
                  value={vals.canonicalUrl || ""}
                  onChange={(e) => updateField("canonicalUrl", e.target.value)}
                  className={inputClass}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase text-[#666]">OG Image URL</label>
                <input
                  value={vals.ogImage}
                  onChange={(e) => updateField("ogImage", e.target.value)}
                  className={inputClass}
                  placeholder="https://images.example.com/og.jpg"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-[#666]">Meta Description</label>
              <textarea
                value={vals.metaDescription}
                onChange={(e) => updateField("metaDescription", e.target.value)}
                rows={3}
                className={textareaClass}
                maxLength={160}
              />
              <p className="mt-1 text-[10px] text-[#999]">{vals.metaDescription.length}/160 characters</p>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-[#666]">Meta Keywords</label>
              <div className="flex flex-wrap gap-1.5 rounded-lg border border-[#e8e8e8] bg-white p-2">
                {vals.metaKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-[#f6f7f6] px-2.5 py-1 text-[10px] font-medium text-[#666]"
                  >
                    {kw}
                    <button onClick={() => removeKeyword(i)} className="text-[#999] hover:text-[#dc2626]">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1">
                  <input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                    placeholder="Add keyword..."
                    className="max-w-[100px] border-0 bg-transparent px-1 py-1 text-[10px] outline-none placeholder:text-[#999]"
                  />
                  <button
                    onClick={addKeyword}
                    className="rounded p-0.5 text-[#0c831f] hover:bg-[#e8f5e9]"
                  >
                    <Hash className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-[#e8e8e8] bg-[#f9fafb] p-3">
              <p className="mb-1 text-[10px] font-bold uppercase text-[#666]">Google Preview</p>
              <p className="text-sm font-medium text-[#1a73e8]">{vals.metaTitle}</p>
              <p className="text-xs text-[#006d21]">{window.location.origin}/products/{vals.slug}</p>
              <p className="mt-0.5 text-xs text-[#545454]">{vals.metaDescription}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-[#e8e8e8] pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0a6a18] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save SEO Settings"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
