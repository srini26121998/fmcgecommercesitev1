"use client";

import { useState, useEffect } from "react";
import { Heart, X, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { SafeProductImage } from "./safe-image";
import { toast } from "sonner";

export default function WishlistPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { wishlist, removeFromWishlist } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const itemCount = wishlist.length;

  return (
    <div className="relative">
      {/* Heart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] flex items-center justify-center hover-border-pink transition-all duration-200 btn-press hover:bg-white hover:shadow-sm group"
        aria-label={`Wishlist${itemCount > 0 ? `, ${itemCount} items` : ""}`}
      >
        <Heart className="w-5 h-5 text-[#444] group-hover:text-[#ff4f8b] transition-colors" />
        {isHydrated && itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#ff4f8b] text-white text-[9px] font-black min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-1 shadow-sm">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#e8e8e8] shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#e8e8e8]">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#ff4f8b] fill-[#ff4f8b]" />
                <h3 className="text-sm font-black text-[#1a1a1a]">My Wishlist</h3>
                {itemCount > 0 && (
                  <span className="bg-[#ff4f8b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {itemCount} items
                  </span>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[#f2f2f2] rounded-lg transition-colors">
                <X className="w-4 h-4 text-[#666]" />
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {itemCount > 0 ? (
                <div className="divide-y divide-[#e8e8e8]">
                  {wishlist.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors">
                      <Link href={`/product/${item.id}`} onClick={() => setIsOpen(false)} className="block flex-shrink-0">
                        <div className="relative w-14 h-14 bg-[#f2f2f2] rounded-lg overflow-hidden border border-[#e8e8e8]">
                          <SafeProductImage src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.id}`} onClick={() => setIsOpen(false)}>
                          <p className="text-xs font-bold text-[#1a1a1a] line-clamp-2 hover:text-[#ff4f8b] transition-colors">
                            {item.name}
                          </p>
                        </Link>
                        <p className="text-sm font-black text-[#1a1a1a] mt-1">₹{item.price}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => {
                              addToCart({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1 });
                              removeFromWishlist(item.id);
                              toast.success("Moved to cart 🛒");
                            }}
                            className="flex items-center justify-center gap-1 flex-1 h-7 rounded bg-[#0c831f] text-white text-[10px] font-bold hover:bg-[#0a6e1a] transition-colors"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            ADD TO CART
                          </button>
                          <button
                            onClick={() => {
                              removeFromWishlist(item.id);
                              toast("Removed from wishlist");
                            }}
                            className="w-7 h-7 flex items-center justify-center rounded bg-[#f2f2f2] text-[#999] hover:text-[#ff4f8b] hover:bg-[#fff0f6] transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Heart className="w-10 h-10 text-[#ccc] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#1a1a1a]">Your wishlist is empty</p>
                  <p className="text-xs text-[#666] mt-1">Save your favorite items here</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {itemCount > 0 && (
              <div className="border-t border-[#e8e8e8] px-4 py-3 bg-[#fafafa]">
                <Link
                  href="/account/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center py-2 rounded-lg bg-white border border-[#e8e8e8] text-xs font-bold text-[#1a1a1a] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-colors"
                >
                  View Full Wishlist
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
