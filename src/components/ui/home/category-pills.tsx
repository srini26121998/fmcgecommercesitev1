"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryPills() {
  const { data: apiCategories, isLoading } = useCategories();

  const displayCategories = (apiCategories || []).map(c => ({
    label: c.name,
    emoji: c.image || "📦",
    slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-')
  }));

  return (
    <nav
      className="w-full bg-white border-b border-[#e8e8e8]"
      aria-label="Product categories"
    >
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6">
        <ul className="flex items-center gap-2 sm:gap-3 overflow-x-auto hide-scrollbar py-3">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <li key={idx} className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[70px] sm:min-w-[80px]">
                <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl" />
                <Skeleton className="h-3 w-12 mt-1" />
              </li>
            ))
          ) : (
            displayCategories.map((item, idx) => (
              <li key={`${item.label}-${idx}`}>
                <Link
                  href={`/category/${item.slug}`}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-1 min-w-[70px] sm:min-w-[80px] px-2 sm:px-4 py-3 sm:py-2 rounded-xl bg-[#f2f2f2] hover:bg-[#ffe6f0] hover:border-[#ff4f8b] border border-transparent transition-all group"
                  aria-label={`Browse ${item.label} category`}
                >
                  {item.emoji.startsWith("http") || item.emoji.startsWith("/") ? (
                    <img src={item.emoji} alt={item.label} className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="text-xl sm:text-xl" aria-hidden="true">{item.emoji}</span>
                  )}
                  <span className="text-[11px] sm:text-xs font-semibold text-[#1a1a1a] group-hover:text-[#ff4f8b] whitespace-nowrap text-center leading-tight">
                    {item.label}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </nav>
  );
}
