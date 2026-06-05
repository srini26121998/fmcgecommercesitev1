"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { promotionService } from "@/services/promotions.service";
import type {
  Promotion,
  Coupon,
  FlashSale,
  Campaign,
  PushNotification,
  ABTest,
  PromotionFilters,
  CouponFilters,
  ABTestFilters,
  CampaignAnalytics,
} from "@/types/promotions";

// ── Promotions Hook ──────────────────────────────────────

export function usePromotions(initialFilters?: Partial<PromotionFilters>) {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [summary, setSummary] = useState<{
    total: number; active: number; scheduled: number; expired: number; totalUsage: number; totalBudget: string;
  }>({ total: 0, active: 0, scheduled: 0, expired: 0, totalUsage: 0, totalBudget: "₹0" });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PromotionFilters>({
    search: "", type: "", status: "", ...initialFilters,
  });

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await promotionService.getPromotions(filters, { page: pagination?.page || 1, pageSize: pagination?.pageSize || 10 });
      setPromotions(result?.promotions || []);
      setSummary(result?.summary || { total: 0, active: 0, scheduled: 0, expired: 0, totalUsage: 0, totalBudget: "₹0" });
      setPagination(result?.pagination || { page: 1, pageSize: 10, total: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch promotions");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.type, filters.status, pagination?.page, pagination?.pageSize]);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  const updateFilters = useCallback((update: Partial<PromotionFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const updatePromotion = useCallback(async (id: string, data: Partial<Promotion>) => {
    try {
      const updated = await promotionService.updatePromotion(id, data);
      await fetchPromotions();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update promotion");
      return null;
    }
  }, [fetchPromotions]);

  const deletePromotion = useCallback(async (id: string) => {
    try {
      const success = await promotionService.deletePromotion(id);
      await fetchPromotions();
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete promotion");
      return false;
    }
  }, [fetchPromotions]);

  const setPage = useCallback((page: number) => setPagination((prev) => ({ ...prev, page })), []);
  const setPageSize = useCallback((pageSize: number) => setPagination((prev) => ({ ...prev, page: 1, pageSize })), []);

  return { promotions, summary, pagination, loading, error, filters, updateFilters, fetchPromotions, updatePromotion, deletePromotion, setPage, setPageSize };
}

// ── Coupons Hook ─────────────────────────────────────────

