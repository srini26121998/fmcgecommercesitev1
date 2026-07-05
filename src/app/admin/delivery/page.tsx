"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { ReusableDrawer } from "@/components/common/drawer";
import { Truck, MapPin, Eye, Star, Phone, Gauge, Users, DollarSign, Edit3 } from "lucide-react";
import { toast } from "sonner";
import { deliveryService } from "@/services/delivery.service";

interface Partner {
  id: string;
  name: string;
  phone: string;
  vehicleType: string;
  status: string;
  currentOrders: number;
  totalDeliveries: number;
  rating: number;
  zone: string;
  earnings: string;
  joinedAt: string;
}

const mockPartners: Partner[] = [];

export default function DeliveryPage() {
  const [partnersList, setPartnersList] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchPartners();
  }, [page, pageSize, statusFilter]);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const res = await deliveryService.getPartners({ page, limit: pageSize });
      if (res.success && res.data) {
        // Map the backend data to the Partner interface expected by the UI
        const mapped = res.data.items.map((r: any) => ({
          id: r.id,
          name: r.name || "Unknown",
          phone: r.phone || "N/A",
          vehicleType: r.vehicleType || "bike",
          status: r.status || "offline",
          currentOrders: r.currentOrders || 0,
          totalDeliveries: r.totalDeliveries || 0,
          rating: r.rating || 5,
          zone: r.zone || "N/A",
          earnings: `₹${(r.earnings || 0).toLocaleString()}`,
          joinedAt: r.joinedAt || "N/A"
        }));
        setPartnersList(mapped);
        setTotalItems(res.data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to load delivery partners", err);
      toast.error("Failed to load delivery partners");
    } finally {
      setIsLoading(false);
    }
  };

  const [showViewModal, setShowViewModal] = useState<Partner | null>(null);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);
  const [editForm, setEditForm] = useState<Partial<Partner>>({});

  const handleSaveEdit = () => {
    if (!editPartner) return;
    setPartnersList((prev) =>
      prev.map((p) => (p.id === editPartner.id ? ({ ...p, ...editForm } as Partner) : p))
    );
    toast.success(`Successfully updated partner ${editForm.name}`);
    setEditPartner(null);
  };

  const filtered = partnersList.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.zone.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const online = partnersList.filter(p => p.status === "online").length;
  const busy = partnersList.filter(p => p.status === "busy").length;
  const totalDeliveries = partnersList.reduce((s, p) => s + p.totalDeliveries, 0);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Logistics & Fleet Management</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                Manage delivery partners, track live orders, view fleet analytics, and optimize routes.
              </p>
            </div>
            <ReusableExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt.toUpperCase()}`)} />
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Delivery Partners" value={partnersList.length} icon={<Users className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Online Now" value={online} icon={<Truck className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="On Delivery" value={busy} icon={<MapPin className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Total Deliveries" value={totalDeliveries.toLocaleString()} icon={<Gauge className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
        </div>

        {/* Fleet Status Overview */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Fleet</p>
            <h3 className="text-sm font-black text-[#1a1a1a]">Real-time Fleet Overview</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Available", count: online, color: "bg-[#0c831f]", icon: Truck },
              { label: "Busy", count: busy, color: "bg-[#d97706]", icon: MapPin },
              { label: "Offline", count: partnersList.filter(p => p.status === "offline").length, color: "bg-[#999]", icon: Phone },
              { label: "Total", count: partnersList.length, color: "bg-[#2563eb]", icon: Gauge },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4 text-center">
                <item.icon className={`mx-auto h-5 w-5 ${item.color.replace("bg-", "text-")}`} />
                <p className="mt-2 text-xl font-bold text-[#1a1a1a]">{item.count}</p>
                <p className="text-xs font-bold text-[#666]">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Zones */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Zones</p>
            <h3 className="text-sm font-black text-[#1a1a1a]">Delivery Zones</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Mumbai Metro", "Delhi NCR", "Pune City", "Bangalore Central"].map((zone) => {
              const zonePartners = partnersList.filter(p => p.zone === zone);
              const zoneOnline = zonePartners.filter(p => p.status === "online").length;
              return (
                <div key={zone} className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
                  <p className="text-sm font-bold text-[#1a1a1a]">{zone}</p>
                  <p className="text-xs text-[#999]">{zonePartners.length} partners  {zoneOnline} online</p>
                  <div className="mt-2 flex -space-x-1.5">
                    {zonePartners.slice(0, 4).map((p) => (
                      <div key={p.id} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#0c831f]/10 text-[8px] font-black text-[#0c831f]">
                        {p.name[0]}
                      </div>
                    ))}
                    {zonePartners.length > 4 && <span className="ml-1 text-[10px] text-[#999]">+{zonePartners.length - 4}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
          <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search partners by name or zone..." />
          <div className="mt-3 flex items-center gap-2">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none">
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="busy">Busy</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </section>

        <ReusableTable
          data={filtered.slice((page - 1) * pageSize, page * pageSize)}
          keyExtractor={(p) => p.id}
          page={page}
          pageSize={pageSize}
          total={filtered.length}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
          columns={[
            { key: "name", header: "Partner", sortable: true, render: (p) => (
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c831f]/10 text-xs font-black text-[#0c831f]">{p.name.split(" ").map((n: string) => n[0]).join("")}</div>
                <div><span className="font-bold text-[#1a1a1a]">{p.name}</span><span className="block text-[10px] text-[#999]">{p.id}</span></div>
              </div>
            )},
            { key: "vehicleType", header: "Vehicle", width: "100px", render: (p) => (
              <span className="font-bold capitalize text-[#666]">{p.vehicleType.replace("_", " ")}</span>
            )},
            { key: "status", header: "Status", width: "100px", render: (p) => <StatusBadge status={p.status} /> },
            { key: "currentOrders", header: "Active Orders", width: "120px", align: "center", hideOnMobile: true },
            { key: "totalDeliveries", header: "Total Delivered", width: "130px", align: "right", sortable: true, hideOnMobile: true, render: (p) => <span className="font-bold">{p.totalDeliveries.toLocaleString()}</span> },
            { key: "rating", header: "Rating", width: "80px", hideOnMobile: true, render: (p) => (
              <div className="flex items-center gap-1"><Star className="h-3 w-3 text-[#d97706] fill-current" /><span className="font-bold">{p.rating}</span></div>
            )},
            { key: "zone", header: "Zone", width: "130px", hideOnMobile: true },
            { key: "earnings", header: "Earnings", width: "100px", align: "right", hideOnMobile: true, render: (p) => <span className="font-bold text-[#0c831f]">{p.earnings}</span> },
          ]}
          actions={[
            { label: "Track", icon: <MapPin className="h-3.5 w-3.5" />, onClick: (p) => toast.info(`Tracking ${p.name}`), variant: "success" },
            { label: "Call", icon: <Phone className="h-3.5 w-3.5" />, onClick: (p) => toast.success(`Calling ${p.phone}`) },
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (p) => setShowViewModal(p) },
            { label: "Edit", icon: <Edit3 className="h-3.5 w-3.5" />, onClick: (p) => { setEditPartner(p); setEditForm({ ...p }); } },
          ]}
        />
      </div>

      {/* View Partner Modal */}
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
                {showViewModal.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1a1a1a]">{showViewModal.name}</h3>
                <span className="text-xs text-[#999]">{showViewModal.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Vehicle</span>
                <span className="text-sm font-bold text-[#1a1a1a] capitalize">{showViewModal.vehicleType.replace("_", " ")}</span>
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

            <div className="grid grid-cols-3 gap-3 rounded-xl bg-[#f9fafb] p-3 text-center">
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Active Orders</span>
                <span className="text-base font-bold text-[#1a1a1a]">{showViewModal.currentOrders}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Total Deliveries</span>
                <span className="text-base font-bold text-[#1a1a1a]">{showViewModal.totalDeliveries.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#666] uppercase">Earnings</span>
                <span className="text-base font-bold text-[#0c831f]">{showViewModal.earnings}</span>
              </div>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-[#666] uppercase">Joined Date</span>
              <span className="text-xs text-[#1a1a1a]">{new Date(showViewModal.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
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

      {/* Edit Partner Drawer */}
      <ReusableDrawer
        open={!!editPartner}
        onClose={() => setEditPartner(null)}
        title="Edit Partner Profile"
        subtitle={`Update details for ${editPartner?.name}`}
        width="md"
        footer={
          <>
            <button
              onClick={() => setEditPartner(null)}
              className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="rounded-xl bg-[#0c831f] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a6a18]"
            >
              Save Changes
            </button>
          </>
        }
      >
        {editPartner && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Full Name</label>
              <input
                type="text"
                value={editForm.name || ""}
                onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Phone Number</label>
              <input
                type="text"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Vehicle Type</label>
              <select
                value={editForm.vehicleType || ""}
                onChange={(e) => setEditForm(f => ({ ...f, vehicleType: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              >
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
                <option value="cycle">Cycle</option>
                <option value="van">Van</option>
                <option value="ev_scooter">EV Scooter</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Zone</label>
              <select
                value={editForm.zone || ""}
                onChange={(e) => setEditForm(f => ({ ...f, zone: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              >
                <option value="Mumbai Metro">Mumbai Metro</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Pune City">Pune City</option>
                <option value="Bangalore Central">Bangalore Central</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
              <select
                value={editForm.status || ""}
                onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Earnings</label>
              <input
                type="text"
                value={editForm.earnings || ""}
                onChange={(e) => setEditForm(f => ({ ...f, earnings: e.target.value }))}
                className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]"
              />
            </div>
          </div>
        )}
      </ReusableDrawer>
    </DashboardLayout>
  );
}

