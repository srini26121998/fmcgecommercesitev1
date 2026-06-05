"use client";

import { useProducts } from "@/hooks/use-products";
import Navbar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/mobile/bottom-nav";
import CategoryClient from "@/components/ui/category/category-client";
import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";

export default function FlashSaleClient() {
  const { products } = useProducts();
  const flashSaleItems = products.filter((p) => p.isFlashSale).map(p => ({ ...p, image: p.media?.[0]?.url || "", oldPrice: p.mrp || p.price, rating: 0 })) as any;

  return (
    <main className="bg-[#f2f2f2] min-h-screen pb-20 md:pb-0">
      <Navbar />

      <div className="pt-[72px] sm:pt-20">
        {/* Page header */}
        <div className="bg-gradient-to-r from-[#ff4f8b] to-[#e63872] border-b border-[#e8e8e8] sticky top-[72px] sm:top-20 z-10 text-white">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black leading-tight uppercase tracking-tight">
                  Flash Sale
                </h1>
                <p className="text-sm font-bold text-white/90">Up to 50% OFF • Limited Time Only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <CategoryClient
            items={flashSaleItems}
            categoryEmoji="⚡"
            categoryLabel="Flash Sale"
          />
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
