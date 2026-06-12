"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./product-card";
import type { Product } from "@/data/products";

const ROOT_CLASS = "relative overflow-hidden";
const SCROLL_CONTAINER_CLASS =
  "w-full flex gap-4 overflow-x-auto overflow-y-hidden px-1 sm:px-2 py-2 scroll-smooth snap-x snap-mandatory touch-pan-x hide-scrollbar";
const ITEM_CLASS =
  "flex-none snap-start min-w-[180px] sm:min-w-[200px] md:min-w-[220px] lg:min-w-[240px] xl:min-w-[250px] flex flex-col items-stretch";
const BUTTON_BASE_CLASS =
  "hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 h-9 w-9 items-center justify-center rounded-full bg-white text-[#1a1a1a] shadow-sm border border-[#e8e8e8] hover:bg-[#f6f7f6] transition-all duration-200 btn-press hover:scale-110 hover:shadow-md";

export default function CarouselRow({ items }: { items: Product[] }) {
  const ref = useRef<HTMLDivElement | null>(null);

  function scroll(dir: number) {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(Math.floor(el.clientWidth * 0.75), 200);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

  return (
    <div className={ROOT_CLASS}>
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className={`${BUTTON_BASE_CLASS} left-2`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div ref={ref} className={SCROLL_CONTAINER_CLASS}>
        {items.map((item) => (
          <div key={item.id} className={ITEM_CLASS}>
            <div className="flex-1 w-full flex flex-col">
              <ProductCard product={item} />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className={`${BUTTON_BASE_CLASS} right-2`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
