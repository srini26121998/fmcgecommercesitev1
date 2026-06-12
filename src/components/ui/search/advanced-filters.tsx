"use client";

import { useState } from "react";
import { X, ChevronDown, Check, RotateCcw, Star, Percent, Sparkles, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { StockStatus } from "@/data/products";
import { useCategories } from "@/hooks/use-categories";

const PRICE_RANGES = [
  { label: "Up to ₹200", min: 0, max: 200 },
  { label: "₹200 - ₹600", min: 200, max: 600 },
  { label: "₹600 - ₹1,300", min: 600, max: 1300 },
  { label: "₹1,300 - ₹1,900", min: 1300, max: 1900 },
  { label: "Over ₹1,900", min: 1900, max: Infinity },
] as const;

const RATING_OPTIONS = [
  { label: "4★ & Up", min: 4.0 },
  { label: "3★ & Up", min: 3.0 },
  { label: "2★ & Up", min: 2.0 },
  { label: "1★ & Up", min: 1.0 },
] as const;

const DISCOUNT_OPTIONS = [
  { label: "10% Off or more", min: 10 },
  { label: "25% Off or more", min: 25 },
  { label: "35% Off or more", min: 35 },
  { label: "50% Off or more", min: 50 },
  { label: "60% Off or more", min: 60 },
  { label: "70% Off or more", min: 70 },
] as const;

const STOCK_OPTIONS: { label: string; value: StockStatus }[] = [
  { label: "In Stock", value: "in_stock" },
  { label: "Low Stock", value: "low_stock" },
];

const DELIVERY_DAYS = ["Get It by Tomorrow", "Get It in 2 Days"];
const BRANDS = ["Vedaka", "Aashirvaad", "Tata", "Nestle", "Amul", "Britannia"];
const GROCERY_BRANDS = ["Made for You", "Top Brands"];
const FOOD_PREFERENCE = ["Vegetarian", "Non-Vegetarian"];
const DEALS_AND_DISCOUNTS = ["All Discounts", "Buy More, Save More", "Coupons", "Today's Deals"];
const SELLERS = ["RK World Infocom Pvt Ltd", "ARIPL, Teynampet - Chennai", "SuperMart", "FreshFoods"];
const SPECIALTIES = ["Organic", "Natural", "No Preservatives", "Alcohol Free", "Fat Free", "High in Protein", "Low Fat"];
const CUISINES = ["Indian", "Italian", "Chinese", "Mexican"];

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
  { label: "Budget-friendly", icon: "💰", filters: { priceRanges: [0], discounts: [], ratings: [], stock: [], category: "All", deliveryDays: [], freeShipping: false, localMarket: false, brands: [], groceryBrands: [], foodPreference: [], dealsAndDiscounts: [], payOnDelivery: false, sellers: [], specialty: [], cuisine: [] } },
  { label: "Top rated", icon: "⭐", filters: { priceRanges: [], discounts: [], ratings: [0], stock: [], category: "All", deliveryDays: [], freeShipping: false, localMarket: false, brands: [], groceryBrands: [], foodPreference: [], dealsAndDiscounts: [], payOnDelivery: false, sellers: [], specialty: [], cuisine: [] } },
  { label: "Best deals", icon: "🏷️", filters: { priceRanges: [], discounts: [3], ratings: [], stock: [], category: "All", deliveryDays: [], freeShipping: false, localMarket: false, brands: [], groceryBrands: [], foodPreference: [], dealsAndDiscounts: ["Today's Deals"], payOnDelivery: false, sellers: [], specialty: [], cuisine: [] } },
  { label: "Available now", icon: "✅", filters: { priceRanges: [], discounts: [], ratings: [], stock: ["in_stock"], category: "All", deliveryDays: ["Get It by Tomorrow"], freeShipping: false, localMarket: false, brands: [], groceryBrands: [], foodPreference: [], dealsAndDiscounts: [], payOnDelivery: false, sellers: [], specialty: [], cuisine: [] } },
] as const;

export interface FilterState {
  priceRanges: number[];
  discounts: number[];
  ratings: number[];
  stock: string[];
  category: string;
  deliveryDays: string[];
  freeShipping: boolean;
  localMarket: boolean;
  brands: string[];
  groceryBrands: string[];
  foodPreference: string[];
  dealsAndDiscounts: string[];
  payOnDelivery: boolean;
  sellers: string[];
  specialty: string[];
  cuisine: string[];
}

