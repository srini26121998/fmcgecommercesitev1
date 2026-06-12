"use client";

import { memo, useMemo, useEffect, useState } from "react";
import CarouselRow from "@/components/ui/products/carousel-row";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { useProducts } from "@/hooks/use-products";
import Link from "next/link";

function AmazonHistoryCarousels() {
  const { products } = useProducts();
  const recentItems = useRecentlyViewedStore((s) => s.items);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const historyProducts = useMemo(() => {
    return recentItems
      .map((item) => products.find((p) => String(p.id) === String(item.id)))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [recentItems, products]);

  const relatedProducts = useMemo(() => {
    if (historyProducts.length === 0) {
      return [...products].sort(() => 0.5 - Math.random()).slice(0, 10);
    }
    const categories = new Set(historyProducts.map((p) => p.category));
    return products
      .filter((p) => categories.has(p.category) && !historyProducts.some((hp) => hp.id === p.id))
      .slice(0, 10);
  }, [products, historyProducts]);

  if (!mounted) return null;

  const mapToLocalProduct = (p: any): any => ({
    ...p,
    id: p.id,
    oldPrice: p.mrp || p.price,
    rating: 4.5,
    image: p.media?.[0]?.url || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=400&q=80",
    stock: p.stock > 0 ? "in_stock" : "out_of_stock"
  });

  return (
    <div className="w-full max-w-[1400px] mx-auto px-2 sm:px-4 my-4 sm:my-6 space-y-4 sm:space-y-6 relative z-10">
      {historyProducts.length > 0 && (
        <section className="bg-white p-3 sm:p-4 rounded-xl border border-[#e8e8e8] shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#1a1a1a]">Inspired by your browsing history</h2>
            <Link href="/account/recently-viewed" className="hidden sm:block text-xs sm:text-sm text-[#007185] hover:text-[#c40000] hover:underline">
              View or edit your browsing history
            </Link>
          </div>
          <CarouselRow items={historyProducts.map(mapToLocalProduct)} />
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="bg-white p-3 sm:p-4 rounded-xl border border-[#e8e8e8] shadow-sm">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-[#1a1a1a]">Related to items you've viewed</h2>
          </div>
          <CarouselRow items={relatedProducts.map(mapToLocalProduct)} />
        </section>
      )}
    </div>
  );
}

export default memo(AmazonHistoryCarousels);
