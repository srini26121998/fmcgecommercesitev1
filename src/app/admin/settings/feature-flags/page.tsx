"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import { Flag, Plus, Power, Eye } from "lucide-react";
import { toast } from "sonner";

const featureFlags = [
  { id: "FF-001", name: "live-order-tracking", description: "Real-time order tracking for customers", enabled: true, environment: "production", owner: "Product Team", rollback: "2026-04-15" },
  { id: "FF-002", name: "ai-product-recommendations", description: "AI-powered product recommendations on homepage", enabled: true, environment: "production", owner: "ML Team", rollback: "2026-05-01" },
  { id: "FF-003", name: "vendor-self-onboarding", description: "Allow vendors to self-register", enabled: false, environment: "staging", owner: "Vendor Team", rollback: "₹" },
  { id: "FF-004", name: "dark-mode-admin", description: "Dark mode support for admin panel", enabled: true, environment: "staging", owner: "UI Team", rollback: "2026-05-10" },
  { id: "FF-005", name: "wallet-cashback", description: "Wallet cashback and rewards system", enabled: true, environment: "production", owner: "Finance Team", rollback: "2026-04-20" },
  { id: "FF-006", name: "subscription-box", description: "Weekly subscription box feature", enabled: false, environment: "development", owner: "Product Team", rollback: "₹" },
  { id: "FF-007", name: "bulk-order-processing", description: "Bulk order status update and processing", enabled: true, environment: "production", owner: "Ops Team", rollback: "2026-05-14" },
  { id: "FF-008", name: "fraud-detection-engine", description: "AI-based fraud detection for orders", enabled: false, environment: "staging", owner: "Security Team", rollback: "₹" },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState(featureFlags);

  const toggleFlag = (id: string) => {
    setFlags(flags.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
    const flag = flags.find(f => f.id === id);
    toast.success(`${flag?.name} ${flag?.enabled ? "disabled" : "enabled"} (${flag?.environment})`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Settings</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Feature Flags</h1>
              <p className="mt-1.5 text-xs text-[#666]">Enable or disable features across environments with rollback history.</p>
            </div>
            <button className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
              <Plus className="h-4 w-4" /> New Flag
            </button>
          </div>
        </section>

        <div className="space-y-3">
          {flags.map((flag) => (
            <div key={flag.id} className="flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-white p-4 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${flag.enabled ? "bg-[#e8f5e9]" : "bg-[#f6f7f6]"}`}>
                  <Flag className={`h-4 w-4 ${flag.enabled ? "text-[#0c831f]" : "text-[#999]"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1a1a1a]">{flag.name}</span>
                    <span className="rounded bg-[#f6f7f6] px-1.5 py-0.5 text-[10px] font-mono text-[#0c831f]">{flag.id}</span>
                    <StatusBadge status={flag.enabled ? "active" : "inactive"} />
                  </div>
                  <p className="text-xs text-[#666]">{flag.description}</p>
                  <div className="mt-1 flex items-center gap-3 text-[10px] text-[#999]">
                    <span>Env: <span className="font-semibold">{flag.environment}</span></span>
                    <span>Owner: <span className="font-semibold">{flag.owner}</span></span>
                    {flag.rollback !== "₹" && <span>Rollback: {flag.rollback}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFlag(flag.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    flag.enabled
                      ? "bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]"
                      : "bg-[#e8f5e9] text-[#0c831f] hover:bg-[#d0edd4]"
                  }`}
                >
                  <Power className="h-3 w-3" />
                  {flag.enabled ? "Disable" : "Enable"}
                </button>
                <button className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]"><Eye className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

