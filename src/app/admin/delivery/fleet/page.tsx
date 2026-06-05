"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { Truck, Users, Activity, XCircle, Plus, Loader2 } from "lucide-react";
import { useDeliveryPartners } from "@/hooks/use-delivery";
import { toast } from "sonner";

export default function FleetDashboardPage() {
  const { partners, loading, statusFilter, setStatusFilter, addPartner, onlineCount, busyCount, pagination } = useDeliveryPartners();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleType: "bike",
    zone: "",
  });

  const fleetStats = [
    { label: "Total Riders", value: pagination.total || 0, icon: Users, color: "text-[#2563eb]" },
    { label: "Online", value: onlineCount, icon: Activity, color: "text-[#0c831f]" },
    { label: "Busy", value: busyCount, icon: Truck, color: "text-[#d97706]" },
    { label: "Offline", value: (pagination.total || 0) - onlineCount - busyCount, icon: XCircle, color: "text-[#dc2626]" },
  ];

  const handleAddRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const res = await addPartner(formData);
    setIsAdding(false);
    
    if (res.success) {
      toast.success("Rider added successfully");
      setIsAddModalOpen(false);
      setFormData({ name: "", phone: "", vehicleType: "bike", zone: "" });
    } else {
      toast.error(res.error || "Failed to add rider");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6 gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
            <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Fleet Dashboard</h1>
            <p className="mt-1.5 text-xs text-[#666]">Manage delivery fleet, track riders, and monitor activity.</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]"
          >
            <Plus className="h-4 w-4" /> Add Rider
          </button>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fleetStats.map((s) => (
            <div key={s.label} className="rounded-xl border border-[#e8e8e8] bg-white p-4">
              <div className="flex items-center gap-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-xs text-[#666]">{s.label}</span>
              </div>
              <p className="mt-1 text-xl font-bold text-[#1a1a1a]">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {["all", "online", "busy", "offline"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === s ? "bg-[#0c831f] text-white" : "bg-[#f6f7f6] text-[#666] hover:bg-[#e8e8e8]"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#0c831f]" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#f9fafb] text-left text-[10px] font-black uppercase tracking-wide text-[#666]">
                  <th className="px-4 py-3">Rider ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Zone</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Deliveries</th>
                  <th className="px-4 py-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8e8]">
                {partners.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-4 text-center text-sm text-[#666]">No riders found.</td>
                  </tr>
                ) : (
                  partners.map((v) => (
                    <tr key={v.id} className="text-sm hover:bg-[#f9fafb]">
                      <td className="px-4 py-3 font-bold text-[#0c831f]">{v.id}</td>
                      <td className="px-4 py-3 font-bold text-[#1a1a1a]">{v.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#666]">{v.phone || "N/A"}</td>
                      <td className="px-4 py-3 text-[#666] capitalize">{v.vehicleType || "N/A"}</td>
                      <td className="px-4 py-3 text-[#666]">{v.zone || "N/A"}</td>
                      <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                      <td className="px-4 py-3 font-bold">{v.totalDeliveries}</td>
                      <td className="px-4 py-3 text-xs">⭐ {v.rating.toFixed(1)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <ReusableModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Rider"
      >
        <form onSubmit={handleAddRider} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-[#666]">Rider Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm focus:border-[#0c831f] outline-none"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[#666]">Phone</label>
            <input
              required
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm focus:border-[#0c831f] outline-none"
              placeholder="10-digit number"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[#666]">Vehicle Type</label>
            <select
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm focus:border-[#0c831f] outline-none bg-white"
            >
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
              <option value="ev_scooter">EV Scooter</option>
              <option value="van">Van</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-[#666]">Zone</label>
            <input
              required
              type="text"
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              className="h-10 w-full rounded-xl border border-[#e8e8e8] px-3 text-sm focus:border-[#0c831f] outline-none"
              placeholder="e.g. North Zone"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18] disabled:opacity-70"
            >
              {isAdding && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Rider
            </button>
          </div>
        </form>
      </ReusableModal>
    </DashboardLayout>
  );
}


