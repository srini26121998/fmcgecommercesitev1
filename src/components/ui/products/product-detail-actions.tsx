"use client";

import { Bell } from "lucide-react";
import { useUserCart } from "@/hooks/use-user-cart";
import AddToCartButton from "@/components/ui/products/add-to-cart-button";
import { toast } from "sonner";
import type { StockStatus } from "@/data/products";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  stock?: StockStatus;
}

export default function ProductDetailActions({ product }: { product: Product }) {
  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } = useUserCart();
  const cartItem = cartItems.find((item) => Number(item.id) === Number(product.id));
  const quantity = cartItem?.quantity ?? 0;
  const isOutOfStock = product.stock === "out_of_stock";

  if (isOutOfStock) {
    return (
      <div className="flex flex-col w-full">
        <button
          onClick={() => {
            toast("Price alert feature coming soon!");
          }}
          className="w-full h-14 rounded-xl bg-[#fff0f6] text-[#ff4f8b] text-base sm:text-sm font-black flex items-center justify-center gap-2.5 px-4"
        >
          <Bell className="w-5 h-5 sm:w-4 sm:h-4" />
          Notify Me
        </button>
        <p className="text-xs text-[#999] mt-2 text-center">
          This item is currently out of stock. We'll notify you when it's back.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <AddToCartButton
        productId={product.id}
        productName={product.name}
        productPrice={product.price}
        productImage={product.image}
        themeColor="pink"
        size="lg"
      />
    </div>
  );
}
