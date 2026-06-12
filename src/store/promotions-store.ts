import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CashbackRule {
  id: string;
  code: string;
  description: string;
  percentage: number;
  maxCap: number;
  applicableCategories: string[];
  applicablePaymentMethods: string[];
  validUntil: string;
}

export interface CampaignBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  deepLink: string;
  validUntil: string;
  linkedRuleIds: string[]; // IDs for BOGO, cashback, etc.
  themeColor: string;
  themeGradient: string;
}

export interface BogoRule {
  id: string;
  code: string;
  description: string;
  triggerProductId: string;
  rewardProductId: string;
  rewardProductName: string;
  rewardProductImage: string;
  rewardProductMrp: number;
  validUntil: string;
  isRewardInStock: boolean;
}

interface PromotionsState {
  cashbackRules: CashbackRule[];
  bogoRules: BogoRule[];
  activeProductBadges: Record<string, string[]>; // productId -> ruleIds
  activeBogoBadges: Record<string, string[]>; // productId -> bogoRuleIds
  estimatedCashback: number;
  appliedCashbackRuleId: string | null;
  campaigns: CampaignBanner[];
  personalizedOffers: CampaignBanner[];

  // Actions
  fetchApplicableBadges: (productIds: string[]) => void;
  fetchBogoBadges: (productIds: string[]) => void;
  validatePromotions: (cartTotal: number, items: any[], paymentMode: string | null) => void;
  setEstimatedCashback: (amount: number, ruleId: string | null) => void;
  fetchHomeFeed: (userSegment?: string) => void;
}

// Mock Rules
const MOCK_RULES: CashbackRule[] = [
  {
    id: "cb_10_upi",
    code: "UPI10",
    description: "Get 10% Cashback (up to ₹100) on this order",
    percentage: 10,
    maxCap: 100,
    applicableCategories: ["all"],
    applicablePaymentMethods: ["upi"],
    validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
  },
  {
    id: "cb_5_card",
    code: "CARD5",
    description: "Get 5% Cashback (up to ₹50) on Card payments",
    percentage: 5,
    maxCap: 50,
    applicableCategories: ["electronics", "groceries"],
    applicablePaymentMethods: ["card"],
    validUntil: new Date(Date.now() + 86400000 * 15).toISOString(),
  }
];

// Mock BOGO Rules
const MOCK_BOGO_RULES: BogoRule[] = [
  {
    id: "bogo_1",
    code: "BOGO",
    description: "Buy One Get One Free",
    triggerProductId: "1", // Example product ID
    rewardProductId: "2",
    rewardProductName: "Farm Fresh Tomatoes (500g)",
    rewardProductImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=400&q=80",
    rewardProductMrp: 45,
    validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
    isRewardInStock: true,
  }
];

const MOCK_CAMPAIGNS: CampaignBanner[] = [
  {
    id: "camp_flash_sale",
    title: "Up to 50% OFF",
    subtitle: "On daily essentials",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80",
    deepLink: "/campaign/camp_flash_sale",
    validUntil: new Date(Date.now() + 3600000 * 5).toISOString(), // 5 hours from now
    linkedRuleIds: ["bogo_1", "cb_10_upi"],
    themeColor: "#e63872",
    themeGradient: "linear-gradient(to right, rgba(255, 79, 139, 0.95), rgba(230, 56, 114, 0.9))",
  },
  {
    id: "camp_free_delivery",
    title: "Orders above ₹199",
    subtitle: "No minimum on first order",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80",
    deepLink: "/campaign/camp_free_delivery",
    validUntil: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    linkedRuleIds: ["cb_5_card"],
    themeColor: "#10b981",
    themeGradient: "linear-gradient(to right, rgba(12, 131, 31, 0.95), rgba(16, 185, 129, 0.9))",
  }
];

export const usePromotionsStore = create<PromotionsState>()(
  persist(
    (set, get) => ({
      cashbackRules: MOCK_RULES,
      bogoRules: MOCK_BOGO_RULES,
      activeProductBadges: {},
      activeBogoBadges: {},
      estimatedCashback: 0,
      appliedCashbackRuleId: null,
      campaigns: [],
      personalizedOffers: [],

      fetchApplicableBadges: async (productIds) => {
        // Mock API GET /promotions/applicable-badges?productIds=[]
        const { cashbackRules } = get();
        const badges: Record<string, string[]> = {};
        
        productIds.forEach(id => {
          // For demo, apply cb_10_upi to all products
          badges[id] = ["cb_10_upi"];
        });

        set({ activeProductBadges: { ...get().activeProductBadges, ...badges } });
      },

      fetchBogoBadges: async (productIds) => {
        const { bogoRules } = get();
        const badges: Record<string, string[]> = {};
        
        productIds.forEach(id => {
          const matchingRules = bogoRules.filter(rule => rule.triggerProductId === String(id));
          if (matchingRules.length > 0) {
            badges[id] = matchingRules.map(r => r.id);
          }
        });

        set({ activeBogoBadges: { ...get().activeBogoBadges, ...badges } });
      },

      validatePromotions: async (cartTotal, items, paymentMode) => {
        // Mock API POST /checkout/validate-promotions
        const { cashbackRules } = get();
        
        let bestCashback = 0;
        let bestRuleId = null;

        for (const rule of cashbackRules) {
          // Check payment mode if provided during checkout
          if (paymentMode && !rule.applicablePaymentMethods.includes(paymentMode)) {
            continue;
          }

          // In cart, paymentMode is usually null, we calculate max possible cashback
          // as "Estimated Cashback"
          const calculated = (cartTotal * rule.percentage) / 100;
          const capped = Math.min(calculated, rule.maxCap);

          if (capped > bestCashback) {
            bestCashback = capped;
            bestRuleId = rule.id;
          }
        }

        const currentState = get();
        if (currentState.estimatedCashback !== bestCashback || currentState.appliedCashbackRuleId !== bestRuleId) {
          set({ estimatedCashback: bestCashback, appliedCashbackRuleId: bestRuleId });
        }
      },

      setEstimatedCashback: (amount, ruleId) => {
        set({ estimatedCashback: amount, appliedCashbackRuleId: ruleId });
      },

      fetchHomeFeed: async (userSegment = "general") => {
        // Mock GET /promotions/home-feed
        // Simulated network delay
        await new Promise(res => setTimeout(res, 500));
        
        // Return ordered personalized list
        set({ campaigns: MOCK_CAMPAIGNS });

        // Simulate personalized 'Offers For You'
        if (userSegment === "premium") {
          set({ personalizedOffers: MOCK_CAMPAIGNS });
        } else {
          set({ personalizedOffers: [MOCK_CAMPAIGNS[0]] }); // Just one for normal users
        }
      }
    }),
    {
      name: "fmcg-promotions-store",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return persistedState as PromotionsState;
      },
    }
  )
);
