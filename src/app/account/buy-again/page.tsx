"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ChevronLeft,
  ShoppingBag,
  TrendingUp,
  Clock,
  Plus,
  Zap,
  CheckCircle2,
  AlertCircle,
  PackageX
} from "lucide-react";
import { toast } from "sonner";
import { SafeProductImage } from "@/components/ui/safe-image";
import { useOrderStore, OrderItem, Order } from "@/store/order-store";
import { useCartStore } from "@/store/cart-store";

interface PredictiveItem extends OrderItem {
  lastBought: string;
  lastBoughtDate: Date;
  frequency: string;
  urgency: "high" | "medium" | "low";
  estimatedRunOut: string;
}

export default function BuyAgainPage() {
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const { orders } = useOrderStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const predictiveItems = useMemo(() => {
    const itemMap = new Map<string, { item: OrderItem; dates: Date[] }>();

    orders.forEach((order) => {
      const orderDate = new Date(order.date);
      order.items.forEach((item) => {
        const id = String(item.id);
        if (!itemMap.has(id)) {
          itemMap.set(id, { item, dates: [] });
        }
        itemMap.get(id)!.dates.push(orderDate);
      });
    });

    const items: PredictiveItem[] = [];
    const now = new Date();

    itemMap.forEach(({ item, dates }) => {
      dates.sort((a, b) => b.getTime() - a.getTime());
      const lastBoughtDate = dates[0];
      const diffTime = Math.abs(now.getTime() - lastBoughtDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let frequencyStr = "Occasionally";
      let urgency: "high" | "medium" | "low" = "low";
      let estimatedRunOut = "in a while";

      if (dates.length > 1) {
        const firstBought = dates[dates.length - 1];
        const spanDays = Math.ceil(Math.abs(now.getTime() - firstBought.getTime()) / (1000 * 60 * 60 * 24));
        const avgFrequency = spanDays / dates.length;
        frequencyStr = `Every ~${Math.round(avgFrequency)} days`;
        
        if (diffDays >= avgFrequency - 2) {
          urgency = "high";
          estimatedRunOut = "1-2 days";
        } else if (diffDays >= avgFrequency - 5) {
          urgency = "medium";
          estimatedRunOut = "4-5 days";
        }
      } else {
        if (diffDays > 30) {
          urgency = "medium";
          estimatedRunOut = "soon";
        } else if (diffDays > 60) {
          urgency = "high";
          estimatedRunOut = "any day now";
        }
      }

      items.push({
        ...item,
        lastBought: `${diffDays === 0 ? 'Today' : diffDays + ' days ago'}`,
        lastBoughtDate,
        frequency: frequencyStr,
        urgency,
        estimatedRunOut,
      });
    });

    return items.sort((a, b) => {
      const urgencyScore = { high: 3, medium: 2, low: 1 };
      if (urgencyScore[a.urgency] !== urgencyScore[b.urgency]) {
        return urgencyScore[b.urgency] - urgencyScore[a.urgency];
      }
      return b.lastBoughtDate.getTime() - a.lastBoughtDate.getTime();
    });
  }, [orders]);

  const handleAddToCart = (item: PredictiveItem) => {
    setAddingToCart(String(item.id));
    
    setTimeout(() => {
      addToCart({
        id: String(item.id),
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
      });
      setAddingToCart(null);
      toast.success("Added to cart", {
        description: `${item.name} has been added.`,
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      });
    }, 600);
  };

  const highUrgencyItems = predictiveItems.filter(i => i.urgency === "high");
  const otherItems = predictiveItems.filter(i => i.urgency !== "high");

  // Animations
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24 font-sans">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 py-3 sticky top-0 z-20 shadow-sm transition-all">
        <div className="max-w-[800px] mx-auto flex items-center gap-3">
          <Link
            href="/account"
            className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Back to account"
          >
            <ChevronLeft className="w-5 h-5 text-slate-800" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Buy Again</h1>
            <p className="text-[11px] font-medium text-slate-500">Based on your past orders</p>
          </div>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 py-6 space-y-8">
        
        {predictiveItems.length > 0 ? (
          <>
            {/* Predictive AI Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200 flex items-center gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl -mb-10" />
              
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-md border border-white/20 z-10">
                <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300/30" />
              </div>
              <div className="z-10">
                <h2 className="text-base font-bold mb-0.5 tracking-tight">Smart Restock AI</h2>
                <p className="text-[13px] text-white/90 font-medium leading-tight">
                  We analyzed your shopping habits to predict what you might need today.
                </p>
              </div>
            </motion.div>

            <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-8">
              {/* High Urgency Section */}
              {highUrgencyItems.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Running Low Soon</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {highUrgencyItems.map((item) => (
                      <motion.div variants={itemVars} key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#ff4f8b]/30 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                          Runs out in ~{item.estimatedRunOut}
                        </div>
                        
                        <div className="flex gap-4 relative z-0">
                          <div className="relative w-24 h-24 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 mt-2 group-hover:scale-[1.02] transition-transform">
                            <SafeProductImage src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 line-clamp-2 pr-10 leading-tight mb-1.5 group-hover:text-[#ff4f8b] transition-colors">{item.name}</p>
                              <div className="flex items-baseline gap-1.5 mb-2.5">
                                <span className="text-sm font-black text-slate-900">₹{item.price}</span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Bought {item.lastBought}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                                  <span>{item.frequency}</span>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={addingToCart === String(item.id)}
                              className="mt-3 w-full h-9 rounded-xl bg-[#ff4f8b] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#e63872] transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-sm"
                            >
                              {addingToCart === String(item.id) ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Plus className="w-4 h-4" /> Add to Cart
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Other Regular Items */}
              {otherItems.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight uppercase">Frequently Bought</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {otherItems.map((item) => (
                      <motion.div variants={itemVars} key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-[#ff4f8b]/30 transition-all duration-300 group">
                        <div className="flex gap-4">
                          <div className="relative w-20 h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0 group-hover:scale-[1.02] transition-transform">
                            <SafeProductImage src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-tight mb-1.5 group-hover:text-[#ff4f8b] transition-colors">{item.name}</p>
                              <p className="text-sm font-black text-slate-900 mb-2">₹{item.price}</p>
                              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>Bought {item.lastBought}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={addingToCart === String(item.id)}
                              className="mt-3 w-full h-8 rounded-xl bg-[#ff4f8b] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#e63872] transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none shadow-sm"
                            >
                              {addingToCart === String(item.id) ? (
                                <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" /> Add to Cart
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center"
          >
            {/* Animated icon */}
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 18 }}
              className="relative w-28 h-28 mb-6"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 shadow-inner" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-200 animate-spin-slow" />
              <div className="relative flex items-center justify-center w-full h-full">
                <PackageX className="w-12 h-12 text-indigo-300" />
              </div>
            </motion.div>

            <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
              No Purchase History Yet
            </h3>
            <p className="text-sm text-slate-500 mb-4 max-w-xs leading-relaxed font-medium">
              Once you place your first order, our <span className="font-bold text-indigo-600">Smart Restock AI</span> will
              predict what you need and surface items here automatically.
            </p>

            {/* How it works mini-steps */}
            <div className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 text-left space-y-2.5">
              {[
                { step: "1", text: "Browse and add items to cart" },
                { step: "2", text: "Place your first order" },
                { step: "3", text: "AI learns your restock rhythm" },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-600">{s.text}</span>
                </div>
              ))}
            </div>

            <Link
              href="/"
              className="h-12 px-10 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[15px] font-bold inline-flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all active:scale-[0.98] shadow-lg shadow-indigo-600/25"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}

