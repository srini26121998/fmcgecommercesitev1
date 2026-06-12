"use client";

import Link from "next/link";
import ProductCard from "./product-card";
import { useProducts } from "@/hooks/use-products";
import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useCategories } from "@/hooks/use-categories";
import { usePromotionsStore } from "@/store/promotions-store";
import { useEffect } from "react";

export default function ProductGrid() {
  const { products } = useProducts(undefined, 100);
  const { data: apiCategories } = useCategories();
  const fetchApplicableBadges = usePromotionsStore((s) => s.fetchApplicableBadges);

  useEffect(() => {
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      fetchApplicableBadges(productIds);
    }
  }, [products, fetchApplicableBadges]);

  // Memoize filtered products to avoid recalculations
  const filteredCategories = useMemo(() => {
    const cats = apiCategories || [];
    return cats
      .map((cat) => {
        // Attempt to match products by category name
        const items = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase());
        return items.length > 0 ? { 
          label: cat.name, 
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'), 
          emoji: cat.image || "📦", 
          items 
        } : null;
      })
      .filter(Boolean) as Array<{ label: string; slug: string; emoji: string; items: typeof products }>;
  }, [apiCategories, products]);

  return (
    <div
      className="max-w-[1400px] mx-auto space-y-6 py-4 sm:py-6"
      itemScope
      itemType="https://schema.org/ItemList"
      itemProp="mainEntity"
    >
      {filteredCategories.map(({ label, slug, emoji, items }) => (
        <section key={slug} aria-label={`${label} products`}>
          {/* Section header */}
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-[#0c831f] rounded-full" />
              {emoji.startsWith("http") || emoji.startsWith("/") ? (
                <img src={emoji} alt={label} className="w-5 h-5 object-contain" />
              ) : (
                <span className="text-lg leading-none" aria-hidden="true">{emoji}</span>
              )}
              <h2
                className="text-base sm:text-lg font-black text-[#1a1a1a] font-royal"
                itemProp="name"
              >
                {label}
              </h2>
              <meta itemProp="numberOfItems" content={String(items.length)} />
            </div>
            <Link
              href={`/category/${slug}`}
              className="flex items-center gap-0.5 text-xs sm:text-sm font-semibold text-[#0c831f] hover:text-[#ff4f8b] hover:underline"
              aria-label={`Browse all ${label} products`}
            >
              See all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal scroll row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 px-3 sm:px-4 md:px-6 pb-4">
            {items.map((product, index) => (
              <div
                key={product.id}
                className="w-full flex flex-col h-full"
                itemScope
                itemType="https://schema.org/Product"
                itemProp="itemListElement"
              >
                <meta itemProp="position" content={String(index + 1)} />
                <div className="flex-1 flex flex-col w-full">
                  <ProductCard product={product as any} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
