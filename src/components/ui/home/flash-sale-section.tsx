"use client";

import { useRef, useMemo } from "react";
import Link from "next/link";
import { Zap, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { SafeProductImage } from "@/components/ui/safe-image";
import AddToCartButton from "@/components/ui/products/add-to-cart-button";

export default function FlashSaleSection() {
  const { products } = useProducts();
  const scrollRef = useRef<HTMLDivElement>(null);

  const flashSaleProducts = useMemo(() => {
    return products.filter((p) => p.isFlashSale && p.stock > 0);
  }, [products]);

  function scroll(dir: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  }

  if (flashSaleProducts.length === 0) return null;

  return (
    <section
      className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-2"
      aria-label="Flash Sale products"
    >
      <div className="rounded-xl bg-gradient-to-r from-[#dc2626] via-[#ea580c] to-[#f97316] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 shadow-lg">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full mb-2">
            <Clock className="w-3 h-3" />
            LIMITED TIME
          </span>
          <h2 className="text-base sm:text-lg md:text-xl font-black text-white leading-tight flex items-center gap-2">
            <Zap className="w-5 h-5 fill-white" />
            Flash Sale
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-md">
            Unbeatable deals on top products — prices drop fast, grab them before they&apos;re gone!
          </p>
        </div>

        <Link
          href="/offers/flash-sale"
          className="flex-shrink-0 inline-flex items-center justify-center h-8 sm:h-9 px-4 rounded-lg bg-white text-[#dc2626] font-bold text-xs sm:text-sm hover:bg-white/90 transition shadow-sm"
        >
          View All Deals
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll(-1)}
          className="hidden sm:flex absolute -left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-[#e8e8e8] shadow-md hover:shadow-lg transition-shadow"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 text-[#1a1a1a]" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory touch-pan-x pb-1"
        >
          {flashSaleProducts.map((product) => {
            const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

            return (
              <div
                key={product.id}
                className="flex-shrink-0 w-[140px] sm:w-[160px] snap-start"
              >
                <div className="bg-white rounded-xl border-2 border-[#fecaca] overflow-hidden relative">
                  {/* Flash badge */}
                  <div className="absolute top-0 right-0 z-20">
                    <div className="bg-[#dc2626] text-white text-[8px] font-black px-2 py-1 rounded-bl-lg flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 fill-white" />
                      FLASH
                    </div>
                  </div>

                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative aspect-square bg-[#fef2f2]">
                      <SafeProductImage
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {discount > 0 && (
                        <span className="absolute top-2 left-2 bg-[#dc2626] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="p-2.5 sm:p-3">
                    <Link href={`/product/${product.id}`} className="block">
                      <p className="text-xs font-semibold text-[#1a1a1a] truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] text-[#999] line-through">
                          ₹{product.oldPrice}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#dc2626]">
                          ₹{product.price}
                        </span>
                      </div>
                    </Link>

                    <div className="mt-2.5">
                      <AddToCartButton
                        productId={product.id}
                        productName={product.name}
                        productPrice={product.price}
                        productImage={product.image}
                        themeColor="red"
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => scroll(1)}
          className="hidden sm:flex absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white border border-[#e8e8e8] shadow-md hover:shadow-lg transition-shadow"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4 text-[#1a1a1a]" />
        </button>
      </div>
    </section>
  );
}
