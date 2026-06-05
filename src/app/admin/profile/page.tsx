"use client";

import { useState } from "react";
import DashboardLayout from "../dashboard-layout";
import { useAdminProfile } from "@/hooks/use-admin-profile";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Shield,
  Key,
  Smartphone,
  Monitor,
  Tablet,
  LogOut,
  CheckCheck,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Loader2,
  Activity,
  Terminal,
  Globe,
  Calendar,
  Bell,
  BellRing,
  Mail as MailIcon,
  MessageSquare,
  AlertTriangle,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";

// -- Profile Tab Config ------------------------------------

const profileTabs = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "security", label: "Security & Auth", icon: Shield },
  { id: "sessions", label: "Active Sessions", icon: Monitor },
  { id: "activity", label: "Activity Log", icon: Activity },
  { id: "preferences", label: "Notifications", icon: Bell },
];

// -- Helper: Device Icon -----------------------------------

function DeviceIcon({ type }: { type: string }) {
  const icons: Record<string, typeof Monitor> = {
    desktop: Monitor,
    mobile: Smartphone,
    tablet: Tablet,
  };
  const Icon = icons[type] || Monitor;
  return <Icon className="h-4 w-4" />;
}

// -- Helper: Truncate Key ----------------------------------

function truncateKey(key: string): string {
  if (key.length <= 16) return key;
  return `${key.slice(0, 12)}₹${key.slice(-4)}`;
}

// -- Main Page ---------------------------------------------

