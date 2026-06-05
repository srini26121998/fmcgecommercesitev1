"use client";

import Link from "next/link";
import { ChevronRight, Clock, Trash2, Minus, Plus } from "lucide-react";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";
import { useProducts } from "@/hooks/use-products";
import { SafeProductImage } from "@/components/ui/safe-image";
import AddToCartButton from "@/components/ui/products/add-to-cart-button";
import { toast } from "sonner";
import { useRef } from "react";

export default function RecentlyViewed() {
  const { products } = useProducts();
  const { items, clearRecentlyViewed } = useRecentlyViewedStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const viewedProducts = items
    .map((v) => {
      const p = products.find((prod) => String(prod.id) === String(v.id));
      return p ? { ...p, viewedAt: v.viewedAt } : null;
    })
    .filter(Boolean)
    .slice(0, 10);

  if (viewedProducts.length === 0) return null;

  const isOutOfStock = (stock: number) => stock <= 0;

  function scroll(dir: number) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  }

  return (
    <section className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-2" aria-label="Recently viewed products">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#ff4f8b]" />
          <h2 className="text-base sm:text-lg font-black text-[#1a1a1a]">Recently Viewed</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={clearRecentlyViewed}
            className="flex items-center gap-1 text-xs text-[#999] hover:text-[#ff4f8b] transition-colors"
            aria-label="Clear recently viewed"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory touch-pan-x pb-1"
        >
          {viewedProducts.map((product) => {
            const oos = isOutOfStock(product!.stock);
            return (
              <div
                key={product!.id}
                className={`flex-shrink-0 w-[130px] sm:w-[150px] snap-start ${oos ? "opacity-60" : ""}`}
              >
                <div className="bg-white rounded-xl border border-[#e8e8e8] overflow-hidden">
                  <Link href={`/product/${product!.id}`} className="block">
                    <div className={`relative aspect-square bg-[#f2f2f2] ${oos ? "grayscale" : ""}`}>
                      <SafeProductImage
                        src={product!.image}
                        alt={product!.name}
                        fill
                        sizes="130px"
                        className="object-cover"
                        loading="lazy"
                      />
                      {oos && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
                          <span className="text-[9px] font-black text-white bg-[#ff4f8b] px-2 py-0.5 rounded shadow-lg">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-2">
                    <Link href={`/product/${product!.id}`}>
                      <p className={`text-xs font-semibold leading-tight line-clamp-2 min-h-[2rem] ${oos ? "text-[#666]" : "text-[#1a1a1a]"}`}>
                        {product!.name}
                      </p>
                    </Link>
                    <div className="mt-1.5">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-black ${oos ? "text-[#999] line-through" : "text-[#1a1a1a]"}`}>₹{product!.price}</span>
                      </div>
                      <div className="mt-2">
                        {oos ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toast("Price alert feature coming soon!");
                            }}
                            className="w-full h-8 sm:h-9 rounded-lg text-xs font-bold bg-[#fafafa] text-[#ff4f8b] border border-[#ff4f8b]/20 hover:bg-[#fff0f6] transition-colors"
                          >
                            NOTIFY
                          </button>
                        ) : (
                          <AddToCartButton
                            productId={product!.id}
                            productName={product!.name}
                            productPrice={product!.price}
                            productImage={product!.image}
                            themeColor="pink"
                            size="md"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
