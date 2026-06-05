// ── Delivery Management Hooks ────────────────────────────
// Architecture: UI → Component → Hook → Service → Axios → API Gateway → Backend
//
// Each hook manages its own loading/error/data states and exposes
// a clean interface for page components. No API logic lives in components.

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { deliveryService } from "@/services/delivery.service";
import type {
  DeliveryPartner,
  PartnerProfile,
  LiveDelivery,
  DeliveryRoute,
  DeliveryStatusEntry,
  PerformanceOverview,
  DeliveryAnalytics,
  SLADashboard,
  DeliveryQueryParams,
  AnalyticsQueryParams,
  AssignDeliveryFormData,
  UpdateDeliveryStatusFormData,
} from "@/types/delivery";
import type { PaginationState } from "@/types/products";

// ── Delivery Partners Hook ────────────────────────────────

export function useDeliveryPartners(initialParams?: Partial<DeliveryQueryParams>) {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialParams?.search || "");
  const [statusFilter, setStatusFilter] = useState(initialParams?.status || "all");
  const [zoneFilter, setZoneFilter] = useState(initialParams?.zone || "");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 10, total: 0,
  });

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deliveryService.getPartners({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        zone: zoneFilter || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (res.success && res.data) {
        setPartners(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load partners");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, zoneFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  }, []);

  const addPartner = useCallback(async (data: any) => {
    const res = await deliveryService.createPartner(data);
    if (res.success) {
      await fetchPartners();
    }
    return res;
  }, [fetchPartners]);

  const onlineCount = useMemo(() => partners.filter((p) => p.status === "online").length, [partners]);
  const busyCount = useMemo(() => partners.filter((p) => p.status === "busy").length, [partners]);
  const zones = useMemo(() => [...new Set(partners.map((p) => p.zone).filter(Boolean))] as string[], [partners]);

  return {
    partners, loading, error,
    search, setSearch,
    statusFilter, setStatusFilter,
    zoneFilter, setZoneFilter,
    pagination, setPage, setPageSize,
    onlineCount, busyCount, zones,
    addPartner,
    refresh: fetchPartners,
  };
}

// ── Partner Profile Hook ──────────────────────────────────

export function usePartnerProfile(partnerId: string | null) {
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerId) {
      setProfile(null);
      return;
    }
    setLoading(true);
    setError(null);
    deliveryService.getPartnerProfile(partnerId)
      .then((res) => {
        if (res.success) setProfile(res.data);
        else setError(res.error || "Failed to load profile");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setLoading(false));
  }, [partnerId]);

  return { profile, loading, error };
}

// ── Live Deliveries Hook ─────────────────────────────────

export function useLiveDeliveries(initialParams?: Partial<DeliveryQueryParams>) {
  const [deliveries, setDeliveries] = useState<LiveDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(initialParams?.status || "all");
  const [zoneFilter, setZoneFilter] = useState(initialParams?.zone || "");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 10, total: 0,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deliveryService.getLiveDeliveries({
        status: statusFilter !== "all" ? statusFilter : undefined,
        zone: zoneFilter || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (res.success && res.data) {
        setDeliveries(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, zoneFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchDeliveries(); }, [fetchDeliveries]);

  // Auto-poll every 15s for real-time updates (simulates socket)
  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchDeliveries();
    }, 15000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchDeliveries]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  }, []);

  const activeCount = useMemo(
    () => deliveries.filter((d) => !["delivered", "failed", "returned", "cancelled"].includes(d.status)).length,
    [deliveries]
  );

  return {
    deliveries, loading, error,
    statusFilter, setStatusFilter,
    zoneFilter, setZoneFilter,
    pagination, setPage, setPageSize,
    activeCount,
    refresh: fetchDeliveries,
  };
}

// ── Delivery Routes Hook ─────────────────────────────────

