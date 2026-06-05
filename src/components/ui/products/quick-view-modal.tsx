"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Clock,
  X,
  Heart,
  ChevronRight,
} from "lucide-react";
import { useUserCart } from "@/hooks/use-user-cart";
import AddToCartButton from "@/components/ui/products/add-to-cart-button";
import { useWishlistStore } from "@/store/wishlist-store";
import { toast } from "sonner";
import type { Product } from "@/data/products";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, open, onClose }: QuickViewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { addToCart, cartItems, increaseQuantity, decreaseQuantity } = useUserCart();
  const { addToWishlist, removeFromWishlist, wishlist } = useWishlistStore();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !product) return null;

  const discount = Math.round(
    ((product.oldPrice - product.price) / product.oldPrice) * 100
  );
  const wishlisted = wishlist.some((item) => item.id === product.id);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-modal-in max-h-[90vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Close quick view"
        >
          <X className="w-4 h-4 text-[#666]" />
        </button>

        {/* Image */}
        <div className="relative bg-[#f9f9f9] aspect-square max-h-[280px] flex items-center justify-center p-6">
          {discount > 0 && (
            <span className="absolute top-3 left-3 text-[10px] font-black text-white bg-[#ff4f8b] px-2 py-1 rounded-lg z-10">
              {discount}% OFF
            </span>
          )}
          <div className="relative w-full h-full max-w-[200px]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              sizes="200px"
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#0c831f] bg-[#e8f5e9] px-2 py-1 rounded-full">
              {product.category}
            </span>
            <div className="flex items-center gap-1 bg-[#0c831f] text-white text-[10px] font-bold px-2 py-1 rounded-lg">
              <Star className="w-2.5 h-2.5 fill-white" />
              {product.rating}
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-black text-[#1a1a1a] leading-tight">
            {product.name}
          </h3>

          {discount > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Clock className="w-3 h-3 text-[#ff4f8b]" />
              <span className="text-[10px] font-bold text-[#ff4f8b]">10 min delivery</span>
            </div>
          )}

          <div className="flex items-baseline gap-2 mt-3 mb-4">
            <p className="text-xl sm:text-2xl font-black text-[#1a1a1a]">
              ₹{product.price}
            </p>
            <p className="text-sm text-[#999] line-through">₹{product.oldPrice}</p>
            {discount > 0 && (
              <span className="text-xs font-bold text-[#ff4f8b]">{discount}% off</span>
            )}
          </div>

          <p className="text-xs text-[#666] leading-relaxed mb-4">
            Premium quality {String(product.category).toLowerCase()} product. Fresh and carefully sourced.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2">
              <div className="flex-1">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  productPrice={product.price}
                  productImage={product.image}
                  themeColor="pink"
                  size="lg"
                />
              </div>

            <button
              onClick={() => {
                if (wishlisted) {
                  removeFromWishlist(product.id);
                  toast.success("Removed from wishlist");
                } else {
                  addToWishlist(product);
                  toast.success("Added to wishlist! ❤️");
                }
              }}
              className="flex min-w-[44px] h-11 items-center justify-center rounded-xl border border-[#e8e8e8] hover:bg-[#fff0f6] transition-colors"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-4 h-4 ${wishlisted ? "fill-[#ff4f8b] text-[#ff4f8b]" : "text-[#666]"}`}
              />
            </button>
          </div>

          <Link
            href={`/product/${product.id}`}
            className="mt-3 flex items-center justify-center gap-1 h-10 rounded-xl border border-[#e8e8e8] text-xs font-semibold text-[#666] hover:bg-[#fafafa] transition-colors"
          >
            View full details
             <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
