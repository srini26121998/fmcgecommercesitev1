// ── Customer Management Hooks ───────────────────────────
// Architecture: UI → Component → Hook → Service → API Gateway → Backend

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { customerService } from "@/services/customers.service";
import type {
  Customer,
  CustomerFilters,
  Segment,
  AnalyticsMetric,
  CohortData,
  SupportTicket,
  TicketFilters,
  FraudAlert,
  FraudFilters,
  CustomersListResponse,
  TicketsListResponse,
  FraudListResponse,
} from "@/types/customers";
import type { PaginationState } from "@/types/products";

// ── Customers List Hook ──────────────────────────────────

export function useCustomers(initialFilters?: CustomerFilters) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState<string>(initialFilters?.segment || "all");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.status || "all");
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 });
  const [summary, setSummary] = useState<CustomersListResponse["summary"]>({
    total: 0, active: 0, vip: 0, new: 0, atRisk: 0, churned: 0, totalRevenue: 0, avgOrderValue: 0,
  });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerService.getCustomers(
        { search, segment: segmentFilter, status: statusFilter },
        { page: pagination.page, pageSize: pagination.pageSize },
      );
      setCustomers(result.customers);
      setPagination(result.pagination);
      setSummary(result.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, segmentFilter, statusFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const setPage = useCallback((p: number) => setPagination((prev) => ({ ...prev, page: p })), []);
  const setPageSize = useCallback((s: number) => setPagination((prev) => ({ ...prev, page: 1, pageSize: s })), []);

  const updateCustomer = useCallback(async (id: string, data: Partial<Customer>) => {
    try {
      const updated = await customerService.updateCustomer(id, data);
      await fetchCustomers();
      return updated || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer");
      return null;
    }
  }, [fetchCustomers]);

  return {
    customers, loading, error, search, setSearch,
    segmentFilter, setSegmentFilter, statusFilter, setStatusFilter,
    pagination, summary, setPage, setPageSize, fetchCustomers, updateCustomer,
  };
}

// ── Single Customer Hook ─────────────────────────────────

export function useCustomer(id: string) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    customerService.getCustomerById(id)
      .then((c) => { setCustomer(c || null); if (!c) setError("Customer not found"); })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load customer"))
      .finally(() => setLoading(false));
  }, [id]);

  return { customer, loading, error };
}

// ── Customer Actions Hook ────────────────────────────────

export function useCustomerActions() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(async (id: string, status: string) => {
    setUpdating(true);
    setError(null);
    try {
      await customerService.updateCustomerStatus(id, status);
      return true;
    } catch {
      setError("Failed to update status");
      return false;
    } finally {
      setUpdating(false);
    }
  }, []);

  const addNote = useCallback(async (id: string, content: string) => {
    try {
      await customerService.addCustomerNote(id, content, "Admin User");
      return true;
    } catch {
      setError("Failed to add note");
      return false;
    }
  }, []);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await customerService.deleteCustomerNote(noteId);
      return true;
    } catch {
      setError("Failed to delete note");
      return false;
    }
  }, []);

  return { updateStatus, addNote, deleteNote, updating, error };
}

export function useCustomerNotes(id: string) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerService.getCustomerNotes(id);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { notes, loading, error, fetchNotes };
}

export function useCustomerStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    customerService.getCustomerStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}

// ── Segments Hook ────────────────────────────────────────

export function useSegments() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSegments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getSegments();
      setSegments(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load segments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  const createSegment = useCallback(async (data: { name: string; criteria: string; description: string }) => {
    try {
      const newSeg = await customerService.createSegment(data);
      await fetchSegments();
      return newSeg;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create segment");
      throw err;
    }
  }, [fetchSegments]);

  const updateSegment = useCallback(async (id: string | number, data: { name: string; criteria: string; description: string }) => {
    try {
      const updated = await customerService.updateSegment(id, data);
      await fetchSegments();
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update segment");
      throw err;
    }
  }, [fetchSegments]);

  const totalCustomers = useMemo(() => {
    return segments.reduce((s, seg) => s + (seg.customerCount || 0), 0);
  }, [segments]);

  return {
    segments,
    loading,
    error,
    totalCustomers,
    fetchSegments,
    createSegment,
    updateSegment,
  };
}

// ── Analytics Hook ───────────────────────────────────────

