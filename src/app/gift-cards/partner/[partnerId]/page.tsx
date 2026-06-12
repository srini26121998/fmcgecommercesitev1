'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/ui/navbar';
import { Button } from '@/components/ui/button';
import { useGiftCardStore, PartnerGiftCard } from '@/stores/gift-card-store';
import { motion } from 'framer-motion';

export default function PartnerGiftCardPage() {
  const params = useParams();
  const router = useRouter();
  const partnerId = params.partnerId as string;
  
  const [partner, setPartner] = useState<PartnerGiftCard | null>(null);
  const [selectedDenomination, setSelectedDenomination] = useState<number | null>(null);
  const getPartnerById = useGiftCardStore(state => state.getPartnerById);

  useEffect(() => {
    if (partnerId) {
      const p = getPartnerById(partnerId);
      if (p) {
        setPartner(p);
        if (p.denominations.length > 0) {
          setSelectedDenomination(p.denominations[0]);
        }
      } else {
         router.push('/gift-cards');
      }
    }
  }, [partnerId, getPartnerById, router]);

  if (!partner) return null;

  const { themeConfig } = partner;

  const handleProceedToPay = () => {
    if (!selectedDenomination) return;
    
    // Pass partner card purchase intent to checkout
    sessionStorage.setItem('pendingPartnerGiftCard', JSON.stringify({
      partnerId: partner.partnerId,
      denomination: selectedDenomination
    }));
    
    router.push('/checkout?order_type=partner_giftcard_purchase');
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-500"
      style={{ 
        backgroundColor: themeConfig.primaryColor,
        color: themeConfig.secondaryColor,
        fontFamily: themeConfig.fontFamily || 'inherit'
      }}
    >
      {/* We could use a modified Navbar or just the standard one. 
          To keep standard navigation, we will render it.
          We might need to override some of its styles, but for now we let it be. */}
      <div className="bg-white text-black">
         <Navbar />
      </div>

      {/* Prominent Disclaimer Banner */}
      <div className="bg-black/90 text-white text-center py-3 px-4 text-sm font-medium sticky top-16 z-40">
        ⚠️ This voucher is redeemable ONLY on the {partner.partnerName} App/Website. 
        It cannot be used for payments on this platform.
      </div>

      <main className="max-w-2xl mx-auto px-4 py-12 mt-4 text-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20"
        >
          <div className="w-32 h-32 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-lg p-4 overflow-hidden">
             <img 
               src={themeConfig.logoUrl} 
               alt={partner.partnerName}
               className="w-full h-full object-contain"
               onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.png'; }}
             />
          </div>

          <h1 className="text-4xl font-black mb-4 tracking-tight">{partner.title}</h1>
          <p className="text-lg opacity-90 mb-8 max-w-md mx-auto">{partner.description}</p>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 opacity-90">Select Denomination</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {partner.denominations.map(den => (
                <button
                  key={den}
                  onClick={() => setSelectedDenomination(den)}
                  className={`py-4 rounded-xl text-lg font-bold transition-all border-2 ${
                    selectedDenomination === den
                      ? 'bg-white text-black border-white shadow-lg scale-105'
                      : 'bg-black/20 text-white border-white/30 hover:bg-black/30'
                  }`}
                >
                  ₹{den}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleProceedToPay}
            disabled={!selectedDenomination}
            className="w-full h-16 text-xl font-black rounded-xl bg-white text-black hover:bg-gray-100 shadow-xl transition-transform active:scale-95"
            style={{ color: themeConfig.primaryColor }} // Make text color match primary brand color
          >
            Buy for ₹{selectedDenomination}
          </Button>
        </motion.div>

      </main>
    </div>
  );
}
