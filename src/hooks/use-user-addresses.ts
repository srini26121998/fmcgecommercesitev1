"use client";

import { useState, useCallback, useEffect } from "react";
import { usersService, AddressPayload } from "@/services/users.service";
import { useAuthStore } from "@/store/auth-store";
import { useAddressStore } from "@/store/address-store";

export function useUserAddresses(autoFetch = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoggedIn } = useAuthStore();
  const addresses = useAddressStore((state) => state.addresses);
  const setAddresses = useAddressStore((state) => state.setAddresses);

  const fetchAddresses = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersService.getAddresses();
      if (response.success && response.data) {
        setAddresses(response.data);
      } else {
        setError(response.message || "Failed to fetch addresses");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch addresses");
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, setAddresses]);

  const addAddress = useCallback(async (payload: AddressPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersService.addAddress(payload);
      if (response.success && response.data) {
        setAddresses([...addresses, response.data]);
        return { success: true, data: response.data };
      }
      setError(response.message || "Failed to add address");
      return { success: false, message: response.message };
    } catch (err: any) {
      setError(err.message || "Failed to add address");
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [addresses, setAddresses]);

  const updateAddress = useCallback(async (id: string, payload: Partial<AddressPayload>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersService.updateAddress(id, payload);
      if (response.success && response.data) {
        const updated = addresses.map((a) => (a.id === id ? { ...a, ...response.data! } : a));
        setAddresses(updated);
        return { success: true, data: response.data };
      }
      setError(response.message || "Failed to update address");
      return { success: false, message: response.message };
    } catch (err: any) {
      setError(err.message || "Failed to update address");
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [addresses, setAddresses]);

  const setDefaultAddress = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersService.setDefaultAddress(id);
      if (response.success) {
        // Update local state to reflect the new default
        const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
        setAddresses(updated);
        return { success: true };
      }
      setError(response.message || "Failed to set default address");
      return { success: false, message: response.message };
    } catch (err: any) {
      setError(err.message || "Failed to set default address");
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [addresses, setAddresses]);

  const deleteAddress = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersService.deleteAddress(id);
      if (response.success) {
        setAddresses(addresses.filter((a) => a.id !== id));
        return { success: true };
      }
      setError(response.message || "Failed to delete address");
      return { success: false, message: response.message };
    } catch (err: any) {
      setError(err.message || "Failed to delete address");
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [addresses, setAddresses]);

  useEffect(() => {
    if (autoFetch && isLoggedIn) {
      fetchAddresses();
    }
  }, [autoFetch, isLoggedIn, fetchAddresses]);

  return {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
}