export function useCustomerAnalytics() {
  const [purchaseBehavior, setPurchaseBehavior] = useState<any>(null);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [acquisitionChannels, setAcquisitionChannels] = useState<{ channel: string; count: number; percentage: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pb = await customerService.getPurchaseBehavior().catch((err) => {
        console.warn("getPurchaseBehavior failed, using fallback:", err);
        return null;
      });
      setPurchaseBehavior(pb);
      setMetrics([]);
      setCohortData([]);
      setAcquisitionChannels([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { purchaseBehavior, metrics, cohortData, acquisitionChannels, loading, error, refresh: fetchAnalytics };
}

// ── Support Tickets Hook ─────────────────────────────────

export function useSupportTickets(initialFilters?: TicketFilters) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.status || "all");
  const [priorityFilter, setPriorityFilter] = useState<string>(initialFilters?.priority || "all");
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 });
  const [summary, setSummary] = useState<TicketsListResponse["summary"]>({
    total: 0, open: 0, inProgress: 0, resolved: 0, urgent: 0,
  });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerService.getTickets(
        { search, status: statusFilter, priority: priorityFilter },
        { page: pagination.page, pageSize: pagination.pageSize },
      );
      setTickets(result.tickets || []);
      setPagination(result.pagination || { page: pagination.page, pageSize: pagination.pageSize, total: result.tickets?.length || 0 });
      setSummary(result.summary || { total: 0, open: 0, inProgress: 0, resolved: 0, urgent: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, priorityFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const setPage = useCallback((p: number) => setPagination((prev) => ({ ...prev, page: p })), []);
  const setPageSize = useCallback((s: number) => setPagination((prev) => ({ ...prev, page: 1, pageSize: s })), []);

  const updateTicketStatus = useCallback(async (id: string, status: string, assignedTo?: string) => {
    const updated = await customerService.updateTicketStatus(id, status, assignedTo);
    if (updated) {
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
    return !!updated;
  }, []);

  const createTicket = useCallback(async (data: any) => {
    try {
      await customerService.createTicket(data);
      await fetchTickets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
      return false;
    }
  }, [fetchTickets]);

  const updateTicket = useCallback(async (id: string, data: any) => {
    try {
      await customerService.updateTicket(id, data);
      await fetchTickets();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket");
      return false;
    }
  }, [fetchTickets]);

  return {
    tickets, loading, error, search, setSearch,
    statusFilter, setStatusFilter, priorityFilter, setPriorityFilter,
    pagination, summary, setPage, setPageSize, fetchTickets,
    updateTicketStatus, createTicket, updateTicket,
  };
}

// ── Fraud Detection Hook ─────────────────────────────────

export function useFraudAlerts(initialFilters?: FraudFilters) {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.status || "all");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>(initialFilters?.riskLevel || "all");
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, pageSize: 10, total: 0 });
  const [summary, setSummary] = useState<FraudListResponse["summary"]>({
    total: 0, blocked: 0, flagged: 0, monitoring: 0, critical: 0, high: 0,
  });

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await customerService.getFraudAlerts(
        { search, status: statusFilter, riskLevel: riskLevelFilter },
        { page: pagination.page, pageSize: pagination.pageSize },
      );
      setAlerts(result.alerts || []);
      setPagination(result.pagination || { page: pagination.page, pageSize: pagination.pageSize, total: result.alerts?.length || 0 });
      setSummary(result.summary || { total: 0, blocked: 0, flagged: 0, monitoring: 0, critical: 0, high: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fraud alerts");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, riskLevelFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const setPage = useCallback((p: number) => setPagination((prev) => ({ ...prev, page: p })), []);
  const setPageSize = useCallback((s: number) => setPagination((prev) => ({ ...prev, page: 1, pageSize: s })), []);

  const updateAlertStatus = useCallback(async (id: string, status: string) => {
    const updated = await customerService.updateFraudAlertStatus(id, status);
    if (updated) {
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
    return !!updated;
  }, []);

  const resetFraudScore = useCallback(async (customerId: string) => {
    try {
      await customerService.resetFraudScore(customerId);
      await fetchAlerts();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset fraud score");
      return false;
    }
  }, [fetchAlerts]);

  return {
    alerts, loading, error, search, setSearch,
    statusFilter, setStatusFilter, riskLevelFilter, setRiskLevelFilter,
    pagination, summary,
    setPage, setPageSize, fetchAlerts, updateAlertStatus, resetFraudScore,
  };
}
