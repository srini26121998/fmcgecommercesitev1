"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Mail,
  Phone,
  Smartphone,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

// Inline store for communication preferences
interface CommPref {
  channel: "email" | "sms" | "push";
  topic: string;
  enabled: boolean;
}

interface CommPrefsStore {
  prefs: CommPref[];
  toggle: (channel: CommPref["channel"], topic: string) => void;
  enableAll: () => void;
  disableAll: () => void;
}

const DEFAULT_PREFS: CommPref[] = [
  { channel: "email", topic: "Order updates", enabled: true },
  { channel: "email", topic: "Promotional offers", enabled: true },
  { channel: "email", topic: "Account security alerts", enabled: true },
  { channel: "email", topic: "Weekly digest", enabled: false },
  { channel: "sms", topic: "Order updates", enabled: true },
  { channel: "sms", topic: "Delivery OTPs", enabled: true },
  { channel: "sms", topic: "Promotional SMS", enabled: false },
  { channel: "push", topic: "Order status changes", enabled: true },
  { channel: "push", topic: "Flash sales & deals", enabled: true },
  { channel: "push", topic: "Price drop alerts", enabled: true },
  { channel: "push", topic: "Recommendations", enabled: false },
  { channel: "push", topic: "Subscription reminders", enabled: true },
];

const useCommPrefsStore = create<CommPrefsStore>()(
  persist(
    (set) => ({
      prefs: DEFAULT_PREFS,
      toggle: (channel, topic) =>
        set((state) => ({
          prefs: state.prefs.map((p) =>
            p.channel === channel && p.topic === topic
              ? { ...p, enabled: !p.enabled }
              : p
          ),
        })),
      enableAll: () =>
        set((state) => ({
          prefs: state.prefs.map((p) => ({ ...p, enabled: true })),
        })),
      disableAll: () =>
        set((state) => ({
          prefs: state.prefs.map((p) => ({
            ...p,
            enabled:
              p.topic === "Account security alerts" ||
              p.topic === "Delivery OTPs" ||
              p.topic === "Order updates",
          })),
        })),
    }),
    { name: "fmcg-comm-prefs" }
  )
);

const CHANNEL_META = {
  email: { icon: <Mail className="w-4 h-4 text-[#0c831f]" />, label: "Email Notifications", color: "#0c831f" },
  sms: { icon: <Phone className="w-4 h-4 text-[#f59e0b]" />, label: "SMS Notifications", color: "#f59e0b" },
  push: { icon: <Smartphone className="w-4 h-4 text-[#7c3aed]" />, label: "Push Notifications", color: "#7c3aed" },
};

const ALWAYS_ON_TOPICS = new Set(["Account security alerts", "Delivery OTPs", "Order updates"]);

export default function NotificationPreferencesPage() {
  const { prefs, toggle, enableAll, disableAll } = useCommPrefsStore();
  const [isSaving, setIsSaving] = useState(false);
  const channels = (["email", "sms", "push"] as const);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Notification preferences saved!");
    setIsSaving(false);
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2]">
      <div className="bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] px-4 pt-8 pb-14 text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 text-white/70 text-xs mb-6">
            <Link href="/account" className="hover:text-white transition-colors">Account</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Notifications</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            <h1 className="text-xl font-black">Notification Preferences</h1>
          </div>
          <p className="text-white/70 text-xs mt-1">Control what alerts you receive and where</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 pb-20 space-y-4">
        <div className="flex gap-2">
          <button id="comm-enable-all-btn" onClick={() => { enableAll(); toast.success("All notifications enabled"); }}
            className="flex-1 py-2.5 rounded-xl border-2 border-[#0c831f] bg-[#e8f5e9] text-xs font-bold text-[#0c831f] flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Enable All
          </button>
          <button id="comm-disable-all-btn" onClick={() => { disableAll(); toast.success("Non-essential notifications disabled"); }}
            className="flex-1 py-2.5 rounded-xl border-2 border-[#e8e8e8] bg-white text-xs font-bold text-[#666] flex items-center justify-center gap-1">
            Disable Non-Essential
          </button>
        </div>

        {channels.map((channel) => {
          const meta = CHANNEL_META[channel];
          const channelPrefs = prefs.filter((p) => p.channel === channel);
          const enabledCount = channelPrefs.filter((p) => p.enabled).length;
          return (
            <section key={channel} className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e8e8e8]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: meta.color + "15" }}>
                  {meta.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-black text-[#1a1a1a]">{meta.label}</h2>
                  <p className="text-[10px] text-[#999]">{enabledCount}/{channelPrefs.length} enabled</p>
                </div>
              </div>
              <div className="divide-y divide-[#f5f5f5]">
                {channelPrefs.map((pref) => {
                  const isAlwaysOn = ALWAYS_ON_TOPICS.has(pref.topic);
                  return (
                    <div key={pref.topic} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{pref.topic}</p>
                        {isAlwaysOn && <p className="text-[10px] text-[#0c831f] font-bold">Always on (required)</p>}
                      </div>
                      <button
                        id={`comm-toggle-${channel}-${pref.topic.replace(/[\s&]/g, "-").toLowerCase()}`}
                        onClick={() => { if (!isAlwaysOn) toggle(channel, pref.topic); else toast.info("Required notification"); }}
                        disabled={isAlwaysOn}
                        className={isAlwaysOn ? "opacity-50 cursor-not-allowed" : ""}
                      >
                        {pref.enabled
                          ? <ToggleRight className="w-6 h-6" style={{ color: meta.color }} />
                          : <ToggleLeft className="w-6 h-6 text-[#ccc]" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <button id="comm-save-btn" onClick={handleSave} disabled={isSaving}
          className="w-full rounded-2xl bg-[#7c3aed] text-white font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          style={{ height: "52px" }}>
          {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Preferences</>}
        </button>
        <p className="text-center text-[10px] text-[#999]">Critical security and order notifications cannot be disabled.</p>
      </div>
    </main>
  );
}
