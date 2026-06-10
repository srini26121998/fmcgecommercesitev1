"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { reportsService } from "@/services/reports.service";
import type {
  GSTReportEntry,
  CustomerReportEntry,
  CohortEntry,
  AbandonedCartEntry,
  RevenueAnalyticsEntry,
  PromotionROIEntry,
  SalesReportEntry,
  InventoryReportEntry,
  VendorReportEntry,
  TaxReportEntry,
  ReportPageMeta,
  ReportFilters,
} from "@/types/reports";

// ── Generic pagination state ──────────────────────────────

function usePagination(initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [meta, setMeta] = useState<ReportPageMeta>({ page: 1, pageSize: initialPageSize, total: 0, totalPages: 0 });

  const goToPage = useCallback((p: number) => setPage(p), []);
  const changePageSize = useCallback((s: number) => {
    setPageSize(s);
    setPage(1);
  }, []);

  return { page, pageSize, meta, setMeta, goToPage, changePageSize, setPage };
}

// ── GST Reports Hook ─────────────────────────────────────

export function useGSTReports(initialFilters?: Partial<ReportFilters>) {
  const [data, setData] = useState<GSTReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalLiability: number;
    totalInputCredit: number;
    netPayable: number;
    pendingReturns: number;
    overdueReturns: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: "",
    dateTo: "",
    period: "30d",
    search: "",
    sortBy: "",
    sortOrder: "desc",
    ...initialFilters,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getGSTReports(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch GST reports");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo, filters.search, filters.sortBy, filters.sortOrder, page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getGSTSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...update } as ReportFilters));
    goToPage(1);
  }, [goToPage]);

  const clearFilters = useCallback(() => {
    setFilters({ dateFrom: "", dateTo: "", period: "30d", search: "", sortBy: "", sortOrder: "desc" });
    goToPage(1);
  }, [goToPage]);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== "" && v !== undefined && k !== "period" && k !== "sortOrder" && k !== "sortBy").length,
    [filters]
  );

  return { data, loading, error, summary, filters, meta, activeFilterCount, fetchData, updateFilters, clearFilters, goToPage, changePageSize };
}

// ── Customer Reports Hook ────────────────────────────────

export function useCustomerReports(initialFilters?: Partial<ReportFilters>) {
  const [data, setData] = useState<CustomerReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalCustomers: number;
    totalRevenue: number;
    avgRetentionRate: number;
    platinumCount: number;
    atRiskCount: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: "",
    dateTo: "",
    period: "30d",
    search: "",
    sortBy: "",
    sortOrder: "desc",
    ...initialFilters,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getCustomerReports(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch customer reports");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo, filters.search, filters.sortBy, filters.sortOrder, page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getCustomerSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...update } as ReportFilters));
    goToPage(1);
  }, [goToPage]);

  const clearFilters = useCallback(() => {
    setFilters({ dateFrom: "", dateTo: "", period: "30d", search: "", sortBy: "", sortOrder: "desc" });
    goToPage(1);
  }, [goToPage]);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== "" && v !== undefined && k !== "period" && k !== "sortOrder" && k !== "sortBy").length,
    [filters]
  );

  return { data, loading, error, summary, filters, meta, activeFilterCount, fetchData, updateFilters, clearFilters, goToPage, changePageSize };
}

// ── Cohort Analysis Hook ─────────────────────────────────

export function useCohortData() {
  const [data, setData] = useState<CohortEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalCohorts: number;
    totalUsers: number;
    avgRetentionWeek1: number;
    avgRetentionWeek4: number;
    avgRetentionWeek12: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(12);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getCohortData(page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cohort data");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getCohortSummary().then(setSummary).catch(() => {});
  }, []);

  return { data, loading, error, summary, meta, goToPage, changePageSize, fetchData };
}

// ── Abandoned Cart Hook ──────────────────────────────────

