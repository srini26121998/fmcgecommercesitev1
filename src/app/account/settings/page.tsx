"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Bell, Globe, Moon, Shield, ChevronRight, Smartphone, Eye, Users, CreditCard, Gift, RotateCcw, Check, Info } from "lucide-react";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { useLanguageStore, SUPPORTED_LANGUAGES } from "@/store/language-store";
import { useAuthStore } from "@/store/auth-store";

const settingsGroups = [
  {
    title: "Notifications & Preferences",
    items: [
      { name: "Notifications", href: "/account/settings/notifications", icon: Bell, desc: "Push, WhatsApp, and in-app alerts", color: "text-[#1565c0]", bgColor: "bg-[#e3f2fd]", badge: "On" },
      { name: "Appearance", href: "#", icon: Moon, desc: "Dark mode, theme preferences", color: "text-[#7b1fa2]", bgColor: "bg-[#f3e5f5]", badge: "Light" },
    ],
  },
  {
    title: "Rewards & Benefits",
    items: [
      { name: "Rewards & Referrals", href: "/account/referral", icon: Gift, desc: "Loyalty tiers, cashback, referral earnings", color: "text-[#ff4f8b]", bgColor: "bg-[#fff0f6]", badge: undefined },
      { name: "Returns & Refunds", href: "/account/returns", icon: RotateCcw, desc: "Track return requests and refunds", color: "text-[#e65100]", bgColor: "bg-[#fff3e0]", badge: undefined },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      { name: "Privacy Settings", href: "#", icon: Eye, desc: "Manage your data and privacy", color: "text-[#e65100]", bgColor: "bg-[#fff3e0]", badge: undefined },
      { name: "Security", href: "#", icon: Shield, desc: "Password, 2FA, login activity", color: "text-[#c62828]", bgColor: "bg-[#ffebee]", badge: undefined },
      { name: "Saved Cards & UPI", href: "/account/payment", icon: CreditCard, desc: "Manage payment methods", color: "text-[#546e7a]", bgColor: "bg-[#eceff1]", badge: undefined },
    ],
  },
  {
    title: "General",
    items: [
      { name: "Linked Accounts", href: "#", icon: Users, desc: "Google, Facebook, Apple sign-in", color: "text-[#00838f]", bgColor: "bg-[#e0f7fa]", badge: undefined },
      { name: "Mobile & Data", href: "#", icon: Smartphone, desc: "Mobile data, Wi-Fi preferences", color: "text-[#2e7d32]", bgColor: "bg-[#e8f5e9]", badge: undefined },
    ],
  },
];

export default function SettingsPage() {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showLanguagePanel, setShowLanguagePanel] = useState(false);
  const { language, setLanguage } = useLanguageStore();
  const { linkedSocials } = useAuthStore();

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language)!;

  const handleSave = (setting: string, value: string | boolean) => {
    toast.success(`${setting} updated successfully!`, {
      description: `Changed to: ${value}`,
      duration: 2000,
      position: "top-center",
      className: "bg-gradient-to-r from-[#0c831f] to-[#10b981] text-white border-none",
    });
  };

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Account Settings</h1>
          </div>
          <span className="text-[10px] text-[#999]">{currentLang.nativeName}</span>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-6">
        {/* ── Language Section (prominent, inline) ── */}
        <div>
          <h2 className="text-base font-bold text-[#1a1a1a] mb-3 px-1 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#0c831f] inline-block" />
            Language
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden">
            <button
              onClick={() => setShowLanguagePanel(!showLanguagePanel)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-[#0c831f]" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-semibold text-sm text-[#1a1a1a] group-hover:text-[#ff4f8b] transition-colors">
                  App Language
                </h3>
                <p className="text-xs text-[#666] mt-0.5">
                  {currentLang.nativeName} — {currentLang.name}
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 text-[#ccc] group-hover:text-[#ff4f8b] transition-all flex-shrink-0 ${showLanguagePanel ? "rotate-90" : ""}`} />
            </button>

            {showLanguagePanel && (
              <div className="px-4 pb-4 border-t border-[#e8e8e8] pt-3">
                <p className="text-xs text-[#666] mb-3 flex items-center gap-1.5">
                  <Info className="w-3 h-3" />
                  Choose your preferred language for the app interface
                </p>
                <LanguageSwitcher />
              </div>
            )}
          </div>
        </div>

        {/* ── Other Settings Groups ── */}
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-base font-bold text-[#1a1a1a] mb-3 px-1 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#ff4f8b] inline-block" />
              {group.title}
            </h2>
            <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden divide-y divide-[#e8e8e8]">
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors group"
                >
                  <div className={`w-11 h-11 rounded-xl ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[#1a1a1a] group-hover:text-[#ff4f8b] transition-colors">{item.name}</h3>
                    <p className="text-xs text-[#666] mt-0.5">{item.desc}</p>
                  </div>
                  {item.badge && (
                    <span
                      className="text-xs font-semibold text-[#666] bg-[#f2f2f2] px-2.5 py-1 rounded-full flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (item.name === "Notifications") {
                          setNotificationEnabled(!notificationEnabled);
                          handleSave("Notifications", !notificationEnabled ? "On" : "Off");
                        } else if (item.name === "Appearance") {
                          setDarkMode(!darkMode);
                          handleSave("Theme", !darkMode ? "Dark Mode" : "Light Mode");
                        }
                      }}
                    >
                      {item.name === "Linked Accounts"
                        ? `${linkedSocials.length} linked`
                        : item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-[#ccc] group-hover:text-[#ff4f8b] transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* ── Save All Settings Button ── */}
        <button
          onClick={() => {
            handleSave("All account settings", "saved");
            toast.success("All settings saved! ✅", {
              description: "Your preferences have been updated.",
              duration: 3000,
              position: "top-center",
            });
          }}
          className="w-full bg-gradient-to-r from-[#ff4f8b] to-[#ff6b9d] text-white rounded-2xl py-4 font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] btn-press"
        >
          Save All Settings
        </button>

        <div className="text-center text-[10px] text-[#999] pt-2">
          FMCG Commerce v1.0 • App Version 3.2.1
        </div>
      </div>
    </main>
  );
}
