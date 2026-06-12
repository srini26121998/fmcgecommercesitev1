"use client";

import { memo, useEffect, useState } from "react";
import Link from "next/link";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { SafeProductImage } from "@/components/ui/safe-image";

function AmazonBrowsingFooter() {
  const recentItems = useRecentlyViewedStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || recentItems.length === 0) return null;

  return (
    <div className="w-full bg-white border-t border-[#e8e8e8] pt-6 pb-12 mt-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#1a1a1a]">Your Browsing History</h2>
          <Link href="/account/recently-viewed" className="text-xs text-[#007185] hover:text-[#c40000] hover:underline">
            View or edit
          </Link>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
          {recentItems.slice(0, 10).map((item) => (
            <Link key={item.id} href={`/product/${item.id}`} className="group flex-shrink-0 w-[100px]">
              <div className="aspect-square relative mb-2 bg-[#f9f9f9] rounded p-1">
                <SafeProductImage
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-contain mix-blend-multiply"
                />
              </div>
              <p className="text-[10px] text-[#007185] group-hover:text-[#c40000] group-hover:underline line-clamp-2 leading-tight">
                {item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(AmazonBrowsingFooter);