export function useAbandonedCart(initialFilters?: Partial<ReportFilters>) {
  const [data, setData] = useState<AbandonedCartEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalAbandoned: number;
    totalRecovered: number;
    recoveryRate: number;
    lostRevenue: number;
    recoveredRevenue: number;
    avgCartValue: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<ReportFilters>({
    search: "",
    sortBy: "",
    sortOrder: "desc",
    ...initialFilters,
  } as ReportFilters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getAbandonedCartData(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch abandoned cart data");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.sortBy, filters.sortOrder, page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getAbandonedCartSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    goToPage(1);
  }, [goToPage]);

  const clearFilters = useCallback(() => {
    setFilters({ search: "", sortBy: "", sortOrder: "desc" } as ReportFilters);
    goToPage(1);
  }, [goToPage]);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== "" && v !== undefined && k !== "sortOrder" && k !== "sortBy").length,
    [filters]
  );

  return { data, loading, error, summary, filters, meta, activeFilterCount, fetchData, updateFilters, clearFilters, goToPage, changePageSize };
}

// ── Revenue Analytics Hook ───────────────────────────────

export function useRevenueAnalytics() {
  const [data, setData] = useState<RevenueAnalyticsEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    totalCOGS: number;
    totalGrossProfit: number;
    avgGrossMargin: number;
    totalNetProfit: number;
    revenueGrowth: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(12);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getRevenueAnalytics(page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch revenue analytics");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getRevenueSummary().then(setSummary).catch(() => {});
  }, []);

  return { data, loading, error, summary, meta, goToPage, changePageSize, fetchData };
}

// ── Promotion ROI Hook ───────────────────────────────────

export function usePromotionROI(initialFilters?: Partial<ReportFilters>) {
  const [data, setData] = useState<PromotionROIEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalPromotions: number;
    totalCost: number;
    totalRevenue: number;
    avgROI: number;
    highestROI: number;
    bestPromotion: string;
    totalRedemptions: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<ReportFilters>({
    search: "",
    sortBy: "",
    sortOrder: "desc",
    ...initialFilters,
  } as ReportFilters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getPromotionROIData(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch promotion ROI data");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.sortBy, filters.sortOrder, page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getPromotionROISummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...update } as ReportFilters));
    goToPage(1);
  }, [goToPage]);

  const clearFilters = useCallback(() => {
    setFilters({ search: "", sortBy: "", sortOrder: "desc" } as ReportFilters);
    goToPage(1);
  }, [goToPage]);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== "" && v !== undefined && k !== "sortOrder" && k !== "sortBy").length,
    [filters]
  );

  return { data, loading, error, summary, filters, meta, activeFilterCount, fetchData, updateFilters, clearFilters, goToPage, changePageSize };
}

// ── Export Hook ─────────────────────────────────────────

export function useReportExport() {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async (reportType: string, format: "csv" | "xlsx" | "pdf", filters?: Partial<ReportFilters>) => {
    setExporting(true);
    try {
      const result = await reportsService.exportReport(reportType, format, filters);
      return result;
    } finally {
      setExporting(false);
    }
  }, []);

  return { handleExport, exporting };
}

// ── Sales Reports Hook ───────────────────────────────────

export function useSalesReports(initialFilters?: Partial<ReportFilters>) {
  const [data, setData] = useState<SalesReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalDiscounts: number;
    totalTax: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: "",
    dateTo: "",
    period: "30d",
    search: "",
    sortBy: "",
    sortOrder: "desc",
    ...initialFilters,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getSalesReports(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sales reports");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo, filters.search, filters.sortBy, filters.sortOrder, page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getSalesSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...update } as ReportFilters));
    goToPage(1);
  }, [goToPage]);

  const clearFilters = useCallback(() => {
    setFilters({ dateFrom: "", dateTo: "", period: "30d", search: "", sortBy: "", sortOrder: "desc" });
    goToPage(1);
  }, [goToPage]);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== "" && v !== undefined && k !== "period" && k !== "sortOrder" && k !== "sortBy").length,
    [filters]
  );

  return { data, loading, error, summary, filters, meta, activeFilterCount, fetchData, updateFilters, clearFilters, goToPage, changePageSize };
}

