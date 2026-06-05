"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Share2, ShoppingCart, Copy, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { useProducts } from "@/hooks/use-products";
import Navbar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/mobile/bottom-nav";
import { SafeProductImage } from "@/components/ui/safe-image";

export default function SharedCartPage({ params }: { params: Promise<{ id: string }> }) {
  const { products } = useProducts();
  const { id } = use(params);
  const { addToCart } = useCartStore();

  // Mock fetching shared cart based on ID. 
  // For demo, we just pick 3 random products.
  const sharedItems = products.slice(0, 3).map(p => ({ ...p, quantity: 1, image: p.media?.[0]?.url || "" }));
  const total = sharedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Shared cart link copied!");
  };

  const handleAddAll = () => {
    sharedItems.forEach(item => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
      });
    });
    toast.success("Added all items to your cart!");
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      <Navbar />
      <div className="pt-[72px] sm:pt-20">
        <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-[72px] sm:top-20 z-10">
          <div className="max-w-[900px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/cart" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-[#1a1a1a] flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#ff4f8b]" /> Shared Cart
                </h1>
                <p className="text-xs text-[#666]">Shared by a friend • {sharedItems.length} items</p>
              </div>
            </div>
            <button onClick={handleCopyLink} className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors" title="Copy Link">
              <Copy className="w-5 h-5 text-[#666]" />
            </button>
          </div>
        </div>

        <div className="max-w-[900px] mx-auto px-4 py-6 space-y-4">
          {sharedItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="bg-white rounded-xl p-4 flex gap-4 border border-[#e8e8e8]">
              <div className="relative w-20 h-20 flex-shrink-0">
                <SafeProductImage src={item.image} alt={item.name} fill className="object-contain rounded-lg bg-[#f9f9f9]" sizes="80px" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-[#666] mt-1">Qty: {item.quantity}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold">₹{item.price * item.quantity}</span>
                  <button 
                    onClick={() => {
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        quantity: item.quantity,
                      });
                      toast.success(`Added ${item.name} to cart`);
                    }}
                    className="w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center hover:bg-[#e8e8e8] text-[#ff4f8b]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl p-4 border border-[#e8e8e8] mt-6">
            <div className="flex items-center justify-between font-black text-lg mb-4">
              <span>Total Value</span>
              <span>₹{total}</span>
            </div>
            <button 
              onClick={handleAddAll}
              className="w-full h-12 rounded-xl bg-[#ff4f8b] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#e63872] transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Add All to My Cart
            </button>
          </div>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
