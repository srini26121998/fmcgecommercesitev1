"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useMultiWishlistStore } from "@/store/multi-wishlist-store";
import { WishlistListPicker } from "@/components/ui/wishlist-list-picker";

interface ProductDetailWishlistProps {
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    mrp?: number;
  };
}

export default function ProductDetailWishlist({
  product,
}: ProductDetailWishlistProps) {
  const isInAnyList = useMultiWishlistStore((s) => s.isInAnyList);
  const [showPicker, setShowPicker] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isWishlisted = isMounted ? isInAnyList(product.id) : false;

  return (
    <>
      <button
        onClick={() => setShowPicker(true)}
        className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
          isWishlisted
            ? "border-[#ff4f8b] bg-[#fff0f6] text-[#ff4f8b]"
            : "border-[#e8e8e8] text-[#999] hover:border-[#ff4f8b] hover:text-[#ff4f8b] hover:bg-[#fff0f6]"
        }`}
        aria-label={isWishlisted ? "Saved to wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`w-5 h-5 ${isWishlisted ? "fill-[#ff4f8b]" : ""}`}
        />
      </button>

      <AnimatePresence>
        {showPicker && (
          <WishlistListPicker
            item={{
              id: product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              mrp: product.mrp,
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
