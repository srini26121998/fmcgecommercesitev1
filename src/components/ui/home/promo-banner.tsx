"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePromotionsStore } from "@/store/promotions-store";

function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return "00:00:00";
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <span className="mb-3 inline-block rounded-full bg-black/40 backdrop-blur-sm px-3 py-1 text-[11px] font-black text-white uppercase tracking-wider shadow-sm flex items-center gap-1 w-max">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      Ends in {timeLeft}
    </span>
  );
}

export default function PromoBanner() {
  const campaigns = usePromotionsStore((state) => state.campaigns);
  
  // Track impressions on mount
  useEffect(() => {
    campaigns.forEach(campaign => {
      console.log(`[Analytics] Impression logged for campaign: ${campaign.id}, placement: home_carousel`);
    });
  }, [campaigns]);

  const handleBannerClick = (campaignId: string) => {
    console.log(`[Analytics] Click logged for campaign: ${campaignId}, placement: home_carousel`);
  };

  if (!campaigns || campaigns.length === 0) return null;

  return (
    <section
      className="mx-auto max-w-[1400px] px-4 py-6 md:px-6 md:py-8"
      aria-label="Promotional banners"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 sm:gap-6">
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={campaign.deepLink}
            onClick={() => handleBannerClick(campaign.id)}
            aria-label={`${campaign.title} — ${campaign.subtitle} at FMCG Commerce`}
            className="relative flex items-center justify-between rounded-2xl p-6 sm:p-8 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
            style={{
              backgroundImage: `${campaign.themeGradient}, url('${campaign.image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="relative z-10 transition-transform duration-300 group-hover:scale-[1.02]" itemScope itemType="https://schema.org/Offer">
              <meta itemProp="name" content={campaign.title} />
              <meta itemProp="description" content={campaign.subtitle} />
              <meta itemProp="url" content={`https://fmcgcommerce.com${campaign.deepLink}`} />
              
              <CountdownTimer targetDate={campaign.validUntil} />
              
              <h2 className="text-xl font-black leading-tight text-white sm:text-2xl md:text-3xl drop-shadow-md" itemProp="name">
                {campaign.title}
              </h2>
              <p className="mt-2 text-sm text-white/90 sm:text-base font-medium drop-shadow-sm" itemProp="description">
                {campaign.subtitle}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
