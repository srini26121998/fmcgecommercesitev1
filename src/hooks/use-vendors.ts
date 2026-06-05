"use client";

// ── Vendor Hooks ──────────────────────────────────────────
// Architecture: UI → Component → Hook → Service → API Gateway → Backend
//
// Hooks exported:
//   useVendors            – list + CRUD for the main vendors table
//   useVendorById         – single-vendor detail / edit view
//   useVendorOnboarding   – onboarding applications list
//   useVendorProducts     – products listed under a vendor
//   useVendorSettlements  – all-vendor settlement list (admin)
//   useVendorAnalytics    – vendor performance analytics
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo } from "react";
import { vendorsService } from "@/services/vendors.service";
import type {
  Vendor,
  VendorOnboarding,
  VendorProduct,
  VendorSettlement,
  VendorAnalyticsEntry,
  VendorFilters,
  VendorPageMeta,
  VendorSummary,
  SettlementSummary,
  OnboardingSummary,
  VendorAnalyticsSummary,
} from "@/types/vendors";

// ── Generic pagination helper (internal) ──────────────────

function usePagination(initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [meta, setMeta] = useState<VendorPageMeta>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 0,
  });

  const goToPage       = useCallback((p: number) => setPage(p), []);
  const changePageSize = useCallback((s: number) => {
    setPageSize(s);
    setPage(1);
  }, []);

  return { page, pageSize, meta, setMeta, goToPage, changePageSize };
}

// ══════════════════════════════════════════════════════════
// ── 1. useVendors ─────────────────────────────────────────
// Full list hook: pagination, filtering, CRUD (create, update, delete, status)
// Used by: /admin/vendors
// ══════════════════════════════════════════════════════════

