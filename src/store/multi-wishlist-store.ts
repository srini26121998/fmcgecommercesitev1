"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ListPrivacy = "private" | "shared" | "public";

export interface WishlistListItem {
  id: number;
  name: string;
  image: string;
  price: number;
  mrp?: number;
  addedAt: string;
}

export interface WishlistList {
  id: string;
  name: string;
  privacy: ListPrivacy;
  /** Shareable token for public/shared lists */
  shareToken: string;
  createdAt: string;
  items: WishlistListItem[];
}

interface MultiWishlistStore {
  lists: WishlistList[];
  /** Active list ID for quick-add context */
  activeListId: string;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  createList: (name: string, privacy?: ListPrivacy) => string;
  deleteList: (listId: string) => void;
  renameList: (listId: string, name: string) => void;
  setPrivacy: (listId: string, privacy: ListPrivacy) => void;
  addItem: (listId: string, item: Omit<WishlistListItem, "addedAt">) => void;
  removeItem: (listId: string, itemId: number) => void;
  moveItem: (fromListId: string, toListId: string, itemId: number) => void;
  isInAnyList: (itemId: number) => boolean;
  getListsContaining: (itemId: number) => WishlistList[];
  setActiveList: (listId: string) => void;
}

const DEFAULT_LIST_ID = "list_default";

export const useMultiWishlistStore = create<MultiWishlistStore>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      activeListId: DEFAULT_LIST_ID,
      lists: [
        {
          id: DEFAULT_LIST_ID,
          name: "My Wishlist",
          privacy: "private",
          shareToken: "tk_" + Math.random().toString(36).slice(2, 10),
          createdAt: new Date().toISOString(),
          items: [],
        },
        {
          id: "list_groceries",
          name: "Monthly Groceries",
          privacy: "private",
          shareToken: "tk_" + Math.random().toString(36).slice(2, 10),
          createdAt: new Date().toISOString(),
          items: [],
        },
      ],

      setHasHydrated: (v) => set({ _hasHydrated: v }),
      setActiveList: (listId) => set({ activeListId: listId }),

      createList: (name, privacy = "private") => {
        const id = `list_${Date.now()}`;
        const shareToken = "tk_" + Math.random().toString(36).slice(2, 10);
        set((state) => ({
          lists: [
            ...state.lists,
            {
              id,
              name,
              privacy,
              shareToken,
              createdAt: new Date().toISOString(),
              items: [],
            },
          ],
          activeListId: id,
        }));
        return id;
      },

      deleteList: (listId) =>
        set((state) => {
          const filtered = state.lists.filter((l) => l.id !== listId);
          return {
            lists: filtered,
            activeListId:
              state.activeListId === listId
                ? filtered[0]?.id ?? ""
                : state.activeListId,
          };
        }),

      renameList: (listId, name) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId ? { ...l, name } : l
          ),
        })),

      setPrivacy: (listId, privacy) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId ? { ...l, privacy } : l
          ),
        })),

      addItem: (listId, item) =>
        set((state) => ({
          lists: state.lists.map((l) => {
            if (l.id !== listId) return l;
            // Prevent duplicates
            if (l.items.some((i) => i.id === item.id)) return l;
            return {
              ...l,
              items: [
                ...l.items,
                { ...item, addedAt: new Date().toISOString() },
              ],
            };
          }),
        })),

      removeItem: (listId, itemId) =>
        set((state) => ({
          lists: state.lists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((i) => i.id !== itemId) }
              : l
          ),
        })),

      moveItem: (fromListId, toListId, itemId) => {
        const { lists, addItem, removeItem } = get();
        const fromList = lists.find((l) => l.id === fromListId);
        const item = fromList?.items.find((i) => i.id === itemId);
        if (!item) return;
        addItem(toListId, item);
        removeItem(fromListId, itemId);
      },

      isInAnyList: (itemId) =>
        get().lists.some((l) => l.items.some((i) => i.id === itemId)),

      getListsContaining: (itemId) =>
        get().lists.filter((l) => l.items.some((i) => i.id === itemId)),
    }),
    {
      name: "fmcg-multi-wishlist",
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) state.setHasHydrated(true);
      },
    }
  )
);
