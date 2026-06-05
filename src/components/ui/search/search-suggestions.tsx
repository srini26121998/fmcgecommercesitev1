"use client";

import { useState, useMemo } from "react";
import { Search, Mic, Clock, TrendingUp, X, ArrowRight } from "lucide-react";
import { useSearchHistoryStore } from "@/store/search-history-store";
import { useProducts } from "@/hooks/use-products";

interface SearchSuggestionsProps {
  query: string;
  onSelect: (query: string) => void;
  onVoiceSearch?: () => void;
  isListening?: boolean;
}

// Simple Levenshtein-based typo correction
function getClosestMatch(input: string, candidates: string[]): string | null {
  const lower = input.toLowerCase();
  if (candidates.some((c) => c.toLowerCase() === lower)) return null; // exact match
  let best: string | null = null;
  let bestDist = 3; // max edit distance
  for (const candidate of candidates) {
    const dist = levenshteinDistance(lower, candidate.toLowerCase());
    if (dist < bestDist && dist > 0) {
      bestDist = dist;
      best = candidate;
    }
  }
  return best;
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

export default function SearchSuggestions({ query, onSelect, onVoiceSearch, isListening }: SearchSuggestionsProps) {
  const { products } = useProducts();
  const { queries, removeQuery, clearHistory } = useSearchHistoryStore();
  const [showHistory, setShowHistory] = useState(true);

  const allProductNames = useMemo(() => products.map((p) => p.name), []);
  const allCategories = useMemo(() => [...new Set(products.map((p) => p.category))], []);

  const searchSuggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .slice(0, 6)
      .map((p) => ({ type: "product" as const, label: p.name, category: p.category, price: p.price }));
  }, [query]);

  const typoSuggestion = useMemo(() => {
    if (!query.trim() || searchSuggestions.length > 0) return null;
    const closest = getClosestMatch(query, [...allProductNames, ...allCategories]);
    return closest;
  }, [query, searchSuggestions, allProductNames, allCategories]);

  const trendingSearches = ["Milk", "Bread", "Eggs", "Coca-Cola", "Lays", "Tata Salt"];

  if (!query.trim() && queries.length === 0 && !isListening) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#e8e8e8] shadow-lg max-h-[70vh] overflow-y-auto">
      {/* Voice Search Status */}
      {isListening && (
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#e8e8e8] bg-gradient-to-r from-[#fff0f6] to-white">
          <div className="relative w-10 h-10 rounded-full bg-[#ff4f8b] flex items-center justify-center animate-pulse">
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
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fff0f6] transition-colors border-b border-[#e8e8e8]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#fff3e0] flex items-center justify-center">
            <ArrowRight className="w-4 h-4 text-[#e65100]" />
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-[#e65100]">Did you mean?</p>
            <p className="text-sm font-bold text-[#1a1a1a]">{typoSuggestion}</p>
          </div>
        </button>
      )}

      {/* Search Suggestions */}
      {searchSuggestions.length > 0 && (
        <div className="border-b border-[#e8e8e8]">
          <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wide text-[#999]">Suggestions</p>
          {searchSuggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSelect(s.label)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] transition-colors"
            >
              <Search className="w-4 h-4 text-[#999] flex-shrink-0" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm text-[#1a1a1a] truncate">{s.label}</p>
                <p className="text-[10px] text-[#999]">{s.category} • ₹{s.price}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Search History */}
      {!query.trim() && queries.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#999] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Recent Searches
            </p>
            <button
              onClick={clearHistory}
              className="text-[10px] font-semibold text-[#ff4f8b] hover:underline"
            >
              Clear all
            </button>
          </div>
          {queries.slice(0, 5).map((q) => (
            <div key={q} className="flex items-center gap-2 px-4 py-2 group">
              <button
                onClick={() => onSelect(q)}
                className="flex-1 flex items-center gap-3 text-left hover:bg-[#fafafa] transition-colors py-1 rounded-lg"
              >
                <Clock className="w-3.5 h-3.5 text-[#999] flex-shrink-0" />
                <span className="text-sm text-[#666] truncate">{q}</span>
              </button>
              <button
                onClick={() => removeQuery(q)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#f2f2f2] rounded-full transition-all"
                aria-label={`Remove ${q} from history`}
              >
                <X className="w-3 h-3 text-[#999]" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Trending Searches */}
      {!query.trim() && queries.length === 0 && !isListening && (
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#999] mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending Now
          </p>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => onSelect(term)}
                className="px-3 py-1.5 rounded-full bg-[#f2f2f2] text-xs font-semibold text-[#666] hover:bg-[#ff4f8b] hover:text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Search Button */}
      {onVoiceSearch && !isListening && !query.trim() && (
        <div className="border-t border-[#e8e8e8] p-3">
          <button
            onClick={onVoiceSearch}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#f2f2f2] text-sm font-semibold text-[#666] hover:bg-[#ff4f8b] hover:text-white transition-colors"
          >
            <Mic className="w-4 h-4" />
            Search by voice
          </button>
        </div>
      )}
    </div>
  );
}