export function useCoupons(initialFilters?: Partial<CouponFilters>) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [summary, setSummary] = useState({
    total: 0, active: 0, scheduled: 0, expired: 0, totalUsed: 0, totalIssued: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CouponFilters>({
    search: "", type: "", status: "", ...initialFilters,
  });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await promotionService.getCoupons(filters, { page: pagination?.page || 1, pageSize: pagination?.pageSize || 10 });
      setCoupons(result?.coupons || []);
      setSummary(result?.summary || { total: 0, active: 0, scheduled: 0, expired: 0, totalUsed: 0, totalIssued: 0 });
      setPagination(result?.pagination || { page: 1, pageSize: 10, total: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.type, filters.status, pagination?.page, pagination?.pageSize]);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const updateFilters = useCallback((update: Partial<CouponFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const generateCoupon = useCallback(async (data: Partial<Coupon>) => {
    try {
      const newCoupon = await promotionService.generateCoupon(data);
      await fetchCoupons();
      return newCoupon;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate coupon");
      return null;
    }
  }, [fetchCoupons]);

  const updateCoupon = useCallback(async (id: string, data: Partial<Coupon>) => {
    try {
      const updated = await promotionService.updateCoupon(id, data);
      await fetchCoupons();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update coupon");
      return null;
    }
  }, [fetchCoupons]);

  const deleteCoupon = useCallback(async (id: string) => {
    try {
      const success = await promotionService.deleteCoupon(id);
      await fetchCoupons();
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
      return false;
    }
  }, [fetchCoupons]);

  const setPage = useCallback((page: number) => setPagination((prev) => ({ ...prev, page })), []);
  const setPageSize = useCallback((pageSize: number) => setPagination((prev) => ({ ...prev, page: 1, pageSize })), []);

  return { coupons, summary, pagination, loading, error, filters, updateFilters, fetchCoupons, generateCoupon, updateCoupon, deleteCoupon, setPage, setPageSize };
}

// ── Flash Sales Hook ─────────────────────────────────────

export function useFlashSales() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [summary, setSummary] = useState({ live: 0, scheduled: 0, completed: 0, totalBudget: "₹0" });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await promotionService.getFlashSales({ page: pagination?.page || 1, pageSize: pagination?.pageSize || 10 });
      setFlashSales(result?.flashSales || []);
      setSummary(result?.summary || { live: 0, scheduled: 0, completed: 0, totalBudget: "₹0" });
      setPagination(result?.pagination || { page: 1, pageSize: 10, total: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch flash sales");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.page, pagination?.pageSize]);

  useEffect(() => { fetchFlashSales(); }, [fetchFlashSales]);

  const createFlashSale = useCallback(async (data: Partial<FlashSale>) => {
    try {
      const newFs = await promotionService.createFlashSale(data);
      await fetchFlashSales();
      return newFs;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create flash sale");
      return null;
    }
  }, [fetchFlashSales]);

  const updateFlashSale = useCallback(async (id: string, data: Partial<FlashSale>) => {
    try {
      const updated = await promotionService.updateFlashSale(id, data);
      await fetchFlashSales();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update flash sale");
      return null;
    }
  }, [fetchFlashSales]);

  const deleteFlashSale = useCallback(async (id: string) => {
    try {
      const success = await promotionService.deleteFlashSale(id);
      await fetchFlashSales();
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete flash sale");
      return false;
    }
  }, [fetchFlashSales]);

  const setPage = useCallback((page: number) => setPagination((prev) => ({ ...prev, page })), []);
  const setPageSize = useCallback((pageSize: number) => setPagination((prev) => ({ ...prev, page: 1, pageSize })), []);

  return { flashSales, summary, pagination, loading, error, fetchFlashSales, createFlashSale, updateFlashSale, deleteFlashSale, setPage, setPageSize };
}

// ── Campaigns Hook ───────────────────────────────────────

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState({ active: 0, scheduled: 0, drafts: 0, totalReach: "0" });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await promotionService.getCampaigns({ page: pagination?.page || 1, pageSize: pagination?.pageSize || 10 });
      setCampaigns(result?.campaigns || []);
      setSummary(result?.summary || { active: 0, scheduled: 0, drafts: 0, totalReach: "0" });
      setPagination(result?.pagination || { page: 1, pageSize: 10, total: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.page, pagination?.pageSize]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const createCampaign = useCallback(async (data: Partial<Campaign>) => {
    try {
      const newCamp = await promotionService.createCampaign(data);
      await fetchCampaigns();
      return newCamp;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create campaign");
      return null;
    }
  }, [fetchCampaigns]);

  const updateCampaign = useCallback(async (id: string, data: Partial<Campaign>) => {
    try {
      const updated = await promotionService.updateCampaign(id, data);
      if (updated) setCampaigns((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update campaign");
      return null;
    }
  }, []);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      const success = await promotionService.deleteCampaign(id);
      await fetchCampaigns();
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete campaign");
      return false;
    }
  }, [fetchCampaigns]);

  const setPage = useCallback((page: number) => setPagination((prev) => ({ ...prev, page })), []);
  const setPageSize = useCallback((pageSize: number) => setPagination((prev) => ({ ...prev, page: 1, pageSize })), []);

  return { campaigns, summary, pagination, loading, error, fetchCampaigns, createCampaign, updateCampaign, deleteCampaign, setPage, setPageSize };
}

// ── Push Notifications Hook ──────────────────────────────

export function usePushNotifications() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [summary, setSummary] = useState({ sent: 0, scheduled: 0, drafts: 0, avgOpenRate: "0%" });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await promotionService.getPushNotifications({ page: pagination?.page || 1, pageSize: pagination?.pageSize || 10 });
      setNotifications(result?.notifications || []);
      setSummary(result?.summary || { sent: 0, scheduled: 0, drafts: 0, avgOpenRate: "0%" });
      setPagination(result?.pagination || { page: 1, pageSize: 10, total: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination?.page, pagination?.pageSize]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const createNotification = useCallback(async (data: Partial<PushNotification>) => {
    try {
      const newNotif = await promotionService.createPushNotification(data);
      await fetchNotifications();
      return newNotif;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notification");
      return null;
    }
  }, [fetchNotifications]);

  const updateNotification = useCallback(async (id: string, data: Partial<PushNotification>) => {
    try {
      const updated = await promotionService.updatePushNotification(id, data);
      await fetchNotifications();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update notification");
      return null;
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const success = await promotionService.deletePushNotification(id);
      await fetchNotifications();
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification");
      return false;
    }
  }, [fetchNotifications]);

  const setPage = useCallback((page: number) => setPagination((prev) => ({ ...prev, page })), []);
  const setPageSize = useCallback((pageSize: number) => setPagination((prev) => ({ ...prev, page: 1, pageSize })), []);

  return { notifications, summary, pagination, loading, error, fetchNotifications, createNotification, updateNotification, deleteNotification, setPage, setPageSize };
}

// ── A/B Tests Hook ───────────────────────────────────────

export function useABTests(initialFilters?: Partial<ABTestFilters>) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [summary, setSummary] = useState({ total: 0, running: 0, completed: 0, totalImpressions: 0 });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ABTestFilters>({
    search: "", status: "", ...initialFilters,
  });

  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await promotionService.getABTests(filters, { page: pagination?.page || 1, pageSize: pagination?.pageSize || 10 });
      setTests(result?.tests || []);
      setSummary(result?.summary || { total: 0, running: 0, completed: 0, totalImpressions: 0 });
      setPagination(result?.pagination || { page: 1, pageSize: 10, total: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch A/B tests");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, pagination?.page, pagination?.pageSize]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const updateFilters = useCallback((update: Partial<ABTestFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  const createTest = useCallback(async (data: Partial<ABTest>) => {
    try {
      const newTest = await promotionService.createABTest(data);
      await fetchTests();
      return newTest;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create A/B test");
      return null;
    }
  }, [fetchTests]);

  const updateTest = useCallback(async (id: string, data: Partial<ABTest>) => {
    try {
      const updated = await promotionService.updateABTest(id, data);
      await fetchTests();
      return updated || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update A/B test");
      return null;
    }
  }, [fetchTests]);

  const deleteTest = useCallback(async (id: string) => {
    try {
      const success = await promotionService.deleteABTest(id);
      await fetchTests();
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete A/B test");
      return false;
    }
  }, [fetchTests]);

  const setPage = useCallback((page: number) => setPagination((prev) => ({ ...prev, page })), []);
  const setPageSize = useCallback((pageSize: number) => setPagination((prev) => ({ ...prev, page: 1, pageSize })), []);

  return { tests, summary, pagination, loading, error, filters, updateFilters, fetchTests, createTest, updateTest, deleteTest, setPage, setPageSize };
}

// ── Campaign Analytics Hook ──────────────────────────────

export function useCampaignAnalytics() {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await promotionService.getCampaignAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch campaign analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return { analytics, loading, error, fetchAnalytics };
}
