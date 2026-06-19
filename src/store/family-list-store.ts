"use client";

import { create } from "zustand";
import { listsService, ShoppingListResponse, ShoppingListItem as ApiListItem } from "@/services/lists.service";

interface FamilyListItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  addedBy: string;
  purchased: boolean;
}

interface FamilyList {
  id: string;
  name: string;
  description: string;
  members: string[];
  items: FamilyListItem[];
  createdAt: string;
}

interface FamilyListStore {
  lists: FamilyList[];
  isLoading: boolean;
  error: string | null;

  fetchLists: () => Promise<void>;
  createList: (name: string, description: string, members: string[]) => Promise<void>;
  addItemToList: (listId: string, item: Omit<FamilyListItem, "id" | "addedBy" | "purchased">) => Promise<void>;
  removeItemFromList: (listId: string, itemId: string) => Promise<void>;
  togglePurchased: (listId: string, itemId: string) => void;
  deleteList: (listId: string) => Promise<void>;
}

export const useFamilyListStore = create<FamilyListStore>((set, get) => ({
  lists: [],
  isLoading: false,
  error: null,

  fetchLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await listsService.getLists();
      
      const mappedLists: FamilyList[] = data.map((apiList: ShoppingListResponse) => ({
        id: String(apiList.id),
        name: apiList.name,
        description: "", // BE doesn't store this yet
        members: ["You"], // BE doesn't store sharing yet
        items: apiList.items.map((apiItem: ApiListItem) => ({
          id: String(apiItem.id),
          productId: String(apiItem.productId),
          name: apiItem.productTitle || `Product ${apiItem.productId}`,
          price: apiItem.price || 0,
          image: "/placeholder.svg?text=Item",
          quantity: apiItem.qty,
          addedBy: "You",
          purchased: false
        })),
        createdAt: apiList.createdAt
      }));

      set({ lists: mappedLists, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || "Failed to fetch lists", isLoading: false });
    }
  },

  createList: async (name, description, members) => {
    set({ isLoading: true, error: null });
    try {
      await listsService.createList(name);
      await get().fetchLists();
    } catch (error: any) {
      set({ error: error.message || "Failed to create list", isLoading: false });
    }
  },

  addItemToList: async (listId, item) => {
    set({ isLoading: true, error: null });
    try {
      await listsService.addItemToList(Number(listId), Number(item.productId), item.quantity);
      await get().fetchLists();
    } catch (error: any) {
      set({ error: error.message || "Failed to add item", isLoading: false });
    }
  },

  removeItemFromList: async (listId, itemId) => {
    set({ isLoading: true, error: null });
    try {
      await listsService.removeItemFromList(Number(listId), Number(itemId));
      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === listId
            ? { ...list, items: list.items.filter((i) => i.id !== itemId) }
            : list
        ),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || "Failed to remove item", isLoading: false });
    }
  },

  togglePurchased: (listId, itemId) => {
    // UI only for now, can be extended later
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map((i) =>
                i.id === itemId ? { ...i, purchased: !i.purchased } : i
              ),
            }
          : list
      ),
    }));
  },

  deleteList: async (listId) => {
    set({ isLoading: true, error: null });
    try {
      await listsService.deleteList(Number(listId));
      set((state) => ({
        lists: state.lists.filter((l) => l.id !== listId),
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message || "Failed to delete list", isLoading: false });
    }
  },
}));
