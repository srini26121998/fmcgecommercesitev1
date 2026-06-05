"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import { Shield, Eye, AlertTriangle, CheckCircle, Clock, Ban } from "lucide-react";
import { toast } from "sonner";
import { useFraudAlerts } from "@/hooks/use-customers";
import { AnimatedLoader } from "@/components/ui/animated-loader";

export default function FraudDetectionPage() {
  const [showDetailModal, setShowDetailModal] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    alerts,
    loading,
    search,
    setSearch,
    pagination,
    setPage,
    setPageSize,
    summary,
    updateAlertStatus,
    resetFraudScore,
  } = useFraudAlerts();

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Customers</p>
          <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Fraud Detection</h1>
          <p className="mt-1.5 text-xs text-[#666]">AI-powered fraud detection monitoring suspicious activity, payment patterns, and account behavior.</p>
        </section>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Fraud Alerts" value={summary.total || 0} icon={<Shield className="h-4 w-4" />} color="text-[#dc2626]" bgColor="bg-[#fef2f2]" />
          <ReusableCard title="Blocked" value={summary.blocked || 0} icon={<Ban className="h-4 w-4" />} color="text-[#dc2626]" bgColor="bg-[#fef2f2]" />
          <ReusableCard title="Flagged" value={summary.flagged || 0} icon={<AlertTriangle className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
          <ReusableCard title="Monitoring" value={summary.monitoring || 0} icon={<Clock className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
        </div>

        <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search fraud alerts..." />

        <ReusableTable
          data={alerts}
          keyExtractor={(f) => f.id}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          isLoading={loading}
          columns={[
            { key: "id", header: "Alert ID", width: "100px", render: (f) => <span className="font-semibold text-[#dc2626]">{f.id}</span> },
            { key: "customerName", header: "User", render: (f) => <span className="font-semibold text-[#1a1a1a]">{f.customerName}</span> },
            { key: "reason", header: "Reason", sortable: true },
            { key: "riskScore", header: "Risk Score", width: "100px", align: "right", render: (f) => {
              const score = f.riskScore ?? 0;
              const color = score >= 80 ? "text-[#dc2626]" : score >= 60 ? "text-[#d97706]" : "text-[#d97706]";
              return <span className={`font-semibold ${color}`}>{score}%</span>;
            }},
            { key: "status", header: "Status", width: "110px", render: (f) => <StatusBadge status={f.status} /> },
            { key: "lastFlagged", header: "Detected", width: "130px", render: (f) => f.lastFlagged, hideOnMobile: true },
            { key: "actionTaken", header: "Action Taken", width: "130px", render: (f) => f.actionTaken, hideOnMobile: true },
          ]}
          actions={[
            { label: "Review", icon: <Eye className="h-3.5 w-3.5" />, onClick: (f) => setShowDetailModal(f) },
            { label: "Block User", icon: <Ban className="h-3.5 w-3.5" />, onClick: async (f) => {
              setIsSubmitting(true);
              const ok = await updateAlertStatus(f.id, "blocked");
              setIsSubmitting(false);
              if (ok) toast.success(`${f.customerName} blocked`);
            }},
          ]}
        />
      </div>

      <ReusableModal open={!!showDetailModal} onClose={() => setShowDetailModal(null)} title={`Review Fraud Alert — ${showDetailModal?.id}`} subtitle={showDetailModal?.customerName} size="lg">
        {showDetailModal && (
          <div className="space-y-5">
            <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-[#1a1a1a]">Suspicious Behavior Detected</h4>
                <p className="text-xs text-[#666] mt-0.5">This user account has triggered an automated alert for the following reason:</p>
                <p className="text-xs font-bold text-red-700 mt-1">{showDetailModal.reason}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "User / Customer", value: showDetailModal.customerName },
                { label: "Email Address", value: showDetailModal.email },
                { label: "Risk Score", value: <span className={`font-bold ${(showDetailModal.riskScore) >= 80 ? "text-red-600" : "text-amber-600"}`}>{(showDetailModal.riskScore) ?? 0}%</span> },
                { label: "Alert Status", value: <StatusBadge status={showDetailModal.status} /> },
                { label: "IP Address", value: showDetailModal.ipAddress || "—" },
                { label: "Timestamp", value: showDetailModal.lastFlagged },
                { label: "Action Taken", value: showDetailModal.actionTaken },
              ].map((f) => (
                <div key={f.label} className="rounded-xl bg-[#f9fafb] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">{f.label}</p>
                  <div className="mt-1 text-xs font-bold text-[#1a1a1a]">{f.value as React.ReactNode}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
              <button
                onClick={async () => {
                  setIsSubmitting(true);
                  const ok = await resetFraudScore(showDetailModal.customerId);
                  setIsSubmitting(false);
                  if (ok) {
                    toast.success(`Fraud score reset for ${showDetailModal.customerName}.`);
                    setShowDetailModal(null);
                  }
                }}
                className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-bold text-[#2563eb] hover:bg-[#eff6ff]"
              >
                Reset Score
              </button>
              <button
                onClick={async () => {
                  setIsSubmitting(true);
                  const ok = await updateAlertStatus(showDetailModal.id, "cleared");
                  setIsSubmitting(false);
                  if (ok) {
                    toast.success(`Alert ${showDetailModal.id} marked as cleared.`);
                    setShowDetailModal(null);
                  }
                }}
                className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-bold text-[#0c831f] hover:bg-[#e8f5e9]"
              >
                Clear Alert
              </button>
              <button
                onClick={async () => {
                  setIsSubmitting(true);
                  const ok = await updateAlertStatus(showDetailModal.id, "blocked");
                  setIsSubmitting(false);
                  if (ok) {
                    toast.success(`${showDetailModal.customerName} account has been blocked`);
                    setShowDetailModal(null);
                  }
                }}
                className="rounded-xl bg-[#dc2626] px-4 py-2 text-xs font-bold text-white hover:bg-[#b91c1c]"
              >
                Confirm Block
              </button>
            </div>
          </div>
        )}
      </ReusableModal>
      {isSubmitting && <AnimatedLoader fullScreen text="Processing action..." />}
    </DashboardLayout>
  );
}

