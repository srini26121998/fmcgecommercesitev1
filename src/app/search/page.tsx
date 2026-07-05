"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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
  Loader2,
  Filter,
  ArrowDownUp
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/lib/hooks/useDebounce";
import ErrorBoundary from "@/components/ui/error-boundary";
import EmptyState from "@/components/ui/empty-state";
import type { ProductSortOption } from "@/lib/types";
import { useProducts, useProductBarcode } from "@/hooks/use-products";
import { motion, AnimatePresence, type Variants } from "framer-motion";

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

// Framer Motion Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { addQuery, queries } = useSearchHistoryStore();
  const { getByBarcode } = useProductBarcode();

  const searchTags = useMemo(() => {
    return queries.slice(0, 10);
  }, [queries]);

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("Search refreshed! ✓", { duration: 1500 });
  }, []);

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
        setSearchQuery(barcode);
        toast.info(`No exact match — showing search results for "${barcode}"`, { duration: 3000 });
      }
    } catch {
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

  const removeArrayChip = (key: keyof FilterState, value: string | number) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: (prev[key] as any[]).filter((v) => v !== value),
    }));
  };

  const removeBooleanChip = (key: keyof FilterState) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  const { products: filteredProducts, loading, updateFilters } = useProducts({
    search: debouncedSearchQuery,
    category: activeFilters.category !== "All" ? activeFilters.category : (selectedCategory !== "All" ? selectedCategory : undefined),
    sortBy: sortBy === "relevance" ? undefined : sortBy.replace("-low", "").replace("-high", ""),
    sortOrder: sortBy.includes("-high") ? "desc" : "asc"
  });
  
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
        <main className="min-h-screen bg-gradient-to-b from-[#f8f9fa] to-white pb-20 md:pb-0">
          <Navbar />

          <div className="pt-[72px] sm:pt-20">
            {/* Search Header Area */}
            <div className="bg-white/90 backdrop-blur-xl sticky top-[72px] sm:top-20 z-40 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
              {/* Search Bar */}
              <div className="px-3 sm:px-4 md:px-6 py-4 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto">
                  <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
                    <motion.div 
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="h-12 sm:h-14 rounded-2xl bg-white border border-gray-200/80 flex items-center px-4 gap-3 focus-within:border-pink focus-within:ring-4 focus-within:ring-pink/10 transition-all shadow-sm"
                    >
                      <Search className="w-5 h-5 text-gray-400 flex-shrink-0" aria-hidden="true" />
                      <button
                        onClick={() => setShowScanner(true)}
                        disabled={isScanningBarcode}
                        className="p-2 hover:bg-pink/5 rounded-xl transition-colors mr-1 disabled:opacity-50 disabled:cursor-not-allowed group"
                        aria-label={isScanningBarcode ? "Looking up barcode..." : "Scan barcode"}
                        title={isScanningBarcode ? "Looking up barcode..." : "Scan barcode"}
                      >
                        {isScanningBarcode
                          ? <Loader2 className="w-5 h-5 text-pink animate-spin" />
                          : <Scan className="w-5 h-5 text-gray-400 group-hover:text-pink transition-colors" />}
                      </button>
                      <input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Search for groceries, snacks, beverages..."
                        className="flex-1 bg-transparent outline-none text-[15px] text-gray-800 placeholder:text-gray-400 font-medium w-full"
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
                      <AnimatePresence>
                        {searchQuery && (
                          <motion.button
                            initial={{ scale: 0, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0, rotate: 90 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onClick={() => { setSearchQuery(""); setShowSuggestions(true); searchInputRef.current?.focus(); }}
                            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Clear search"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    {/* Search Suggestions Dropdown */}
                    <AnimatePresence>
                      {showSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 right-0 mt-3 z-50 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden"
                        >
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
              </div>

              {/* Category Pills & Filter Button */}
              <div className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-100">
                <div className="max-w-[1400px] mx-auto flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowFilters(true)}
                      className={`flex-shrink-0 h-10 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all shadow-sm ${
                        activeFilterCount > 0
                          ? "bg-gradient-to-r from-pink to-rose-500 text-white border-transparent shadow-pink/20"
                          : "bg-white text-gray-700 border-gray-200 hover:border-pink hover:text-pink hover:bg-pink/5"
                      }`}
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-white text-[11px] font-bold text-pink leading-none shadow-sm">
                          {activeFilterCount}
                        </span>
                      )}
                    </motion.button>
                  </div>
                  <div className="w-[1px] h-6 bg-gray-200 mx-1 flex-shrink-0" />
                  <motion.div 
                    className="flex-1 flex items-center gap-2.5 overflow-x-auto hide-scrollbar pb-1 -mb-1"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {searchTags.map((cat) => (
                      <motion.button
                        variants={itemVariants}
                        key={cat}
                        onClick={() => { setSearchQuery(cat); addQuery(cat); }}
                        className={`flex-shrink-0 inline-flex items-center justify-center h-10 px-5 rounded-xl text-sm font-medium border transition-all ${
                          cat === searchQuery.trim()
                            ? "bg-gray-900 text-white border-gray-900 shadow-md shadow-gray-900/10"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Active Filter Chips */}
              <AnimatePresence>
                {activeFilterCount > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-50/80 border-b border-gray-100 px-3 sm:px-4 md:px-6 py-3 overflow-hidden"
                  >
                    <div className="max-w-[1400px] mx-auto flex items-center gap-2.5 flex-wrap">
                      <span className="text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5 mr-2">
                        <Sparkles className="w-3.5 h-3.5 text-pink" />
                        Active Filters:
                      </span>
                      {activeFilters.category !== "All" && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-xs font-semibold text-green-700 border border-green-200/60 shadow-sm">
                          {activeFilters.category}
                          <button onClick={() => setActiveFilters((prev) => ({ ...prev, category: "All" }))} className="hover:bg-green-100 rounded-md p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      )}
                      {activeFilters.priceRanges.map((idx) => (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key={`price-${idx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink/10 text-xs font-semibold text-pink border border-pink/20 shadow-sm">
                          {PRICE_RANGES[idx].label}
                          <button onClick={() => removePriceRangeChip(idx)} className="hover:bg-pink/20 rounded-md p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))}
                      {activeFilters.discounts.map((idx) => (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key={`discount-${idx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink/10 text-xs font-semibold text-pink border border-pink/20 shadow-sm">
                          {DISCOUNT_OPTIONS[idx].label}
                          <button onClick={() => removeDiscountChip(idx)} className="hover:bg-pink/20 rounded-md p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))}
                      {activeFilters.ratings.map((idx) => (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key={`rating-${idx}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink/10 text-xs font-semibold text-pink border border-pink/20 shadow-sm">
                          {RATING_OPTIONS[idx].label}
                          <button onClick={() => removeRatingChip(idx)} className="hover:bg-pink/20 rounded-md p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))}
                      {activeFilters.stock.map((status) => (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key={`stock-${status}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink/10 text-xs font-semibold text-pink border border-pink/20 shadow-sm">
                          {STOCK_OPTIONS.find((o) => o.value === status)?.label ?? status}
                          <button onClick={() => removeStockChip(status)} className="hover:bg-pink/20 rounded-md p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))}
                      {(['deliveryDays', 'brands', 'groceryBrands', 'foodPreference', 'dealsAndDiscounts', 'sellers', 'specialty', 'cuisine'] as const).map(key => 
                        activeFilters[key].map((item) => (
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} key={`${key}-${item}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink/10 text-xs font-semibold text-pink border border-pink/20 shadow-sm">
                            {item}
                            <button onClick={() => removeArrayChip(key, item)} className="hover:bg-pink/20 rounded-md p-0.5 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.span>
                        ))
                      )}
                      {activeFilters.freeShipping && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink/10 text-xs font-semibold text-pink border border-pink/20 shadow-sm">
                          Free Shipping
                          <button onClick={() => removeBooleanChip('freeShipping')} className="hover:bg-pink/20 rounded-md p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      )}
                      {activeFilters.localMarket && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink/10 text-xs font-semibold text-pink border border-pink/20 shadow-sm">
                          FMCG Fresh
                          <button onClick={() => removeBooleanChip('localMarket')} className="hover:bg-pink/20 rounded-md p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      )}
                      {activeFilters.payOnDelivery && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink/10 text-xs font-semibold text-pink border border-pink/20 shadow-sm">
                          Pay On Delivery
                          <button onClick={() => removeBooleanChip('payOnDelivery')} className="hover:bg-pink/20 rounded-md p-0.5 transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={clearAllActiveFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-all ml-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Clear all
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search History */}
            {!searchQuery.trim() && (
              <div className="px-3 sm:px-4 md:px-6 py-6">
                <div className="max-w-[1400px] mx-auto">
                  <SearchHistory onSelect={handleSelectSuggestion} />
                </div>
              </div>
            )}

            {/* Results Section */}
            <div
              className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-8"
              itemScope
              itemType="https://schema.org/ItemList"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {searchQuery ? (
                      <span>Results for <span className="text-pink">"{searchQuery}"</span></span>
                    ) : selectedCategory !== "All" ? (
                      selectedCategory
                    ) : (
                      'All Products'
                    )}
                  </h2>
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-fit">
                    {filteredProducts.length} items
                  </span>
                </div>
                
                <div className="flex items-center gap-3 self-end sm:self-auto bg-white border border-gray-200 rounded-xl px-1 shadow-sm">
                  <div className="pl-3 py-2 flex items-center gap-1.5 text-gray-500">
                    <ArrowDownUp className="w-4 h-4" />
                    <label htmlFor="sort-by" className="text-sm font-semibold hidden md:inline">Sort:</label>
                  </div>
                  <div className="relative">
                    <select
                      id="sort-by"
                      className="appearance-none text-sm font-semibold bg-transparent pl-2 pr-8 py-2.5 text-gray-800 outline-none cursor-pointer focus:ring-0 focus:outline-none"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="font-medium">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                 <div className="py-24 flex flex-col items-center justify-center gap-5">
                   <div className="relative w-16 h-16">
                     <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                     <div className="absolute inset-0 rounded-full border-4 border-pink border-t-transparent animate-spin"></div>
                     <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-pink/50 animate-pulse" />
                   </div>
                   <p className="text-gray-500 font-medium tracking-wide">Curating best matches...</p>
                 </div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5"
                >
                  {filteredProducts.map((product) => (
                    <motion.div variants={itemVariants} key={product.id} className="h-full">
                      <ProductCard product={{
                        ...product,
                        oldPrice: product.mrp,
                        rating: 4.5,
                        image: product.media?.[0]?.url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=400&q=80",
                        stock: product.stock > 0 ? "in_stock" : "out_of_stock"
                      } as any} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!loading && filteredProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16"
                >
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
                </motion.div>
              )}
            </div>
          </div>

          <BottomNav />

          {/* Advanced Filters */}
          <AdvancedFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={activeFilters}
            onApply={(f) => { setActiveFilters(f); setShowFilters(false); }}
            onClear={() => { setActiveFilters({ ...defaultFilterState }); }}
          />

          {/* Barcode Lookup Overlay */}
          <AnimatePresence>
            {isScanningBarcode && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-white rounded-3xl shadow-2xl px-10 py-12 flex flex-col items-center gap-6 mx-4 max-w-sm w-full border border-white/20"
                >
                  <div className="relative w-24 h-24">
                     <div className="absolute inset-0 rounded-full border-[6px] border-pink/10"></div>
                     <div className="absolute inset-0 rounded-full border-[6px] border-pink border-t-transparent animate-spin"></div>
                     <Scan className="absolute inset-0 m-auto w-10 h-10 text-pink" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-bold text-gray-900">Scanning Product...</p>
                    <p className="text-sm text-gray-500 font-medium">Checking barcode against our catalogue</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

           {/* Barcode Scanner Modal */}
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
