"use client";

import React, { useState } from "react";
import { MapPin, ChevronDown, CheckCircle2, Heart, Truck, ShieldCheck, CreditCard, Box, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserCart } from "@/hooks/use-user-cart";
import { useRouter } from "next/navigation";
import { useMultiWishlistStore } from "@/store/multi-wishlist-store";
import { toast } from "sonner";
import { WishlistListPicker } from "@/components/ui/wishlist-list-picker";

interface AmazonBuyBoxProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    mrp: number;
    image: string;
    stock: number;
  };
}

export default function AmazonBuyBox({ product }: AmazonBuyBoxProps) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useUserCart();
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  
  const isInAnyList = useMultiWishlistStore((s) => s.isInAnyList);
  const isHydrated = useMultiWishlistStore((s) => s._hasHydrated);
  const [showPicker, setShowPicker] = useState(false);
  
  const isWishlisted = isHydrated ? isInAnyList(Number(product.id)) : false;

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(Number(product.id), quantity);
    setTimeout(() => setIsAdding(false), 600);
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(Number(product.id), quantity);
    router.push('/checkout');
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 1);
  const deliveryDateStr = deliveryDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
      className="border-2 border-indigo-50/50 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl shadow-indigo-100/40 flex flex-col gap-5 sticky top-24"
    >
      <div className="space-y-1">
        <div className="flex items-start gap-1">
          <span className="text-xs font-medium text-slate-500 mt-2">₹</span>
          <span className="text-3xl font-black text-slate-900 tracking-tight">{product.price.toLocaleString()}</span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          ≈ ₹{Math.round((product.price / 150) * 100).toLocaleString()} per 100g
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> In Stock
        </span>
      </div>

      {/* Delivery Info */}
      <div className="bg-indigo-50/50 rounded-2xl p-4 space-y-3 border border-indigo-100/50">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <Truck className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-xs text-slate-700 leading-tight">
              Free Delivery by <span className="font-bold text-slate-900">{deliveryDateStr}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">On your first order</div>
          </div>
        </div>
        <div className="h-px w-full bg-indigo-100" />
        <div className="flex items-start gap-3 group cursor-pointer">
          <div className="mt-0.5">
            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="text-xs text-slate-600 group-hover:text-indigo-600 transition-colors">
            Deliver to <span className="font-medium text-slate-900 group-hover:text-indigo-700">Chennai 600009</span>
          </div>
        </div>
      </div>

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">Quantity</label>
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl w-max p-1">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all active:scale-95"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="w-10 text-center font-bold text-slate-900">{quantity}</div>
          <button 
            onClick={() => setQuantity(Math.min(10, quantity + 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button 
          onClick={handleAddToCart}
          disabled={isAdding}
          className={`w-full bg-[#ff4f8b] hover:bg-[#e63872] text-white rounded-xl py-3 text-xs sm:text-sm font-bold transition-all relative overflow-hidden flex justify-center items-center gap-2 group ${isAdding ? 'scale-95 opacity-90' : 'active:scale-95'}`}
        >
          <AnimatePresence mode="wait">
            {isAdding ? (
              <motion.div 
                key="added"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Added to Cart
              </motion.div>
            ) : (
              <motion.div 
                key="add"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <Box className="w-4 h-4 group-hover:-translate-y-1 transition-transform" /> Add to Cart
              </motion.div>
            )}
          </AnimatePresence>
        </button>
        <button 
          onClick={handleBuyNow}
          className="w-full bg-[#E3C290] hover:bg-[#D1B180] text-slate-900 rounded-xl py-3 text-xs sm:text-sm font-bold shadow-xl shadow-[#E3C290]/30 transition-all active:scale-95 flex justify-center items-center gap-2 hover:-translate-y-0.5"
        >
          <CreditCard className="w-4 h-4" /> Buy Now
        </button>
      </div>

      <div className="h-px w-full bg-slate-100" />

      {/* Seller info */}
      <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-[10px] sm:text-xs bg-slate-50/50 p-3 sm:p-4 rounded-xl border border-slate-100">
        <div className="text-slate-500 font-medium flex items-center gap-1.5"><Box className="w-3 h-3" /> Ships from</div>
        <div className="font-semibold text-slate-900">FMCG Commerce</div>
        
        <div className="text-slate-500 font-medium flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Sold by</div>
        <div className="font-semibold text-indigo-600">{product.name.split(' ')[0]} Retail.</div>
        
        <div className="text-slate-500 font-medium flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Payments</div>
        <div className="text-slate-700">Secure transaction</div>
      </div>

      {/* Add to Wish List */}
      <button 
        onClick={() => setShowPicker(true)}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-rose-50 border-2 border-slate-100 hover:border-rose-100 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 hover:text-rose-600 shadow-sm transition-all group active:scale-95"
      >
        <Heart className={`w-4 h-4 transition-all group-hover:scale-110 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-400 group-hover:text-rose-500"}`} />
        {isWishlisted ? "Saved to Wish List" : "Add to Wish List"}
      </button>

      {/* Wishlist List Picker */}
      <AnimatePresence>
        {showPicker && (
          <WishlistListPicker
            item={{ 
              id: Number(product.id), 
              name: product.name, 
              image: product.image, 
              price: product.price, 
              mrp: product.mrp > product.price ? product.mrp : undefined 
            }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
