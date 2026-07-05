"use client";

import { useState, useEffect, useCallback } from "react";
import { profileService } from "@/services/profile.service";
import type {
  AdminProfile,
  LoginSession,
  ActivityLogEntry,
  AdminSecuritySettings,
  AdminNotificationPrefs,
  ProfileStats,
} from "@/types/admin-profile";

// ── Hook ──────────────────────────────────────────────────

export function useAdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [security, setSecurity] = useState<AdminSecuritySettings | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<AdminNotificationPrefs | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activityPage, setActivityPage] = useState(1);

  // ── Fetch all initial data ──────────────────────────────

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [p, s, sec, np, st] = await Promise.all([
        profileService.getProfile(),
        profileService.getLoginSessions(),
        profileService.getSecuritySettings(),
        profileService.getNotificationPrefs(),
        profileService.getProfileStats(),
      ]);
      setProfile(p);
      setSessions(s);
      setSecurity(sec);
      setNotifPrefs(np);
      setStats(st);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Fetch activity log ──────────────────────────────────

  const fetchActivityLog = useCallback(async (pageNum: number) => {
    setActivityLoading(true);
    try {
      const result = await profileService.getActivityLog(pageNum, 10);
      setActivityLog(result.entries);
      setActivityTotal(result.total);
      setActivityPage(result.page);
    } catch {
      // silent fail for activity
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityLog(1);
  }, [fetchActivityLog]);

  // ── Profile update ──────────────────────────────────────

  const updateProfile = useCallback(
    async (data: { name?: string; phone?: string; bio?: string; location?: string; timezone?: string }) => {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      return updated;
    },
    []
  );

  // ── Password change ─────────────────────────────────────

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string, confirmPassword: string) => {
      return profileService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
    },
    []
  );

  // ── MFA Update ──────────────────────────────────────────

  const updateMFA = useCallback(
    async (enabled: boolean, method: "app" | "sms" | "email" | null) => {
      const updated = await profileService.setupMFA({ enabled, method });
      setSecurity(updated);
      return updated;
    },
    []
  );

  // ── Session management ──────────────────────────────────

  const terminateSession = useCallback(
    async (sessionId: string) => {
      await profileService.terminateSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    },
    []
  );

  const terminateOtherSessions = useCallback(async () => {
    await profileService.terminateOtherSessions();
    setSessions((prev) => prev.filter((s) => s.isCurrent));
  }, []);

  // ── API key rotation ────────────────────────────────────

  const rotateApiKey = useCallback(async () => {
    const newKey = await profileService.rotateApiKey();
    setSecurity((prev) =>
      prev ? { ...prev, apiKey: newKey, apiKeyLastRotated: new Date().toISOString() } : prev
    );
    return newKey;
  }, []);

  // ── Notification preferences ────────────────────────────

  const updateNotifPrefs = useCallback(
    async (prefs: Partial<AdminNotificationPrefs>) => {
      const updated = await profileService.updateNotificationPrefs(prefs);
      setNotifPrefs(updated);
      return updated;
    },
    []
  );

  // ── Activity pagination ─────────────────────────────────

  const loadMoreActivity = useCallback(async () => {
    const nextPage = activityPage + 1;
    await fetchActivityLog(nextPage);
  }, [activityPage, fetchActivityLog]);

  return {
    // Data
    profile,
    sessions,
    activityLog,
    activityTotal,
    activityPage,
    security,
    notifPrefs,
    stats,
    loading,
    activityLoading,
    error,
    // Actions
    updateProfile,
    changePassword,
    updateMFA,
    terminateSession,
    terminateOtherSessions,
    rotateApiKey,
    updateNotifPrefs,
    loadMoreActivity,
    refresh: fetchAll,
  };
}
