"use client";

import { useState } from "react";
import { X, ChevronDown, Check, RotateCcw, Star, Percent, Sparkles } from "lucide-react";
import type { StockStatus } from "@/data/products";
import { useCategories } from "@/hooks/use-categories";

const PRICE_RANGES = [
  { label: "Under ₹100", min: 0, max: 100 },
  { label: "₹100 – ₹500", min: 100, max: 500 },
  { label: "₹500 – ₹1,000", min: 500, max: 1000 },
  { label: "Above ₹1,000", min: 1000, max: Infinity },
] as const;

const RATING_OPTIONS = [
  { label: "4.5★ & above", min: 4.5 },
  { label: "4★ & above", min: 4.0 },
  { label: "3★ & above", min: 3.0 },
  { label: "2★ & above", min: 2.0 },
] as const;

const DISCOUNT_OPTIONS = [
  { label: "10% or more", min: 10 },
  { label: "20% or more", min: 20 },
  { label: "30% or more", min: 30 },
  { label: "50% or more", min: 50 },
] as const;

const STOCK_OPTIONS: { label: string; value: StockStatus }[] = [
  { label: "In Stock", value: "in_stock" },
  { label: "Low Stock", value: "low_stock" },
];

const FALLBACK_CATEGORIES = [
  "All",
  "Groceries",
  "Fruits",
  "Snacks",
  "Health",
  "Dairy",
  "Beverages",
];

const PRESET_COMBOS = [
  { label: "Budget-friendly", icon: "💰", filters: { priceRanges: [0], discounts: [] as number[], ratings: [] as number[], stock: [] as string[], category: "All" } },
  { label: "Top rated", icon: "⭐", filters: { priceRanges: [] as number[], discounts: [] as number[], ratings: [0], stock: [] as string[], category: "All" } },
  { label: "Best deals", icon: "🏷️", filters: { priceRanges: [] as number[], discounts: [2], ratings: [] as number[], stock: [] as string[], category: "All" } },
  { label: "Available now", icon: "✅", filters: { priceRanges: [] as number[], discounts: [] as number[], ratings: [] as number[], stock: ["in_stock"], category: "All" } },
] as const;

export interface FilterState {
  priceRanges: number[];
  discounts: number[];
  ratings: number[];
  stock: string[];
  category: string;
}

export const defaultFilterState: FilterState = {
  priceRanges: [],
  discounts: [],
  ratings: [],
  stock: [],
  category: "All",
};

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}

export function getActiveFilterCount(filters: FilterState): number {
  return filters.priceRanges.length + filters.discounts.length + filters.ratings.length + filters.stock.length + (filters.category !== "All" ? 1 : 0);
}

export { PRICE_RANGES, RATING_OPTIONS, DISCOUNT_OPTIONS, STOCK_OPTIONS, PRESET_COMBOS };

