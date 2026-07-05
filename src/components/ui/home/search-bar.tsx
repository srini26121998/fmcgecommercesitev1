"use client";

import { Mic, Search, History } from "lucide-react";
import Link from "next/link";
import { useSearchHistoryStore } from "@/store/search-history-store";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const { queries } = useSearchHistoryStore();
  const topQueries = queries.slice(0, 5);
  const router = useRouter();

  return (
    <div className="w-full bg-white border-b border-[#e8e8e8] py-3 px-3 sm:px-4 md:px-6">
      <div className="max-w-[1400px] mx-auto">
        <Link href="/search">
          <div className="h-11 sm:h-12 rounded-lg bg-[#f2f2f2] border border-[#e8e8e8] flex items-center px-4 gap-3 hover-border-pink transition-colors cursor-pointer">
            <Search className="text-[#999] w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm text-[#999] truncate">
              Search for groceries, snacks, beverages...
            </span>
            <Mic className="text-[#ff4f8b] w-4 h-4 flex-shrink-0 cursor-pointer" />
          </div>
        </Link>
        
        {topQueries.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
            <span className="text-[11px] font-bold text-[#999] uppercase tracking-wider flex items-center gap-1">
              <History className="w-3 h-3" /> Recent:
            </span>
            {topQueries.map((query, idx) => (
              <button
                key={`${query}-${idx}`}
                onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
                className="px-3 py-1.5 bg-[#f5f5f5] hover:bg-[#e8e8e8] border border-[#e8e8e8] rounded-full text-xs font-medium text-[#4d4d4d] transition-colors whitespace-nowrap cursor-pointer"
              >
                {query}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
