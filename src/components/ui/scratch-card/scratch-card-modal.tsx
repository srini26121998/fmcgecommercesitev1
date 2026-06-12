"use client";

import React, { useState, useEffect } from "react";
import { X, Gift, Sparkles } from "lucide-react";
import ScratchCardCanvas from "./scratch-card-canvas";
import { toast } from "sonner";
import { useWalletStore } from "@/store/wallet-store";
import { useScratchCardStore } from "@/store/scratch-card-store";
import { motion, AnimatePresence } from "framer-motion";

interface ScratchCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

export default function ScratchCardModal({ isOpen, onClose, orderId }: ScratchCardModalProps) {
  const [showCanvas, setShowCanvas] = useState(false);
  const [isScratched, setIsScratched] = useState(false);
  const { addPendingTransaction } = useWalletStore();
  
  const scratchCard = useScratchCardStore((state) => state.getCardByOrderId(orderId));
  const markScratched = useScratchCardStore((state) => state.markScratched);

  useEffect(() => {
    if (isOpen) {
      // Reset state when opened
      setShowCanvas(false);
      setIsScratched(false);
    }
  }, [isOpen]);

  const handleScratchComplete = async () => {
    // Simulate API Call: POST /scratchcards/{id}/scratch
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate win logic
    const isWin = Math.random() > 0.2; // 80% chance to win something
    let result = { type: "Better Luck", value: "", isWin: false };
    
    if (isWin) {
      const type = Math.random() > 0.5 ? "Cashback" : "Coupon";
      if (type === "Cashback") {
        const amount = Math.floor(Math.random() * 40) + 10; // 10 to 50
        result = { type: "Wallet Cashback", value: `₹${amount}`, isWin: true };
        addPendingTransaction(amount, `Scratch Card Win (Order ${orderId})`, "cashback");
        setTimeout(() => toast.success(`₹${amount} cashback credited to your wallet!`), 1000);
      } else {
        const percent = Math.floor(Math.random() * 3) * 5 + 5; // 5, 10, 15
        result = { type: "Off Coupon", value: `${percent}% OFF`, isWin: true };
        setTimeout(() => toast.success(`Coupon added to My Coupons!`), 1000);
      }
    }
    
    if (scratchCard && !scratchCard.isScratched) {
      markScratched(scratchCard.id, result.type, result.value);
    }

    setIsScratched(true);
    return result;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 md:p-8 shadow-2xl relative z-10 overflow-hidden"
          >
            {/* Decorative background elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-rose-400 to-orange-300 rounded-full blur-3xl opacity-20 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full blur-3xl opacity-20 pointer-events-none" />

            <button 
              onClick={onClose}
              className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/80 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors z-20 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mt-2 relative z-10">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2, damping: 15 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mb-6 shadow-inner border border-rose-100"
              >
                <Gift className="w-10 h-10 text-rose-500" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-rose-200 rounded-full opacity-50"
                />
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black text-slate-900 text-center tracking-tight"
              >
                Surprise Reward! <Sparkles className="inline w-5 h-5 text-amber-400 mb-1" />
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-slate-500 mt-2 text-center mb-8 font-medium px-4"
              >
                Thanks for shopping with us. Scratch the card below to reveal your exclusive reward.
              </motion.p>

              {!showCanvas ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="w-full space-y-3"
                >
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCanvas(true)}
                    className="group relative w-full h-14 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_25px_rgba(244,63,94,0.5)] transition-all overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Scratch Now
                    </span>
                    <motion.div 
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                      className="absolute inset-0 h-full w-[50%] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    />
                  </motion.button>
                  <button 
                    onClick={onClose}
                    className="w-full h-14 rounded-2xl bg-slate-50 text-slate-600 font-semibold hover:bg-slate-100 transition-colors active:scale-[0.98]"
                  >
                    Maybe Later
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="w-full flex justify-center perspective-[1000px]"
                >
                  <ScratchCardCanvas onScratchComplete={handleScratchComplete} />
                </motion.div>
              )}

              {isScratched && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={onClose}
                  className="mt-8 px-8 py-3 rounded-full border-2 border-slate-200 text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-95"
                >
                  Awesome, Close
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
