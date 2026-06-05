"use client";

import { Heart, BarChart3, RotateCw } from "lucide-react";
import Link from "next/link";
import { memo, useState, useEffect } from "react";
import { useUserCart } from "@/hooks/use-user-cart";
import { useWishlistStore } from "@/store/wishlist-store";
import { useComparisonStore } from "@/store/comparison-store";
import { SafeProductImage } from "@/components/ui/safe-image";
import { env } from "@/lib/env";
import ProductView360 from "@/components/ui/home/product-view-360";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import AddToCartButton from "@/components/ui/products/add-to-cart-button";


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
  const [animateHeart, setAnimateHeart] = useState(false);
  const [show360, setShow360] = useState(false);
  const { cartItems, addToCart, increaseQuantity: increaseQty, decreaseQuantity: decreaseQty } = useUserCart();
  const cartItem = cartItems.find((i) => Number(i.id) === Number(product.id));
  const wishlist        = useWishlistStore((s) => s.wishlist);
  const addToWishlist   = useWishlistStore((s) => s.addToWishlist);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const quantity   = isMounted ? (cartItem?.quantity ?? 0) : 0;
  
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
  const isWishlisted = isMounted ? wishlist.some((item) => item.id === product.id) : false;
  
  const isComparedVal = useComparisonStore((s) => s.isInComparison)(product.id);
  const isCompared = isMounted ? isComparedVal : false;
  
  const addToComparison = useComparisonStore((s) => s.addToComparison);
  const removeFromComparison = useComparisonStore((s) => s.removeFromComparison);
  const seoAlt = `${product.name} — ${product.category} — ₹${actualPrice} — FMCG Commerce grocery delivery`;

  return (
    <div
      className={`product-card ${glowClass} group bg-white rounded-xl border border-[#e8e8e8] overflow-hidden relative shadow-sm hover:shadow-md transition-shadow`}
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
        <Link href={`/product/${product.id}`} className="block w-full h-full" aria-label={`View ${product.name}`}>
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
          <span className="absolute top-2 left-2 text-[10px] font-black text-white bg-[#ff4f8b] px-1.5 py-0.5 rounded z-10 pointer-events-none">
            {discount}% OFF
          </span>
        )}

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
                if (!isWishlisted) {
                  addToWishlist({ id: product.id, name: product.name, image: imageUrl, price: actualPrice });
                  toast.success("Added to wishlist ❤️");
                  setAnimateHeart(true);
                  window.setTimeout(() => setAnimateHeart(false), 240);
                } else {
                  removeFromWishlist(product.id);
                  toast("Removed from wishlist 💔");
                }
              }}
              className={`wish-button absolute top-2 right-2 min-w-[44px] min-h-[44px] w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform z-20 active:scale-95 ${isWishlisted ? "active" : ""}`}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              suppressHydrationWarning
            >
              <Heart className={`heart-icon w-3.5 h-3.5 ${isWishlisted ? "text-[#ff4f8b]" : "text-[#666] hover:text-[#ff4f8b]"} ${animateHeart ? "heart-pop" : ""}`} />
            </button>
          </>
        )}
      </div>

      {/* ── Info ── */}
      <div className={`p-2.5 sm:p-3 ${isOOS ? "opacity-60" : ""}`}>
        {/* Delivery + stock row */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          {isOOS ? (
            <span className="text-[10px] font-bold text-[#ff4f8b] bg-[#fff0f6] px-1.5 py-0.5 rounded">
              Currently Unavailable
            </span>
          ) : (
            <>
              <span className="text-[10px] font-bold text-[#0c831f] bg-[#e8f5e9] px-1.5 py-0.5 rounded">
                10 mins
              </span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${stock?.dot} ${stock?.pulse ? "stock-pulse" : ""}`} />
                <span className="text-[9px] font-semibold text-[#666]">{stock?.label}</span>
              </span>
            </>
          )}
        </div>

        <Link href={`/product/${product.id}`} className="block group/title">
          <h2 className={`text-xs sm:text-sm font-semibold leading-tight line-clamp-2 min-h-[2.5rem] ${isOOS ? "text-[#666]" : "text-[#1a1a1a] group-hover/title:text-[#ff4f8b] transition-colors"}`}>
            {product.name}
          </h2>
        </Link>

        <p className="text-[10px] text-[#999] mt-0.5">{product.category}</p>

        {/* Price + Add button */}
        <div className="mt-2">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm sm:text-base font-black ${isOOS ? "text-[#999] line-through" : "text-[#1a1a1a]"}`} itemProp="price">
              ₹{actualPrice}
              <meta itemProp="priceCurrency" content="INR" />
            </span>
            {!isOOS && oldPrice > actualPrice && (
              <span className="text-[10px] text-[#999] line-through" aria-label={`Original price: ₹${oldPrice}`}>
                ₹{oldPrice}
              </span>
            )}
          </div>

          <div className="mt-2.5">
            {isOOS ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast("Price alert feature coming soon!");
                }}
                className="flex items-center justify-center w-full h-8 sm:h-9 rounded-lg bg-[#fafafa] text-[#ff4f8b] font-bold text-[11px] border border-[#ff4f8b]/20 hover:bg-[#fff0f6] transition-colors shadow-sm"
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
                size="md"
              />
            )}
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
    </div>
  );
}

export default memo(ProductCard);
