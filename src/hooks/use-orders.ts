// ── Order Management Hooks ──────────────────────────────
// Architecture: UI → Component → Hook → Service → API Gateway → Backend

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { orderService } from "@/services/orders.service";
import { notifyOrder } from "@/lib/notifications";
import type {
  Order,
  DeliveryPartner,
  Substitution,
  BulkJob,
  OrderFilters,
  AssignPartnerFormData,
  StatusUpdateFormData,
  SubstitutionDecisionData,
} from "@/types/orders";
import type { PaginationState } from "@/types/products";

// ── Orders List Hook ─────────────────────────────────────

export function useOrders(initialStatus?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialStatus || "all");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [isMock, setIsMock] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 20, total: 0,
  });

  const [summary, setSummary] = useState({
    total: 0, pending: 0, confirmed: 0, preparing: 0,
    outForDelivery: 0, delivered: 0, cancelled: 0, returned: 0,
    revenue: 0,
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getOrders(
        { search, status: statusFilter },
        { page: pagination.page, pageSize: pagination.pageSize }
      );
      setOrders(result.orders);
      setPagination(result.pagination);
      setSummary(result.summary);
      setIsMock(!!result.isMock);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  }, []);

  const kanbanGroups = useMemo(() => {
    const groups: Record<string, Order[]> = {
      pending: [], confirmed: [], preparing: [],
      out_for_delivery: [], delivered: [], cancelled: [], returned: [],
    };
    orders.forEach((o) => {
      if (groups[o.status]) groups[o.status].push(o);
    });
    return groups;
  }, [orders]);

  return {
    orders, loading, error, search, setSearch,
    statusFilter, setStatusFilter,
    viewMode, setViewMode,
    pagination, summary, kanbanGroups,
    isMock,
    setPage, setPageSize,
    fetchOrders,
  };
}

// ── Single Order Hook ────────────────────────────────────

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    orderService.getOrderById(id)
      .then((o) => { setOrder(o || null); if (!o) setError("Order not found"); })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = useCallback(async (newStatus: string, note?: string) => {
    const updated = await orderService.updateOrderStatus(id, newStatus, note);
    if (updated) setOrder(updated);
    // Fire-and-forget admin notification (non-critical, won't break the action)
    notifyOrder.statusChanged(id, newStatus).catch(() => {});
    return !!updated;
  }, [id]);

  return { order, loading, error, updateStatus };
}

// ── Order Actions Hook ───────────────────────────────────

export function useOrderActions() {
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (data: StatusUpdateFormData): Promise<boolean> => {
    setUpdating((prev) => ({ ...prev, [data.orderId]: true }));
    setError(null);
    try {
      await orderService.updateOrderStatus(data.orderId, data.newStatus, data.notes, data.backendId);
      // Fire-and-forget admin notification (non-critical, won't break the action)
      notifyOrder.statusChanged(data.orderId, data.newStatus).catch(() => {});
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      return false;
    } finally {
      setUpdating((prev) => ({ ...prev, [data.orderId]: false }));
    }
  }, []);

  const assignPartner = useCallback(async (data: AssignPartnerFormData): Promise<boolean> => {
    setUpdating((prev) => ({ ...prev, [data.orderId]: true }));
    setError(null);
    try {
      await orderService.assignPartner(data, data.backendId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign partner");
      return false;
    } finally {
      setUpdating((prev) => ({ ...prev, [data.orderId]: false }));
    }
  }, []);

  const addNote = useCallback(async (orderId: string, note: string): Promise<boolean> => {
    try {
      await orderService.addOrderNote(orderId, note, "Super Admin");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add note");
      return false;
    }
  }, []);

  return { updateStatus, assignPartner, addNote, updating, error };
}

// ── Delivery Partners Hook ───────────────────────────────

export function useDeliveryPartners() {
  const [partners, setPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getDeliveryPartners(search);
      setPartners(result.partners);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const onlineCount = useMemo(() => partners.filter((p) => p.status === "online").length, [partners]);
  const zones = useMemo(() => [...new Set(partners.map((p) => p.zone).filter(Boolean))], [partners]);

  return { partners, loading, error, search, setSearch, onlineCount, zones, fetchPartners };
}

// ── Substitutions Hook ───────────────────────────────────

export function useSubstitutions() {
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 10, total: 0,
  });

  const fetchSubstitutions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getSubstitutions(
        { search, status: statusFilter || undefined },
        { page: pagination.page, pageSize: pagination.pageSize }
      );
      setSubstitutions(result.substitutions);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load substitutions");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchSubstitutions(); }, [fetchSubstitutions]);

  const decideSubstitution = useCallback(async (data: SubstitutionDecisionData) => {
    try {
      await orderService.decideSubstitution(data);
      setSubstitutions((prev) =>
        prev.map((s) => (s.id === data.substitutionId ? { ...s, status: data.status } : s))
      );
      return true;
    } catch {
      return false;
    }
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  }, []);

  return {
    substitutions, loading, error,
    search, setSearch, statusFilter, setStatusFilter,
    pagination, decideSubstitution, setPage, setPageSize, fetchSubstitutions,
  };
}

// ── Bulk Jobs Hook ───────────────────────────────────────

export function useBulkJobs() {
  const [jobs, setJobs] = useState<BulkJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState(false);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 10, total: 0,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getBulkJobs(search, {
        page: pagination.page, pageSize: pagination.pageSize,
      });
      setJobs(result.jobs);
      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bulk jobs");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const createBulkAction = useCallback(async (actionType: string, orderIds: string[], targetStatus?: string) => {
    setProcessing(true);
    setError(null);
    try {
      await orderService.createBulkAction({ actionType, orderIds, targetStatus });
      await fetchJobs();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create bulk action");
      return false;
    } finally {
      setProcessing(false);
    }
  }, [fetchJobs]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  }, []);

  return {
    jobs, loading, error, search, setSearch,
    processing, pagination, createBulkAction,
    setPage, setPageSize, fetchJobs,
  };
}

// ── Unassigned Orders Hook ───────────────────────────────

export function useUnassignedOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<"unassigned" | "assigned" | "all">("unassigned");
  const pageSize = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await orderService.getOrders(
        { search }, { page, pageSize }
      );
      setOrders(result.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const unassignedCount = useMemo(() => orders.filter((o) => !o.deliveryPartner).length, [orders]);
  const assignedCount = useMemo(() => orders.filter((o) => !!o.deliveryPartner).length, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filterType === "unassigned") return !o.deliveryPartner;
      if (filterType === "assigned") return !!o.deliveryPartner;
      return true;
    });
  }, [orders, filterType]);

  return {
    orders: filteredOrders,
    rawOrders: orders,
    loading,
    error,
    search,
    setSearch,
    setPage,
    filterType,
    setFilterType,
    unassignedCount,
    assignedCount,
    fetchOrders,
  };
}
