"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Clock,
  X,
  Heart,
  ChevronRight,
  ShoppingCart,
  Zap,
  Shield,
  RotateCcw,
  Package,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserCart } from "@/hooks/use-user-cart";
import AddToCartButton from "@/components/ui/products/add-to-cart-button";
import { useMultiWishlistStore } from "@/store/multi-wishlist-store";
import { WishlistListPicker } from "@/components/ui/wishlist-list-picker";
import type { Product } from "@/data/products";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({
  product,
  open,
  onClose,
}: QuickViewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { cartItems } = useUserCart();
  const isInAnyList = useMultiWishlistStore((s) => s.isInAnyList);
  const [showPicker, setShowPicker] = useState(false);
  const [heartPop, setHeartPop] = useState(false);

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

  const discount =
    product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  const wishlisted = isInAnyList(product.id);
  const cartItem = cartItems.find(
    (i) => Number(i.id) === Number(product.id)
  );
  const inCart = (cartItem?.quantity ?? 0) > 0;
  const savings = product.oldPrice > product.price ? product.oldPrice - product.price : 0;

  const handleHeartClick = () => {
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 300);
    setShowPicker(true);
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.22)" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-slate-100 transition-all active:scale-90"
          aria-label="Close quick view"
        >
          <X className="w-4 h-4 text-slate-600" />
        </button>

        {/* Image Section */}
        <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 aspect-[4/3] max-h-[220px] flex items-center justify-center overflow-hidden">
          {/* Discount Badge */}
          {discount > 0 && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute top-4 left-4 z-10"
            >
              <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-rose-500/40">
                <TrendingDown className="w-3 h-3" />
                {discount}% OFF
              </span>
            </motion.div>
          )}

          {/* Wishlist Button on Image */}
          <button
            onClick={handleHeartClick}
            className={`absolute top-4 right-14 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${
              wishlisted
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-slate-500 hover:bg-rose-50 hover:text-rose-500"
            }`}
            aria-label={wishlisted ? "Saved to wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                heartPop ? "scale-125" : "scale-100"
              } ${wishlisted ? "fill-current" : ""}`}
            />
          </button>

          {/* Product Image */}
          <div className="relative w-full h-full max-w-[200px] mx-auto">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain drop-shadow-md transition-transform hover:scale-105 duration-300"
              sizes="200px"
              priority
            />
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-2">
            {/* Category + Rating Row */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                {product.category}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[11px] font-black text-amber-700">
                    {product.rating}
                  </span>
                </div>
                {inCart && (
                  <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full">
                    <ShoppingCart className="w-3 h-3 text-indigo-600" />
                    <span className="text-[11px] font-black text-indigo-600">
                      In cart
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Name */}
            <h3 className="text-base font-black text-slate-900 leading-snug mb-1.5">
              {product.name}
            </h3>

            {/* Delivery Promise */}
            <div className="flex items-center gap-1.5 mb-3">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-600">
                10 min express delivery
              </span>
            </div>

            {/* Price Block */}
            <div className="flex items-baseline gap-2.5 mb-1">
              <span className="text-2xl font-black text-slate-900">
                ₹{product.price}
              </span>
              {product.oldPrice > product.price && (
                <span className="text-sm text-slate-400 line-through font-semibold">
                  ₹{product.oldPrice}
                </span>
              )}
              {savings > 0 && (
                <span className="text-[11px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                  Save ₹{savings}
                </span>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-3 mt-3 mb-4">
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <Shield className="w-3 h-3 text-slate-400" />
                100% Genuine
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <RotateCcw className="w-3 h-3 text-slate-400" />
                Easy Returns
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                <Package className="w-3 h-3 text-slate-400" />
                Sealed Pack
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-5 h-px bg-slate-100" />

          {/* Actions */}
          <div className="px-5 py-4 space-y-3">
            {/* Add to Cart Button */}
            <AddToCartButton
              productId={product.id}
              productName={product.name}
              productPrice={product.price}
              productImage={product.image}
              themeColor="pink"
              size="lg"
            />

            {/* View Full Details */}
            <Link
              href={`/product/${product.id}`}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 h-11 rounded-2xl border-2 border-slate-200 text-[13px] font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all group"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              View Full Details
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Wishlist List Picker */}
      <AnimatePresence>
        {showPicker && (
          <WishlistListPicker
            item={{
              id: product.id,
              name: product.name,
              image: product.image,
              price: product.price,
              mrp:
                product.oldPrice > product.price
                  ? product.oldPrice
                  : undefined,
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
