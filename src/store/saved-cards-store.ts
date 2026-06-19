import { create } from "zustand";
import { paymentsService, SavedPaymentResponse } from "@/services/payments.service";

export type CardType = "Visa" | "Mastercard" | "RuPay" | "UPI" | string;
export type CardCategory = "credit" | "debit" | "upi" | string;

export interface SavedCard {
  id: number;
  type: CardType;
  category: CardCategory;
  last4: string;
  maskedNumber: string;
  expiry: string;
  holderName: string;
  provider: string;
  isDefault: boolean;
  createdAt: string;
}

interface SavedCardsStore {
  cards: SavedCard[];
  isLoading: boolean;
  error: string | null;

  fetchCards: () => Promise<void>;
  addCard: (card: { token: string, provider: string, type: string, last4: string, expiryMonth?: number, expiryYear?: number, isDefault?: boolean }) => Promise<void>;
  deleteCard: (id: number) => Promise<void>;
  updateCard: (id: number, card: any) => Promise<void>;
  setDefaultCard: (id: number) => Promise<void>;
  maskCardNumber: (cardNumber: string) => string;
  getDefaultCard: () => SavedCard | undefined;
}

export const useSavedCardsStore = create<SavedCardsStore>((set, get) => ({
  cards: [],
  isLoading: false,
  error: null,

  fetchCards: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await paymentsService.getPayments();
      // Map API response to UI shape
      const mappedCards = data.map(p => ({
        id: p.id,
        type: p.type,
        category: p.type.toLowerCase(),
        last4: p.last4,
        maskedNumber: p.type === "UPI" ? p.last4 : `**** ${p.last4}`,
        expiry: p.expiryMonth ? `${p.expiryMonth.toString().padStart(2, '0')}/${p.expiryYear?.toString().slice(-2)}` : '',
        holderName: "Card Holder", // Not stored in backend for PCI reasons
        provider: p.provider,
        isDefault: p.isDefault,
        createdAt: p.createdAt
      }));
      set({ cards: mappedCards, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch saved cards", isLoading: false });
    }
  },

  addCard: async (card) => {
    set({ isLoading: true, error: null });
    try {
      await paymentsService.savePayment(card);
      await get().fetchCards(); // Refresh list to get new IDs
    } catch (error: any) {
      set({ error: error.message || "Failed to save card", isLoading: false });
    }
  },

  deleteCard: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await paymentsService.deletePayment(id);
      set((state) => ({
        cards: state.cards.filter((c) => c.id !== id),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || "Failed to delete card", isLoading: false });
    }
  },

  updateCard: async (id, cardPayload) => {
    set({ isLoading: true, error: null });
    try {
      // Mock update or you can implement paymentsService.updatePayment
      // For now, let's just fetch cards to refresh or update local state
      await get().fetchCards();
    } catch (error: any) {
      set({ error: error.message || "Failed to update card", isLoading: false });
    }
  },

  setDefaultCard: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Mock setting default
      await get().fetchCards();
    } catch (error: any) {
      set({ error: error.message || "Failed to set default card", isLoading: false });
    }
  },

  maskCardNumber: (cardNumber: string) => {
    return cardNumber.replace(/\d(?=\d{4})/g, "*");
  },

  getDefaultCard: () => get().cards.find((c) => c.isDefault)
}));
