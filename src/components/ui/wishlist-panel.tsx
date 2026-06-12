"use client";

import { useState } from "react";
import { Heart, X, ShoppingCart, Trash2, ChevronRight } from "lucide-react";
import { useMultiWishlistStore } from "@/store/multi-wishlist-store";
import { useCartStore } from "@/store/cart-store";
import Link from "next/link";
import { SafeProductImage } from "./safe-image";
import { toast } from "sonner";

export default function WishlistPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { lists, removeItem, activeListId, _hasHydrated: isHydrated } = useMultiWishlistStore();
  const addToCart = useCartStore((s) => s.addToCart);

  // Total items across all lists (for badge count)
  const totalItems = lists.reduce((acc, l) => acc + l.items.length, 0);

  // Show items from the active list in the panel
  const activeList =
    lists.find((l) => l.id === activeListId) ?? lists[0];
  const items = activeList?.items ?? [];

  return (
    <div className="relative">
      {/* Heart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#f8f9fa] border border-[#e8e8e8] flex items-center justify-center hover-border-pink transition-all duration-200 btn-press hover:bg-white hover:shadow-sm group"
        aria-label={`Wishlist${totalItems > 0 ? `, ${totalItems} items` : ""}`}
      >
        <Heart className="w-5 h-5 text-[#444] group-hover:text-[#ff4f8b] transition-colors" />
        {isHydrated && totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#ff4f8b] text-white text-[9px] font-black min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none px-1 shadow-sm">
            {totalItems > 9 ? "9+" : totalItems}
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
                <h3 className="text-sm font-black text-[#1a1a1a]">
                  {activeList?.name ?? "My Wishlist"}
                </h3>
                {totalItems > 0 && (
                  <span className="bg-[#ff4f8b] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {totalItems} items
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#f2f2f2] rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-[#666]" />
              </button>
            </div>

            {/* List tabs (if multiple lists) */}
            {lists.length > 1 && (
              <div className="flex gap-1.5 px-3 pt-2 overflow-x-auto hide-scrollbar">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() =>
                      useMultiWishlistStore.getState().setActiveList(list.id)
                    }
                    className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${
                      list.id === activeListId
                        ? "bg-[#ff4f8b] text-white"
                        : "bg-[#f2f2f2] text-[#666] hover:bg-[#ffe0ee]"
                    }`}
                  >
                    {list.name}
                    <span className="ml-1 opacity-70">({list.items.length})</span>
                  </button>
                ))}
              </div>
            )}

            {/* List */}
            <div className="max-h-80 overflow-y-auto mt-1">
              {items.length > 0 ? (
                <div className="divide-y divide-[#e8e8e8]">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors"
                    >
                      <Link
                        href={`/product/${item.id}`}
                        onClick={() => setIsOpen(false)}
                        className="block flex-shrink-0"
                      >
                        <div className="relative w-14 h-14 bg-[#f2f2f2] rounded-lg overflow-hidden border border-[#e8e8e8]">
                          <SafeProductImage
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.id}`}
                          onClick={() => setIsOpen(false)}
                        >
                          <p className="text-xs font-bold text-[#1a1a1a] line-clamp-2 hover:text-[#ff4f8b] transition-colors">
                            {item.name}
                          </p>
                        </Link>
                        <p className="text-sm font-black text-[#1a1a1a] mt-1">
                          ₹{item.price}
                          {item.mrp && item.mrp > item.price && (
                            <span className="text-[10px] font-normal text-[#999] line-through ml-1.5">
                              ₹{item.mrp}
                            </span>
                          )}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => {
                              addToCart({
                                id: String(item.id),
                                name: item.name,
                                price: item.price,
                                image: item.image,
                                quantity: 1,
                              });
                              removeItem(activeList!.id, item.id);
                              toast.success("Moved to cart 🛒");
                            }}
                            className="flex items-center justify-center gap-1 flex-1 h-7 rounded bg-[#0c831f] text-white text-[10px] font-bold hover:bg-[#0a6e1a] transition-colors"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            ADD TO CART
                          </button>
                          <button
                            onClick={() => {
                              removeItem(activeList!.id, item.id);
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
              ) : totalItems > 0 ? (
                // Other lists have items but this one is empty
                <div className="py-8 text-center">
                  <Heart className="w-8 h-8 text-[#ccc] mx-auto mb-2" />
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    This list is empty
                  </p>
                  <p className="text-xs text-[#666] mt-1">
                    Switch to another list above
                  </p>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <Heart className="w-10 h-10 text-[#ccc] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    Your wishlist is empty
                  </p>
                  <p className="text-xs text-[#666] mt-1">
                    Tap ♡ on any product to save it
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {totalItems > 0 && (
              <div className="border-t border-[#e8e8e8] px-4 py-3 bg-[#fafafa]">
                <Link
                  href="/account/wishlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-1 w-full text-center py-2 rounded-lg bg-white border border-[#e8e8e8] text-xs font-bold text-[#1a1a1a] hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-colors"
                >
                  View All Wishlists
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
