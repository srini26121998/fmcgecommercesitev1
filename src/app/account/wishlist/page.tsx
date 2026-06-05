"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Heart, ShoppingCart, Trash2, Search, ShoppingBag, ArrowLeftFromLine } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, moveToCart } = useWishlistStore();
  const { addToCart } = useCartStore();
  const [movingId, setMovingId] = useState<number | null>(null);

  const handleMoveToCart = (item: { id: number; name: string; image: string; price: number }) => {
    setMovingId(item.id);
    setTimeout(() => {
      const moved = moveToCart(item.id);
      if (moved) {
        addToCart({
          id: moved.id,
          name: moved.name,
          price: moved.price,
          image: moved.image,
          quantity: 1,
        });
        toast.success(`${moved.name} moved to cart ðŸ›’`);
      }
      setMovingId(null);
    }, 300);
  };

  const handleRemove = (id: number, name: string) => {
    removeFromWishlist(id);
    toast(`${name} removed from wishlist`);
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">My Wishlist</h1>
            <p className="text-xs text-[#666]">{wishlist.length} {wishlist.length === 1 ? "item" : "items"}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-5">
        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[#fff0f6] flex items-center justify-center mx-auto mb-4">
              <Heart className="w-10 h-10 text-[#ff4f8b]" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-[#666] mb-6">Save items you love and move them to cart when ready</p>
            <Link href="/" className="inline-flex h-11 px-6 rounded-xl bg-[#ff4f8b] text-white text-sm font-semibold items-center gap-2 hover:bg-[#e63872] transition-colors">
              <ShoppingBag className="w-4 h-4" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-[#e8e8e8] overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 p-4">
                  {/* Image */}
                  <Link href={`/product/${item.id}`} className="relative w-20 h-20 rounded-xl bg-[#f2f2f2] overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${item.id}`}>
                      <h3 className="text-sm font-bold text-[#1a1a1a] truncate hover:text-[#ff4f8b] transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-black text-[#1a1a1a] mt-1">₹{item.price}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      disabled={movingId === item.id}
                      className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors disabled:opacity-70"
                    >
                      {movingId === item.id ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <ShoppingCart className="w-3.5 h-3.5" />
                      )}
                      Move to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.id, item.name)}
                      className="flex items-center justify-center gap-1 h-9 px-3 rounded-xl border border-[#e8e8e8] text-xs font-semibold text-[#999] hover:text-[#ff4f8b] hover:border-[#ff4f8b] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
