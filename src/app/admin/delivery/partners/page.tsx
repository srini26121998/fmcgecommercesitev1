"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { ReusableDrawer } from "@/components/common/drawer";
import { Truck, Phone, MapPin, Star, UserPlus, Eye, Edit3 } from "lucide-react";
import { toast } from "sonner";

const initialPartners = [
  { id: "DP-001", name: "Rahul Verma", phone: "+91-98765-43201", vehicle: "Honda Activa - MH01 AB 1234", zone: "North Zone", rating: 4.8, deliveries: 1245, status: "online" },
  { id: "DP-002", name: "Priya Mehta", phone: "+91-98765-43202", vehicle: "TVS iQube - MH02 CD 5678", zone: "East Zone", rating: 4.9, deliveries: 980, status: "online" },
  { id: "DP-003", name: "Amit Singh", phone: "+91-98765-43203", vehicle: "Hero Splendor - DL03 EF 9012", zone: "West Zone", rating: 4.6, deliveries: 2100, status: "busy" },
  { id: "DP-004", name: "Sunita Yadav", phone: "+91-98765-43204", vehicle: "Ola Electric - KA04 GH 3456", zone: "South Zone", rating: 4.7, deliveries: 1560, status: "online" },
  { id: "DP-005", name: "Vikram Joshi", phone: "+91-98765-43205", vehicle: "Bajaj CT 100 - MH12 IJ 7890", zone: "Central Zone", rating: 4.4, deliveries: 890, status: "offline" },
  { id: "DP-006", name: "Neha Kapoor", phone: "+91-98765-43206", vehicle: "Honda Activa - DL04 KL 1234", zone: "North Zone", rating: 4.8, deliveries: 1780, status: "online" },
];

export default function DeliveryPartnersPage() {
  const [partnersList, setPartnersList] = useState(initialPartners);
  const [search, setSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState<any>(null);
  const [editPartner, setEditPartner] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const filtered = partnersList.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.zone.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      id: `DP-${String(partnersList.length + 1).padStart(3, "0")}`,
      name: "",
      phone: "",
      vehicle: "",
      zone: "North Zone",
      rating: 5.0,
      deliveries: 0,
      status: "online",
    });
  };

  const handleSaveEdit = () => {
    if (isAdding) {
      if (!editForm.name) {
        toast.error("Name is required");
        return;
      }
      setPartnersList(prev => [...prev, editForm]);
      toast.success(`Successfully added partner ${editForm.name}`);
      setIsAdding(false);
    } else if (editPartner) {
      setPartnersList(prev => prev.map(p => p.id === editPartner.id ? { ...p, ...editForm } : p));
      toast.success(`Successfully updated partner ${editForm.name}`);
      setEditPartner(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Delivery Partners</h1>
              <p className="mt-1.5 text-xs text-[#666]">Manage and monitor all delivery partners on the platform.</p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18]"
            >
              <UserPlus className="h-4 w-4" /> Add Partner
            </button>
          </div>
        </section>

        <ReusableSearchBar value={search} onChange={setSearch} placeholder="Search by name or zone..." />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-xl border border-[#e8e8e8] bg-white p-4 transition-all hover:shadow-sm hover:-translate-y-0.5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5e9]">
                    <Truck className="h-5 w-5 text-[#0c831f]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a]">{p.name}</p>
                    <p className="flex items-center gap-1 text-xs text-[#999]">
                      <Phone className="h-3 w-3" /> {p.phone}
                    </p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-[#666]">
                <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#2563eb]" /> {p.zone} - {p.vehicle}</p>
                <p className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[#d97706]" /> {p.rating} rating ₹ {p.deliveries} deliveries</p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-[#e8e8e8] pt-3">
                <span className="text-[10px] font-mono text-[#999]">{p.id}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowViewModal(p)}
                    className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]"
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setEditPartner(p); setEditForm({ ...p }); }}
                    className="rounded-lg bg-[#f6f7f6] p-1.5 text-[#666] hover:bg-[#e8e8e8]"
                    title="Edit profile"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ReusableModal
        open={!!showViewModal}
        onClose={() => setShowViewModal(null)}
        title="Delivery Partner Details"
        subtitle={`Partner ID: ${showViewModal?.id}`}
        size="md"
      >
        {showViewModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-[#e8e8e8] pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0c831f]/10 text-lg font-black text-[#0c831f]">
                {showViewModal.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">{showViewModal.name}</h3>
                <span className="text-xs text-[#999]">{showViewModal.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Vehicle</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{showViewModal.vehicle}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Status</span>
                <div className="mt-0.5"><StatusBadge status={showViewModal.status} /></div>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Zone</span>
                <span className="text-sm font-bold text-[#1a1a1a]">{showViewModal.zone}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Rating</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 text-[#d97706] fill-current" />
                  <span className="text-sm font-bold text-[#1a1a1a]">{showViewModal.rating}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#f9fafb] p-3 text-center">
              <span className="block text-[10px] font-bold text-[#666] uppercase">Total Deliveries</span>
              <span className="text-lg font-bold text-[#1a1a1a]">{showViewModal.deliveries}</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowViewModal(null)}
                className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </ReusableModal>

      <ReusableDrawer
        open={!!editPartner || isAdding}
        onClose={() => { setEditPartner(null); setIsAdding(false); }}
        title={isAdding ? "Add Partner" : "Edit Partner Profile"}
        subtitle={isAdding ? "Register a new delivery partner" : `Update details for ${editPartner?.name}`}
        width="md"
        footer={
          <>
            <button
              onClick={() => { setEditPartner(null); setIsAdding(false); }}
              className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="rounded-xl bg-[#0c831f] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a6a18]"
            >
              Save
            </button>
          </>
        }
      >
        {(editPartner || isAdding) && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Full Name</label>
              <input
                type="text"
                value={editForm.name || ""}
                onChange={(e) => setEditForm((f: any) => ({ ...f, name: e.target.value }))}
                placeholder="Rahul Verma"
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Phone Number</label>
              <input
                type="text"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm((f: any) => ({ ...f, phone: e.target.value }))}
                placeholder="+91-98765-43201"
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Vehicle Info</label>
              <input
                type="text"
                value={editForm.vehicle || ""}
                onChange={(e) => setEditForm((f: any) => ({ ...f, vehicle: e.target.value }))}
                placeholder="Honda Activa - MH01 AB 1234"
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Zone</label>
              <select
                value={editForm.zone || ""}
                onChange={(e) => setEditForm((f: any) => ({ ...f, zone: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              >
                <option value="North Zone">North Zone</option>
                <option value="East Zone">East Zone</option>
                <option value="West Zone">West Zone</option>
                <option value="South Zone">South Zone</option>
                <option value="Central Zone">Central Zone</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
              <select
                value={editForm.status || ""}
                onChange={(e) => setEditForm((f: any) => ({ ...f, status: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        )}
      </ReusableDrawer>
    </DashboardLayout>
  );
}