export default function ProfilePage() {
  const {
    profile,
    sessions,
    activityLog,
    activityTotal,
    security,
    notifPrefs,
    stats,
    loading,
    activityLoading,
    error,
    updateProfile,
    changePassword,
    updateMFA,
    terminateSession,
    terminateOtherSessions,
    rotateApiKey,
    updateNotifPrefs,
    loadMoreActivity,
  } = useAdminProfile();

  const [activeTab, setActiveTab] = useState("personal");

  // -- Edit Profile Modal ----------------------------------
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    bio: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);

  const openEditModal = () => {
    if (!profile) return;
    setEditForm({
      name: profile.name,
      phone: profile.phone || "",
      bio: profile.bio || "",
      location: profile.location || "",
    });
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile(editForm);
      toast.success("Profile updated successfully");
      setShowEditModal(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // -- Password Change Modal -------------------------------
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });
  const [showNewPass, setShowNewPass] = useState(false);

  const handleChangePassword = async () => {
    if (passwordForm.newPass !== passwordForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setSaving(true);
    try {
      await changePassword(
        passwordForm.current,
        passwordForm.newPass,
        passwordForm.confirm
      );
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordForm({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  // -- MFA Toggle ------------------------------------------
  const [showMFAModal, setShowMFAModal] = useState(false);

  const handleMFAToggle = async () => {
    if (!security) return;
    try {
      await updateMFA(!security.mfaEnabled, !security.mfaEnabled ? "app" : null);
      toast.success(
        `Two-factor authentication ${security.mfaEnabled ? "disabled" : "enabled"}`
      );
    } catch {
      toast.error("Failed to update MFA settings");
    }
  };

  // -- API Key Rotate --------------------------------------
  const [rotatingKey, setRotatingKey] = useState(false);

  const handleRotateKey = async () => {
    setRotatingKey(true);
    try {
      const newKey = await rotateApiKey();
      toast.success("API key rotated successfully");
      navigator.clipboard?.writeText(newKey);
    } catch {
      toast.error("Failed to rotate API key");
    } finally {
      setRotatingKey(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#0c831f]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#fef2f2] bg-white p-12">
          <AlertTriangle className="h-10 w-10 text-[#dc2626]" />
          <p className="mt-4 text-lg font-black text-[#1a1a1a]">Failed to load profile</p>
          <p className="text-sm text-[#666]">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        {/* -- Header / Profile Card ------------------------- */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
          <div className="relative h-24 rounded-t-2xl bg-gradient-to-r from-[#0c831f] to-[#0a6a18] sm:h-32" />
          <div className="relative px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4 -mt-12 sm:-mt-16">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-[#0c831f] text-xl font-bold text-white shadow-lg sm:h-24 sm:w-24 sm:text-3xl">
                  {profile.avatarInitials}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#1a1a1a] sm:text-2xl">
                      {profile.name}
                    </h1>
                    <StatusBadge status={profile.status} size="sm" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-[#666]">
                    <span className="font-bold text-[#0c831f]">
                      {profile.roleLabel}
                    </span>
                    {profile.team && (
                      <>
                        <span className="text-[#ccc]">₹</span>
                        <span>{profile.team}</span>
                      </>
                    )}
                    {profile.location && (
                      <>
                        <span className="text-[#ccc]">₹</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {profile.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={openEditModal}
                className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]"
              >
                <User className="h-4 w-4" />
                Edit Profile
              </button>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-4 max-w-2xl text-sm text-[#666]">{profile.bio}</p>
            )}
          </div>
        </section>

        {/* -- Stats Cards ---------------------------------- */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Orders Processed", value: stats.totalOrdersProcessed, icon: Activity },
              { label: "Revenue Managed", value: `?${(stats.totalRevenueManaged / 10000000).toFixed(1)}Cr`, icon: Activity },
              { label: "Active Sessions", value: stats.activeSessions, icon: Monitor },
              { label: "Days on Platform", value: stats.daysSinceJoined, icon: Calendar },
              { label: "Login Streak", value: `${stats.loginStreak}d`, icon: Clock },
              { label: "Actions Today", value: stats.actionsToday, icon: Terminal },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="rounded-xl border border-[#e8e8e8] bg-white p-3 shadow-sm"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-lg font-black text-[#1a1a1a]">{item.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* -- Tabs ----------------------------------------- */}
        <div className="flex flex-wrap gap-1 rounded-2xl border border-[#e8e8e8] bg-white p-1 shadow-sm">
          {profileTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all sm:px-4 ${
                  activeTab === tab.id
                    ? "bg-[#0c831f] text-white shadow-sm"
                    : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* -- Tab Content ---------------------------------- */}

        {/* ---- PERSONAL INFO -------------------------- */}
        {activeTab === "personal" && (
          <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
                Profile
              </p>
              <h3 className="text-sm font-black text-[#1a1a1a]">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#999]">
                  Full Name
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 py-2.5">
                  <User className="h-4 w-4 text-[#999]" />
                  <span className="text-sm font-semibold text-[#1a1a1a]">
                    {profile.name}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#999]">
                  Email Address
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 py-2.5">
                  <Mail className="h-4 w-4 text-[#999]" />
                  <span className="text-sm font-semibold text-[#1a1a1a]">
                    {profile.email}
                  </span>
                  {profile.emailVerified && (
                    <CheckCheck className="ml-auto h-4 w-4 text-[#0c831f]" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#999]">
                  Phone
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 py-2.5">
                  <Phone className="h-4 w-4 text-[#999]" />
                  <span className="text-sm font-semibold text-[#1a1a1a]">
                    {profile.phone || "₹"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#999]">
                  Role
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 py-2.5">
                  <Shield className="h-4 w-4 text-[#999]" />
                  <span className="text-sm font-semibold text-[#1a1a1a]">
                    {profile.roleLabel}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#999]">
                  Location
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 py-2.5">
                  <MapPin className="h-4 w-4 text-[#999]" />
                  <span className="text-sm font-semibold text-[#1a1a1a]">
                    {profile.location || "₹"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#999]">
                  Timezone
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-3 py-2.5">
                  <Globe className="h-4 w-4 text-[#999]" />
                  <span className="text-sm font-semibold text-[#1a1a1a]">
                    {profile.timezone}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={openEditModal}
                className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]"
              >
                <Save className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        )}

        {/* ---- SECURITY & AUTH ------------------------ */}
        {activeTab === "security" && (
          <div className="space-y-4">
            {/* MFA */}
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
                  Security
                </p>
                <h3 className="text-sm font-black text-[#1a1a1a]">
                  Two-Factor Authentication
                </h3>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      security?.mfaEnabled
                        ? "bg-[#e8f5e9] text-[#0c831f]"
                        : "bg-[#f6f7f6] text-[#999]"
                    }`}
                  >
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      {security?.mfaEnabled ? "Enabled" : "Not Set Up"}
                    </p>
                    <p className="text-xs text-[#666]">
                      {security?.mfaEnabled
                        ? `Using ${security.mfaMethod === "app" ? "Authenticator App" : security.mfaMethod}`
                        : "Add an extra layer of security to your account"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleMFAToggle}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                    security?.mfaEnabled
                      ? "border border-[#dc2626] text-[#dc2626] hover:bg-[#fef2f2]"
                      : "bg-[#0c831f] text-white hover:bg-[#0a6a18]"
                  }`}
                >
                  {security?.mfaEnabled ? (
                    <>
                      <X className="h-4 w-4" /> Disable 2FA
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4" /> Enable 2FA
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4">
                <h3 className="text-sm font-black text-[#1a1a1a]">Password</h3>
                <p className="text-xs text-[#666]">
                  Last changed: {security?.passwordLastChanged
                    ? new Date(security.passwordLastChanged).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Never"}
                  {security?.passwordExpiresAt && (
                    <> ₹ Expires: {new Date(security.passwordExpiresAt).toLocaleDateString("en-IN")}</>
                  )}
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]"
              >
                <Key className="h-4 w-4" />
                Change Password
              </button>
            </div>

            {/* API Key */}
            {security && (
              <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-[#1a1a1a]">API Key</h3>
                  <p className="text-xs text-[#666]">
                    Last rotated: {security.apiKeyLastRotated
                      ? new Date(security.apiKeyLastRotated).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Never"}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <code className="flex-1 rounded-xl border border-[#e8e8e8] bg-[#f6f7f6] px-3 py-2.5 text-xs font-mono text-[#666]">
                    {truncateKey(security.apiKey || "")}
                  </code>
                  <button
                    onClick={handleRotateKey}
                    disabled={rotatingKey}
                    className="flex items-center gap-2 rounded-xl border border-[#d97706] px-4 py-2.5 text-sm font-bold text-[#d97706] hover:bg-[#fffbeb] disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${rotatingKey ? "animate-spin" : ""}`} />
                    Rotate Key
                  </button>
                </div>
              </div>
            )}

            {/* Session Timeout */}
            {security && (
              <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-[#1a1a1a]">Session Settings</h3>
                  <p className="text-xs text-[#666]">
                    Auto-logout after inactivity
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#666]">Timeout:</span>
                  <span className="rounded-xl bg-[#f6f7f6] px-3 py-1.5 text-sm font-bold text-[#1a1a1a]">
                    {security.sessionTimeout} minutes
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- ACTIVE SESSIONS ------------------------ */}
        {activeTab === "sessions" && (
          <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
                  Devices
                </p>
                <h3 className="text-sm font-black text-[#1a1a1a]">
                  Active Sessions ({sessions.length})
                </h3>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={terminateOtherSessions}
                  className="flex items-center gap-2 rounded-xl border border-[#dc2626] px-3 py-2 text-xs font-bold text-[#dc2626] hover:bg-[#fef2f2]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log Out Others
                </button>
              )}
            </div>

            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`rounded-xl border p-4 transition-all ${
                    session.isCurrent
                      ? "border-[#0c831f]/30 bg-[#f0fdf4]"
                      : "border-[#e8e8e8] hover:border-[#ccc]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          session.isCurrent
                            ? "bg-[#e8f5e9] text-[#0c831f]"
                            : "bg-[#f6f7f6] text-[#999]"
                        }`}
                      >
                        <DeviceIcon type={session.deviceType} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1a1a1a]">
                            {session.deviceName}
                          </span>
                          {session.isCurrent && (
                            <span className="rounded-full bg-[#0c831f]/10 px-2 py-0.5 text-[10px] font-bold text-[#0c831f]">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#666]">
                          {session.browser} ₹ {session.os}
                        </p>
                        <p className="text-xs text-[#999]">
                          {session.location} ₹ IP: {session.ip}
                        </p>
                        <p className="mt-1 text-[10px] text-[#999]">
                          Last active: {new Date(session.lastActiveAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <button
                        onClick={() => terminateSession(session.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#999] hover:bg-[#fef2f2] hover:text-[#dc2626]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- ACTIVITY LOG ---------------------------- */}
        {activeTab === "activity" && (
          <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
                History
              </p>
              <h3 className="text-sm font-black text-[#1a1a1a]">
                Activity Log ({activityTotal} entries)
              </h3>
            </div>

            {activityLoading && activityLog.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#0c831f]" />
              </div>
            ) : activityLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Activity className="h-8 w-8 text-[#ccc]" />
                <p className="mt-2 text-sm text-[#999]">No activity recorded yet</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-[#e8e8e8]" />

                <div className="space-y-0">
                  {activityLog.map((entry, idx) => (
                    <div key={entry.id} className="relative flex items-start gap-4 pb-5">
                      {/* Dot */}
                      <div
                        className={`relative z-10 mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                          entry.status === "success"
                            ? "bg-[#e8f5e9] text-[#0c831f]"
                            : entry.status === "failure"
                            ? "bg-[#fef2f2] text-[#dc2626]"
                            : "bg-[#fffbeb] text-[#d97706]"
                        }`}
                      >
                        <Activity className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#1a1a1a]">
                          {entry.action}
                        </p>
                        <p className="text-xs text-[#666]">{entry.description}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-[#999]">
                          <span>
                            {new Date(entry.createdAt).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {entry.ip && (
                            <>
                              <span>₹</span>
                              <span>IP: {entry.ip}</span>
                            </>
                          )}
                          {entry.resource && (
                            <>
                              <span>₹</span>
                              <span>{entry.resource}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {activityLog.length < activityTotal && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={loadMoreActivity}
                      disabled={activityLoading}
                      className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] px-4 py-2 text-xs font-bold text-[#666] hover:bg-[#f6f7f6] disabled:opacity-50"
                    >
                      {activityLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Load More
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ---- NOTIFICATION PREFERENCES --------------- */}
        {activeTab === "preferences" && (
          <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
                Preferences
              </p>
              <h3 className="text-sm font-black text-[#1a1a1a]">
                Notification Settings
              </h3>
            </div>

            {notifPrefs && (
              <div className="space-y-4">
                {/* Channels */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#999]">
                    Channels
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        key: "emailNotifications",
                        label: "Email Notifications",
                        desc: "Receive notifications via email",
                        icon: MailIcon,
                      },
                      {
                        key: "pushNotifications",
                        label: "Push Notifications",
                        desc: "Browser and in-app push alerts",
                        icon: BellRing,
                      },
                      {
                        key: "smsNotifications" as const,
                        label: "SMS Notifications",
                        desc: "Critical alerts via SMS",
                        icon: MessageSquare,
                      },
                    ].map((channel) => {
                      const Icon = channel.icon;
                      const isEnabled = notifPrefs[channel.key as keyof typeof notifPrefs];
                      return (
                        <div
                          key={channel.key}
                          className="flex items-center justify-between rounded-xl border border-[#e8e8e8] p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f6f7f6] text-[#666]">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#1a1a1a]">
                                {channel.label}
                              </p>
                              <p className="text-xs text-[#999]">{channel.desc}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={!!isEnabled}
                              onChange={() =>
                                updateNotifPrefs({
                                  [channel.key]: !isEnabled,
                                })
                              }
                              className="peer sr-only"
                            />
                            <div className="h-6 w-11 rounded-full bg-[#e8e8e8] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#0c831f] peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alert Types */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#999]">
                    Alert Categories
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        key: "orderAlerts",
                        label: "Order Alerts",
                        desc: "New orders, cancellations, returns",
                      },
                      {
                        key: "inventoryAlerts",
                        label: "Inventory Alerts",
                        desc: "Low stock, expiring batches, transfers",
                      },
                      {
                        key: "systemAlerts",
                        label: "System Alerts",
                        desc: "Server health, errors, maintenance",
                      },
                      {
                        key: "marketingEmails",
                        label: "Marketing Emails",
                        desc: "Promotional and campaign updates",
                      },
                    ].map((alert) => {
                      const isEnabled = notifPrefs[alert.key as keyof typeof notifPrefs];
                      return (
                        <div
                          key={alert.key}
                          className="flex items-center justify-between rounded-xl border border-[#e8e8e8] p-3"
                        >
                          <div>
                            <p className="text-sm font-bold text-[#1a1a1a]">
                              {alert.label}
                            </p>
                            <p className="text-xs text-[#999]">{alert.desc}</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input
                              type="checkbox"
                              checked={!!isEnabled}
                              onChange={() =>
                                updateNotifPrefs({
                                  [alert.key]: !isEnabled,
                                })
                              }
                              className="peer sr-only"
                            />
                            <div className="h-6 w-11 rounded-full bg-[#e8e8e8] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#0c831f] peer-checked:after:translate-x-full" />
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Digest Frequency */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#999]">
                    Email Digest
                  </p>
                  <select
                    value={notifPrefs.digestFrequency}
                    onChange={(e) =>
                      updateNotifPrefs({
                        digestFrequency: e.target.value as "never" | "daily" | "weekly",
                      })
                    }
                    className="w-full rounded-xl border border-[#e8e8e8] bg-white px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] sm:w-48"
                  >
                    <option value="never">Never</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* -- Edit Profile Modal --------------------------- */}
      <ReusableModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Full Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Phone</label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Location</label>
            <input
              type="text"
              value={editForm.location}
              onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Bio</label>
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-[#e8e8e8] bg-white px-3 py-2.5 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowEditModal(false)}
              className="rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
          </div>
        </div>
      </ReusableModal>

      {/* -- Change Password Modal ----------------------- */}
      <ReusableModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Current Password</label>
            <input
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm((f) => ({ ...f, current: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">New Password</label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm((f) => ({ ...f, newPass: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 pr-10 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              />
              <button
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1a1a1a]"
              >
                {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm((f) => ({ ...f, confirm: e.target.value }))}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            />
            {passwordForm.confirm && passwordForm.newPass !== passwordForm.confirm && (
              <p className="mt-1 text-[10px] text-[#dc2626]">Passwords do not match</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
            >
              Cancel
            </button>
            <button
              onClick={handleChangePassword}
              disabled={saving || !passwordForm.current || !passwordForm.newPass || !passwordForm.confirm}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Key className="h-4 w-4" />
              )}
              Update Password
            </button>
          </div>
        </div>
      </ReusableModal>
    </DashboardLayout>
  );
}

