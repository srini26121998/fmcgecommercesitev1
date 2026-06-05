// ── Inventory Hooks ────────────────────────────────
// Data-fetching hooks for all inventory subsections.
// Each hook handles loading/error states, data fetching, and refresh.

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { inventoryService } from "@/services/inventory.service";
import type {
  InventoryItem,
  Warehouse,
  StockTransfer,
  SafetyStockRule,
  FEFOBatch,
  DemandForecast,
  LowStockAlert,
  InventoryQueryParams,
  TransferQueryParams,
} from "@/types/inventory";

// ── useInventoryItems ─────────────────────────────────────
export function useInventoryItems(initialParams?: InventoryQueryParams) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });

  // Keep a ref to the latest params so the effect callback always reads current
  // values without needing them as reactive dependencies.
  const paramsRef = useRef(initialParams);
  paramsRef.current = initialParams;

  const fetchItems = useCallback(async (params?: InventoryQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getInventory(params);
      setItems(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch (err: any) {
      // Gracefully handle missing/unimplemented backend endpoints
      const status = err?.status ?? err?.response?.status;
      if (status === 404 || status === 500 || err?.message?.includes('No static resource')) {
        setItems([]);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load inventory");
      }
    } finally {
      setLoading(false);
    }
  }, []); // stable — never recreated

  // Serialize params to a primitive string so the effect only re-runs when the
  // actual values change, NOT when the caller creates a new object reference
  // on every render (which was the cause of the repeated API calls).
  const paramsKey = JSON.stringify(initialParams ?? null);

  useEffect(() => {
    fetchItems(paramsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchItems, paramsKey]);

  return { items, loading, error, pagination, refresh: (p?: InventoryQueryParams) => fetchItems(p || paramsRef.current) };
}

// ── useWarehouses ─────────────────────────────────────────
export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getWarehouses();
      setWarehouses(res.data);
    } catch (err: any) {
      // Gracefully handle missing/unimplemented backend endpoints
      const status = err?.status ?? err?.response?.status;
      if (status === 404 || status === 500 || err?.message?.includes('No static resource')) {
        setWarehouses([]);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load warehouses");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const createWarehouse = useCallback(async (data: Partial<Warehouse>) => {
    try {
      const res = await inventoryService.createWarehouse(data);
      setWarehouses((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create warehouse");
    }
  }, []);

  const updateWarehouse = useCallback(async (id: string, updates: Partial<Warehouse>) => {
    try {
      const res = await inventoryService.updateWarehouse(id, updates);
      setWarehouses((prev) => prev.map((w) => (w.id === id ? res.data : w)));
      return res.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update warehouse");
    }
  }, []);

  return { warehouses, loading, error, refresh: fetch, createWarehouse, updateWarehouse };
}

// ── useStockTransfers ─────────────────────────────────────
export function useStockTransfers(initialParams?: TransferQueryParams) {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 0 });

  const fetch = useCallback(async (params?: TransferQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getTransfers(params);
      setTransfers(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch (err: any) {
      // Gracefully handle missing/unimplemented backend endpoints
      const status = err?.status ?? err?.response?.status;
      if (status === 404 || status === 500 || err?.message?.includes('No static resource')) {
        setTransfers([]);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load transfers");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(initialParams); }, [fetch, initialParams]);

  const createTransfer = useCallback(async (data: Omit<StockTransfer, "id" | "status" | "createdAt">) => {
    try {
      const res = await inventoryService.createTransfer(data);
      setTransfers((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to create transfer");
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: StockTransfer["status"]) => {
    try {
      const res = await inventoryService.updateTransferStatus(id, status);
      setTransfers((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      return res.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update transfer status");
    }
  }, []);

  return { transfers, loading, error, pagination, refresh: fetch, createTransfer, updateStatus };
}

// ── useSafetyStock ────────────────────────────────────────
export function useSafetyStock(initialStatus?: string) {
  const [rules, setRules] = useState<SafetyStockRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getSafetyStockRules({ status });
      setRules(res.data);
    } catch (err: any) {
      const s = err?.status ?? err?.response?.status;
      if (s === 404 || s === 500 || err?.message?.includes('No static resource')) {
        setRules([]);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load safety stock rules");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(initialStatus); }, [fetch, initialStatus]);

  const updateSafetyStock = useCallback(async (inventoryId: number, safetyStock: number) => {
    try {
      const res = await inventoryService.updateSafetyStock(inventoryId, safetyStock);
      await fetch(initialStatus);
      return res.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to update safety stock");
    }
  }, [fetch, initialStatus]);

  return { rules, loading, error, refresh: (s?: string) => fetch(s || initialStatus), updateSafetyStock };
}

// ── useFEFO ───────────────────────────────────────────────
export function useFEFO(initialSearch?: string) {
  const [batches, setBatches] = useState<FEFOBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getFEFOBatches({ search });
      setBatches(res.data);
    } catch (err: any) {
      const s = err?.status ?? err?.response?.status;
      if (s === 404 || s === 500 || err?.message?.includes('No static resource')) {
        setBatches([]);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load FEFO batches");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(initialSearch); }, [fetch, initialSearch]);

  return { batches, loading, error, refresh: (s?: string) => fetch(s || initialSearch) };
}

// ── useDemandForecasts ────────────────────────────────────
export function useDemandForecasts() {
  const [forecasts, setForecasts] = useState<DemandForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getDemandForecasts();
      setForecasts(res.data);
    } catch (err: any) {
      const s = err?.status ?? err?.response?.status;
      if (s === 404 || s === 500 || err?.message?.includes('No static resource')) {
        setForecasts([]);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load forecasts");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { forecasts, loading, error, refresh: fetch };
}

// ── useLowStockAlerts ─────────────────────────────────────
export function useLowStockAlerts() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getLowStockAlerts();
      setAlerts(res.data);
    } catch (err: any) {
      const s = err?.status ?? err?.response?.status;
      if (s === 404 || s === 500 || err?.message?.includes('No static resource')) {
        setAlerts([]);
      } else {
        setError(err instanceof Error ? err.message : "Failed to load low stock alerts");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { alerts, loading, error, refresh: fetch };
}

// ── useInventoryReport ────────────────────────────────────
export function useInventoryReport() {
  const [report, setReport] = useState<{
    outOfStockCount: number;
    totalProducts: number;
    inStockCount: number;
    lowStockCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryService.getInventoryReport();
      setReport(res.data as any);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Failed to load inventory report");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { report, loading, error, refresh: fetch };
}
