"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { ReusableDrawer } from "@/components/common/drawer";
import { Truck, Phone, MapPin, Star, UserPlus, Eye, Edit3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDeliveryPartners } from "@/hooks/use-delivery";

export default function DeliveryPartnersPage() {
  const { partners, loading, search, setSearch, addPartner, refresh } = useDeliveryPartners();
  const [showViewModal, setShowViewModal] = useState<any>(null);
  const [editPartner, setEditPartner] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState<any>({});

  const filtered = partners.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.zone?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      name: "",
      phone: "",
      vehicleType: "bike",
      vehicleNumber: "",
      zone: "North Zone",
      rating: 5.0,
      totalDeliveries: 0,
      status: "online",
    });
  };

  const handleSaveEdit = async () => {
    if (isAdding) {
      if (!editForm.name) {
        toast.error("Name is required");
        return;
      }
      try {
        await addPartner(editForm);
        toast.success(`Successfully added partner ${editForm.name}`);
        setIsAdding(false);
      } catch (err) {
        toast.error("Failed to add partner");
      }
    } else if (editPartner) {
      toast.success(`Successfully updated partner ${editForm.name}`);
      setEditPartner(null);
      refresh();
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

        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-[#e8e8e8] bg-white">
            <Loader2 className="h-6 w-6 animate-spin text-[#0c831f]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-[#e8e8e8] bg-white text-sm text-[#666]">
            <p>No delivery partners found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p: any) => (
              <div key={p.id} className="rounded-xl border border-[#e8e8e8] bg-white p-4 transition-all hover:shadow-sm hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5e9]">
                      <Truck className="h-5 w-5 text-[#0c831f]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{p.name}</p>
                      <p className="flex items-center gap-1 text-xs text-[#999]">
                        <Phone className="h-3 w-3" /> {p.phone || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={p.status} />
                    {p.partnerType === "THIRD_PARTY" ? (
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">3rd Party</span>
                    ) : (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">In-House</span>
                    )}
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-[#666]">
                  <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#2563eb]" /> {p.zone} - {p.vehicleType || "Vehicle"} {p.vehicleNumber}</p>
                  <p className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-[#d97706]" /> {p.rating || 5.0} rating • {p.totalDeliveries || 0} deliveries</p>
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
        )}
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
                <span className="text-sm font-bold text-[#1a1a1a]">{showViewModal.vehicleType || "Vehicle"} {showViewModal.vehicleNumber}</span>
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
                  <span className="text-sm font-bold text-[#1a1a1a]">{showViewModal.rating || 5.0}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#f9fafb] p-3 text-center">
              <span className="block text-[10px] font-bold text-[#666] uppercase">Total Deliveries</span>
              <span className="text-lg font-bold text-[#1a1a1a]">{showViewModal.totalDeliveries || 0}</span>
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

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Vehicle Type</label>
                <input
                  type="text"
                  value={editForm.vehicleType || ""}
                  onChange={(e) => setEditForm((f: any) => ({ ...f, vehicleType: e.target.value }))}
                  placeholder="e.g. Bike"
                  className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Vehicle Number</label>
                <input
                  type="text"
                  value={editForm.vehicleNumber || ""}
                  onChange={(e) => setEditForm((f: any) => ({ ...f, vehicleNumber: e.target.value }))}
                  placeholder="e.g. MH01 AB 1234"
                  className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs font-bold text-[#666]">Partner Type</label>
                <select
                  value={editForm.partnerType || "IN_HOUSE"}
                  onChange={(e) => setEditForm((f: any) => ({ ...f, partnerType: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                >
                  <option value="IN_HOUSE">In-House Fleet</option>
                  <option value="THIRD_PARTY">Third-Party Logistics</option>
                </select>
              </div>
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