export function useVendors(initialFilters?: Partial<VendorFilters>) {
  const [data, setData]       = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [summary, setSummary] = useState<VendorSummary | null>(null);

  // Mutation state
  const [mutating, setMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<VendorFilters>({
    search:      "",
    status:      "all",
    category:    "all",
    performance: "all",
    sortBy:      "",
    sortOrder:   "desc",
    ...initialFilters,
  });

  // ── Fetch ──────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await vendorsService.getVendors(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search, filters.status, filters.category,
    filters.performance, filters.sortBy, filters.sortOrder,
    page, pageSize,
  ]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch summary (KPI cards) independently
  useEffect(() => {
    vendorsService.getVendorSummary().then(setSummary).catch(() => {});
  }, []);

  // ── Filters ───────────────────────────────────────────

  const updateFilters = useCallback((update: Partial<VendorFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    goToPage(1);
  }, [goToPage]);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "", status: "all", category: "all",
      performance: "all", sortBy: "", sortOrder: "desc",
    });
    goToPage(1);
  }, [goToPage]);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(
        ([k, v]) =>
          v !== "" && v !== "all" && v !== undefined &&
          k !== "sortOrder" && k !== "sortBy"
      ).length,
    [filters]
  );

  // ── Mutations ─────────────────────────────────────────

  /** Create a new vendor then re-fetch the list. */
  const createVendor = useCallback(async (payload: Partial<Vendor>) => {
    setMutating(true);
    setMutationError(null);
    try {
      const created = await vendorsService.createVendor(payload);
      await fetchData();
      vendorsService.getVendorSummary().then(setSummary).catch(() => {});
      return created;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create vendor";
      setMutationError(msg);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [fetchData]);

  /** Update vendor details then re-fetch. */
  const updateVendor = useCallback(
    async (id: string, payload: Partial<Vendor>) => {
      setMutating(true);
      setMutationError(null);
      try {
        const updated = await vendorsService.updateVendor(id, payload);
        await fetchData();
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update vendor";
        setMutationError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [fetchData]
  );

  /** Update vendor status (active / suspended / etc.) then re-fetch. */
  const updateVendorStatus = useCallback(
    async (id: string, status: Vendor["status"]) => {
      setMutating(true);
      setMutationError(null);
      try {
        await vendorsService.updateVendorStatus(id, status);
        await fetchData();
        vendorsService.getVendorSummary().then(setSummary).catch(() => {});
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update vendor status";
        setMutationError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [fetchData]
  );

  /** Delete a vendor then re-fetch. */
  const deleteVendor = useCallback(
    async (id: string) => {
      setMutating(true);
      setMutationError(null);
      try {
        const result = await vendorsService.deleteVendor(id);
        await fetchData();
        vendorsService.getVendorSummary().then(setSummary).catch(() => {});
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to delete vendor";
        setMutationError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [fetchData]
  );

  const approveVendor = useCallback(async (id: string) => {
    setMutating(true);
    setMutationError(null);
    try {
      await vendorsService.approveVendor(id);
      await fetchData();
      vendorsService.getVendorSummary().then(setSummary).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to approve vendor";
      setMutationError(msg);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [fetchData]);

  const rejectVendor = useCallback(async (id: string, reason: string) => {
    setMutating(true);
    setMutationError(null);
    try {
      await vendorsService.rejectVendor(id, reason);
      await fetchData();
      vendorsService.getVendorSummary().then(setSummary).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to reject vendor";
      setMutationError(msg);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [fetchData]);

  return {
    // Data
    data, loading, error, summary, filters, meta,
    // Pagination
    activeFilterCount, goToPage, changePageSize,
    // Filter helpers
    fetchData, updateFilters, clearFilters,
    // Mutations
    mutating, mutationError,
    createVendor, updateVendor, updateVendorStatus, deleteVendor,
    approveVendor, rejectVendor,
  };
}

// ══════════════════════════════════════════════════════════
// ── 2. useVendorById ──────────────────────────────────────
// Single-vendor detail hook.
// Used by: /admin/vendors/[id] detail & edit pages
// ══════════════════════════════════════════════════════════

export function useVendorById(id: string | undefined) {
  const [vendor, setVendor]   = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [mutating, setMutating]         = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const fetchVendor = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await vendorsService.getVendorById(id);
      setVendor(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vendor");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchVendor(); }, [fetchVendor]);

  const updateVendor = useCallback(
    async (payload: Partial<Vendor>) => {
      if (!id) return null;
      setMutating(true);
      setMutationError(null);
      try {
        const updated = await vendorsService.updateVendor(id, payload);
        setVendor(updated);
        return updated;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to update vendor";
        setMutationError(msg);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [id]
  );

  const deleteVendor = useCallback(async () => {
    if (!id) return;
    setMutating(true);
    setMutationError(null);
    try {
      return await vendorsService.deleteVendor(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete vendor";
      setMutationError(msg);
      throw err;
    } finally {
      setMutating(false);
    }
  }, [id]);

  return {
    vendor, loading, error,
    mutating, mutationError,
    fetchVendor, updateVendor, deleteVendor,
  };
}

// ══════════════════════════════════════════════════════════
// ── 3. useVendorOnboarding ────────────────────────────────
// Onboarding applications list + approve / reject actions.
// Used by: /admin/vendors/onboarding
// ══════════════════════════════════════════════════════════

export function useVendorOnboarding(initialFilters?: Partial<VendorFilters>) {
  const [data, setData]       = useState<VendorOnboarding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [summary, setSummary] = useState<OnboardingSummary | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<VendorFilters>({
    search:    "",
    status:    "all",
    sortBy:    "",
    sortOrder: "desc",
    ...initialFilters,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await vendorsService.getOnboardingApplications(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch onboarding applications");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, page, pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    vendorsService.getOnboardingSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<VendorFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    goToPage(1);
  }, [goToPage]);

  const approveVendor = useCallback(async (id: string) => {
    await vendorsService.approveVendor(id);
    fetchData();
    vendorsService.getOnboardingSummary().then(setSummary).catch(() => {});
  }, [fetchData]);

  const rejectVendor = useCallback(async (id: string, reason: string) => {
    await vendorsService.rejectVendor(id, reason);
    fetchData();
    vendorsService.getOnboardingSummary().then(setSummary).catch(() => {});
  }, [fetchData]);

  return {
    data, loading, error, summary, filters, meta,
    fetchData, updateFilters, approveVendor, rejectVendor,
    goToPage, changePageSize,
  };
}

// ══════════════════════════════════════════════════════════
// ── 4. useVendorProducts ──────────────────────────────────
// Products listed under a specific vendor (or all vendors).
// Used by: /admin/vendors/products
// ══════════════════════════════════════════════════════════

export function useVendorProducts(
  initialFilters?: Partial<VendorFilters> & { vendorId?: string }
) {
  const [data, setData]       = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalProducts:   number;
    activeProducts:  number;
    outOfStockCount: number;
    inactiveCount:   number;
    avgMargin:       number;
    totalStockValue: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<VendorFilters & { vendorId?: string }>({
    search:    "",
    status:    "all",
    sortBy:    "",
    sortOrder: "desc",
    ...initialFilters,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await vendorsService.getVendorProducts(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vendor products");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.vendorId, filters.sortBy, filters.sortOrder, page, pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    vendorsService.getProductSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback(
    (update: Partial<VendorFilters & { vendorId?: string }>) => {
      setFilters((prev) => ({ ...prev, ...update }));
      goToPage(1);
    },
    [goToPage]
  );

  return {
    data, loading, error, summary, filters, meta,
    fetchData, updateFilters, goToPage, changePageSize,
  };
}

// ══════════════════════════════════════════════════════════
// ── 5. useVendorSettlements ───────────────────────────────
// All-vendor settlements list for the admin settlements tab.
// Also exposes per-vendor settlement fetching.
// Used by: /admin/vendors/settlements
// ══════════════════════════════════════════════════════════

export function useVendorSettlements(initialFilters?: Partial<VendorFilters>) {
  const [data, setData]       = useState<VendorSettlement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<VendorFilters>({
    search:    "",
    status:    "all",
    sortBy:    "",
    sortOrder: "desc",
    ...initialFilters,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await vendorsService.getSettlements(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settlements");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.status, filters.sortBy, filters.sortOrder, page, pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    vendorsService.getSettlementSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<VendorFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    goToPage(1);
  }, [goToPage]);

  const processSettlement = useCallback(async (id: string) => {
    await vendorsService.processSettlement(id);
    fetchData();
    vendorsService.getSettlementSummary().then(setSummary).catch(() => {});
  }, [fetchData]);

  /**
   * Fetch settlements for a specific vendor.
   * Calls GET /api/v1/admin/vendors/:vendorId/settlements
   */
  const fetchVendorSettlements = useCallback(
    async (vendorId: string, p = 1, ps = 10) => {
      return vendorsService.getVendorSettlements(vendorId, p, ps);
    },
    []
  );

  return {
    data, loading, error, summary, filters, meta,
    fetchData, updateFilters, processSettlement,
    fetchVendorSettlements,
    goToPage, changePageSize,
  };
}

// ══════════════════════════════════════════════════════════
// ── 6. useVendorAnalytics ─────────────────────────────────
// Vendor performance analytics.
// Used by: /admin/vendors/analytics
// ══════════════════════════════════════════════════════════

export function useVendorAnalytics(initialFilters?: Partial<VendorFilters>) {
  const [data, setData]       = useState<VendorAnalyticsEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [summary, setSummary] = useState<VendorAnalyticsSummary | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<VendorFilters>({
    search:    "",
    sortBy:    "",
    sortOrder: "desc",
    ...initialFilters,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await vendorsService.getVendorAnalytics(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vendor analytics");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.sortBy, filters.sortOrder, page, pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    vendorsService.getAnalyticsSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<VendorFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    goToPage(1);
  }, [goToPage]);

  return {
    data, loading, error, summary, filters, meta,
    fetchData, updateFilters, goToPage, changePageSize,
  };
}
