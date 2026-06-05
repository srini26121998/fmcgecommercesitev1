// ── Settings Management Hooks ────────────────────────────
// Architecture: UI → Component → Hook → Service → Axios → API Gateway → Backend
//
// Each hook manages its own loading/error/data states and exposes
// a clean interface for page components. No API logic lives in components.

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { settingsService } from "@/services/settings.service";
import type {
  SettingsUser,
  Role,
  FeatureFlag,
  ThemeSettings,
  ApiKey,
  AuditLog,
  SystemConfig,
  SettingsQueryParams,
  PaymentMethodConfig,
  TaxRate,
  GstReturn,
  NotificationChannel,
  NotificationEventMapping,
  CreateUserFormData,
  CreateRoleFormData,
  CreateApiKeyFormData,
  UpdateConfigFormData,
  GlobalSettings,
} from "@/types/settings";
import type { PaginationState } from "@/lib/types";

// ── Users Hook ────────────────────────────────────────────

export function useSettingsUsers(initialParams?: Partial<SettingsQueryParams>) {
  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialParams?.search || "");
  const [statusFilter, setStatusFilter] = useState(initialParams?.status || "all");
  const [roleFilter, setRoleFilter] = useState(initialParams?.role || "all");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 10, total: 0,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getUsers({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (res.success && res.data) {
        setUsers(res.data.items);
        setPagination((prev) => ({ ...prev, ...res.data!.pagination }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, roleFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  }, []);

  const activeCount = useMemo(() => users.filter((u) => u.status === "active").length, [users]);
  const inactiveCount = useMemo(() => users.filter((u) => u.status === "inactive" || u.status === "suspended").length, [users]);

  return {
    users, loading, error,
    search, setSearch,
    statusFilter, setStatusFilter,
    roleFilter, setRoleFilter,
    pagination, setPage, setPageSize,
    activeCount, inactiveCount,
    refresh: fetchUsers,
  };
}

// ── Roles Hook ────────────────────────────────────────────

export function useSettingsRoles(initialParams?: Partial<SettingsQueryParams>) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialParams?.search || "");

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getRoles({ search: search || undefined });
      if (res.success && res.data) setRoles(res.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const totalUsers = useMemo(() => roles.reduce((sum, r) => sum + r.usersCount, 0), [roles]);

  return { roles, loading, error, search, setSearch, totalUsers, refresh: fetchRoles };
}

// ── Feature Flags Hook ────────────────────────────────────

export function useFeatureFlags(initialParams?: Partial<SettingsQueryParams>) {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [envFilter, setEnvFilter] = useState(initialParams?.environment || "all");
  const [search, setSearch] = useState(initialParams?.search || "");

  const fetchFlags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getFeatureFlags({
        environment: envFilter !== "all" ? envFilter : undefined,
        search: search || undefined,
      });
      if (res.success && res.data) setFlags(res.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  }, [envFilter, search]);

  useEffect(() => { fetchFlags(); }, [fetchFlags]);

  const toggleFlag = useCallback(async (flagId: string, enabled: boolean) => {
    setFlags((prev) => prev.map((f) => (f.id === flagId ? { ...f, enabled } : f)));
    await settingsService.toggleFeatureFlag(flagId, enabled);
  }, []);

  const enabledCount = useMemo(() => flags.filter((f) => f.enabled).length, [flags]);

  return {
    flags, loading, error,
    envFilter, setEnvFilter,
    search, setSearch,
    enabledCount, toggleFlag,
    refresh: fetchFlags,
  };
}

// ── Theme Settings Hook ───────────────────────────────────

export function useThemeSettings() {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchTheme = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getThemeSettings();
      if (res.success) setTheme(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load theme");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTheme(); }, [fetchTheme]);

  const updateTheme = useCallback(async (data: Partial<ThemeSettings>) => {
    setSaving(true);
    try {
      const res = await settingsService.updateThemeSettings(data);
      if (res.success) setTheme(res.data);
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { theme, loading, error, saving, updateTheme, refresh: fetchTheme };
}

// ── API Keys Hook ─────────────────────────────────────────

export function useApiKeys(initialParams?: Partial<SettingsQueryParams>) {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialParams?.search || "");
  const [statusFilter, setStatusFilter] = useState(initialParams?.status || "all");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 10, total: 0,
  });

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getApiKeys({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (res.success && res.data) {
        setKeys(res.data.items);
        setPagination((prev) => ({ ...prev, ...res.data!.pagination }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const revokeKey = useCallback(async (keyId: string) => {
    await settingsService.revokeApiKey(keyId);
    setKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, status: "revoked" as const } : k)));
  }, []);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  }, []);

  const activeCount = useMemo(() => keys.filter((k) => k.status === "active").length, [keys]);

  return {
    keys, loading, error,
    search, setSearch,
    statusFilter, setStatusFilter,
    pagination, setPage, setPageSize,
    activeCount, revokeKey,
    refresh: fetchKeys,
  };
}

