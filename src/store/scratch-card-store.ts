import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ScratchCard {
  id: string;
  orderId: string;
  isScratched: boolean;
  rewardType?: string;
  rewardValue?: string;
  createdAt: string;
}

interface ScratchCardStore {
  cards: ScratchCard[];
  createCard: (orderId: string) => void;
  markScratched: (id: string, rewardType: string, rewardValue: string) => void;
  getUnscratchedCards: () => ScratchCard[];
  getCardByOrderId: (orderId: string) => ScratchCard | undefined;
}

export const useScratchCardStore = create<ScratchCardStore>()(
  persist(
    (set, get) => ({
      cards: [],
      
      createCard: (orderId: string) =>
        set((state) => {
          // Prevent duplicates for the same order
          if (state.cards.some((c) => c.orderId === orderId)) return state;
          
          return {
            cards: [
              {
                id: `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                orderId,
                isScratched: false,
                createdAt: new Date().toISOString(),
              },
              ...state.cards,
            ],
          };
        }),

      markScratched: (id: string, rewardType: string, rewardValue: string) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id
              ? { ...card, isScratched: true, rewardType, rewardValue }
              : card
          ),
        })),

      getUnscratchedCards: () => {
        return get().cards.filter((c) => !c.isScratched);
      },
      
      getCardByOrderId: (orderId: string) => {
        return get().cards.find((c) => c.orderId === orderId);
      }
    }),
    { name: "scratch-card-storage" }
  )
);
