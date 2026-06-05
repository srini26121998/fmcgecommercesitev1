"use client";

import { useState, useEffect, useCallback } from "react";
import { useThemeSettings } from "@/hooks/use-settings";
import DashboardLayout from "../../dashboard-layout";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { ReusablePageHeader } from "@/components/common";
import { Palette, Monitor, Sun, Moon, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AnimatedLoader } from "@/components/ui/animated-loader";

const fontOptions = [
  { value: "inter", label: "Inter" },
  { value: "system", label: "System UI" },
  { value: "roboto", label: "Roboto" },
];

const borderRadiusOptions = [
  { value: "sm", label: "Small (4px)" },
  { value: "md", label: "Medium (8px)" },
  { value: "lg", label: "Large (12px)" },
];

const fontSizeOptions = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

export default function ThemeSettingsPage() {
  const { theme, loading, error, saving, updateTheme, refresh } = useThemeSettings();
  const [localTheme, setLocalTheme] = useState(theme);

  useEffect(() => {
    if (theme) setLocalTheme(theme);
  }, [theme]);

  const handleSave = useCallback(async () => {
    if (!localTheme) return;
    const success = await updateTheme(localTheme);
    if (success) {
      toast.success("Theme settings saved");
    } else {
      toast.error("Failed to save theme settings");
    }
  }, [localTheme, updateTheme]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-12">
          <AnimatedLoader />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <Palette className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-sm font-bold text-red-600">Failed to load theme settings</p>
          <p className="mt-1 text-xs text-red-400">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!localTheme) return null;

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <ReusablePageHeader
          breadcrumb="Settings"
          title="Theme Settings"
          subtitle="Customize the appearance of the admin panel to match your brand."
          actions={
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          }
        />

        {/* Theme Preview */}
        <div className="overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
          <div
            className="p-6 transition-all"
            style={{
              borderRadius: localTheme.borderRadius === "sm" ? "4px" : localTheme.borderRadius === "md" ? "8px" : "12px",
              fontFamily: localTheme.fontFamily === "inter"
                ? "'Inter', sans-serif"
                : localTheme.fontFamily === "roboto"
                ? "'Roboto', sans-serif"
                : "system-ui, sans-serif",
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide" style={{ color: localTheme.primaryColor }}>
                  Theme Preview
                </p>
                <h2 className="mt-1 text-xl font-bold text-[#1a1a1a]">Live Preview</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#f6f7f6] px-3 py-1 text-xs font-bold text-[#666]">
                  {localTheme.mode === "dark" ? "Dark" : localTheme.mode === "light" ? "Light" : "System"}
                </span>
                {localTheme.highContrast && (
                  <span className="rounded-full bg-[#fef2f2] px-3 py-1 text-xs font-bold text-red-600">
                    High Contrast
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Mode Selection */}
              <div className="rounded-xl border border-[#e8e8e8] p-4">
                <p className="text-xs font-bold text-[#666] mb-3">Theme Mode</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "light" as const, icon: Sun, label: "Light" },
                    { value: "dark" as const, icon: Moon, label: "Dark" },
                    { value: "system" as const, icon: Monitor, label: "System" },
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => setLocalTheme((t) => t ? { ...t, mode: value } : t)}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-4 transition-all ${
                        localTheme.mode === value
                          ? "border-[#0c831f] bg-[#e8f5e9]"
                          : "border-[#e8e8e8] hover:border-[#ccc]"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${localTheme.mode === value ? "text-[#0c831f]" : "text-[#666]"}`} />
                      <span className={`text-xs font-bold ${localTheme.mode === value ? "text-[#0c831f]" : "text-[#666]"}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="rounded-xl border border-[#e8e8e8] p-4">
                <p className="text-xs font-bold text-[#666] mb-3">Brand Colors</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-[#999]">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={localTheme.primaryColor}
                        onChange={(e) => setLocalTheme((t) => t ? { ...t, primaryColor: e.target.value } : t)}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-[#e8e8e8] bg-transparent"
                      />
                      <input
                        type="text"
                        value={localTheme.primaryColor}
                        onChange={(e) => setLocalTheme((t) => t ? { ...t, primaryColor: e.target.value } : t)}
                        className="flex-1 rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm font-mono text-[#1a1a1a] focus:border-[#0c831f] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-[#999]">Accent Color</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={localTheme.accentColor}
                        onChange={(e) => setLocalTheme((t) => t ? { ...t, accentColor: e.target.value } : t)}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-[#e8e8e8] bg-transparent"
                      />
                      <input
                        type="text"
                        value={localTheme.accentColor}
                        onChange={(e) => setLocalTheme((t) => t ? { ...t, accentColor: e.target.value } : t)}
                        className="flex-1 rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm font-mono text-[#1a1a1a] focus:border-[#0c831f] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="rounded-xl border border-[#e8e8e8] p-4">
                <p className="text-xs font-bold text-[#666] mb-3">Typography</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-[#999]">Font Family</label>
                    <select
                      value={localTheme.fontFamily}
                      onChange={(e) => setLocalTheme((t) => t ? { ...t, fontFamily: e.target.value as "inter" | "system" | "roboto" } : t)}
                      className="w-full rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm focus:border-[#0c831f] focus:outline-none"
                    >
                      {fontOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-[#999]">Font Size</label>
                    <div className="flex gap-1">
                      {fontSizeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setLocalTheme((t) => t ? { ...t, fontSize: opt.value as "small" | "medium" | "large" } : t)}
                          className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-all ${
                            localTheme.fontSize === opt.value
                              ? "border-[#0c831f] bg-[#e8f5e9] text-[#0c831f]"
                              : "border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-[#999]">Border Radius</label>
                    <div className="flex gap-1">
                      {borderRadiusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setLocalTheme((t) => t ? { ...t, borderRadius: opt.value as "sm" | "md" | "lg" } : t)}
                          className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-all ${
                            localTheme.borderRadius === opt.value
                              ? "border-[#0c831f] bg-[#e8f5e9] text-[#0c831f]"
                              : "border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Behavior */}
              <div className="rounded-xl border border-[#e8e8e8] p-4">
                <p className="text-xs font-bold text-[#666] mb-3">Behavior</p>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">Reduced Motion</p>
                      <p className="text-[10px] text-[#999]">Minimize animations and transitions</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={localTheme.reducedMotion}
                        onChange={(e) => setLocalTheme((t) => t ? { ...t, reducedMotion: e.target.checked } : t)}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-[#e8e8e8] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#0c831f] peer-checked:after:translate-x-full" />
                    </label>
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">High Contrast</p>
                      <p className="text-[10px] text-[#999]">Increase contrast for better readability</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={localTheme.highContrast}
                        onChange={(e) => setLocalTheme((t) => t ? { ...t, highContrast: e.target.checked } : t)}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-[#e8e8e8] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#0c831f] peer-checked:after:translate-x-full" />
                    </label>
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">Compact Mode</p>
                      <p className="text-[10px] text-[#999]">Reduce spacing for denser layouts</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={localTheme.compactMode}
                        onChange={(e) => setLocalTheme((t) => t ? { ...t, compactMode: e.target.checked } : t)}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-[#e8e8e8] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#0c831f] peer-checked:after:translate-x-full" />
                    </label>
                  </label>
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">Sidebar Collapsed</p>
                      <p className="text-[10px] text-[#999]">Start with sidebar collapsed by default</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={localTheme.sidebarCollapsed}
                        onChange={(e) => setLocalTheme((t) => t ? { ...t, sidebarCollapsed: e.target.checked } : t)}
                        className="peer sr-only"
                      />
                      <div className="h-6 w-11 rounded-full bg-[#e8e8e8] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-[#0c831f] peer-checked:after:translate-x-full" />
                    </label>
                  </label>
                </div>
              </div>

              {/* Sample UI Preview */}
              <div className="col-span-full rounded-xl border border-[#e8e8e8] p-4">
                <p className="mb-3 text-xs font-bold text-[#666]">Sample UI Elements</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      style={{ backgroundColor: localTheme.primaryColor }}
                      className="rounded-lg px-4 py-2 text-sm font-bold text-white"
                    >
                      Primary Button
                    </button>
                    <button
                      style={{ borderColor: localTheme.primaryColor, color: localTheme.primaryColor }}
                      className="rounded-lg border px-4 py-2 text-sm font-bold"
                    >
                      Secondary Button
                    </button>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f6f7f6] text-sm font-bold text-[#666]">
                      M
                    </div>
                    <span
                      style={{ backgroundColor: `${localTheme.primaryColor}15`, color: localTheme.primaryColor }}
                      className="rounded-full px-3 py-1 text-xs font-bold"
                    >
                      Badge
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-24 rounded-full bg-[#e8e8e8]">
                      <div
                        style={{ backgroundColor: localTheme.primaryColor, width: "60%" }}
                        className="h-2 rounded-full"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Input field..."
                      className="rounded-lg border border-[#e8e8e8] px-3 py-2 text-sm focus:outline-none"
                      style={{ borderColor: "#e8e8e8" }}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

