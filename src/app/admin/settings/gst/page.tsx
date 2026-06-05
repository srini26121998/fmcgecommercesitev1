"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { Landmark, FileText, Plus, Download, Edit3, Eye } from "lucide-react";
import { toast } from "sonner";

const taxRates = [
  { id: "TAX-001", name: "GST 0%", rate: "0%", category: "Essential Goods", hsn: "0401", type: "exempt", applicable: "Milk, Eggs, Bread" },
  { id: "TAX-002", name: "GST 5%", rate: "5%", category: "Daily Essentials", hsn: "2105", type: "standard", applicable: "Sugar, Tea, Spices" },
  { id: "TAX-003", name: "GST 12%", rate: "12%", category: "Processed Foods", hsn: "1902", type: "standard", applicable: "Biscuits, Noodles, Butter" },
  { id: "TAX-004", name: "GST 18%", rate: "18%", category: "General Goods", hsn: "3304", type: "standard", applicable: "Toiletries, Electronics" },
  { id: "TAX-005", name: "GST 28%", rate: "28%", category: "Luxury Items", hsn: "9503", type: "luxury", applicable: "High-end cosmetics, Luxury items" },
];

const gstReturns = [
  { period: "Apr 2026", status: "filed", dueDate: "2026-05-11", filedOn: "2026-05-10", amount: "?1,24,560" },
  { period: "Mar 2026", status: "filed", dueDate: "2026-04-11", filedOn: "2026-04-09", amount: "?1,12,340" },
  { period: "Feb 2026", status: "filed", dueDate: "2026-03-11", filedOn: "2026-03-08", amount: "?1,08,920" },
  { period: "May 2026", status: "pending", dueDate: "2026-06-11", filedOn: "₹", amount: "?1,32,450" },
];

export default function GSTSettingsPage() {
  const [showAddTax, setShowAddTax] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Settings</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">GST / Tax Settings</h1>
              <p className="mt-1.5 text-xs text-[#666]">Manage GST rates, HSN codes, and tax compliance filings.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] hover:bg-[#f6f7f6]">
                <Download className="h-4 w-4" /> Export
              </button>
              <button onClick={() => setShowAddTax(true)} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]">
                <Plus className="h-4 w-4" /> Add Tax Rate
              </button>
            </div>
          </div>
        </section>

        {/* Tax Rates Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
          <div className="border-b border-[#e8e8e8] px-5 py-3">
            <h3 className="text-sm font-black text-[#1a1a1a]">Tax Rates</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] text-left text-[10px] font-black uppercase tracking-wide text-[#666]">
                <th className="px-4 py-3">Tax ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">HSN Code</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Applicable On</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              {taxRates.map((t) => (
                <tr key={t.id} className="text-sm hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 font-bold text-[#0c831f]">{t.id}</td>
                  <td className="px-4 py-3 font-bold text-[#1a1a1a]">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-[#e8f5e9] px-2 py-1 text-xs font-bold text-[#0c831f]">{t.rate}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#666]">{t.category}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#666]">{t.hsn}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.type} /></td>
                  <td className="px-4 py-3 text-xs text-[#999]">{t.applicable}</td>
                  <td className="px-4 py-3">
                    <button className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]"><Edit3 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GST Returns */}
        <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
          <div className="border-b border-[#e8e8e8] px-5 py-3">
            <h3 className="text-sm font-black text-[#1a1a1a]">GST Returns</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] text-left text-[10px] font-black uppercase tracking-wide text-[#666]">
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Filed On</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              {gstReturns.map((r) => (
                <tr key={r.period} className="text-sm hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 font-bold text-[#1a1a1a]">{r.period}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-xs text-[#999]">{r.dueDate}</td>
                  <td className="px-4 py-3 text-xs text-[#999]">{r.filedOn}</td>
                  <td className="px-4 py-3 font-bold">{r.amount}</td>
                  <td className="px-4 py-3">
                    {r.status === "pending" ? (
                      <button className="rounded-lg bg-[#0c831f] px-3 py-1.5 text-[10px] font-bold text-white hover:bg-[#0a6a18]">File Now</button>
                    ) : (
                      <button className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]"><FileText className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAddTax && (
          <ReusableModal open={true} onClose={() => setShowAddTax(false)} title="Add Tax Rate" size="md">
            <div className="space-y-4">
              <input placeholder="Tax name (e.g. GST 18%)" className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Rate (%)" className="rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]" />
                <input placeholder="HSN Code" className="rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]" />
              </div>
              <input placeholder="Category (e.g. Essential Goods)" className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]" />
              <textarea placeholder="Applicable items" className="w-full rounded-xl border border-[#e8e8e8] px-4 py-2.5 text-sm outline-none focus:border-[#0c831f]" rows={2} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddTax(false)} className="rounded-lg border border-[#e8e8e8] px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]">Cancel</button>
                <button className="rounded-lg bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]">Add Tax Rate</button>
              </div>
            </div>
          </ReusableModal>
        )}
      </div>
    </DashboardLayout>
  );
}

