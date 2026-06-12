import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GiftCardTheme = 'Birthday' | 'Anniversary' | 'Festive' | 'Generic';

export interface PartnerThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  fontFamily?: string;
}

export interface PartnerGiftCard {
  id: string;
  partnerId: string;
  partnerName: string;
  title: string;
  description: string;
  denominations: number[];
  themeConfig: PartnerThemeConfig;
  status: 'active' | 'inactive';
}

export interface GiftCardPurchaseForm {
  recipientName: string;
  recipientEmailOrPhone: string;
  deliveryDate: string; // ISO string, empty means immediate
  personalMessage: string;
  theme: GiftCardTheme;
  cardDesignUrl: string;
  denomination: number;
}

export interface OwnedGiftCard {
  id: string;
  code: string;
  type: 'platform' | 'partner';
  balance: number;
  initialBalance: number;
  expiryDate: string;
  status: 'Active' | 'Expired' | 'Fully Redeemed';
  // Platform specific
  theme?: GiftCardTheme;
  cardDesignUrl?: string;
  recipientName?: string;
  // Partner specific
  partnerId?: string;
  partnerName?: string;
  partnerLogoUrl?: string;
  lastSynced?: string;
}

interface GiftCardState {
  // Store Data
  availableThemes: { [key in GiftCardTheme]: string[] }; // Theme -> array of image URLs
  platformDenominations: number[];
  partnerGiftCards: PartnerGiftCard[];
  
  // User Data
  ownedGiftCards: OwnedGiftCard[];
  
  // Actions
  purchasePlatformGiftCard: (form: GiftCardPurchaseForm) => Promise<string>;
  purchasePartnerGiftCard: (partnerId: string, denomination: number) => Promise<string>;
  redeemGiftCard: (code: string) => Promise<{ success: boolean; message: string; balanceApplied?: number }>;
  deductGiftCardBalance: (code: string, amount: number) => Promise<void>;
  syncPartnerGiftCardStatus: (cardId: string) => Promise<void>;
  
  // Helpers
  getPartnerById: (partnerId: string) => PartnerGiftCard | undefined;
}

const mockThemes = {
  Birthday: [
    'https://images.unsplash.com/photo-1530103862676-de8892bf309c?w=400&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80'
  ],
  Anniversary: [
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&q=80',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&q=80'
  ],
  Festive: [
    'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=400&q=80',
    'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&q=80'
  ],
  Generic: [
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80',
    'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80'
  ],
};

const mockPartners: PartnerGiftCard[] = [
  {
    id: 'pc_1',
    partnerId: 'zomato',
    partnerName: 'Zomato',
    title: 'Zomato Gift Voucher',
    description: 'Craving something? Get it delivered with Zomato.',
    denominations: [250, 500, 1000],
    themeConfig: {
      primaryColor: '#E23744',
      secondaryColor: '#FFFFFF',
      logoUrl: 'https://placehold.co/400x400/E23744/FFFFFF?text=Zomato'
    },
    status: 'active'
  },
  {
    id: 'pc_2',
    partnerId: 'swiggy',
    partnerName: 'Swiggy',
    title: 'Swiggy Money Voucher',
    description: 'Food delivery, dining and more.',
    denominations: [100, 500, 1000, 2000],
    themeConfig: {
      primaryColor: '#FC8019',
      secondaryColor: '#FFFFFF',
      logoUrl: 'https://placehold.co/400x400/FC8019/FFFFFF?text=Swiggy'
    },
    status: 'active'
  }
];

export const useGiftCardStore = create<GiftCardState>()(
  persist(
    (set, get) => ({
      availableThemes: mockThemes,
      platformDenominations: [100, 500, 1000],
      partnerGiftCards: mockPartners,
      ownedGiftCards: [],

      purchasePlatformGiftCard: async (form) => {
        // Simulate API call and payment
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const newCard: OwnedGiftCard = {
          id: `gc_${Date.now()}`,
          code: `PLTF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          type: 'platform',
          balance: form.denomination,
          initialBalance: form.denomination,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
          status: 'Active',
          theme: form.theme,
          cardDesignUrl: form.cardDesignUrl,
          recipientName: form.recipientName,
        };

        set((state) => ({
          ownedGiftCards: [newCard, ...state.ownedGiftCards],
        }));

        return newCard.id;
      },

      purchasePartnerGiftCard: async (partnerId, denomination) => {
        // Simulate API call and payment
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        const partner = get().getPartnerById(partnerId);
        if (!partner) throw new Error('Partner not found');

        const newCard: OwnedGiftCard = {
          id: `pgc_${Date.now()}`,
          code: `${partnerId.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          type: 'partner',
          balance: denomination,
          initialBalance: denomination,
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months expiry
          status: 'Active',
          partnerId: partner.partnerId,
          partnerName: partner.partnerName,
          partnerLogoUrl: partner.themeConfig.logoUrl,
          lastSynced: new Date().toISOString(),
        };

        set((state) => ({
          ownedGiftCards: [newCard, ...state.ownedGiftCards],
        }));

        return newCard.id;
      },

      redeemGiftCard: async (code) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const { ownedGiftCards } = get();
        const cardIndex = ownedGiftCards.findIndex(c => c.code === code);
        
        if (cardIndex === -1) {
          return { success: false, message: 'Invalid gift card code' };
        }

        const card = ownedGiftCards[cardIndex];
        
        if (card.type === 'partner') {
           return { success: false, message: 'Partner gift cards cannot be redeemed on this platform.' };
        }

        if (card.status !== 'Active') {
          return { success: false, message: `Gift card is ${card.status}` };
        }

        if (card.balance <= 0) {
           return { success: false, message: 'Gift card has zero balance' };
        }

        // For simplicity in mock, returning success with full balance
        // The actual deduction happens when order is placed
        return { success: true, message: 'Gift card applied successfully', balanceApplied: card.balance };
      },

      deductGiftCardBalance: async (code, amount) => {
         set((state) => {
            const cards = [...state.ownedGiftCards];
            const idx = cards.findIndex(c => c.code === code);
            if (idx !== -1) {
               cards[idx].balance -= amount;
               if (cards[idx].balance <= 0) {
                  cards[idx].balance = 0;
                  cards[idx].status = 'Fully Redeemed';
               }
            }
            return { ownedGiftCards: cards };
         });
      },

      syncPartnerGiftCardStatus: async (cardId) => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        set((state) => {
           const newCards = [...state.ownedGiftCards];
           const idx = newCards.findIndex(c => c.id === cardId);
           if (idx !== -1 && newCards[idx].type === 'partner') {
             // Simulate a sync - maybe balance changed externally
             newCards[idx].lastSynced = new Date().toISOString();
           }
           return { ownedGiftCards: newCards };
        });
      },

      getPartnerById: (partnerId) => {
        return get().partnerGiftCards.find(p => p.partnerId === partnerId);
      }
    }),
    {
      name: 'gift-card-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        return { ownedGiftCards: persistedState.ownedGiftCards || [] } as any;
      },
      partialize: (state) => ({ ownedGiftCards: state.ownedGiftCards }),
    }
  )
);
