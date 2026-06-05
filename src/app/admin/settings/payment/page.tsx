"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { CreditCard, Shield, Wallet, CheckCircle, XCircle, Edit3 } from "lucide-react";
import { toast } from "sonner";

const paymentMethods = [
  { name: "UPI", enabled: true, provider: "Razorpay", fee: "1.5%", settlement: "T+1", limit: "?1,00,000" },
  { name: "Credit/Debit Card", enabled: true, provider: "Razorpay", fee: "2.0%", settlement: "T+2", limit: "?2,00,000" },
  { name: "Net Banking", enabled: true, provider: "Razorpay", fee: "0.8%", settlement: "T+1", limit: "?5,00,000" },
  { name: "Wallet", enabled: true, provider: "In-house", fee: "0%", settlement: "Instant", limit: "?25,000" },
  { name: "COD", enabled: true, provider: "Razorpay", fee: "1.0%", settlement: "T+1", limit: "?5,000" },
  { name: "EMI", enabled: false, provider: "Razorpay", fee: "1.5%", settlement: "T+3", limit: "?3,00,000" },
];

export default function PaymentSettingsPage() {
  const [methods, setMethods] = useState(paymentMethods);

  const toggleMethod = (name: string) => {
    setMethods(methods.map(m => m.name === name ? { ...m, enabled: !m.enabled } : m));
    toast.success(`${name} payment method updated`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Settings</p>
          <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Payment Settings</h1>
          <p className="mt-1.5 text-xs text-[#666]">Manage payment gateway configuration, methods, and settlement rules.</p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#2563eb]" />
              <span className="text-xs text-[#666]">Payment Gateway</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">Razorpay</p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#0c831f]" />
              <span className="text-xs text-[#666]">Active Methods</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">{methods.filter(m => m.enabled).length}/6</p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#9333ea]" />
              <span className="text-xs text-[#666]">Transaction Fee</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">Avg 1.2%</p>
          </div>
          <div className="rounded-xl border border-[#e8e8e8] bg-white p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-[#0c831f]" />
              <span className="text-xs text-[#666]">Settlement</span>
            </div>
            <p className="mt-1 text-lg font-black text-[#1a1a1a]">T+1</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] text-left text-[10px] font-black uppercase tracking-wide text-[#666]">
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Fee</th>
                <th className="px-4 py-3">Settlement</th>
                <th className="px-4 py-3">Limit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              {methods.map((m) => (
                <tr key={m.name} className="text-sm hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 font-bold text-[#1a1a1a]">{m.name}</td>
                  <td className="px-4 py-3 text-xs text-[#666]">{m.provider}</td>
                  <td className="px-4 py-3">{m.fee}</td>
                  <td className="px-4 py-3 text-xs text-[#666]">{m.settlement}</td>
                  <td className="px-4 py-3 text-xs text-[#666]">{m.limit}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${m.enabled ? "text-[#0c831f]" : "text-[#999]"}`}>
                      {m.enabled ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {m.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => toggleMethod(m.name)} className={`rounded-lg p-1.5 ${m.enabled ? "bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]" : "bg-[#e8f5e9] text-[#0c831f] hover:bg-[#d0edd4]"}`}>
                        {m.enabled ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      </button>
                      <button className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]"><Edit3 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

