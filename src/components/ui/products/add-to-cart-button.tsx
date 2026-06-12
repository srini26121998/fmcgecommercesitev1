"use client";

import { useUserCart } from "@/hooks/use-user-cart";
import { useMultiWishlistStore } from "@/store/multi-wishlist-store";
import { Plus, Minus } from "lucide-react";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: number | string;
  productName: string;
  productPrice: number;
  productImage: string;
  themeColor?: "pink" | "green" | "red"; // Styling preset
  size?: "sm" | "md" | "lg";
}

const colorPresets = {
  pink: {
    text: "text-white",
    border: "border-[#ff4f8b]",
    bgHover: "hover:bg-[#e63872]",
    bgActive: "bg-[#ff4f8b]",
    bgActiveDark: "hover:bg-[#e63872]",
    glow: "hover:shadow-[0_4px_14px_rgba(255,79,139,0.39)]",
    lightBg: "bg-[#ff4f8b]",
  },
  green: {
    text: "text-[#0c831f]",
    border: "border-[#0c831f]",
    bgHover: "hover:bg-[#0c831f] hover:text-white",
    bgActive: "bg-[#0c831f]",
    bgActiveDark: "hover:bg-[#0a6e1a]",
    glow: "hover:shadow-[0_0_12px_rgba(12,131,31,0.35)]",
    lightBg: "bg-[#e8f5e9]",
  },
  red: {
    text: "text-[#dc2626]",
    border: "border-[#dc2626]",
    bgHover: "hover:bg-[#dc2626] hover:text-white",
    bgActive: "bg-[#dc2626]",
    bgActiveDark: "hover:bg-[#b91c1c]",
    glow: "hover:shadow-[0_0_12px_rgba(220,38,38,0.35)]",
    lightBg: "bg-[#fef2f2]",
  },
};

const sizeClasses = {
  sm: {
    container: "h-7 sm:h-8",
    addText: "text-[10px] sm:text-xs px-2.5",
    qtyText: "text-xs px-1",
    icon: "w-3 h-3",
  },
  md: {
    container: "h-8 sm:h-9",
    addText: "text-xs px-4",
    qtyText: "text-sm px-2",
    icon: "w-3.5 h-3.5",
  },
  lg: {
    container: "h-11 sm:h-12",
    addText: "text-sm px-6",
    qtyText: "text-base px-3",
    icon: "w-4 h-4",
  },
};

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  productImage,
  themeColor = "pink",
  size = "md",
}: AddToCartButtonProps) {
  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } = useUserCart();
  const isHydrated = useMultiWishlistStore((s) => s._hasHydrated);

  const cartItem = cartItems.find((item) => Number(item.id) === Number(productId));
  const quantity = isHydrated ? (cartItem?.quantity ?? 0) : 0;

  const preset = colorPresets[themeColor];
  const sizePreset = sizeClasses[size];

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(productId, 1);
      toast.success(`Added ${productName} to cart 🛒`);
    } catch (err) {
      toast.error("Failed to add item to cart");
    }
  };

  const handleIncrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await increaseQuantity(productId);
    toast.success(`Updated ${productName} quantity 🛒`);
  };

  const handleDecrease = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await decreaseQuantity(productId);
  };

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className={`w-full ${sizePreset.container} rounded-lg ${preset.bgActive} border ${preset.border} ${preset.text} font-black uppercase tracking-wider ${sizePreset.addText} transition-all duration-200 cursor-pointer shadow-sm ${preset.bgHover} ${preset.glow} active:scale-95 flex items-center justify-center gap-1`}
      >
        <Plus className={sizePreset.icon} />
        ADD
      </button>
    );
  }

  return (
    <div
      className={`flex items-center justify-between w-full ${sizePreset.container} rounded-lg ${preset.bgActive} overflow-hidden shadow-md border ${preset.border} transition-all duration-200`}
    >
      <button
        type="button"
        onClick={handleDecrease}
        className={`flex-1 h-full flex items-center justify-center text-white ${preset.bgActiveDark} transition-colors cursor-pointer`}
        aria-label="Decrease quantity"
      >
        <Minus className={sizePreset.icon} />
      </button>
      <span className={`w-8 text-center font-black text-white select-none ${sizePreset.qtyText}`}>
        {quantity}
      </span>
      <button
        type="button"
        onClick={handleIncrease}
        className={`flex-1 h-full flex items-center justify-center text-white ${preset.bgActiveDark} transition-colors cursor-pointer`}
        aria-label="Increase quantity"
      >
        <Plus className={sizePreset.icon} />
      </button>
    </div>
  );
}
