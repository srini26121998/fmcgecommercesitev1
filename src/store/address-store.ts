"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Address {
  id: string;
  type: "Home" | "Work" | "Other";
  name: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressStore {
  addresses: Address[];
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => Address | undefined;
  setAddresses: (addresses: Address[]) => void;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [
        {
          id: "addr_1",
          type: "Home",
          name: "John Doe",
          address: "123 Main Street, Apartment 4B, Andheri West",
          city: "Mumbai",
          pincode: "400058",
          phone: "+91 98765 43210",
          isDefault: true,
        },
        {
          id: "addr_2",
          type: "Work",
          name: "John Doe",
          address: "Office 501, Tech Park Building, Bandra Kurla Complex",
          city: "Mumbai",
          pincode: "400051",
          phone: "+91 98765 43210",
          isDefault: false,
        },
      ],

      addAddress: (address) =>
        set((state) => ({
          addresses: [
            ...state.addresses.map((a) =>
              address.isDefault ? { ...a, isDefault: false } : a
            ),
            { ...address, id: `addr_${Date.now()}` },
          ],
        })),

      updateAddress: (id, updated) =>
        set((state) => ({
          addresses: state.addresses.map((a) =>
            a.id === id
              ? { ...a, ...updated, ...(updated.isDefault ? { isDefault: true } : {}) }
              : updated.isDefault && a.id !== id
                ? { ...a, isDefault: false }
                : a
          ),
        })),

      deleteAddress: (id) =>
        set((state) => {
          const filtered = state.addresses.filter((a) => a.id !== id);
          // If deleted address was default, make the first remaining address default
          const deleted = state.addresses.find((a) => a.id === id);
          if (deleted?.isDefault && filtered.length > 0) {
            filtered[0].isDefault = true;
          }
          return { addresses: filtered };
        }),

      setDefaultAddress: (id) =>
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          })),
        })),

      getDefaultAddress: () => get().addresses.find((a) => a.isDefault),

      setAddresses: (addresses) => set({ addresses }),
    }),
    { name: "address-storage" }
  )
);
