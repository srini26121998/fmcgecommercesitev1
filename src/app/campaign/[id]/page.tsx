"use client";

import { useParams, useRouter } from "next/navigation";
import { usePromotionsStore } from "@/store/promotions-store";
import { useProducts } from "@/hooks/use-products";
import { useGiftCardStore } from "@/stores/gift-card-store";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Sparkles, Tag, CheckCircle2, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ui/products/product-card";
import { BrandThemedCard } from "@/components/ui/gift-cards/brand-themed-card";

function CouponCard({ rule, themeColor }: { rule: any; themeColor: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rule.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="relative overflow-hidden border-2 border-dashed rounded-2xl p-5 flex justify-between items-center bg-white shadow-sm hover:shadow-md transition-all duration-300"
      style={{ borderColor: themeColor }}
    >
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: themeColor }}
      />
      <div className="relative z-10 flex-1 pr-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="font-black text-2xl tracking-tight"
            style={{ color: themeColor }}
          >
            {rule.code}
          </span>
          <span className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">
            Coupon
          </span>
        </div>
        <div className="text-sm text-gray-500 font-medium leading-snug">
          {rule.description}
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="relative z-10 overflow-hidden flex items-center justify-center min-w-[95px] h-[42px] rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm active:scale-95"
        style={{
          backgroundColor: copied ? "#10b981" : themeColor,
          color: "white",
        }}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="copied"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              COPIED
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              COPY
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

export default function CampaignLandingPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const campaign = usePromotionsStore((state) =>
    state.campaigns.find((c) => c.id === campaignId)
  );
  
  const bogoRules = usePromotionsStore((state) => state.bogoRules);
  const cashbackRules = usePromotionsStore((state) => state.cashbackRules);
  const partnerCards = useGiftCardStore((state) => state.partnerGiftCards);
  const { products } = useProducts();

  // Track impressions
  useEffect(() => {
    if (campaign) {
      console.log(`[Analytics] Impression logged for campaign landing page: ${campaign.id}`);
    }
  }, [campaign]);

  // Extract linked rules
  const linkedBogo = useMemo(() => {
    if (!campaign) return [];
    return bogoRules.filter(r => campaign.linkedRuleIds.includes(r.id));
  }, [campaign, bogoRules]);

  const linkedCashback = useMemo(() => {
    if (!campaign) return [];
    return cashbackRules.filter(r => campaign.linkedRuleIds.includes(r.id));
  }, [campaign, cashbackRules]);

  // Get products related to BOGO trigger products
  const featuredProducts = useMemo(() => {
    if (!linkedBogo.length) return products.slice(0, 10); // Fallback
    const triggerIds = linkedBogo.map(r => r.triggerProductId);
    return products.filter(p => triggerIds.includes(p.id.toString()));
  }, [linkedBogo, products]);

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-xl font-bold">Campaign not found</h1>
        <button onClick={() => router.push("/")} className="text-[#ff4f8b] font-semibold">Go Home</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pb-24 md:pb-12" itemScope itemType="https://schema.org/WebPage">
      {/* ── Custom Themed Header ── */}
      <div 
        className="text-white px-4 pt-6 pb-12 rounded-b-3xl shadow-sm relative overflow-hidden"
        style={{ background: campaign.themeGradient }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('${campaign.image}')`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(10px)' }}></div>
        <div className="max-w-[1400px] mx-auto relative z-10">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors mb-6">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <h1 className="text-3xl md:text-5xl font-black mb-2 drop-shadow-md">{campaign.title}</h1>
          <p className="text-white/90 text-sm md:text-lg font-medium drop-shadow-sm">{campaign.subtitle}</p>
          
          <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-4 h-4" />
            Special Campaign
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 -mt-6 relative z-20 space-y-8">
        
        {/* ── Highlighted Cashback & Coupons ── */}
        {linkedCashback.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-[#e8e8e8]">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" style={{ color: campaign.themeColor }} />
              Applicable Coupons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {linkedCashback.map((rule) => (
                <CouponCard key={rule.id} rule={rule} themeColor={campaign.themeColor} />
              ))}
            </div>
          </div>
        )}

        {/* ── Featured BOGO Products ── */}
        <div>
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" style={{ color: campaign.themeColor }} />
            Featured Deals (BOGO)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </div>

        {/* ── Partner Gift Cards Promos ── */}
        {partnerCards && partnerCards.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Partner Brand Offers</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
               {partnerCards.slice(0, 4).map(partner => (
                 <div key={partner.id} className="w-64 flex-shrink-0 snap-start">
                   <BrandThemedCard partner={partner} />
                 </div>
               ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