export function useDeliveryRoutes(initialParams?: Partial<DeliveryQueryParams>) {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(initialParams?.status || "all");
  const [optimizing, setOptimizing] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 10, total: 0,
  });

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deliveryService.getRoutes({
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (res.success && res.data) {
        setRoutes(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load routes");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  const optimizeAllRoutes = useCallback(async () => {
    setOptimizing(true);
    try {
      await deliveryService.optimizeAllRoutes();
      await fetchRoutes();
    } finally {
      setOptimizing(false);
    }
  }, [fetchRoutes]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  return {
    routes, loading, error,
    statusFilter, setStatusFilter,
    optimizing, optimizeAllRoutes,
    pagination, setPage,
    refresh: fetchRoutes,
  };
}

// ── Delivery Status Hook ────────────────────────────────

export function useDeliveryStatuses(initialParams?: Partial<DeliveryQueryParams>) {
  const [entries, setEntries] = useState<DeliveryStatusEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialParams?.search || "");
  const [statusFilter, setStatusFilter] = useState(initialParams?.status || "all");
  const [zoneFilter, setZoneFilter] = useState(initialParams?.zone || "");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 10, total: 0,
  });

  const fetchStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deliveryService.getDeliveryStatuses({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        zone: zoneFilter || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (res.success && res.data) {
        setEntries(res.data.items);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load delivery statuses");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, zoneFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchStatuses(); }, [fetchStatuses]);

  const updateStatus = useCallback(async (data: UpdateDeliveryStatusFormData): Promise<boolean> => {
    try {
      const res = await deliveryService.updateDeliveryStatus(data);
      if (res.success) {
        await fetchStatuses();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchStatuses]);

  const assignDelivery = useCallback(async (data: AssignDeliveryFormData): Promise<boolean> => {
    try {
      const res = await deliveryService.assignDelivery(data);
      if (res.success) {
        await fetchStatuses();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchStatuses]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  }, []);

  const summary = useMemo(() => ({
    total: entries.length,
    assigned: entries.filter((e) => e.status === "assigned").length,
    pickedUp: entries.filter((e) => e.status === "picked_up").length,
    inTransit: entries.filter((e) => e.status === "in_transit").length,
    outForDelivery: entries.filter((e) => e.status === "out_for_delivery").length,
    delivered: entries.filter((e) => e.status === "delivered").length,
    failed: entries.filter((e) => e.status === "failed").length,
    cancelled: entries.filter((e) => ["cancelled", "returned"].includes(e.status)).length,
    delayed: entries.filter((e) => e.slaStatus === "delayed" || e.slaStatus === "critical").length,
  }), [entries]);

  return {
    entries, loading, error,
    search, setSearch,
    statusFilter, setStatusFilter,
    zoneFilter, setZoneFilter,
    pagination, setPage, setPageSize,
    summary, updateStatus, assignDelivery,
    refresh: fetchStatuses,
  };
}

// ── Partner Performance Hook ──────────────────────────────

export function usePartnerPerformance(partnerId?: string | null) {
  const [performances, setPerformances] = useState<PerformanceOverview[]>([]);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("30d");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (partnerId) {
        const res = await deliveryService.getPartnerPerformance(partnerId, { period: period as AnalyticsQueryParams["period"] });
        if (res.success) {
          setSelectedPerformance(res.data);
          setPerformances(res.data ? [res.data] : []);
        }
      } else {
        const res = await deliveryService.getAllPartnerPerformance({ period: period as AnalyticsQueryParams["period"] });
        if (res.success) {
          setPerformances(res.data);
          setSelectedPerformance(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load performance data");
    } finally {
      setLoading(false);
    }
  }, [partnerId, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const topPerformers = useMemo(
    () => [...performances].sort((a, b) => b.onTimeRate - a.onTimeRate).slice(0, 5),
    [performances]
  );

  return {
    performances,
    selectedPerformance,
    loading, error,
    period, setPeriod,
    topPerformers,
    refresh: fetchData,
  };
}

// ── Delivery Analytics Hook ───────────────────────────────

export function useDeliveryAnalytics(initialParams?: Partial<AnalyticsQueryParams>) {
  const [analytics, setAnalytics] = useState<DeliveryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(initialParams?.period || "30d");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deliveryService.getAnalytics({ period: period as AnalyticsQueryParams["period"] });
      if (res.success) setAnalytics(res.data);
      else setError(res.error || "Failed to load analytics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return { analytics, loading, error, period, setPeriod, refresh: fetchAnalytics };
}

// ── SLA Dashboard Hook ────────────────────────────────────

export function useSLADashboard() {
  const [slaData, setSlaData] = useState<SLADashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSLA = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await deliveryService.getSLADashboard();
      if (res.success) setSlaData(res.data);
      else setError(res.error || "Failed to load SLA data");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load SLA data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSLA(); }, [fetchSLA]);

  return { slaData, loading, error, refresh: fetchSLA };
}

// ── Delivery Actions Hook ─────────────────────────────────

export function useDeliveryActions() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignPartner = useCallback(async (data: AssignDeliveryFormData): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    try {
      const res = await deliveryService.assignDelivery(data);
      return res.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign");
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  const updateStatus = useCallback(async (data: UpdateDeliveryStatusFormData): Promise<boolean> => {
    setUpdating(true);
    setError(null);
    try {
      const res = await deliveryService.updateDeliveryStatus(data);
      return res.success;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { assignPartner, updateStatus, updating, error };
}
