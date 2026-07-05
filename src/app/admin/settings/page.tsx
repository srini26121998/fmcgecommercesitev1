"use client";

import { useState } from "react";
import DashboardLayout from "../dashboard-layout";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import {
  Settings,
  User,
  Shield,
  CreditCard,
  FileText,
  Bell,
  Flag,
  Save,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useGlobalSettings, useFeatureFlags } from "@/hooks/use-settings";

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
}

// Removed mockFlags

const settingsTabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "users", label: "Users & Roles", icon: Shield },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "tax", label: "GST / Tax", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "features", label: "Feature Flags", icon: Flag },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [showFeatureModal, setShowFeatureModal] = useState<FeatureFlag | null>(null);
  
  const { settings, loading, saving, updateSettings } = useGlobalSettings();
  const { flags, toggleFlag } = useFeatureFlags();

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Settings</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Configuration</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                Manage user permissions, payment settings, GST configuration, notifications, and feature flags.
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]">
              <RefreshCw className="h-4 w-4" />
              Sync Settings
            </button>
          </div>
        </section>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 rounded-2xl border border-[#e8e8e8] bg-white p-1.5 shadow-sm">
          {settingsTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#0c831f] text-white shadow-sm"
                    : "text-[#666] hover:bg-[#f6f7f6] hover:text-[#1a1a1a]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          {activeTab === "general" && (
            <form 
              className="space-y-5"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  storeName: formData.get("storeName") as string,
                  supportEmail: formData.get("supportEmail") as string,
                  supportPhone: formData.get("supportPhone") as string,
                  currency: formData.get("currency") as string,
                  timezone: formData.get("timezone") as string,
                  deliveryRadiusKm: Number(formData.get("deliveryRadiusKm")),
                };
                const success = await updateSettings(data);
                if (success) toast.success("Settings saved successfully");
              }}
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Store</p>
                <h3 className="text-sm font-black text-[#1a1a1a]">General Settings</h3>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-[#0c831f]" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      { label: "Store Name", name: "storeName", value: settings?.storeName || "", type: "text" },
                      { label: "Support Email", name: "supportEmail", value: settings?.supportEmail || "", type: "email" },
                      { label: "Support Phone", name: "supportPhone", value: settings?.supportPhone || "", type: "text" },
                      { label: "Currency", name: "currency", value: settings?.currency || "INR (₹)", type: "text", disabled: true },
                      { label: "Timezone", name: "timezone", value: settings?.timezone || "Asia/Kolkata (IST)", type: "text", disabled: true },
                      { label: "Delivery Radius (km)", name: "deliveryRadiusKm", value: settings?.deliveryRadiusKm || "", type: "number" },
                    ].map((field) => (
                      <div key={field.label}>
                        <label className="mb-1.5 block text-xs font-bold text-[#666]">{field.label}</label>
                        <input
                          name={field.name}
                          type={field.type || "text"}
                          defaultValue={field.value}
                          disabled={field.disabled}
                          className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#999] focus:border-[#0c831f] disabled:cursor-not-allowed disabled:bg-[#f6f7f6] disabled:text-[#999]"
                        />
                        {/* Add hidden inputs for disabled fields so they are included in FormData */}
                        {field.disabled && (
                          <input type="hidden" name={field.name} value={field.value} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-70">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </form>
          )}

          {activeTab === "payment" && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Payments</p>
                <h3 className="text-sm font-black text-[#1a1a1a]">Payment Gateway Settings</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { label: "Payment Gateway", value: "Razorpay" },
                  { label: "Gateway Commission (%)", value: "2.0" },
                  { label: "Minimum COD Amount (?)", value: "500" },
                  { label: "Maximum COD Amount (?)", value: "5000" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="mb-1.5 block text-xs font-bold text-[#666]">{field.label}</label>
                    <input type="text" defaultValue={field.value} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-[#f9fafb] p-4">
                <p className="text-xs font-bold text-[#666] mb-2">Enabled Payment Methods</p>
                <div className="flex flex-wrap gap-2">
                  {["UPI", "Credit Card", "Debit Card", "Net Banking", "COD", "Wallet"].map((m) => (
                    <span key={m} className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f5e9] px-3 py-1.5 text-xs font-bold text-[#0c831f]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0c831f]" />
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "tax" && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Tax</p>
                <h3 className="text-sm font-black text-[#1a1a1a]">GST Configuration</h3>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  { label: "GSTIN", value: "27AAOFH1234H1Z5" },
                  { label: "PAN", value: "AAOFH1234H" },
                  { label: "Default Tax Rate (%)", value: "5" },
                  { label: "HSN Code", value: "2106" },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="mb-1.5 block text-xs font-bold text-[#666]">{field.label}</label>
                    <input type="text" defaultValue={field.value} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]" />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={() => toast.success("Tax settings saved")} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
                  <Save className="h-4 w-4" />
                  Update GST Info
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Alerts</p>
                <h3 className="text-sm font-black text-[#1a1a1a]">Notification Channels</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Push Notifications", desc: "Browser and in-app push alerts", enabled: true },
                  { label: "Email Notifications", desc: "Transactional and marketing emails", enabled: true },
                  { label: "SMS Alerts", desc: "Order updates and OTP messages", enabled: true },
                  { label: "Low Stock Alerts", desc: "Notify when stock falls below threshold", enabled: true },
                  { label: "Vendor Payout Alerts", desc: "Daily payment reconciliation reports", enabled: false },
                  { label: "System Health Reports", desc: "Weekly infrastructure and uptime reports", enabled: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#e8e8e8] p-4">
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{item.label}</p>
                      <p className="text-xs text-[#999]">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked={item.enabled} className="peer sr-only" />
                      <div className="h-6 w-11 rounded-full bg-[#e8e8e8] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#0c831f] peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Features</p>
                <h3 className="text-sm font-black text-[#1a1a1a]">Feature Flags</h3>
              </div>
              <div className="space-y-2">
                {flags.map((flag) => (
                  <div key={flag.id} className="flex items-center justify-between rounded-xl border border-[#e8e8e8] p-4 transition-all hover:border-[#0c831f]/30">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1a1a1a]">{flag.name}</span>
                        <span className="rounded-full bg-[#f6f7f6] px-2 py-0.5 text-[10px] font-mono text-[#999]">{flag.key}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#999]">{flag.description}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center ml-4">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={flag.enabled}
                        onChange={(e) => {
                          toggleFlag(flag.id, e.target.checked);
                          toast.success(`${flag.name} ${e.target.checked ? "enabled" : "disabled"}`);
                        }}
                      />
                      <div className="h-6 w-11 rounded-full bg-[#e8e8e8] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#0c831f] peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Security</p>
                <h3 className="text-sm font-black text-[#1a1a1a]">User Management & Roles</h3>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#e8e8e8]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f9fafb] text-left text-[10px] font-black uppercase tracking-wide text-[#666]">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e8e8e8]">
                    {[
                      { name: "Super Admin", email: "admin@fmcg.com", role: "Super Admin", status: "active", lastLogin: "2026-05-24 09:15" },
                      { name: "Rohit Sharma", email: "rohit@fmcg.com", role: "Inventory Manager", status: "active", lastLogin: "2026-05-24 08:30" },
                      { name: "Priya Patel", email: "priya@fmcg.com", role: "Order Manager", status: "active", lastLogin: "2026-05-23 18:45" },
                      { name: "Amit Verma", email: "amit@fmcg.com", role: "Vendor Manager", status: "inactive", lastLogin: "2026-05-15 11:00" },
                      { name: "Neha Singh", email: "neha@fmcg.com", role: "Support Agent", status: "active", lastLogin: "2026-05-24 10:00" },
                    ].map((user) => (
                      <tr key={user.email} className="text-sm hover:bg-[#f9fafb]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c831f]/10 text-xs font-black text-[#0c831f]">{user.name.split(" ").map(n => n[0]).join("")}</div>
                            <div><span className="font-bold text-[#1a1a1a]">{user.name}</span><span className="block text-[10px] text-[#999]">{user.email}</span></div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#666]">{user.role}</td>
                        <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                        <td className="px-4 py-3 text-xs text-[#999]">{user.lastLogin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

