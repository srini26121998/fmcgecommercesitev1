"use client";

import { usePromotionsStore } from "@/store/promotions-store";
import { Info, Tag, X, CheckCircle, CreditCard, Smartphone } from "lucide-react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function ProductPromoBanner({ productId, category }: { productId: string, category: string }) {
  const { 
    cashbackRules = [], 
    activeProductBadges = {}, 
    fetchApplicableBadges, 
    bogoRules = [], 
    activeBogoBadges = {}, 
    fetchBogoBadges 
  } = usePromotionsStore();
  const [showModal, setShowModal] = useState(false);
  const [showBogoModal, setShowBogoModal] = useState(false);

  useEffect(() => {
    if (fetchApplicableBadges) fetchApplicableBadges([productId]);
    if (fetchBogoBadges) fetchBogoBadges([productId]);
  }, [productId, fetchApplicableBadges, fetchBogoBadges]);

  const productBadges = activeProductBadges[productId] || [];
  // For demo, if no specific badge, try to match by category
  const activeRule = productBadges.length > 0 
    ? cashbackRules.find(r => r.id === productBadges[0])
    : cashbackRules.find(r => r.applicableCategories.includes("all") || r.applicableCategories.includes(category.toLowerCase()));

  const bogoProductBadges = activeBogoBadges[productId] || [];
  const activeBogoRule = bogoProductBadges.length > 0 ? bogoRules.find(r => r.id === bogoProductBadges[0]) : null;

  if (!activeRule && !activeBogoRule) return null;

  return (
    <>
      {activeBogoRule && activeBogoRule.isRewardInStock && (
        <div className="flex items-center justify-between bg-gradient-to-r from-[#f5f3ff] to-[#faf5ff] border border-[#7c3aed]/20 rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 border border-[#e8e8e8]">
              <img src={activeBogoRule.rewardProductImage} alt={activeBogoRule.rewardProductName} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-black text-[#7c3aed]">Buy this, Get {activeBogoRule.rewardProductName} Free</p>
              <button onClick={() => setShowBogoModal(true)} className="text-xs text-[#6d28d9] font-bold hover:underline mt-0.5">View Details</button>
            </div>
          </div>
        </div>
      )}

      {activeRule && (
        <div className="flex items-center justify-between bg-gradient-to-r from-[#e8f5e9] to-[#f0fdf4] border border-[#0c831f]/20 rounded-xl p-3 mb-4 shadow-sm">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 bg-[#0c831f] text-white p-1 rounded-full flex-shrink-0">
              <Tag className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#0c831f]">{activeRule.description}</p>
              <p className="text-xs text-[#666] mt-0.5">Use code: <span className="font-bold text-[#1a1a1a]">{activeRule.code}</span></p>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="p-1.5 hover:bg-[#0c831f]/10 rounded-full transition-colors flex-shrink-0"
            aria-label="View terms and conditions"
          >
            <Info className="w-4 h-4 text-[#0c831f]" />
          </button>
        </div>
      )}

      <AnimatePresence>
        {showModal && activeRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-[#0c831f] p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  <h3 className="font-bold">Offer Details</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="text-lg font-black text-[#1a1a1a]">{activeRule.code}</h4>
                  <p className="text-sm text-[#666]">{activeRule.description}</p>
                </div>
                
                <div className="space-y-2 bg-[#f9f9f9] p-3 rounded-xl border border-[#e8e8e8]">
                  <div className="flex items-start gap-2 text-sm text-[#444]">
                    <CheckCircle className="w-4 h-4 text-[#0c831f] shrink-0 mt-0.5" />
                    <span>Maximum cashback allowed is <strong>₹{activeRule.maxCap}</strong> per transaction.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#444]">
                    {activeRule.applicablePaymentMethods.includes("upi") ? (
                      <Smartphone className="w-4 h-4 text-[#7c3aed] shrink-0 mt-0.5" />
                    ) : (
                      <CreditCard className="w-4 h-4 text-[#ff4f8b] shrink-0 mt-0.5" />
                    )}
                    <span>Applicable only on <strong>{activeRule.applicablePaymentMethods.join(", ").toUpperCase()}</strong> payments.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#444]">
                    <CheckCircle className="w-4 h-4 text-[#0c831f] shrink-0 mt-0.5" />
                    <span>Valid until {new Date(activeRule.validUntil).toLocaleDateString("en-IN")}.</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full py-2.5 bg-[#f5f5f5] hover:bg-[#e8e8e8] text-[#1a1a1a] font-bold rounded-xl transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {showBogoModal && activeBogoRule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="bg-[#7c3aed] p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  <h3 className="font-bold">BOGO Offer Details</h3>
                </div>
                <button onClick={() => setShowBogoModal(false)} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-4 h-4" />
             </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h4 className="text-lg font-black text-[#1a1a1a]">Buy One Get One Free</h4>
                  <p className="text-sm text-[#666]">Buy this item and get {activeBogoRule.rewardProductName} absolutely free!</p>
                </div>
                
                <div className="space-y-2 bg-[#f9f9f9] p-3 rounded-xl border border-[#e8e8e8]">
                  <div className="flex items-start gap-2 text-sm text-[#444]">
                    <CheckCircle className="w-4 h-4 text-[#0c831f] shrink-0 mt-0.5" />
                    <span>Free item will be automatically added to your cart.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#444]">
                    <CheckCircle className="w-4 h-4 text-[#0c831f] shrink-0 mt-0.5" />
                    <span>Offer valid till stock lasts.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-[#444]">
                    <CheckCircle className="w-4 h-4 text-[#0c831f] shrink-0 mt-0.5" />
                    <span>Valid until {new Date(activeBogoRule.validUntil).toLocaleDateString("en-IN")}.</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => setShowBogoModal(false)}
                  className="w-full py-2.5 bg-[#f5f5f5] hover:bg-[#e8e8e8] text-[#1a1a1a] font-bold rounded-xl transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