export default function AdvancedFilters({ isOpen, onClose, filters, onApply, onClear }: AdvancedFiltersProps) {
  const { data: apiCategories } = useCategories();
  
  const categoryOptions = apiCategories && apiCategories.length > 0 
    ? ["All", ...apiCategories.map(c => c.name)] 
    : FALLBACK_CATEGORIES;

  const [draft, setDraft] = useState<FilterState>({ ...filters });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    price: true,
    discount: true,
    rating: true,
    availability: true,
    category: true,
  });

  if (!isOpen) return null;

  function toggleSection(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleArray(key: 'priceRanges' | 'discounts' | 'ratings' | 'stock', value: number | string) {
    setDraft((prev) => {
      const arr = prev[key] as (number | string)[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function applyPreset(preset: typeof PRESET_COMBOS[number]) {
    setDraft({
      priceRanges: [...preset.filters.priceRanges],
      discounts: [...preset.filters.discounts],
      ratings: [...preset.filters.ratings],
      stock: [...preset.filters.stock],
      category: preset.filters.category,
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#e8e8e8] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff4f8b]" />
            <h2 className="text-lg font-bold text-[#1a1a1a]">Advanced Filters</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClear} className="text-xs font-semibold text-[#999] hover:text-[#ff4f8b] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#ff4f8b]/5">
              Reset
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-[#f2f2f2] rounded-full transition-colors">
              <X className="w-5 h-5 text-[#666]" />
            </button>
          </div>
        </div>

        {/* Preset combos */}
        <div className="px-4 pt-3 pb-1 border-b border-[#e8e8e8]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#999] mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Quick Filters
          </p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
            {PRESET_COMBOS.map((preset) => {
              const isActive =
                JSON.stringify({
                  priceRanges: [...draft.priceRanges].sort(),
                  discounts: [...draft.discounts].sort(),
                  ratings: [...draft.ratings].sort(),
                  stock: [...draft.stock].sort(),
                  category: draft.category,
                }) === JSON.stringify({
                  priceRanges: [...preset.filters.priceRanges].sort(),
                  discounts: [...preset.filters.discounts].sort(),
                  ratings: [...preset.filters.ratings].sort(),
                  stock: [...preset.filters.stock].sort(),
                  category: preset.filters.category,
                });
              return (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    isActive
                      ? "bg-[#ff4f8b] text-white border-[#ff4f8b]"
                      : "bg-white text-[#666] border-[#e8e8e8] hover:border-[#ff4f8b] hover:text-[#ff4f8b]"
                  }`}
                >
                  <span>{preset.icon}</span>
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {/* Category */}
          <div className="border-b border-[#e8e8e8] py-3">
            <button onClick={() => toggleSection("category")} className="w-full flex items-center justify-between text-left">
              <span className="text-sm font-bold text-[#1a1a1a]">Category</span>
              <ChevronDown className={`w-4 h-4 text-[#999] transition-transform duration-200 ${expanded.category ? "" : "-rotate-90"}`} />
            </button>
            {expanded.category && (
              <div className="mt-3 flex flex-wrap gap-2">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setDraft((prev) => ({ ...prev, category: cat }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      draft.category === cat
                        ? "bg-[#ff4f8b] text-white border-[#ff4f8b]"
                        : "bg-white text-[#666] border-[#e8e8e8] hover:border-[#ff4f8b]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="border-b border-[#e8e8e8] py-3">
            <button onClick={() => toggleSection("price")} className="w-full flex items-center justify-between text-left">
              <span className="text-sm font-bold text-[#1a1a1a]">Price Range</span>
              <ChevronDown className={`w-4 h-4 text-[#999] transition-transform duration-200 ${expanded.price ? "" : "-rotate-90"}`} />
            </button>
            {expanded.price && (
              <div className="mt-3 space-y-2 animate-slide-down">
                {PRICE_RANGES.map((range, idx) => (
                  <label key={idx} className="flex items-center gap-3 py-1.5 cursor-pointer group" onClick={() => toggleArray("priceRanges", idx)}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      draft.priceRanges.includes(idx) ? "bg-[#ff4f8b] border-[#ff4f8b]" : "border-[#ccc] group-hover:border-[#ff4f8b]"
                    }`}>
                      {draft.priceRanges.includes(idx) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-[#1a1a1a]">{range.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Discount */}
          <div className="border-b border-[#e8e8e8] py-3">
            <button onClick={() => toggleSection("discount")} className="w-full flex items-center justify-between text-left">
              <span className="text-sm font-bold text-[#1a1a1a] flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#ff4f8b]" />
                Discount
              </span>
              <ChevronDown className={`w-4 h-4 text-[#999] transition-transform duration-200 ${expanded.discount ? "" : "-rotate-90"}`} />
            </button>
            {expanded.discount && (
              <div className="mt-3 space-y-2 animate-slide-down">
                {DISCOUNT_OPTIONS.map((opt, idx) => {
                  const discountLabel = opt.label.replace("or more", "+ OFF");
                  return (
                    <label key={idx} className="flex items-center gap-3 py-1.5 cursor-pointer group" onClick={() => toggleArray("discounts", idx)}>
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                        draft.discounts.includes(idx) ? "bg-[#ff4f8b] border-[#ff4f8b]" : "border-[#ccc] group-hover:border-[#ff4f8b]"
                      }`}>
                        {draft.discounts.includes(idx) && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-sm text-[#1a1a1a]">{discountLabel}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="border-b border-[#e8e8e8] py-3">
            <button onClick={() => toggleSection("rating")} className="w-full flex items-center justify-between text-left">
              <span className="text-sm font-bold text-[#1a1a1a]">Customer Rating</span>
              <ChevronDown className={`w-4 h-4 text-[#999] transition-transform duration-200 ${expanded.rating ? "" : "-rotate-90"}`} />
            </button>
            {expanded.rating && (
              <div className="mt-3 space-y-2 animate-slide-down">
                {RATING_OPTIONS.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-3 py-1.5 cursor-pointer group" onClick={() => toggleArray("ratings", idx)}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      draft.ratings.includes(idx) ? "bg-[#ff4f8b] border-[#ff4f8b]" : "border-[#ccc] group-hover:border-[#ff4f8b]"
                    }`}>
                      {draft.ratings.includes(idx) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-[#1a1a1a] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Availability */}
          <div className="border-b border-[#e8e8e8] py-3">
            <button onClick={() => toggleSection("availability")} className="w-full flex items-center justify-between text-left">
              <span className="text-sm font-bold text-[#1a1a1a]">Availability</span>
              <ChevronDown className={`w-4 h-4 text-[#999] transition-transform duration-200 ${expanded.availability ? "" : "-rotate-90"}`} />
            </button>
            {expanded.availability && (
              <div className="mt-3 space-y-2 animate-slide-down">
                {STOCK_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 py-1.5 cursor-pointer group" onClick={() => toggleArray("stock", opt.value)}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      draft.stock.includes(opt.value) ? "bg-[#ff4f8b] border-[#ff4f8b]" : "border-[#ccc] group-hover:border-[#ff4f8b]"
                    }`}>
                      {draft.stock.includes(opt.value) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-[#1a1a1a]">{opt.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="h-4" />
        </div>

        {/* Sticky Apply */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-[#e8e8e8] bg-white flex gap-3">
          <button
            onClick={() => { setDraft({ ...defaultFilterState }); onClear(); }}
            className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl border-2 border-[#e8e8e8] text-xs font-bold text-[#666] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All
          </button>
          <button
            onClick={() => onApply(draft)}
            className="flex-1 bg-[#ff4f8b] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#ff6b9d] active:bg-[#e04070] transition-colors"
          >
            Apply Filters
            {getActiveFilterCount(draft) > 0 && ` (${getActiveFilterCount(draft)})`}
          </button>
        </div>
      </div>
    </>
  );
}
