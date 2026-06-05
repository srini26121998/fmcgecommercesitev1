"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ui/products/product-card";
import Navbar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/mobile/bottom-nav";
import SearchSuggestionsEnhanced from "@/components/ui/search/search-suggestions-enhanced";
import SearchHistory from "@/components/ui/search/search-history";
import AdvancedFilters, { defaultFilterState, getActiveFilterCount, PRICE_RANGES, RATING_OPTIONS, DISCOUNT_OPTIONS, STOCK_OPTIONS } from "@/components/ui/search/advanced-filters";
import type { FilterState } from "@/components/ui/search/advanced-filters";
import { useSearchHistoryStore } from "@/store/search-history-store";
import PullToRefresh from "@/components/ui/mobile/pull-to-refresh";
import CameraScanner from "@/components/ui/mobile/camera-scanner";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Scan,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/lib/hooks/useDebounce";
import ErrorBoundary from "@/components/ui/error-boundary";
import EmptyState from "@/components/ui/empty-state";
import type { ProductSortOption } from "@/lib/types";
import { useProducts, useProductBarcode } from "@/hooks/use-products";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const filterCategories = [
  "All",
  "Groceries",
  "Snacks",
  "Health",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Beverages",
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
] as const;

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { addQuery } = useSearchHistoryStore();
  const { getByBarcode } = useProductBarcode();

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("Search refreshed! ✓", { duration: 1500 });
  }, []);

  /**
   * Barcode scan handler — wired to the real API.
   * Flow: scan → GET /api/v1/products/barcode/:code
   *   → Found: navigate directly to /product/:id
   *   → Not found: fall back to text search for the scanned code
   */
  const handleBarcodeScan = useCallback(async (barcode: string) => {
    setShowScanner(false);
    setIsScanningBarcode(true);
    addQuery(barcode);

    try {
      const product = await getByBarcode(barcode);
      if (product) {
        toast.success(`Found: ${product.name}`, { duration: 2500 });
        router.push(`/product/${product.id}`);
      } else {
        // Barcode not in DB — fall back to text search
        setSearchQuery(barcode);
        toast.info(`No exact match — showing search results for "${barcode}"`, { duration: 3000 });
      }
    } catch {
      // API error — silently fall back to text search
      setSearchQuery(barcode);
      toast.info(`Searching for "${barcode}"...`, { duration: 2000 });
    } finally {
      setIsScanningBarcode(false);
    }
  }, [addQuery, getByBarcode, router]);

  const handleSelectSuggestion = useCallback((query: string) => {
    setSearchQuery(query);
    addQuery(query);
    setShowSuggestions(false);
  }, [addQuery]);

  const handleVoiceSearch = useCallback(() => {
    const SpeechRecognitionAPI =
      (typeof window !== "undefined" &&
        ((window as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
         (window as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition)) ||
      null;
    if (!SpeechRecognitionAPI) {
      alert("Voice search is not supported on your browser. Try Chrome on desktop or Android.");
      return;
    }
    setIsListening(true);
    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        addQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [addQuery]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<ProductSortOption>("relevance");
  const [showFilters, setShowFilters] = useState(false);

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    ...defaultFilterState,
  });

  const activeFilterCount = getActiveFilterCount(activeFilters);

  const clearAllActiveFilters = () => {
    setActiveFilters({ ...defaultFilterState });
  };

  const removePriceRangeChip = (idx: number) => {
    setActiveFilters((prev) => ({
      ...prev,
      priceRanges: prev.priceRanges.filter((i) => i !== idx),
    }));
  };

  const removeDiscountChip = (idx: number) => {
    setActiveFilters((prev) => ({
      ...prev,
      discounts: prev.discounts.filter((i) => i !== idx),
    }));
  };

  const removeRatingChip = (idx: number) => {
    setActiveFilters((prev) => ({
      ...prev,
      ratings: prev.ratings.filter((i) => i !== idx),
    }));
  };

  const removeStockChip = (status: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      stock: prev.stock.filter((s) => s !== status),
    }));
  };

  const { products: filteredProducts, loading, updateFilters } = useProducts({
    search: debouncedSearchQuery,
    category: activeFilters.category !== "All" ? activeFilters.category : (selectedCategory !== "All" ? selectedCategory : undefined),
    sortBy: sortBy === "relevance" ? undefined : sortBy.replace("-low", "").replace("-high", ""),
    sortOrder: sortBy.includes("-high") ? "desc" : "asc"
  });
  
  // Sync filters whenever they change
  useEffect(() => {
    updateFilters({
      search: debouncedSearchQuery,
      category: activeFilters.category !== "All" ? activeFilters.category : (selectedCategory !== "All" ? selectedCategory : undefined),
      sortBy: sortBy === "relevance" ? undefined : sortBy.replace("-low", "").replace("-high", ""),
      sortOrder: sortBy.includes("-high") ? "desc" : "asc"
    });
  }, [debouncedSearchQuery, selectedCategory, activeFilters, sortBy, updateFilters]);

  return (
    <ErrorBoundary>
    <PullToRefresh onRefresh={handleRefresh}>
    <main className="min-h-screen bg-[#f2f2f2] pb-20 md:pb-0">
      <Navbar />

      <div className="pt-[72px] sm:pt-20">
        {/* Search Bar */}
        <div className="bg-white border-b border-[#e8e8e8] px-3 sm:px-4 md:px-6 py-3">
          <div className="max-w-[1400px] mx-auto">
            <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
              <div className="h-11 sm:h-12 rounded-lg bg-[#f2f2f2] border border-[#e8e8e8] flex items-center px-4 gap-3 focus-within:border-[#0c831f] transition-colors">
                <Search className="w-4 h-4 text-[#999] flex-shrink-0" aria-hidden="true" />
                <button
                  onClick={() => setShowScanner(true)}
                  disabled={isScanningBarcode}
                  className="p-1.5 hover:bg-[#e8e8e8] rounded-lg transition-colors mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isScanningBarcode ? "Looking up barcode..." : "Scan barcode"}
                  title={isScanningBarcode ? "Looking up barcode..." : "Scan barcode"}
                >
                  {isScanningBarcode
                    ? <Loader2 className="w-4 h-4 text-[#ff4f8b] animate-spin" />
                    : <Scan className="w-4 h-4 text-[#999] hover:text-[#ff4f8b] transition-colors" />}
                </button>
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search for groceries, snacks, beverages..."
                  className="flex-1 bg-transparent outline-none text-sm text-[#1a1a1a] placeholder:text-[#999]"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      addQuery(searchQuery.trim());
                      setShowSuggestions(false);
                    }
                    if (e.key === "Escape") setShowSuggestions(false);
                  }}
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(""); setShowSuggestions(true); searchInputRef.current?.focus(); }}
                    className="p-1 hover:bg-[#e8e8e8] rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5 text-[#999]" />
                  </button>
                )}
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <SearchSuggestionsEnhanced
                  query={searchQuery}
                  onSelect={(q) => {
                    handleSelectSuggestion(q);
                    searchInputRef.current?.blur();
                  }}
                  onVoiceSearch={handleVoiceSearch}
                  onBarcodeScan={() => setShowScanner(true)}
                  isListening={isListening}
                />
              )}
            </form>
          </div>
        </div>

        {/* Search History */}
        {!searchQuery.trim() && (
          <div className="px-3 sm:px-4 md:px-6 py-3">
            <div className="max-w-[1400px] mx-auto">
              <SearchHistory onSelect={handleSelectSuggestion} />
            </div>
          </div>
        )}

        {/* Category Pills & Filter Button */}
        <div className="bg-white border-b border-[#e8e8e8] px-3 sm:px-4 md:px-6 py-2.5">
          <div className="max-w-[1400px] mx-auto flex items-start gap-2">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto hide-scrollbar">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); if (activeFilters.category !== "All") setActiveFilters((prev) => ({ ...prev, category: "All" })); }}
                  className={`flex-shrink-0 inline-flex items-center justify-center min-h-[44px] h-8 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${
                    cat === selectedCategory
                      ? "bg-[#ff4f8b] text-white border-[#ff4f8b]"
                      : "bg-white text-[#666] border-[#e8e8e8] hover:border-pink hover:text-pink"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowFilters(true)}
                className={`flex-shrink-0 min-h-[44px] h-8 px-3 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeFilterCount > 0
                    ? "bg-[#ff4f8b] text-white border-[#ff4f8b]"
                    : "bg-white text-[#666] border-[#e8e8e8] hover:border-pink hover:text-pink"
                }`}
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[10px] font-bold text-[#ff4f8b] leading-none">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="bg-white border-b border-[#e8e8e8] px-3 sm:px-4 md:px-6 py-2">
            <div className="max-w-[1400px] mx-auto flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-[#999] flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3" />
                Active:
              </span>
              {activeFilters.category !== "All" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#0c831f]/10 text-xs font-semibold text-[#0c831f] border border-[#0c831f]/20">
                  {activeFilters.category}
                  <button onClick={() => setActiveFilters((prev) => ({ ...prev, category: "All" }))} className="hover:bg-[#0c831f]/20 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {activeFilters.priceRanges.map((idx) => (
                <span key={`price-${idx}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff4f8b]/10 text-xs font-semibold text-[#ff4f8b] border border-[#ff4f8b]/20">
                  {PRICE_RANGES[idx].label}
                  <button onClick={() => removePriceRangeChip(idx)} className="hover:bg-[#ff4f8b]/20 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {activeFilters.discounts.map((idx) => (
                <span key={`discount-${idx}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff4f8b]/10 text-xs font-semibold text-[#ff4f8b] border border-[#ff4f8b]/20">
                  {DISCOUNT_OPTIONS[idx].label}
                  <button onClick={() => removeDiscountChip(idx)} className="hover:bg-[#ff4f8b]/20 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {activeFilters.ratings.map((idx) => (
                <span key={`rating-${idx}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff4f8b]/10 text-xs font-semibold text-[#ff4f8b] border border-[#ff4f8b]/20">
                  {RATING_OPTIONS[idx].label}
                  <button onClick={() => removeRatingChip(idx)} className="hover:bg-[#ff4f8b]/20 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {activeFilters.stock.map((status) => (
                <span key={`stock-${status}`} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ff4f8b]/10 text-xs font-semibold text-[#ff4f8b] border border-[#ff4f8b]/20">
                  {STOCK_OPTIONS.find((o) => o.value === status)?.label ?? status}
                  <button onClick={() => removeStockChip(status)} className="hover:bg-[#ff4f8b]/20 rounded-full p-0.5 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllActiveFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#999] hover:text-[#666] transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div
          className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4"
          itemScope
          itemType="https://schema.org/ItemList"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#666]">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "result" : "results"} found
            </p>
            <select
              className="text-xs sm:text-sm border border-[#e8e8e8] rounded-lg px-2 py-1.5 bg-white text-[#1a1a1a] outline-none focus:border-pink"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
            {loading ? (
               <div className="col-span-full py-10 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4f8b]"></div>
               </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={{
                  ...product,
                  oldPrice: product.mrp,
                  rating: 4.5,
                  image: product.media?.[0]?.url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=400&q=80",
                  stock: product.stock > 0 ? "in_stock" : "out_of_stock"
                } as any} />
              ))
            )}
          </div>

          {!loading && filteredProducts.length === 0 && (
            <EmptyState
              variant={activeFilterCount > 0 ? "filtered" : "search"}
              actions={
                activeFilterCount > 0
                  ? [
                      {
                        label: "Clear all filters",
                        onClick: clearAllActiveFilters,
                        icon: <RotateCcw className="w-4 h-4" />,
                        variant: "secondary",
                      },
                    ]
                  : undefined
              }
            />
          )}
        </div>
      </div>

      <BottomNav />

      {/* ─── Advanced Filters ─── */}
      <AdvancedFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={activeFilters}
        onApply={(f) => { setActiveFilters(f); setShowFilters(false); }}
        onClear={() => { setActiveFilters({ ...defaultFilterState }); }}
      />

      {/* ─── Barcode Lookup Overlay ─── */}
      {isScanningBarcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 flex flex-col items-center gap-4 mx-4">
            <div className="w-16 h-16 rounded-full bg-[#fff0f6] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#ff4f8b] animate-spin" />
            </div>
            <p className="text-base font-bold text-[#1a1a1a]">Looking up product...</p>
            <p className="text-xs text-[#999] text-center">Checking barcode against our catalogue</p>
          </div>
        </div>
      )}

       {/* ─── Barcode Scanner Modal ─── */}
      {showScanner && (
        <CameraScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </main>
    </PullToRefresh>
    </ErrorBoundary>
  );
}
