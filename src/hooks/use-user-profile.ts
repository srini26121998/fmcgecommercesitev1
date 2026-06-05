"use client";

import { useState, useCallback, useEffect } from "react";
import { usersService, UpdateProfilePayload } from "@/services/users.service";
import { useAuthStore } from "@/store/auth-store";

export function useUserProfile(autoFetch = false) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const fetchProfile = useCallback(async () => {
    if (!isLoggedIn) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersService.getProfile();
      if (response.success && response.data) {
        // Merge the existing user state with the fetched data
        setUser({ ...useAuthStore.getState().user, ...response.data } as any);
      } else {
        setError(response.message || "Failed to fetch profile");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  }, [setUser, isLoggedIn]);

  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersService.updateProfile(payload);
      if (response.success && response.data) {
        setUser({ ...useAuthStore.getState().user, ...response.data } as any);
        return { success: true };
      }
      setError(response.message || "Failed to update profile");
      return { success: false, message: response.message };
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    if (autoFetch && isLoggedIn) {
      fetchProfile();
    }
  }, [autoFetch, isLoggedIn, fetchProfile]);

  return {
    user,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
  };
}
