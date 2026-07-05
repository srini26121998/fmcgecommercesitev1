"use client";

import { Heart, BarChart3, RotateCw } from "lucide-react";
import Link from "next/link";
import { memo, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useUserCart } from "@/hooks/use-user-cart";
import { useMultiWishlistStore } from "@/store/multi-wishlist-store";
import { useComparisonStore } from "@/store/comparison-store";
import { SafeProductImage } from "@/components/ui/safe-image";
import { WishlistListPicker } from "@/components/ui/wishlist-list-picker";
import { env } from "@/lib/env";
import ProductView360 from "@/components/ui/home/product-view-360";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import AddToCartButton from "@/components/ui/products/add-to-cart-button";
import { useSearchHistoryStore } from "@/store/search-history-store";
import { usePromotionsStore } from "@/store/promotions-store";
import { Tag } from "lucide-react";


// ── Per-category accent colours ──────────────────────────────
const categoryGlowClass: Record<string, string> = {
  Groceries: "product-card-groceries",
  Fruits:    "product-card-fruits",
  Vegetables: "product-card-vegetables",
  Snacks:    "product-card-snacks",
  Health:    "product-card-health",
  Dairy:     "product-card-dairy",
  Beverages: "product-card-beverages",
};

// ── Stock indicator config ────────────────────────────────────
const stockConfig = {
  in_stock:     { dot: "bg-[#0c831f]",  label: "In Stock",   pulse: true  },
  low_stock:    { dot: "bg-[#f59e0b]",  label: "Few left",   pulse: true  },
  out_of_stock: { dot: "bg-[#ff4f8b]",  label: "Sold out",   pulse: false },
} as const;

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  const { addQuery } = useSearchHistoryStore();
  const [animateHeart, setAnimateHeart] = useState(false);
  const [show360, setShow360] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [isCouponClipped, setIsCouponClipped] = useState(false);
  const { cartItems, addToCart, increaseQuantity: increaseQty, decreaseQuantity: decreaseQty } = useUserCart();
  const cartItem = cartItems.find((i) => Number(i.id) === Number(product.id));
  const isInAnyList = useMultiWishlistStore((s) => s.isInAnyList);
  const isHydrated = useMultiWishlistStore((s) => s._hasHydrated);

  const quantity = isHydrated ? (cartItem?.quantity ?? 0) : 0;
  
  // Handle both UI and API Product shapes
  const actualPrice = product.price || 0;
  const oldPrice = product.oldPrice ?? (product as any).mrp ?? actualPrice;
  const discount = oldPrice > actualPrice ? Math.round(((oldPrice - actualPrice) / oldPrice) * 100) : 0;
  const imageUrl = product.image ?? (product as any).media?.[0]?.url ?? "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=400&q=80";
  
  let stockValue = product.stock as any;
  if (typeof stockValue === 'number') {
    stockValue = stockValue <= 0 ? "out_of_stock" : stockValue < 10 ? "low_stock" : "in_stock";
  } else if (!stockValue) {
    stockValue = "in_stock";
  }
  
  const glowClass  = categoryGlowClass[product.category] ?? "";
  const defaultStock = { dot: "bg-[#0c831f]", label: "In Stock", pulse: true };
  const stock = (stockConfig[stockValue as keyof typeof stockConfig] as any) || stockConfig["in_stock"] || defaultStock;
  const isOOS      = stockValue === "out_of_stock";
  const isWishlisted = isHydrated ? isInAnyList(product.id) : false;

  const isComparedVal = useComparisonStore((s) => s.isInComparison)(product.id);
  const isCompared = isHydrated ? isComparedVal : false;
  
  const addToComparison = useComparisonStore((s) => s.addToComparison);
  const removeFromComparison = useComparisonStore((s) => s.removeFromComparison);
  const seoAlt = `${product.name} — ${product.category} — ₹${actualPrice} — FMCG Commerce grocery delivery`;

  // Cashback Promo Logic
  const activeProductBadges = usePromotionsStore((s) => s.activeProductBadges);
  const cashbackRules = usePromotionsStore((s) => s.cashbackRules);
  const productBadges = activeProductBadges[product.id] || [];
  const activeRule = productBadges.length > 0 ? cashbackRules.find(r => r.id === productBadges[0]) : null;

  // BOGO Promo Logic
  const activeBogoBadges = usePromotionsStore((s) => s.activeBogoBadges);
  const bogoRules = usePromotionsStore((s) => s.bogoRules);
  const bogoProductBadges = activeBogoBadges[product.id] || [];
  const activeBogoRule = bogoProductBadges.length > 0 ? bogoRules.find(r => r.id === bogoProductBadges[0]) : null;

  // Fetch badges if not already fetched
  const fetchBogoBadges = usePromotionsStore((s) => s.fetchBogoBadges);
  useEffect(() => {
    if (product.id && !bogoProductBadges.length && typeof fetchBogoBadges === 'function') {
      fetchBogoBadges([String(product.id)]);
    }
  }, [product.id, bogoProductBadges.length, fetchBogoBadges]);

  // Derived dynamically based on product id for demonstration
  const isLimitedTimeDeal = (product as any).isLimitedTimeDeal ?? (product.id % 7 === 0);
  const isBestSeller = (product as any).isBestSeller ?? (product.id % 5 === 0);
  const isVeg = (product as any).isVeg ?? ((product.category as string) !== "Meat" && (product.category as string) !== "Seafood" && product.id % 4 !== 0);
  const personsBought = (product as any).personsBought ?? (100 + (product.id * 47) % 5000);
  const displayRating = (product as any).rating ?? (4.0 + (product.id % 10) / 10).toFixed(1);

  // For delivery day and date
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 1); // Tomorrow
  const deliveryDayStr = deliveryDate.toLocaleDateString('en-US', { weekday: 'short' });
  const deliveryDateStr = deliveryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  return (
    <div
      className={`product-card ${glowClass} group bg-white rounded-xl border border-[#e8e8e8] overflow-hidden relative shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full`}
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={product.name} />
      <meta itemProp="category" content={product.category} />
      <meta itemProp="price" content={String(actualPrice)} />
      <meta itemProp="priceCurrency" content="INR" />
      <meta itemProp="brand" content="FMCG Commerce" />
      <link itemProp="url" href={`${env.siteUrl}/product/${product.id}`} />
      <meta itemProp="image" content={imageUrl} />

      {/* ── Image ── */}
      <div className={`relative bg-[#f2f2f2] aspect-square overflow-hidden ${isOOS ? "opacity-60 grayscale" : ""}`}>
        <Link href={`/product/${product.id}`} className="block w-full h-full" aria-label={`View ${product.name}`} onClick={() => addQuery(product.name)}>
          <SafeProductImage
            src={imageUrl}
            alt={seoAlt}
            fill
            sizes="(max-width: 640px) 150px, (max-width: 768px) 170px, 185px"
            className={`transition-transform duration-300 ${isOOS ? "" : "group-hover:scale-105"}`}
            loading="lazy"
          />
        </Link>

        {/* Discount badge */}
        {discount > 0 && !isOOS && (
          <span className="absolute top-2 left-2 text-[10px] font-black text-white bg-[#ff4f8b] px-1.5 py-0.5 rounded z-10 pointer-events-none shadow-sm">
            {discount}% OFF
          </span>
        )}

        {/* Promo Badge */}
        <div className="absolute top-8 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {activeRule && !isOOS && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-[#0c831f] bg-[#e8f5e9] border border-[#0c831f]/20 px-1.5 py-0.5 rounded shadow-sm">
              <Tag className="w-2.5 h-2.5" />
              <span>{activeRule.code}</span>
            </div>
          )}
          {activeBogoRule && !isOOS && (
            <div className="flex items-center gap-1 text-[9px] font-bold text-white bg-[#7c3aed] border border-[#6d28d9] px-1.5 py-0.5 rounded shadow-sm">
              <Tag className="w-2.5 h-2.5" />
              <span>BOGO</span>
            </div>
          )}
        </div>

        {/* Out-of-stock overlay - Blinkit style */}
        {isOOS && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 pointer-events-none">
            <div className="flex flex-col items-center">
              <span className="text-xs font-black text-white bg-[#ff4f8b] px-3 py-1.5 rounded-lg shadow-lg border-2 border-white/30">
                SOLD OUT
              </span>
            </div>
          </div>
        )}

        {/* Only show interactive buttons if not OOS */}
        {!isOOS && (
          <>
            {/* 360° View */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShow360(true);
              }}
              className="absolute bottom-2 left-2 min-w-[36px] min-h-[36px] w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform z-20 active:scale-95"
              aria-label="View 360° product"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#666] hover:text-[#ff4f8b]" />
            </button>

            {/* Compare */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isCompared) {
                  addToComparison({
                    id: product.id,
                    name: product.name,
                    image: imageUrl,
                    price: actualPrice,
                    oldPrice: oldPrice,
                    rating: (product as any).rating ?? 0,
                    category: product.category,
                    stock: stockValue,
                  });
                } else {
                  removeFromComparison(product.id);
                  toast("Removed from comparison");
                }
              }}
              className="absolute bottom-2 right-2 min-w-[36px] min-h-[36px] w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform z-20 active:scale-95"
              aria-label={isCompared ? "Remove from comparison" : "Add to comparison"}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${isCompared ? "text-[#0c831f]" : "text-[#999] hover:text-[#0c831f]"}`} />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAnimateHeart(true);
                window.setTimeout(() => setAnimateHeart(false), 240);
                setShowPicker(true);
              }}
              className={`wish-button absolute top-2 right-2 min-w-[44px] min-h-[44px] w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform z-20 active:scale-95 ${isWishlisted ? "active" : ""}`}
              aria-label={isWishlisted ? "Saved to wishlist" : "Add to wishlist"}
              suppressHydrationWarning
            >
              <Heart className={`heart-icon w-3.5 h-3.5 ${isWishlisted ? "text-[#ff4f8b]" : "text-[#666] hover:text-[#ff4f8b]"} ${animateHeart ? "heart-pop" : ""}`} fill={isWishlisted ? "#ff4f8b" : "none"} />
            </button>
          </>
        )}
      </div>

      {/* ── Info ── */}
      <div className={`p-2 flex flex-col flex-1 ${isOOS ? "opacity-60" : ""}`}>
        {/* Badges row: Limited time / Best Seller */}
        {(isLimitedTimeDeal || isBestSeller) && (
          <div className="flex flex-wrap gap-1 mb-1">
            {isLimitedTimeDeal && (
               <span className="text-[8px] font-bold text-white bg-[#cc0c39] px-1 py-0.5 rounded-sm">
                 Limited time
               </span>
            )}
            {isBestSeller && (
               <span className="text-[8px] font-bold text-white bg-[#e06c00] px-1 py-0.5 rounded-sm">
                 Best Seller
               </span>
            )}
          </div>
        )}

        {/* Title & Veg/Non-Veg Icon */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <Link href={`/product/${product.id}`} className="block group/title flex-1" onClick={() => addQuery(product.name)}>
            <h2 className={`text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2 ${isOOS ? "text-[#666]" : "text-[#1a1a1a] group-hover/title:text-[#ff4f8b] transition-colors"}`}>
              {product.name}
            </h2>
          </Link>
          <div className={`shrink-0 w-3 h-3 flex items-center justify-center border ${isVeg ? 'border-green-600' : 'border-red-600'} rounded-[2px] mt-0.5`} title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
             <div className={`w-1 h-1 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
          </div>
        </div>

        {/* Rating and Persons Bought */}
        <div className="flex items-center gap-1 mb-1">
          <div className="flex items-center gap-0.5 text-[9px]">
            <span className="text-[#de7921]">★</span>
            <span className="font-semibold text-slate-700">{displayRating}</span>
          </div>
          <div className="w-[1px] h-2 bg-slate-300" />
          <span className="text-[9px] text-slate-500 font-medium">{personsBought}+ bought</span>
        </div>

        {/* Delivery Info */}
        {!isOOS ? (
          <div className="flex flex-col mb-1" suppressHydrationWarning>
             <span className="text-[9px] text-slate-600 leading-snug" suppressHydrationWarning>
               <span className="text-green-700 font-bold bg-green-50 px-1 py-0.5 rounded-sm mr-1 inline-block mb-0.5">Super saver</span>
               Free delivery by <strong className="text-slate-800" suppressHydrationWarning>{deliveryDateStr}</strong>
             </span>
          </div>
        ) : (
          <div className="mb-1">
            <span className="text-[9px] font-bold text-[#ff4f8b] bg-[#fff0f6] px-1 py-0.5 rounded inline-block">
              Currently Unavailable
            </span>
          </div>
        )}

        <div className="mt-auto pt-1">
          {product.clipCoupon && (
            <div className="mb-1 flex items-center gap-1 bg-green-50 p-1 rounded border border-green-200">
              <input 
                type="checkbox" 
                id={`coupon-${product.id}`}
                checked={isCouponClipped}
                onChange={() => {
                  setIsCouponClipped(!isCouponClipped);
                  if (!isCouponClipped) toast.success(`Coupon for ₹${product.clipCoupon} clipped!`);
                }}
                className="w-3 h-3 text-green-600 rounded border-green-300 focus:ring-green-500 cursor-pointer"
              />
              <label htmlFor={`coupon-${product.id}`} className="text-[9px] font-bold text-green-700 cursor-pointer">
                Save ₹{product.clipCoupon}
              </label>
            </div>
          )}
          
          {product.volumePricing && product.volumePricing.length > 0 && !isOOS && (
            <div className="mb-1 flex flex-col gap-0.5">
              {product.volumePricing.map((tier, idx) => {
                const savings = (actualPrice * tier.qty) - tier.price;
                return (
                  <div key={idx} className="text-[9px] text-[#666] bg-slate-50 px-1 py-0.5 rounded border border-slate-100 flex justify-between">
                    <span>{tier.qty}pcs = ₹{tier.price}</span>
                    {savings > 0 && <span className="text-green-600 font-semibold">Save ₹{savings}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Price + Add button */}
          <div className="flex items-end justify-between gap-1 mt-1">
            <div className="flex flex-col">
              {!isOOS && oldPrice > actualPrice && (
                <span className="text-[9px] text-[#999] line-through" aria-label={`Original price: ₹${oldPrice}`}>
                  ₹{oldPrice}
                </span>
              )}
              <span className={`text-xs sm:text-sm font-black leading-none ${isOOS ? "text-[#999] line-through" : "text-[#1a1a1a]"}`} itemProp="price">
                ₹{actualPrice}
                <meta itemProp="priceCurrency" content="INR" />
              </span>
            </div>
            
            <div className="min-w-[76px] shrink-0">
              {isOOS ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toast("Price alert feature coming soon!");
                  }}
                  className="flex items-center justify-center w-full h-7 rounded bg-[#fafafa] text-[#ff4f8b] font-bold text-[9px] border border-[#ff4f8b]/20 hover:bg-[#fff0f6] transition-colors shadow-sm"
                >
                  NOTIFY
                </button>
              ) : (
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  productPrice={actualPrice}
                  productImage={imageUrl}
                  themeColor="pink"
                  size="sm"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Availability — hidden from visual, read by structured data parsers */}
      <meta
        itemProp="availability"
        content={`https://schema.org/${isOOS ? "OutOfStock" : "InStock"}`}
      />

      {/* 360° Product View Modal */}
      <ProductView360
        isOpen={show360}
        onClose={() => setShow360(false)}
        product={{ id: product.id, name: product.name, image: imageUrl, category: product.category }}
      />

      {/* Wishlist List Picker */}
      <AnimatePresence>
        {showPicker && (
          <WishlistListPicker
            item={{ id: product.id, name: product.name, image: imageUrl, price: actualPrice, mrp: oldPrice > actualPrice ? oldPrice : undefined }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(ProductCard);
