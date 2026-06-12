"use client";

import { usePromotionsStore } from "@/store/promotions-store";
import Link from "next/link";
import { useEffect } from "react";
import { Sparkles, ChevronRight } from "lucide-react";

export function OffersForYouWidget({ placement }: { placement: string }) {
  const personalizedOffers = usePromotionsStore((state) => state.personalizedOffers);

  useEffect(() => {
    personalizedOffers.forEach(offer => {
      console.log(`[Analytics] Impression: Personalized Offer ${offer.id} at ${placement}`);
    });
  }, [personalizedOffers, placement]);

  const handleOfferClick = (offerId: string) => {
    console.log(`[Analytics] Click: Personalized Offer ${offerId} at ${placement}`);
  };

  if (!personalizedOffers || personalizedOffers.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-[#1a1a1a] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#ff4f8b]" />
          Offers For You
        </h2>
        <Link href="/offers" className="text-xs font-semibold text-[#ff4f8b] flex items-center">
          See All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {personalizedOffers.map(offer => (
          <Link
            key={offer.id}
            href={offer.deepLink}
            onClick={() => handleOfferClick(offer.id)}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#f8f9fa] transition border border-transparent hover:border-[#e8e8e8]"
          >
            <div 
              className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: `url('${offer.image}')` }}
            />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-[#1a1a1a]">{offer.title}</h3>
              <p className="text-xs text-[#666] mt-0.5">{offer.subtitle}</p>
              <div className="mt-1 text-[10px] font-semibold text-[#0c831f]">
                Valid till {new Date(offer.validUntil).toLocaleDateString()}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#ccc]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
