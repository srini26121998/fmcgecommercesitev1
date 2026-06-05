"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { usePartnerProfile } from "@/hooks/use-delivery";
import {
  Phone,
  Mail,
  MapPin,
  Star,
  Truck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BadgeCheck,
  FileText,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  verified: "bg-[#e8f5e9] text-[#0c831f]",
  pending: "bg-[#fffbeb] text-[#d97706]",
  rejected: "bg-[#fef2f2] text-[#dc2626]",
};

export default function PartnerProfilePage() {
  const [partnerId, setPartnerId] = useState("DP-001");
  const [inputId, setInputId] = useState("DP-001");
  const { profile, loading, error } = usePartnerProfile(partnerId);

  const handleSearch = () => {
    if (inputId.trim()) {
      setPartnerId(inputId.trim());
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Delivery</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Partner Profile</h1>
              <p className="mt-1.5 text-xs text-[#666]">View detailed partner information, documents, and performance.</p>
            </div>
          </div>
        </section>

        {/* Partner Search */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter partner ID (e.g. DP-001 to DP-010)..."
              className="flex-1 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2.5 text-sm font-bold text-[#1a1a1a] outline-none focus:border-[#0c831f]"
            />
            <button
              onClick={handleSearch}
              className="rounded-xl bg-[#0c831f] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-colors"
            >
              Load Profile
            </button>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#e8e8e8] border-t-[#0c831f]" />
              <p className="text-sm font-bold text-[#666]">Loading partner profile...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-[#dc2626]/20 bg-[#fef2f2] p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-[#dc2626]" />
            <p className="mt-2 text-sm font-bold text-[#dc2626]">{error}</p>
          </div>
        )}

        {/* Profile Content */}
        {!loading && !error && profile && (
          <>
            {/* Profile Header Card */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-6">
                {/* Avatar */}
                <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e8f5e9] text-2xl font-bold text-[#0c831f]">
                  {profile.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-[#1a1a1a]">{profile.name}</h2>
                      <p className="text-sm text-[#999]">{profile.id}</p>
                    </div>
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                        profile.status === "online" || profile.status === "available"
                          ? "bg-[#e8f5e9] text-[#0c831f]"
                          : profile.status === "busy"
                          ? "bg-[#fffbeb] text-[#d97706]"
                          : "bg-[#f6f7f6] text-[#666]"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${
                        profile.status === "online" || profile.status === "available"
                          ? "bg-[#0c831f]"
                          : profile.status === "busy"
                          ? "bg-[#d97706]"
                          : "bg-[#999]"
                      }`} />
                      {profile.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-2 text-sm text-[#666]">
                      <Phone className="h-4 w-4 text-[#2563eb]" />
                      {profile.phone}
                    </div>
                    {profile.email && (
                      <div className="flex items-center gap-2 text-sm text-[#666]">
                        <Mail className="h-4 w-4 text-[#9333ea]" />
                        {profile.email}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-[#666]">
                      <MapPin className="h-4 w-4 text-[#d97706]" />
                      {profile.city} ₹ {profile.zone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#666]">
                      <Truck className="h-4 w-4 text-[#0c831f]" />
                      {profile.vehicleType.replace("_", " ")} ₹ {profile.vehicleReg || "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#666]">
                      <Calendar className="h-4 w-4 text-[#2563eb]" />
                      Joined {new Date(profile.joinedAt).toLocaleDateString("en-IN")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#666]">
                      <Star className="h-4 w-4 text-[#d97706] fill-current" />
                      {profile.rating.toFixed(1)} rating ₹ {profile.totalDeliveries.toLocaleString()} deliveries
                    </div>
                  </div>

                  {profile.address && (
                    <p className="mt-3 text-xs text-[#999]">
                      Address: {profile.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Current Orders", value: profile.currentOrders, color: "text-[#2563eb]", bg: "bg-[#eff6ff]" },
                  { label: "Total Deliveries", value: profile.totalDeliveries.toLocaleString(), color: "text-[#0c831f]", bg: "bg-[#e8f5e9]" },
                  { label: "Total Earnings", value: `?${(profile.totalEarnings / 1000).toFixed(1)}K`, color: "text-[#9333ea]", bg: "bg-[#f3e8ff]" },
                  { label: "This Month", value: `?${(profile.thisMonthEarnings / 1000).toFixed(1)}K`, color: "text-[#d97706]", bg: "bg-[#fffbeb]" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-xl ${stat.bg} p-3 text-center`}>
                    <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] font-bold text-[#666]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Documents & Verification */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Verification</p>
                <h3 className="text-sm font-black text-[#1a1a1a]">Documents & Background Check</h3>
              </div>

              <div className="mb-4 flex flex-wrap gap-3">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                  profile.aadharVerified ? "bg-[#e8f5e9] text-[#0c831f]" : "bg-[#fef2f2] text-[#dc2626]"
                }`}>
                  <BadgeCheck className="h-3.5 w-3.5" /> Aadhar {profile.aadharVerified ? "Verified" : "Not Verified"}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                  profile.dlVerified ? "bg-[#e8f5e9] text-[#0c831f]" : "bg-[#fef2f2] text-[#dc2626]"
                }`}>
                  <BadgeCheck className="h-3.5 w-3.5" /> DL {profile.dlVerified ? "Verified" : "Not Verified"}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                  profile.backgroundCheck ? "bg-[#e8f5e9] text-[#0c831f]" : "bg-[#fffbeb] text-[#d97706]"
                }`}>
                  <Shield className="h-3.5 w-3.5" /> Background {profile.backgroundCheck ? "Cleared" : "Pending"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e8e8e8]">
                      <th className="pb-2 text-[10px] font-bold uppercase tracking-wide text-[#999]">Document</th>
                      <th className="pb-2 text-[10px] font-bold uppercase tracking-wide text-[#999]">Status</th>
                      <th className="pb-2 text-[10px] font-bold uppercase tracking-wide text-[#999]">Uploaded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.documents.map((doc) => (
                      <tr key={doc.name} className="border-b border-[#e8e8e8] last:border-0">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-[#666]" />
                            <span className="text-sm font-bold text-[#1a1a1a]">{doc.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${statusStyles[doc.status] || "bg-[#f6f7f6] text-[#666]"}`}>
                            {doc.status === "verified" ? <CheckCircle2 className="h-3 w-3" /> : doc.status === "pending" ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-xs text-[#666]">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN") : "₹"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Shifts */}
            <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
              <div className="mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Schedule</p>
                <h3 className="text-sm font-black text-[#1a1a1a]">Working Shifts</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {profile.shifts.map((shift) => (
                  <div
                    key={shift.day}
                    className="flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-[#f9fafb] px-4 py-3"
                  >
                    <span className="text-sm font-bold text-[#1a1a1a]">{shift.day}</span>
                    <span className="text-xs font-bold text-[#666]">
                      {shift.start} ₹ {shift.end}
                    </span>
                  </div>
                ))}
                {profile.shifts.length === 0 && (
                  <p className="col-span-full text-center text-sm text-[#999] py-4">No shifts configured</p>
                )}
              </div>
            </section>
          </>
        )}

        {/* No profile */}
        {!loading && !error && !profile && partnerId && (
          <div className="rounded-2xl border border-[#e8e8e8] bg-white p-12 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-[#ccc]" />
            <p className="mt-3 text-sm font-bold text-[#999]">No partner found with ID &quot;{partnerId}&quot;</p>
            <p className="text-xs text-[#ccc]">Try DP-001 through DP-010</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !profile && !partnerId && (
          <div className="rounded-2xl border border-[#e8e8e8] bg-white p-12 text-center">
            <Truck className="mx-auto h-10 w-10 text-[#ccc]" />
            <p className="mt-3 text-sm font-bold text-[#999]">Enter a partner ID to view their profile</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

