"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Mic, Clock, TrendingUp, X, ArrowRight, Camera, Sparkles } from "lucide-react";
import { useSearchHistoryStore } from "@/store/search-history-store";
import { useProducts } from "@/hooks/use-products";
import { SafeProductImage } from "@/components/ui/safe-image";

interface SearchSuggestionsEnhancedProps {
  query: string;
  onSelect: (query: string) => void;
  onVoiceSearch?: () => void;
  onBarcodeScan?: () => void;
  isListening?: boolean;
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function getClosestMatch(input: string, candidates: string[]): string | null {
  const lower = input.toLowerCase();
  if (candidates.some((c) => c.toLowerCase() === lower)) return null;
  let best: string | null = null;
  let bestDist = 3;
  for (const candidate of candidates) {
    const dist = levenshteinDistance(lower, candidate.toLowerCase());
    if (dist < bestDist && dist > 0) {
      bestDist = dist;
      best = candidate;
    }
  }
  return best;
}

const TRENDING_SEARCHES = ["Milk", "Bread", "Eggs", "Coca-Cola", "Lays", "Tata Salt", "Basmati Rice", "Paneer"];

const CATEGORY_EMOJIS: Record<string, string> = {
  Groceries: "🛒",
  Fruits: "🍎",
  Snacks: "🍿",
  Health: "💊",
  Dairy: "🥛",
  Beverages: "🥤",
};

export default function SearchSuggestionsEnhanced({
  query,
  onSelect,
  onVoiceSearch,
  onBarcodeScan,
  isListening,
}: SearchSuggestionsEnhancedProps) {
  const { queries, removeQuery, clearHistory } = useSearchHistoryStore();
  const { products } = useProducts();
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const allProductNames = useMemo(() => products.map((p: any) => p.name), [products]);
  const allCategories = useMemo(() => [...new Set(products.map((p: any) => p.category))], [products]);

  const searchSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter((p: any) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 8)
      .map((p: any) => ({
        type: "product" as const,
        id: p.id,
        label: p.name,
        category: p.category,
        price: p.price,
        image: p.image,
        emoji: CATEGORY_EMOJIS[p.category] || "📦",
      }));
  }, [query, products]);

  const typoSuggestion = useMemo(() => {
    if (!query.trim() || searchSuggestions.length > 0) return null;
    const closest = getClosestMatch(query, [...allProductNames, ...allCategories]);
    return closest;
  }, [query, searchSuggestions, allProductNames, allCategories]);

  const filteredHistory = useMemo(() => {
    if (!query.trim()) return queries.slice(0, 5);
    const q = query.toLowerCase();
    return queries.filter((h) => h.toLowerCase().includes(q)).slice(0, 3);
  }, [query, queries]);

  const combinedItems = useMemo(() => {
    const items: Array<{ type: "suggestion" | "history" | "typo" | "product"; label: string }> = [];
    if (typoSuggestion) items.push({ type: "typo", label: typoSuggestion });
    if (query.trim() && searchSuggestions.length === 0 && !typoSuggestion) {
      items.push({ type: "suggestion", label: `Search for "${query}"` });
    }
    return items;
  }, [query, searchSuggestions, typoSuggestion]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, combinedItems.length + searchSuggestions.length + filteredHistory.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        const all = [
          ...combinedItems,
          ...searchSuggestions.map((s: any) => ({ type: "product" as const, label: s.label })),
          ...filteredHistory.map((h: any) => ({ type: "history" as const, label: h }))
        ];
        if (all[activeIndex]) onSelect(all[activeIndex].label);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [combinedItems, searchSuggestions, filteredHistory, activeIndex, onSelect]);

  if (!query.trim() && queries.length === 0 && !isListening) return null;

  return (
    <div
      ref={listRef}
      className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#e8e8e8] shadow-lg max-h-[75vh] overflow-y-auto"
    >
      {/* Voice Search Status */}
      {isListening && (
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#e8e8e8] bg-gradient-to-r from-[#fff0f6] to-white">
          <div className="relative w-10 h-10 rounded-full bg-[#ff4f8b] flex items-center justify-center">
            <Mic className="w-5 h-5 text-white" />
            <span className="absolute inset-0 rounded-full bg-[#ff4f8b]/40 animate-ping" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1a1a1a]">Listening...</p>
            <p className="text-xs text-[#666]">Speak clearly your search term</p>
          </div>
        </div>
      )}

      {/* Typo Correction */}
      {typoSuggestion && (
        <button
          onClick={() => onSelect(typoSuggestion)}
          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fff0f6] transition-colors border-b border-[#e8e8e8] ${activeIndex === 0 ? "bg-[#fff0f6]" : ""}`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#fff3e0] flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-[#e65100]" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-semibold text-[#e65100]">Did you mean?</p>
            <p className="text-sm font-bold text-[#1a1a1a]">{typoSuggestion}</p>
          </div>
        </button>
      )}

      {/* Rich Product Suggestions */}
      {searchSuggestions.length > 0 && (
        <div className="border-b border-[#e8e8e8]">
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-[#999] flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Product Suggestions
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            {searchSuggestions.map((s: any, i: number) => {
              const idx = combinedItems.length + i;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.label)}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] transition-colors ${activeIndex === idx ? "bg-[#fafafa]" : ""}`}
                >
                  <div className="relative w-10 h-10 rounded-lg bg-[#f2f2f2] overflow-hidden flex-shrink-0">
                    <SafeProductImage
                      src={s.image}
                      alt={s.label}
                      fill
                      sizes="40px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{s.label}</p>
                    <p className="text-[10px] text-[#999]">
                      <span className="font-semibold text-[#ff4f8b]">₹{s.price}</span>
                      {" · "}{s.emoji} {s.category}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No results suggestion */}
      {query.trim() && searchSuggestions.length === 0 && !typoSuggestion && (
        <div className="px-4 py-6 text-center border-b border-[#e8e8e8]">
          <Search className="w-8 h-8 text-[#ccc] mx-auto mb-2" />
          <p className="text-sm font-semibold text-[#666]">No exact matches for &ldquo;{query}&rdquo;</p>
          <button
            onClick={() => onSelect(query)}
            className="mt-2 text-xs font-bold text-[#ff4f8b] hover:underline"
          >
            Search all products instead
          </button>
        </div>
      )}

      {/* Filtered search history */}
      {filteredHistory.length > 0 && (
        <div className="border-b border-[#e8e8e8]">
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-[#999] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Recent Searches
          </p>
          {filteredHistory.map((q, i) => {
            const idx = combinedItems.length + searchSuggestions.length + i;
            return (
              <div key={`${q}-${i}`} className="flex items-center gap-2 px-4 py-2 group">
                <button
                  onClick={() => onSelect(q)}
                  className={`flex-1 flex items-center gap-3 text-left py-1 rounded-lg min-h-[44px] ${activeIndex === idx ? "bg-[#fafafa]" : ""}`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#999] flex-shrink-0" />
                  <span className="text-sm text-[#666] truncate">{q}</span>
                </button>
                <button
                  onClick={() => removeQuery(q)}
                  className="opacity-0 group-hover:opacity-100 min-w-[44px] min-h-[44px] w-8 h-8 flex items-center justify-center hover:bg-[#f2f2f2] rounded-full transition-all"
                  aria-label={`Remove ${q}`}
                >
                  <X className="w-3 h-3 text-[#999]" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Trending Searches */}
      {!query.trim() && queries.length === 0 && !isListening && (
        <div className="p-4 border-b border-[#e8e8e8]">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#999] mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending Now
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {TRENDING_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => onSelect(term)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f2f2f2] text-xs font-semibold text-[#666] hover:bg-[#ff4f8b] hover:text-white transition-colors text-left"
              >
                <TrendingUp className="w-2.5 h-2.5 flex-shrink-0" />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 p-3">
        {onVoiceSearch && !isListening && (
          <button
            onClick={onVoiceSearch}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#f2f2f2] text-xs font-semibold text-[#666] hover:bg-[#ff4f8b] hover:text-white transition-colors"
          >
            <Mic className="w-3.5 h-3.5" />
            Voice
          </button>
        )}
        {onBarcodeScan && (
          <button
            onClick={onBarcodeScan}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#f2f2f2] text-xs font-semibold text-[#666] hover:bg-[#ff4f8b] hover:text-white transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            Scan
          </button>
        )}
      </div>
    </div>
  );
}
