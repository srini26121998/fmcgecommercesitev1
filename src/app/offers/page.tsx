"use client";

import Link from "next/link";
import { ChevronRight, Tag, Clock, Sparkles } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import ProductCard from "@/components/ui/products/product-card";
import BottomNav from "@/components/ui/mobile/bottom-nav";
import PullToRefresh from "@/components/ui/mobile/pull-to-refresh";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

const offerCategories = [
  { name: "Deal of the Day", icon: Sparkles, color: "bg-gradient-to-r from-[#ff4f8b] to-[#ff6b9d]", count: 24 },
  { name: "Flash Sale", icon: Clock, color: "bg-gradient-to-r from-[#0c831f] to-[#10b981]", count: 12 },
  { name: "Big Savings", icon: Tag, color: "bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]", count: 36 },
  { name: "Combo Offers", icon: Sparkles, color: "bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]", count: 18 },
];

export default function OffersPage() {
  const { products } = useProducts(undefined, 50);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success("Offers refreshed! ✨", { duration: 1500 });
  }, []);
  
  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products.slice(0, 15);
    if (activeCategory === "Flash Sale") return products.filter(p => p.isFlashSale).slice(0, 15);
    if (activeCategory === "Deal of the Day") return products.filter(p => p.isFeatured).slice(0, 15);
    if (activeCategory === "Big Savings") return products.filter(p => p.oldPrice > p.price).slice(0, 15);
    return products.slice(0, 15);
  }, [activeCategory, products]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <main
        className="min-h-screen bg-[#f8f9fa] pb-20 md:pb-0"
        itemScope
        itemType="https://schema.org/CollectionPage"
      >
        <div className="bg-gradient-to-r from-[#ff4f8b] to-[#ff6b9d] text-white py-6 px-4">
          <div className="max-w-[1400px] mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Your Deals & Offers</h1>
            <p className="text-white/90 text-sm md:text-base">Fresh offers updated daily - don&apos;t miss out!</p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            {offerCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(activeCategory === category.name ? null : category.name)}
                className={`${category.color} rounded-2xl p-4 text-white text-center transition-transform hover:scale-105 ${
                  activeCategory === category.name ? "ring-2 ring-white ring-offset-2" : ""
                }`}
              >
                <category.icon className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">{category.name}</h3>
                <p className="text-xs opacity-90">{category.count} items</p>
              </button>
            ))}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1a1a1a]">Featured Offers</h2>
              <Link href="/offers" className="text-[#ff4f8b] text-sm font-semibold flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-gradient-to-r from-[#fff1f5] to-[#ffe4e6] rounded-2xl p-5 mb-6 border border-[#ff4f8b]/20">
              <div className="flex items-center gap-4">
                <div className="bg-[#ff4f8b] text-white px-3 py-1 rounded-full text-xs font-bold">HOT DEAL</div>
                <h3 className="text-xl font-bold text-[#1a1a1a]">Extra 20% Off on Orders Above ₹499</h3>
              </div>
              <p className="text-[#666] mt-2 mb-4">Use code: SAVE20 • Valid till midnight today</p>
              <button className="inline-block bg-[#1a1a1a] text-white px-6 py-2 min-h-[44px] leading-[44px] rounded-lg font-semibold hover:bg-[#333] transition">
                Apply Offer
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1a1a1a]">
                {activeCategory ? `${activeCategory} Deals` : "Deal Products"}
              </h2>
              <Link href="/offers" className="text-[#ff4f8b] text-sm font-semibold flex items-center gap-1">
                See All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        <BottomNav />
      </main>
    </PullToRefresh>
  );
}