// ── Audit Logs Hook ──────────────────────────────────────

export function useAuditLogs(initialParams?: Partial<SettingsQueryParams>) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialParams?.search || "");
  const [actionFilter, setActionFilter] = useState(initialParams?.action || "all");
  const [entityFilter, setEntityFilter] = useState(initialParams?.entity || "all");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1, pageSize: 15, total: 0,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getAuditLogs({
        search: search || undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
        entity: entityFilter !== "all" ? entityFilter : undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      if (res.success && res.data) {
        setLogs(res.data.items);
        setPagination((prev) => ({ ...prev, ...res.data!.pagination }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, actionFilter, entityFilter, pagination.page, pagination.pageSize]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, page: 1, pageSize }));
  }, []);

  const uniqueActions = useMemo(
    () => [...new Set(logs.map((l) => l.action))],
    [logs]
  ) as string[];

  const uniqueEntities = useMemo(
    () => [...new Set(logs.map((l) => l.entity))],
    [logs]
  ) as string[];

  return {
    logs, loading, error,
    search, setSearch,
    actionFilter, setActionFilter,
    entityFilter, setEntityFilter,
    pagination, setPage, setPageSize,
    uniqueActions, uniqueEntities,
    refresh: fetchLogs,
  };
}

// ── System Configs Hook ──────────────────────────────────

export function useSystemConfigs(initialParams?: Partial<SettingsQueryParams>) {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(initialParams?.category || "all");
  const [search, setSearch] = useState(initialParams?.search || "");

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getSystemConfigs({
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        search: search || undefined,
      });
      if (res.success && res.data) setConfigs(res.data.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load configs");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, search]);

  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const updateConfig = useCallback(async (data: UpdateConfigFormData): Promise<boolean> => {
    try {
      const res = await settingsService.updateSystemConfig(data);
      if (res.success) {
        setConfigs((prev) =>
          prev.map((c) =>
            c.key === data.key ? { ...c, value: data.value, updatedAt: new Date().toISOString() } : c
          )
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    configs, loading, error,
    categoryFilter, setCategoryFilter,
    search, setSearch,
    updateConfig,
    refresh: fetchConfigs,
  };
}

// ── Payment Settings Hook ─────────────────────────────────

export function usePaymentSettings() {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getPaymentMethods();
      if (res.success) setMethods(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  const toggleMethod = useCallback(async (methodId: string, enabled: boolean) => {
    setMethods((prev) => prev.map((m) => (m.id === methodId ? { ...m, enabled } : m)));
    await settingsService.togglePaymentMethod(methodId, enabled);
  }, []);

  const enabledCount = useMemo(() => methods.filter((m) => m.enabled).length, [methods]);

  return { methods, loading, error, enabledCount, toggleMethod, refresh: fetchMethods };
}

// ── GST / Tax Settings Hook ──────────────────────────────

export function useGstSettings() {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [gstReturns, setGstReturns] = useState<GstReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [taxRes, gstRes] = await Promise.all([
        settingsService.getTaxRates(),
        settingsService.getGstReturns(),
      ]);
      if (taxRes.success) setTaxRates(taxRes.data);
      if (gstRes.success) setGstReturns(gstRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tax data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { taxRates, gstReturns, loading, error, refresh: fetchData };
}

// ── Notification Settings Hook ────────────────────────────

export function useNotificationSettings() {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [eventMappings, setEventMappings] = useState<NotificationEventMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [channelRes, mappingRes] = await Promise.all([
        settingsService.getNotificationChannels(),
        settingsService.getNotificationEventMappings(),
      ]);
      if (channelRes.success) setChannels(channelRes.data);
      if (mappingRes.success) setEventMappings(mappingRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notification settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleChannel = useCallback(async (channelName: string, enabled: boolean) => {
    setChannels((prev) => prev.map((c) => (c.name === channelName ? { ...c, enabled } : c)));
    await settingsService.toggleNotificationChannel(channelName, enabled);
  }, []);

  return { channels, eventMappings, loading, error, toggleChannel, refresh: fetchData };
}

// ── Global Settings Hook ──────────────────────────────────

export function useGlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await settingsService.getGlobalSettings();
      if (res.success) setSettings(res.data);
      else setError(res.error || "Failed to load global settings");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load global settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateSettings = useCallback(async (data: GlobalSettings) => {
    setSaving(true);
    setError(null);
    try {
      const res = await settingsService.updateGlobalSettings(data);
      if (res.success) {
        setSettings(res.data);
        return true;
      } else {
        setError(res.error || "Failed to update global settings");
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update global settings");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, loading, error, saving, updateSettings, refresh: fetchSettings };
}
