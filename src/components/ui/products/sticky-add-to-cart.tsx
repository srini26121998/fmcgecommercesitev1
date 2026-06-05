"use client";

import { Bell } from "lucide-react";
import { useUserCart } from "@/hooks/use-user-cart";
import AddToCartButton from "@/components/ui/products/add-to-cart-button";
import { toast } from "sonner";
import type { StockStatus } from "@/data/products";

interface StickyAddToCartProps {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    stock?: StockStatus;
    weight?: string;
  };
}

export default function StickyAddToCart({ product }: StickyAddToCartProps) {
  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } = useUserCart();
  const cartItem = cartItems.find((item) => Number(item.id) === Number(product.id));
  const quantity = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock === "out_of_stock";

  if (isOutOfStock) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8e8e8] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:hidden animate-slide-up">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#999]">{product.name}</p>
            <p className="text-lg font-black text-[#999] line-through">₹{product.price}</p>
          </div>
          <button
            onClick={() => {
              toast("Price alert feature coming soon!");
            }}
            className="flex items-center gap-2 h-12 px-6 rounded-xl bg-[#fff0f6] text-[#ff4f8b] text-sm font-black"
          >
            <Bell className="w-5 h-5" />
            Notify Me
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e8e8e8] shadow-[0_-8px_24px_rgba(0,0,0,0.08)] md:hidden animate-slide-up safe-area-bottom">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
        {/* Price info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#999]">{product.name}</p>
          <p className="text-lg font-black text-[#1a1a1a]">₹{product.price}</p>
        </div>

        {/* Quantity / Add to Cart */}
        <div className="flex-shrink-0">
          <AddToCartButton
            productId={product.id}
            productName={product.name}
            productPrice={product.price}
            productImage={product.image}
            themeColor="pink"
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
