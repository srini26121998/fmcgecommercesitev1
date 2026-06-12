'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PartnerGiftCard } from '@/stores/gift-card-store';

interface BrandThemedCardProps {
  partner: PartnerGiftCard;
}

export function BrandThemedCard({ partner }: BrandThemedCardProps) {
  const { themeConfig, title, description, denominations } = partner;

  return (
    <Link href={`/gift-cards/partner/${partner.partnerId}`}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative overflow-hidden rounded-2xl shadow-sm border border-gray-100/50 flex flex-col h-full cursor-pointer"
        style={{ backgroundColor: themeConfig.primaryColor }}
      >
        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 mb-4 rounded-full bg-white flex items-center justify-center p-2 shadow-sm overflow-hidden">
             {/* Use basic img for now, SafeImage might need specific sizing */}
            <img 
              src={themeConfig.logoUrl} 
              alt={`${partner.partnerName} Logo`} 
              className="w-full h-full object-contain"
              onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://placehold.co/100x100/EEEEEE/31343C?text=Brand';
              }}
            />
          </div>
          <h3 
             className="text-lg font-bold mb-2 line-clamp-1"
             style={{ color: themeConfig.secondaryColor, fontFamily: themeConfig.fontFamily || 'inherit' }}
          >
            {title}
          </h3>
          <p 
             className="text-sm opacity-90 line-clamp-2"
             style={{ color: themeConfig.secondaryColor }}
          >
            {description}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 mt-auto">
           <div className="flex flex-wrap gap-2 justify-center">
              {denominations.map(den => (
                 <span key={den} className="text-xs font-semibold px-2 py-1 rounded bg-white/20" style={{ color: themeConfig.secondaryColor }}>
                   ₹{den}
                 </span>
              ))}
           </div>
        </div>
      </motion.div>
    </Link>
  );
}
