import { productService } from "@/services/products.service";
import Navbar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/mobile/bottom-nav";
import CategoryClient from "@/components/ui/category/category-client";
import Link from "next/link";
import { ChevronLeft, PartyPopper } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekend Special — Snacks & Beverages | FMCG Commerce",
  description: "Stock up for the weekend with our special deals on snacks and beverages. Munchies, drinks, and party essentials at best prices.",
};

export default async function SnacksBeveragesPage() {
  let snacksBeverages: any[] = [];
  try {
    const res = await productService.getProducts({}, { pageSize: 100 });
    snacksBeverages = res.products.filter((p) => 
      p.category === "Snacks" || p.category === "Beverages"
    );
  } catch (e) {
    console.error("Error loading dynamic snacks and beverages:", e);
  }

  return (
    <main className="bg-[#f2f2f2] min-h-screen pb-20 md:pb-0">
      <Navbar />

      <div className="pt-16">
        {/* Page header */}
        <div className="bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] border-b border-[#e8e8e8] sticky top-16 z-10 text-white">
          <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center min-w-[44px] min-h-[44px] w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black leading-tight uppercase tracking-tight">
                  Weekend Special
                </h1>
                <p className="text-sm font-bold text-white/90">Snacks & Beverages • Stock Up!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <CategoryClient
            items={snacksBeverages}
            categoryEmoji="ðŸ¿"
            categoryLabel="Weekend Special"
          />
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