export const defaultFilterState: FilterState = {
  priceRanges: [],
  discounts: [],
  ratings: [],
  stock: [],
  category: "All",
  deliveryDays: [],
  freeShipping: false,
  localMarket: false,
  brands: [],
  groceryBrands: [],
  foodPreference: [],
  dealsAndDiscounts: [],
  payOnDelivery: false,
  sellers: [],
  specialty: [],
  cuisine: [],
};

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}

export function getActiveFilterCount(filters: FilterState): number {
  return filters.priceRanges.length + filters.discounts.length + filters.ratings.length + filters.stock.length + (filters.category !== "All" ? 1 : 0) +
    filters.deliveryDays.length + (filters.freeShipping ? 1 : 0) + (filters.localMarket ? 1 : 0) + filters.brands.length + filters.groceryBrands.length +
    filters.foodPreference.length + filters.dealsAndDiscounts.length + (filters.payOnDelivery ? 1 : 0) + filters.sellers.length + filters.specialty.length + filters.cuisine.length;
}

export { PRICE_RANGES, RATING_OPTIONS, DISCOUNT_OPTIONS, STOCK_OPTIONS, PRESET_COMBOS, DELIVERY_DAYS, BRANDS, GROCERY_BRANDS, FOOD_PREFERENCE, DEALS_AND_DISCOUNTS, SELLERS, SPECIALTIES, CUISINES };

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
    deliveryDay: false,
    freeShipping: false,
    localMarket: false,
    brands: false,
    groceryBrands: false,
    foodPreference: false,
    dealsAndDiscounts: false,
    payOnDelivery: false,
    sellers: false,
    specialty: false,
    cuisine: false,
  });

  function toggleSection(key: string) {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleArray(key: keyof FilterState, value: number | string) {
    setDraft((prev) => {
      const arr = prev[key] as any[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v: any) => v !== value) : [...arr, value],
      };
    });
  }

  function toggleBoolean(key: keyof FilterState) {
    setDraft((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function applyPreset(preset: typeof PRESET_COMBOS[number]) {
    setDraft({
      priceRanges: [...preset.filters.priceRanges],
      discounts: [...preset.filters.discounts],
      ratings: [...preset.filters.ratings],
      stock: [...preset.filters.stock],
      category: preset.filters.category,
      deliveryDays: [...preset.filters.deliveryDays],
      freeShipping: preset.filters.freeShipping,
      localMarket: preset.filters.localMarket,
      brands: [...preset.filters.brands],
      groceryBrands: [...preset.filters.groceryBrands],
      foodPreference: [...preset.filters.foodPreference],
      dealsAndDiscounts: [...preset.filters.dealsAndDiscounts],
      payOnDelivery: preset.filters.payOnDelivery,
      sellers: [...preset.filters.sellers],
      specialty: [...preset.filters.specialty],
      cuisine: [...preset.filters.cuisine],
    });
  }

  const renderCheckboxSection = (
    title: string,
    sectionKey: string,
    options: { label: string | React.ReactNode; value: any }[],
    draftKey: keyof FilterState,
    icon?: React.ReactNode
  ) => (
    <div className="border-b border-gray-100 py-4">
      <button onClick={() => toggleSection(sectionKey)} className="w-full flex items-center justify-between text-left group">
        <span className="text-[15px] font-semibold text-gray-800 group-hover:text-[#ff4f8b] transition-colors flex items-center gap-2">
          {icon}
          {title}
        </span>
        <motion.div animate={{ rotate: expanded[sectionKey] ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#ff4f8b] transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {expanded[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1 space-y-2.5">
              {options.map((opt) => {
                const isSelected = (draft[draftKey] as any[]).includes(opt.value);
                return (
                  <label key={opt.value} className="flex items-center gap-3 py-1 cursor-pointer group" onClick={() => toggleArray(draftKey, opt.value as never)}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected ? "bg-[#ff4f8b] border-[#ff4f8b] scale-105 shadow-sm shadow-[#ff4f8b]/30" : "border-gray-300 group-hover:border-[#ff4f8b]"
                    }`}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: isSelected ? 1 : 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </motion.div>
                    </div>
                    <span className={`text-[14px] transition-colors ${
                      isSelected ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900"
                    }`}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderBooleanToggle = (
    title: string,
    sectionKey: string,
    label: string,
    draftKey: keyof FilterState
  ) => (
    <div className="border-b border-gray-100 py-4">
      <button onClick={() => toggleSection(sectionKey)} className="w-full flex items-center justify-between text-left group">
        <span className="text-[15px] font-semibold text-gray-800 group-hover:text-[#ff4f8b] transition-colors">{title}</span>
        <motion.div animate={{ rotate: expanded[sectionKey] ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#ff4f8b] transition-colors" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {expanded[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1 space-y-2.5">
              <label className="flex items-center gap-3 py-1 cursor-pointer group" onClick={() => toggleBoolean(draftKey)}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  draft[draftKey] ? "bg-[#ff4f8b] border-[#ff4f8b] scale-105 shadow-sm shadow-[#ff4f8b]/30" : "border-gray-300 group-hover:border-[#ff4f8b]"
                }`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: draft[draftKey] ? 1 : 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                  </motion.div>
                </div>
                <span className={`text-[14px] transition-colors ${
                  draft[draftKey] ? "text-gray-900 font-medium" : "text-gray-600 group-hover:text-gray-900"
                }`}>{label}</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#ff4f8b]/10 rounded-xl">
                  <Filter className="w-5 h-5 text-[#ff4f8b]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">Filters</h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Refine your search</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={onClear} className="text-sm font-semibold text-gray-500 hover:text-[#ff4f8b] transition-colors px-3 py-2 rounded-xl hover:bg-[#ff4f8b]/5">
                  Reset
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors bg-gray-50">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Preset combos */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff4f8b]" />
                Quick Filters
              </p>
              <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
                {PRESET_COMBOS.map((preset) => {
                  const isActive =
                    JSON.stringify({
                      priceRanges: [...draft.priceRanges].sort(),
                      discounts: [...draft.discounts].sort(),
                      ratings: [...draft.ratings].sort(),
                      stock: [...draft.stock].sort(),
                      category: draft.category,
                      deliveryDays: [...draft.deliveryDays].sort(),
                      freeShipping: draft.freeShipping,
                      localMarket: draft.localMarket,
                      brands: [...draft.brands].sort(),
                      groceryBrands: [...draft.groceryBrands].sort(),
                      foodPreference: [...draft.foodPreference].sort(),
                      dealsAndDiscounts: [...draft.dealsAndDiscounts].sort(),
                      payOnDelivery: draft.payOnDelivery,
                      sellers: [...draft.sellers].sort(),
                      specialty: [...draft.specialty].sort(),
                      cuisine: [...draft.cuisine].sort(),
                    }) === JSON.stringify({
                      priceRanges: [...preset.filters.priceRanges].sort(),
                      discounts: [...preset.filters.discounts].sort(),
                      ratings: [...preset.filters.ratings].sort(),
                      stock: [...preset.filters.stock].sort(),
                      category: preset.filters.category,
                      deliveryDays: [...preset.filters.deliveryDays].sort(),
                      freeShipping: preset.filters.freeShipping,
                      localMarket: preset.filters.localMarket,
                      brands: [...preset.filters.brands].sort(),
                      groceryBrands: [...preset.filters.groceryBrands].sort(),
                      foodPreference: [...preset.filters.foodPreference].sort(),
                      dealsAndDiscounts: [...preset.filters.dealsAndDiscounts].sort(),
                      payOnDelivery: preset.filters.payOnDelivery,
                      sellers: [...preset.filters.sellers].sort(),
                      specialty: [...preset.filters.specialty].sort(),
                      cuisine: [...preset.filters.cuisine].sort(),
                    });
                  return (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border shadow-sm ${
                        isActive
                          ? "bg-[#ff4f8b] text-white border-[#ff4f8b] shadow-[#ff4f8b]/20"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#ff4f8b] hover:text-[#ff4f8b] hover:shadow-md"
                      }`}
                    >
                      <span className="text-base">{preset.icon}</span>
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable sections */}
            <div className="flex-1 overflow-y-auto px-6 py-2 pb-8">
              {/* Category */}
              <div className="border-b border-gray-100 py-4">
                <button onClick={() => toggleSection("category")} className="w-full flex items-center justify-between text-left group">
                  <span className="text-[15px] font-semibold text-gray-800 group-hover:text-[#ff4f8b] transition-colors">Category</span>
                  <motion.div animate={{ rotate: expanded.category ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#ff4f8b] transition-colors" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {expanded.category && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-3 pb-1 flex flex-wrap gap-2">
                        {categoryOptions.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setDraft((prev) => ({ ...prev, category: cat }))}
                            className={`px-4 py-2 rounded-xl text-[13px] font-medium border transition-all duration-200 ${
                              draft.category === cat
                                ? "bg-rose-50 text-[#ff4f8b] border-[#ff4f8b]/30"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price Range */}
              {renderCheckboxSection(
                "Price Range",
                "price",
                PRICE_RANGES.map((r, i) => ({ label: r.label, value: i })),
                "priceRanges"
              )}

              {/* Discount */}
              {renderCheckboxSection(
                "Discount",
                "discount",
                DISCOUNT_OPTIONS.map((o, i) => ({ label: o.label.replace("or more", "+ OFF"), value: i })),
                "discounts",
                <Percent className="w-4 h-4 text-[#ff4f8b]" />
              )}

              {/* Rating */}
              {renderCheckboxSection(
                "Customer Rating",
                "rating",
                RATING_OPTIONS.map((o, i) => ({
                  label: (
                    <span className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      {o.label}
                    </span>
                  ),
                  value: i
                })),
                "ratings"
              )}

              {/* Availability */}
              {renderCheckboxSection(
                "Availability",
                "availability",
                STOCK_OPTIONS,
                "stock"
              )}

              {/* Additional Filter Sections */}
              {renderCheckboxSection("Delivery Day", "deliveryDay", DELIVERY_DAYS.map(d => ({ label: d, value: d })), "deliveryDays")}
              {renderBooleanToggle("Eligible for Free Shipping", "freeShipping", "Free Shipping", "freeShipping")}
              {renderBooleanToggle("Local Market", "localMarket", "FMCG Fresh", "localMarket")}
              {renderCheckboxSection("Brands", "brands", BRANDS.map(d => ({ label: d, value: d })), "brands")}
              {renderCheckboxSection("Grocery Brands", "groceryBrands", GROCERY_BRANDS.map(d => ({ label: d, value: d })), "groceryBrands")}
              {renderCheckboxSection("Food Preference", "foodPreference", FOOD_PREFERENCE.map(d => ({ label: d, value: d })), "foodPreference")}
              {renderCheckboxSection("Deals & Discounts", "dealsAndDiscounts", DEALS_AND_DISCOUNTS.map(d => ({ label: d, value: d })), "dealsAndDiscounts")}
              {renderBooleanToggle("Pay On Delivery", "payOnDelivery", "Eligible for Pay On Delivery", "payOnDelivery")}
              {renderCheckboxSection("Seller", "sellers", SELLERS.map(d => ({ label: d, value: d })), "sellers")}
              {renderCheckboxSection("Specialty", "specialty", SPECIALTIES.map(d => ({ label: d, value: d })), "specialty")}
              {renderCheckboxSection("Cuisine", "cuisine", CUISINES.map(d => ({ label: d, value: d })), "cuisine")}
            </div>

            {/* Sticky Apply */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 bg-white/80 backdrop-blur-md flex gap-4">
              <button
                onClick={() => { setDraft({ ...defaultFilterState }); onClear(); }}
                className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 border-gray-200 text-[14px] font-bold text-gray-600 hover:border-[#ff4f8b] hover:text-[#ff4f8b] hover:bg-rose-50 transition-all duration-200 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </button>
              <button
                onClick={() => onApply(draft)}
                className="flex-1 bg-[#ff4f8b] text-white h-12 rounded-xl font-bold text-[15px] hover:bg-[#ff3b7b] hover:shadow-lg hover:shadow-[#ff4f8b]/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
              >
                Show Results
                {getActiveFilterCount(draft) > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-md text-sm">
                    {getActiveFilterCount(draft)}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
