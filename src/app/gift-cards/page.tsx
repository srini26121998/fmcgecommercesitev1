'use client';

import React from 'react';
import Navbar from '@/components/ui/navbar';
import { PlatformGiftCardForm } from '@/components/ui/gift-cards/platform-gift-card-form';
import { BrandThemedCard } from '@/components/ui/gift-cards/brand-themed-card';
import { useGiftCardStore } from '@/stores/gift-card-store';
import { motion } from 'framer-motion';
import { Sparkles, Gift } from 'lucide-react';

export default function GiftCardStorePage() {
  const partnerCards = useGiftCardStore(state => state.partnerGiftCards);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Navbar />
      
      <main className="pt-32 pb-20">
        {/* Animated Hero Section */}
        <section className="relative max-w-7xl mx-auto px-4 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto bg-gradient-to-br from-white to-[#fff0f6] p-10 md:p-16 rounded-[2.5rem] shadow-xl border border-pink-100/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-gradient-to-tr from-orange-300/20 to-pink-300/20 rounded-full blur-3xl"></div>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-gradient-to-r from-[#ff4f8b] to-[#ff7e5f] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30"
            >
              <Gift className="w-8 h-8 text-white" />
            </motion.div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-3 relative z-10">
              Give the Gift of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4f8b] to-[#ff7e5f]">Choice</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 font-medium relative z-10">
              Instantly deliver joy with our premium FMCG Gift Cards and Brand Vouchers for every occasion.
            </p>
          </motion.div>
        </section>

        <div className="max-w-7xl mx-auto px-4">
          {/* Brand Vouchers Section (Discovery) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-20"
          >
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-6 h-6 text-[#ff4f8b]" />
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Vouchers from your favourite brands</h2>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x px-2 -mx-2">
               {partnerCards.map((partner, i) => (
                 <motion.div 
                   key={partner.id} 
                   className="w-72 md:w-80 flex-shrink-0 snap-start"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.4 + (i * 0.1) }}
                 >
                   <BrandThemedCard partner={partner} />
                 </motion.div>
               ))}
            </div>
          </motion.div>

          {/* Platform Gift Card Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-3xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mb-2">Send a Gift Card</h2>
              <p className="text-gray-500 text-base">Personalize and send instantly via email or SMS.</p>
            </div>
            
            <PlatformGiftCardForm />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