// ── Inventory Reports Hook ───────────────────────────────

export function useInventoryReports(initialFilters?: Partial<ReportFilters>) {
  const [data, setData] = useState<InventoryReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalSKUs: number;
    totalStockValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    overstockedCount: number;
    avgTurnoverRate: number;
    totalDamagedValue: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<ReportFilters>({
    search: "",
    sortBy: "",
    sortOrder: "asc",
    ...initialFilters,
  } as ReportFilters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getInventoryReports(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory reports");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.sortBy, filters.sortOrder, page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getInventorySummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    goToPage(1);
  }, [goToPage]);

  const clearFilters = useCallback(() => {
    setFilters({ search: "", sortBy: "", sortOrder: "asc" } as ReportFilters);
    goToPage(1);
  }, [goToPage]);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== "" && v !== undefined && k !== "sortOrder" && k !== "sortBy").length,
    [filters]
  );

  return { data, loading, error, summary, filters, meta, activeFilterCount, fetchData, updateFilters, clearFilters, goToPage, changePageSize };
}

// ── Vendor Reports Hook ──────────────────────────────────

export function useVendorReports(initialFilters?: Partial<ReportFilters>) {
  const [data, setData] = useState<VendorReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    totalVendors: number;
    totalGrossSales: number;
    totalCommission: number;
    totalNetPayout: number;
    totalPendingPayout: number;
    avgRating: number;
    excellentCount: number;
    poorCount: number;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<ReportFilters>({
    search: "",
    sortBy: "",
    sortOrder: "desc",
    ...initialFilters,
  } as ReportFilters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getVendorReports(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch vendor reports");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.sortBy, filters.sortOrder, page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getVendorSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    goToPage(1);
  }, [goToPage]);

  const clearFilters = useCallback(() => {
    setFilters({ search: "", sortBy: "", sortOrder: "desc" } as ReportFilters);
    goToPage(1);
  }, [goToPage]);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== "" && v !== undefined && k !== "sortOrder" && k !== "sortBy").length,
    [filters]
  );

  return { data, loading, error, summary, filters, meta, activeFilterCount, fetchData, updateFilters, clearFilters, goToPage, changePageSize };
}

// ── Tax Reports Hook ─────────────────────────────────────

export function useTaxReports(initialFilters?: Partial<ReportFilters>) {
  const [data, setData] = useState<TaxReportEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    generatedReports: number;
    pendingFilings: number;
    completedFilings: number;
    upcomingTaxLiability: number;
    nextDeadline: string;
    nextDeadlineType: string;
  } | null>(null);
  const { page, pageSize, meta, setMeta, goToPage, changePageSize } = usePagination(10);
  const [filters, setFilters] = useState<ReportFilters>({
    search: "",
    sortBy: "",
    sortOrder: "desc",
    ...initialFilters,
  } as ReportFilters);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await reportsService.getTaxReports(filters, page, pageSize);
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tax reports");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.sortBy, filters.sortOrder, page, pageSize]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    reportsService.getTaxSummary().then(setSummary).catch(() => {});
  }, []);

  const updateFilters = useCallback((update: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...update }));
    goToPage(1);
  }, [goToPage]);

  const clearFilters = useCallback(() => {
    setFilters({ search: "", sortBy: "", sortOrder: "desc" } as ReportFilters);
    goToPage(1);
  }, [goToPage]);

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([k, v]) => v !== "" && v !== undefined && k !== "sortOrder" && k !== "sortBy").length,
    [filters]
  );

  return { data, loading, error, summary, filters, meta, activeFilterCount, fetchData, updateFilters, clearFilters, goToPage, changePageSize };
}
