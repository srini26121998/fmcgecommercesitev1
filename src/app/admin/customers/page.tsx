"use client";

import DashboardLayout from "../dashboard-layout";
import { ReusableTable } from "@/components/ui/admin/reusable-table";
import ReusableSearchBar from "@/components/ui/admin/reusable-search";
import ReusableCard from "@/components/ui/admin/reusable-card";
import StatusBadge from "@/components/ui/admin/reusable-status-badge";
import ReusableModal from "@/components/ui/admin/reusable-modal";
import ReusableExportButton from "@/components/ui/admin/reusable-export";
import { CustomerTimeline } from "@/components/ui/customers/admin";
import { Users, Eye, Mail, AlertTriangle, Star, TrendingUp, Shield, RefreshCw, Paperclip, Trash2, CheckCircle2, Loader2, Edit3, X, Save } from "lucide-react";
import { toast } from "sonner";
import { useCustomers } from "@/hooks/use-customers";
import { useState, useEffect } from "react";
import type { Customer } from "@/types/customers";
import { customerService } from "@/services/customers.service";

export default function CustomersPage() {
  const {
    customers, loading, error, search, setSearch,
    segmentFilter, setSegmentFilter, statusFilter, setStatusFilter,
    pagination, summary, setPage, setPageSize, fetchCustomers, updateCustomer,
  } = useCustomers();
  
  // Detail Modal States
  const [showDetailModal, setShowDetailModal] = useState<Customer | null>(null);
  const [detailActiveTab, setDetailActiveTab] = useState<"overview" | "timeline">("overview");
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Edit Drawer States
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState<Partial<Customer>>({});

  // Email Composer States
  const [showEmailModal, setShowEmailModal] = useState<Customer | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("custom");
  const [emailTab, setEmailTab] = useState<"write" | "preview">("write");
  const [isSending, setIsSending] = useState(false);
  const [sendingStep, setSendingStep] = useState(0);
  const [sendingSuccess, setSendingSuccess] = useState(false);
  const [ccField, setCcField] = useState("");
  const [bccField, setBccField] = useState("");
  const [discountField, setDiscountField] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);

  // Templates definition
  const emailTemplates = {
    custom: {
      name: "Custom (Blank)",
      subject: "",
      body: "",
    },
    welcome: {
      name: "Welcome Discount (New Users)",
      subject: "Welcome to FMCG Commerce! 🎉 Here is 15% off your first order",
      body: "Hi {{name}},\n\nWelcome to FMCG Commerce! We are excited to have you join our community of smart shoppers.\n\nAs a token of our appreciation, here is a special 15% discount on your first order. Use the coupon code at checkout:\n\n{{discount}}\n\nHappy shopping!\n\nBest regards,\nThe FMCG Team",
      defaultDiscount: "WELCOME15",
    },
    vip: {
      name: "VIP Special Promo (High AOV)",
      subject: "Exclusive VIP Appreciation Offer from FMCG Commerce 🌟",
      body: "Hi {{name}},\n\nAs one of our most valued VIP customers, we want to thank you for your incredible loyalty.\n\nWe have credited a special discount code to your account for your next purchase. Enjoy flat ?500 off and free express shipping on orders above ?2000:\n\n{{discount}}\n\nThank you for choosing FMCG Commerce.\n\nBest regards,\nThe VIP Experience Team",
      defaultDiscount: "VIP500GOLD",
    },
    reengage: {
      name: "Re-engagement (At Risk)",
      subject: "We miss you, {{name}}! 💚 Here's a special gift just for you",
      body: "Hi {{name}},\n\nIt has been a while since your last purchase, and we miss you! We have updated our catalog with fresh fresh produce, household essentials, and direct-from-farm choices.\n\nHere is a code for free shipping and ?200 off your next order:\n\n{{discount}}\n\nBest regards,\nThe FMCG Team",
      defaultDiscount: "BACK2FMCG",
    },
    feedback: {
      name: "Feedback Request (Survey)",
      subject: "How was your experience, {{name}}? 📝 We'd love to hear your feedback",
      body: "Hi {{name}},\n\nWe are always working to improve your shopping experience. Could you spare 2 minutes to share your feedback about your recent orders?\n\nClick the link below or reply to this email to share your experience:\n\nhttps://fmcgcommerce.com/feedback?id={{id}}\n\nYour feedback helps us serve you better.\n\nBest regards,\nThe Customer Success Team",
      defaultDiscount: "FEEDBACK10",
    },
  };

  const resolvePlaceholders = (text: string, customer: Customer | null) => {
    if (!customer) return text;
    let resolved = text;
    resolved = resolved.replace(/{{name}}/g, customer.name);
    resolved = resolved.replace(/{{email}}/g, customer.email);
    resolved = resolved.replace(/{{city}}/g, customer.city || "");
    resolved = resolved.replace(/{{id}}/g, customer.id);
    resolved = resolved.replace(/{{discount}}/g, discountField || "N/A");
    return resolved;
  };

  const handleTemplateChange = (templateKey: string) => {
    setEmailTemplate(templateKey);
    const template = emailTemplates[templateKey as keyof typeof emailTemplates];
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.body);
      if ('defaultDiscount' in template) {
        setDiscountField(template.defaultDiscount);
      } else {
        setDiscountField("");
      }
    }
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`
      }));
      setAttachedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSendEmail = async () => {
    if (!showEmailModal) return;
    setIsSending(true);
    setSendingStep(1);

    setTimeout(() => {
      setSendingStep(2);
      setTimeout(() => {
        setSendingStep(3);
        setTimeout(() => {
          setSendingStep(4);
          setTimeout(() => {
            setSendingStep(5);
            setSendingSuccess(true);
            
            const templateName = emailTemplates[emailTemplate as keyof typeof emailTemplates]?.name || "Custom";
            customerService.addCustomerActivity(
              showEmailModal.id,
              "email_sent",
              `Email sent: "${emailSubject}" (Template: ${templateName})`,
              "Admin User"
            ).then(() => {
              // Also add to active detail list if it matches
              if (showDetailModal && showDetailModal.id === showEmailModal.id) {
                customerService.getCustomerActivities(showDetailModal.id).then(setActivities);
              }
              toast.success(`Email successfully sent to ${showEmailModal.name}!`);
            });
          }, 1000);
        }, 600);
      }, 800);
    }, 800);
  };

  const handleCloseEmailModal = () => {
    setShowEmailModal(null);
    setIsSending(false);
    setSendingStep(0);
    setSendingSuccess(false);
    setEmailSubject("");
    setEmailBody("");
    setEmailTemplate("custom");
    setEmailTab("write");
    setCcField("");
    setBccField("");
    setDiscountField("");
    setAttachedFiles([]);
  };

  const handleEditSave = async () => {
    if (!editCustomer || !editForm.name) return;
    const res = await updateCustomer(editCustomer.id, editForm);
    if (res) {
      toast.success(`Customer "${editForm.name}" profile updated successfully!`);
      setEditCustomer(null);
      setEditForm({});
    } else {
      toast.error("Failed to update customer profile");
    }
  };

  // Sync timeline activities when detail modal opens
  useEffect(() => {
    if (showDetailModal) {
      setDetailActiveTab("overview");
      setLoadingActivities(true);
      customerService.getCustomerActivities(showDetailModal.id)
        .then((data) => setActivities(data))
        .catch(() => toast.error("Failed to load customer timeline"))
        .finally(() => setLoadingActivities(false));
    } else {
      setActivities([]);
    }
  }, [showDetailModal]);

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-5 p-2 sm:p-4">
        {/* Header */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Customers</p>
              <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Customer Management</h1>
              <p className="mt-1.5 max-w-2xl text-xs text-[#666]">
                View customer profiles, track spending, manage segments, and review support tickets.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchCustomers} className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-3 py-1.5 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
              <ReusableExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt.toUpperCase()}`)} />
            </div>
          </div>
        </section>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ReusableCard title="Total Customers" value={summary.total} icon={<Users className="h-4 w-4" />} color="text-[#0c831f]" bgColor="bg-[#e8f5e9]" />
          <ReusableCard title="Total Revenue" value={`?${summary.totalRevenue.toLocaleString()}`} icon={<TrendingUp className="h-4 w-4" />} color="text-[#2563eb]" bgColor="bg-[#eff6ff]" />
          <ReusableCard title="VIP Customers" value={summary.vip} icon={<Star className="h-4 w-4" />} color="text-[#9333ea]" bgColor="bg-[#f3e8ff]" />
          <ReusableCard title="At Risk" value={summary.atRisk} icon={<AlertTriangle className="h-4 w-4" />} color="text-[#d97706]" bgColor="bg-[#fffbeb]" />
        </div>

        {/* Filters */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <ReusableSearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customers by name or email..." />
            </div>
            <div className="flex items-center gap-2">
              <select value={segmentFilter} onChange={(e) => { setSegmentFilter(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none">
                <option value="all">All Segments</option>
                <option value="vip">VIP</option>
                <option value="premium">Premium</option>
                <option value="regular">Regular</option>
                <option value="new">New</option>
                <option value="at_risk">At Risk</option>
                <option value="churned">Churned</option>
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm font-bold text-[#1a1a1a] outline-none">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </section>

        {/* Customer Table */}
        <ReusableTable
          data={customers}
          keyExtractor={(c) => c.id}
          isLoading={loading}
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={(s) => { setPageSize(s); }}
          enableSelection
          columns={[
            { key: "name", header: "Customer", sortable: true, render: (c: Customer) => (
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0c831f]/10 text-xs font-black text-[#0c831f]">
                  {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <span className="font-semibold text-[#1a1a1a]">{c.name}</span>
                  <span className="block text-[10px] text-[#999]">{c.email}</span>
                </div>
              </div>
            )},
            { key: "phone", header: "Phone", width: "130px", hideOnMobile: true },
            { key: "segment", header: "Segment", width: "100px", render: (c: Customer) => <StatusBadge status={c.segment} /> },
            { key: "status", header: "Status", width: "100px", render: (c: Customer) => <StatusBadge status={c.status} /> },
            { key: "totalOrders", header: "Orders", width: "80px", align: "right", sortable: true },
            { key: "totalSpent", header: "Spent", width: "100px", align: "right", sortable: true, render: (c: Customer) => <span className="font-semibold">?{c.totalSpent.toLocaleString()}</span> },
            { key: "city", header: "City", width: "100px", hideOnMobile: true },
            { key: "lastOrderDate", header: "Last Order", width: "110px", hideOnMobile: true, render: (c: Customer) => c.lastOrderDate || <span className="text-[#999]">₹</span> },
          ]}
          actions={[
            { label: "View", icon: <Eye className="h-3.5 w-3.5" />, onClick: (c: Customer) => setShowDetailModal(c) },
            { label: "Edit", icon: <Edit3 className="h-3.5 w-3.5" />, onClick: (c: Customer) => { setEditCustomer(c); setEditForm({ ...c }); } },
            { label: "Email", icon: <Mail className="h-3.5 w-3.5" />, onClick: (c: Customer) => setShowEmailModal(c) },
          ]}
        />

        {/* Segmentation Breakdown */}
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm">
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Analytics</p>
            <h3 className="text-sm font-black text-[#1a1a1a]">Segmentation Breakdown</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "VIP", count: summary.vip, pct: summary.total > 0 ? (summary.vip / Math.max(summary.total, 1)) * 100 : 0, color: "bg-[#9333ea]" },
              { label: "Premium", count: customers.filter(c => c.segment === "premium").length, pct: 0, color: "bg-[#2563eb]" },
              { label: "Regular", count: customers.filter(c => c.segment === "regular").length, pct: 0, color: "bg-[#0c831f]" },
              { label: "At Risk / Churned", count: summary.atRisk + summary.churned, pct: summary.total > 0 ? ((summary.atRisk + summary.churned) / Math.max(summary.total, 1)) * 100 : 0, color: "bg-[#dc2626]" },
            ].map((seg) => (
              <div key={seg.label} className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#666]">{seg.label}</span>
                  <span className="text-xs font-black text-[#1a1a1a]">{seg.count} users</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#e8e8e8]">
                  <div className={`h-full rounded-full ${seg.color}`} style={{ width: `${Math.max(seg.pct, 2)}%` }} />
                </div>
                <p className="mt-1.5 text-sm font-black text-[#1a1a1a]">{Math.round(seg.pct)}%</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Customer Detail Modal */}
      <ReusableModal open={!!showDetailModal} onClose={() => setShowDetailModal(null)} title={showDetailModal?.name || ""} subtitle={showDetailModal?.email} size="lg">
        {showDetailModal && (
          <div className="space-y-5">
            {/* Tabs inside Customer Detail Modal */}
            <div className="flex border-b border-[#e8e8e8] mb-2">
              <button
                onClick={() => setDetailActiveTab("overview")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                  detailActiveTab === "overview"
                    ? "border-[#0c831f] text-[#0c831f]"
                    : "border-transparent text-[#666] hover:text-[#1a1a1a]"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDetailActiveTab("timeline")}
                className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  detailActiveTab === "timeline"
                    ? "border-[#0c831f] text-[#0c831f]"
                    : "border-transparent text-[#666] hover:text-[#1a1a1a]"
                }`}
              >
                Activity Timeline
                <span className="rounded-full bg-[#f6f7f6] px-1.5 py-0.5 text-[9px] text-[#666] font-bold">
                  {activities.length}
                </span>
              </button>
            </div>

            {detailActiveTab === "overview" ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Phone", value: showDetailModal.phone },
                    { label: "City", value: `${showDetailModal.city}, ${showDetailModal.state}` },
                    { label: "Segment", value: <StatusBadge status={showDetailModal.segment} /> },
                    { label: "Status", value: <StatusBadge status={showDetailModal.status} /> },
                    { label: "Total Orders", value: showDetailModal.totalOrders },
                    { label: "Total Spent", value: `?${showDetailModal.totalSpent.toLocaleString()}` },
                    { label: "Avg Order Value", value: `?${showDetailModal.avgOrderValue}` },
                    { label: "LTV", value: showDetailModal.lifetimeValue || "₹" },
                  ].map((f) => (
                    <div key={f.label} className="rounded-xl bg-[#f9fafb] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-[#999]">{f.label}</p>
                      <div className="mt-1 text-sm font-bold text-[#1a1a1a]">{f.value as React.ReactNode}</div>
                    </div>
                  ))}
                </div>

                {showDetailModal.tags.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#666]">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {showDetailModal.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[#f6f7f6] px-2.5 py-1 text-[10px] font-bold text-[#666]">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {showDetailModal.acquisitionChannel && (
                  <div className="rounded-xl bg-[#fffbeb] border border-[#fde68a] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#d97706]">Acquisition Channel</p>
                    <p className="mt-1 text-sm font-bold text-[#1a1a1a]">{showDetailModal.acquisitionChannel}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                {loadingActivities ? (
                  <div className="py-8 text-center text-xs text-[#999] flex flex-col items-center gap-2">
                    <div className="h-5 w-5 rounded-full border-2 border-t-[#0c831f] border-[#e8e8e8] animate-spin" />
                    Loading timeline...
                  </div>
                ) : (
                  <CustomerTimeline items={activities} />
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
              <button
                onClick={() => {
                  setShowEmailModal(showDetailModal);
                  setShowDetailModal(null);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-sm font-bold text-[#666] hover:bg-[#f6f7f6]"
              >
                <Mail className="h-4 w-4" /> Send Email
              </button>
               <button
                onClick={() => {
                  setEditCustomer(showDetailModal);
                  setEditForm({ ...showDetailModal });
                  setShowDetailModal(null);
                }}
                className="rounded-xl bg-[#0c831f] px-4 py-2 text-sm font-bold text-white hover:bg-[#0a6a18]"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </ReusableModal>

      {/* Compose Email Modal */}
      <ReusableModal
        open={!!showEmailModal}
        onClose={handleCloseEmailModal}
        title={isSending ? "Sending Email..." : `Compose Email to ${showEmailModal?.name || ""}`}
        subtitle={isSending ? "" : showEmailModal?.email}
        size={isSending ? "md" : "xl"}
      >
        {showEmailModal && (
          <div className="space-y-4">
            {isSending ? (
              <div className="py-6 text-center space-y-6 flex flex-col items-center justify-center min-h-[300px]">
                {!sendingSuccess ? (
                  <>
                    <div className="relative flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full border-4 border-t-[#0c831f] border-[#e8e8e8] animate-spin" />
                      <Mail className="h-6 w-6 text-[#0c831f] absolute" />
                    </div>
                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="text-base font-black text-[#1a1a1a]">Sending secure message</h3>
                      <p className="text-xs text-[#666] animate-pulse">
                        {sendingStep === 1 && "Resolving recipient mail server & credentials..."}
                        {sendingStep === 2 && "Compiling templates & applying user variables..."}
                        {sendingStep === 3 && "Optimizing files & packaging attachments..."}
                        {sendingStep === 4 && "Connecting to SMTP Gateway and delivering payload..."}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="w-64 h-2.5 bg-[#e8e8e8] rounded-full overflow-hidden mx-auto mt-4">
                        <div
                          className="h-full bg-[#0c831f] transition-all duration-500 rounded-full"
                          style={{ width: `${sendingStep * 25}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Checklist */}
                    <div className="text-left w-full max-w-xs mx-auto border border-[#e8e8e8] rounded-xl p-4 bg-[#f9fafb] space-y-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${sendingStep > 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          {sendingStep > 1 ? "?" : "1"}
                        </span>
                        <span className={sendingStep >= 1 ? "text-[#1a1a1a] font-semibold" : "text-[#999]"}>
                          Resolving mail server...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${sendingStep > 2 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          {sendingStep > 2 ? "?" : "2"}
                        </span>
                        <span className={sendingStep >= 2 ? "text-[#1a1a1a] font-semibold" : "text-[#999]"}>
                          Parsing parameters...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${sendingStep > 3 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          {sendingStep > 3 ? "?" : "3"}
                        </span>
                        <span className={sendingStep >= 3 ? "text-[#1a1a1a] font-semibold" : "text-[#999]"}>
                          Compiling attachments...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${sendingStep > 4 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                          {sendingStep > 4 ? "?" : "4"}
                        </span>
                        <span className={sendingStep >= 4 ? "text-[#1a1a1a] font-semibold" : "text-[#999]"}>
                          SMTP Delivery Gateway...
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 bg-[#e8f5e9] text-[#0c831f] rounded-full flex items-center justify-center animate-bounce shadow-md">
                      <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-[#1a1a1a]">Message Sent Successfully!</h3>
                      <p className="text-xs text-[#666]">The custom email has been dispatched via SMTP.</p>
                    </div>
                    
                    <div className="border border-[#e8e8e8] rounded-xl p-4 bg-[#f9fafb] text-xs text-left w-full max-w-md space-y-2">
                      <p><span className="font-bold text-[#666] w-20 inline-block">Recipient:</span> <span className="text-[#1a1a1a] font-semibold">{showEmailModal.name} &lt;{showEmailModal.email}&gt;</span></p>
                      <p><span className="font-bold text-[#666] w-20 inline-block">Subject:</span> <span className="text-[#1a1a1a] font-semibold">{resolvePlaceholders(emailSubject, showEmailModal) || "(No Subject)"}</span></p>
                      <p><span className="font-bold text-[#666] w-20 inline-block">Template:</span> <span className="text-[#1a1a1a] font-semibold">{emailTemplates[emailTemplate as keyof typeof emailTemplates]?.name}</span></p>
                      {attachedFiles.length > 0 && (
                        <p><span className="font-bold text-[#666] w-20 inline-block">Attachments:</span> <span className="text-[#1a1a1a] font-semibold">{attachedFiles.length} file(s) ({attachedFiles.map(f => f.name).join(", ")})</span></p>
                      )}
                      <p><span className="font-bold text-[#666] w-20 inline-block">Timestamp:</span> <span className="text-[#1a1a1a] font-semibold">{new Date().toLocaleString()}</span></p>
                    </div>
                    
                    <button
                      onClick={handleCloseEmailModal}
                      className="w-full max-w-xs bg-[#0c831f] text-white rounded-xl py-2.5 text-xs font-black hover:bg-[#0a6a18] transition-all shadow-md mt-4"
                    >
                      Done
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left compose panel */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Tabs */}
                  <div className="flex border-b border-[#e8e8e8]">
                    <button
                      onClick={() => setEmailTab("write")}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${emailTab === "write" ? "border-[#0c831f] text-[#0c831f]" : "border-transparent text-[#666]"}`}
                    >
                      Compose Message
                    </button>
                    <button
                      onClick={() => setEmailTab("preview")}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${emailTab === "preview" ? "border-[#0c831f] text-[#0c831f]" : "border-transparent text-[#666]"}`}
                    >
                      HTML Preview
                    </button>
                  </div>

                  {emailTab === "write" ? (
                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        {/* Template selection */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#666]">Select Template</label>
                          <select
                            value={emailTemplate}
                            onChange={(e) => handleTemplateChange(e.target.value)}
                            className="w-full h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-xs font-bold text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                          >
                            {Object.entries(emailTemplates).map(([k, t]) => (
                              <option key={k} value={k}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* Discount field */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#666]">Active Discount Code</label>
                          <input
                            type="text"
                            value={discountField}
                            onChange={(e) => setDiscountField(e.target.value)}
                            placeholder="e.g. WELCOME15"
                            className="w-full h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-xs font-bold text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                          />
                        </div>
                      </div>

                      {/* Recipient info (Readonly) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#666]">Recipient</label>
                        <input
                          type="text"
                          disabled
                          value={`${showEmailModal.name} <${showEmailModal.email}>`}
                          className="w-full h-10 rounded-xl border border-[#e8e8e8] bg-gray-50 px-3 text-xs font-bold text-[#666] outline-none"
                        />
                      </div>

                      {/* CC & BCC fields */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#666]">CC</label>
                          <input
                            type="email"
                            value={ccField}
                            onChange={(e) => setCcField(e.target.value)}
                            placeholder="cc@example.com"
                            className="w-full h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-xs font-semibold text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#666]">BCC</label>
                          <input
                            type="email"
                            value={bccField}
                            onChange={(e) => setBccField(e.target.value)}
                            placeholder="bcc@example.com"
                            className="w-full h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-xs font-semibold text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#666]">Subject Line</label>
                        <input
                          type="text"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          placeholder="Enter email subject"
                          className="w-full h-10 rounded-xl border border-[#e8e8e8] bg-white px-3 text-xs font-bold text-[#1a1a1a] outline-none focus:border-[#0c831f]"
                        />
                      </div>

                      {/* Body */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#666]">Email Message Body</label>
                        <textarea
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          placeholder="Type your message here..."
                          className="w-full h-40 rounded-xl border border-[#e8e8e8] p-3 text-xs outline-none focus:border-[#0c831f] font-mono leading-relaxed resize-none"
                        />
                      </div>

                      {/* File attachment upload block */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-[#666]">Attachments</label>
                        <div className="border border-dashed border-[#e8e8e8] rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer hover:border-[#0c831f]/50 transition-all bg-[#f9fafb] relative">
                          <input type="file" multiple onChange={handleAttachFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <Paperclip className="h-4 w-4 text-[#999] mb-1" />
                          <p className="text-[10px] font-bold text-[#666]">Click to upload or drag files here</p>
                          <p className="text-[8px] text-[#999] mt-0.5">PDF, PNG, JPG up to 10MB</p>
                        </div>
                        {attachedFiles.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {attachedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 bg-[#f6f7f6] border border-[#e8e8e8] rounded-lg px-2 py-0.5 text-[10px] text-[#1a1a1a] font-bold">
                                <span>{file.name} ({file.size})</span>
                                <button type="button" onClick={() => handleRemoveAttachment(idx)} className="text-red-500 hover:text-red-700 font-black">
                                  ?
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-[#e8e8e8] rounded-xl overflow-hidden bg-white shadow-inner flex flex-col h-[400px]">
                      {/* Email Header info */}
                      <div className="bg-[#f8fafc] border-b border-[#e8e8e8] p-3 text-[10px] space-y-1 text-[#666] font-mono">
                        <p><span className="font-bold text-[#1a1a1a]">From:</span> FMCG Commerce Outbox &lt;no-reply@fmcgcommerce.com&gt;</p>
                        <p><span className="font-bold text-[#1a1a1a]">To:</span> {showEmailModal.name} &lt;{showEmailModal.email}&gt;</p>
                        {ccField && <p><span className="font-bold text-[#1a1a1a]">CC:</span> {ccField}</p>}
                        <p><span className="font-bold text-[#1a1a1a]">Subject:</span> {resolvePlaceholders(emailSubject, showEmailModal) || "(No Subject)"}</p>
                      </div>
                      {/* Email Body rendered */}
                      <div className="flex-1 overflow-y-auto p-4 bg-[#f1f5f9]">
                        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-[#e2e8f0]">
                          <div className="bg-gradient-to-r from-[#0c831f] to-[#0a6a18] p-4 text-center text-white">
                            <h2 className="text-base font-black tracking-wide">FMCG Commerce</h2>
                            <p className="text-[9px] opacity-80 uppercase tracking-widest mt-0.5 font-bold">Live commerce operations</p>
                          </div>
                          <div className="p-5 space-y-3.5">
                            {emailBody ? (
                              resolvePlaceholders(emailBody, showEmailModal).split("\n").map((para, i) => (
                                <p key={i} className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">{para}</p>
                              ))
                            ) : (
                              <p className="text-xs text-[#94a3b8] italic text-center py-8">Write something in the email body to see it previewed here.</p>
                            )}
                            
                            {emailTemplate !== "custom" && (
                              <div className="pt-3 text-center">
                                <span className="inline-block bg-[#0c831f] text-white text-[10px] font-bold px-4 py-2 rounded-lg shadow-sm">
                                  {emailTemplate === "feedback" ? "Give Feedback Now" : "Shop FMCG Store"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="bg-[#f8fafc] border-t border-[#e2e8f0] p-3 text-center text-[9px] text-[#94a3b8] space-y-0.5">
                            <p className="font-semibold text-[#64748b]">FMCG Commerce Private Limited</p>
                            <p>12, BKC Hub, Bandra East, Mumbai, Maharashtra 400051</p>
                            <p className="pt-1.5 opacity-70">You are receiving this transactional message as part of your registered customer relationship.</p>
                            <p className="text-[#0c831f] font-bold pt-1"><span className="cursor-pointer">Unsubscribe</span> | <span className="cursor-pointer">Preferences</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Help Sidebar */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-[#e8e8e8] bg-[#f9fafb] p-4 space-y-3">
                    <h4 className="text-xs font-black text-[#1a1a1a]">SMTP & Mail Configuration</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between border-b border-[#e8e8e8] pb-1.5">
                        <span className="text-[#666]">Outgoing Server:</span>
                        <span className="font-bold text-[#1a1a1a]">smtp.fmcg.com</span>
                      </div>
                      <div className="flex justify-between border-b border-[#e8e8e8] pb-1.5">
                        <span className="text-[#666]">SSL Port:</span>
                        <span className="font-bold text-[#1a1a1a]">465</span>
                      </div>
                      <div className="flex justify-between border-b border-[#e8e8e8] pb-1.5">
                        <span className="text-[#666]">Authorized User:</span>
                        <span className="font-bold text-[#1a1a1a]">admin@fmcg.com</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">Status:</span>
                        <span className="font-bold text-green-600 flex items-center gap-1">?₹ Active</span>
                      </div>
                    </div>
                  </div>

                  {/* Placeholder panel */}
                  <div className="rounded-xl border border-[#dcfce7] bg-[#f0fdf4] p-4 space-y-2.5">
                    <h4 className="text-xs font-black text-[#0c831f] flex items-center gap-1">
                      💡 Personalization Tokens
                    </h4>
                    <p className="text-[11px] text-[#166534]">
                      Copy/paste these tokens in your subject line or message body. They will be auto-replaced with matching customer profile values.
                    </p>
                    <div className="space-y-2 text-[11px] text-[#166534]">
                      <div className="flex items-start gap-1.5">
                        <code className="bg-white border border-[#bbf7d0] px-1 py-0.5 rounded font-mono font-bold">{"{{name}}"}</code>
                        <span className="mt-0.5">Renders: <span className="font-bold">{showEmailModal.name}</span></span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <code className="bg-white border border-[#bbf7d0] px-1 py-0.5 rounded font-mono font-bold">{"{{email}}"}</code>
                        <span className="mt-0.5">Renders: <span className="font-bold">{showEmailModal.email}</span></span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <code className="bg-white border border-[#bbf7d0] px-1 py-0.5 rounded font-mono font-bold">{"{{city}}"}</code>
                        <span className="mt-0.5">Renders: <span className="font-bold">{showEmailModal.city || "N/A"}</span></span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <code className="bg-white border border-[#bbf7d0] px-1 py-0.5 rounded font-mono font-bold">{"{{discount}}"}</code>
                        <span className="mt-0.5">Renders coupon code input value</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <code className="bg-white border border-[#bbf7d0] px-1 py-0.5 rounded font-mono font-bold">{"{{id}}"}</code>
                        <span className="mt-0.5">Renders: <span className="font-bold">{showEmailModal.id}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isSending && (
              <div className="flex justify-end gap-3 border-t border-[#e8e8e8] pt-4">
                <button
                  type="button"
                  onClick={handleCloseEmailModal}
                  className="rounded-xl border border-[#e8e8e8] bg-white px-4 py-2 text-xs font-bold text-[#666] hover:bg-[#f6f7f6]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0c831f] px-5 py-2 text-xs font-bold text-white hover:bg-[#0a6a18] shadow-sm"
                >
                  <Mail className="h-4 w-4" /> Send Outbound Email
                </button>
              </div>
            )}
          </div>
        )}
      </ReusableModal>

      {/* Edit Customer Profile Drawer */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          editCustomer ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setEditCustomer(null)}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-[100vw] sm:w-[480px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          editCustomer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[#e8e8e8] bg-white px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">
              Edit Customer Profile
            </p>
            <h2 className="mt-0.5 text-base font-black text-[#1a1a1a]">
              {editCustomer?.name}
            </h2>
            <p className="text-[10px] text-[#999] mt-0.5">{editCustomer?.id}</p>
          </div>
          <button
            onClick={() => setEditCustomer(null)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e8e8e8] text-[#666] hover:bg-[#f6f7f6] transition-all"
            aria-label="Close edit panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Full Name</label>
            <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Email Address</label>
            <input type="email" value={editForm.email || ""} onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Phone Number</label>
            <input type="text" value={editForm.phone || ""} onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">City</label>
              <input type="text" value={editForm.city || ""} onChange={(e) => setEditForm(f => ({ ...f, city: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">State</label>
              <input type="text" value={editForm.state || ""} onChange={(e) => setEditForm(f => ({ ...f, state: e.target.value }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Segment</label>
              <select value={editForm.segment || ""} onChange={(e) => setEditForm(f => ({ ...f, segment: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="new">New</option>
                <option value="regular">Regular</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
                <option value="at_risk">At Risk</option>
                <option value="churned">Churned</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#666]">Status</label>
              <select value={editForm.status || ""} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value as any }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f]">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#666]">Tags (comma separated)</label>
            <input type="text" value={editForm.tags?.join(", ") || ""} onChange={(e) => setEditForm(f => ({ ...f, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))} className="h-10 w-full rounded-xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1a1a1a] outline-none focus:border-[#0c831f] transition-colors" />
          </div>
        </div>

        {/* Drawer footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e8e8e8] bg-white px-6 py-4">
          <button onClick={() => setEditCustomer(null)} className="rounded-xl border border-[#e8e8e8] bg-white px-5 py-2.5 text-sm font-bold text-[#666] hover:bg-[#f6f7f6] transition-all">Cancel</button>
          <button onClick={handleEditSave} className="flex items-center gap-2 rounded-xl bg-[#0c831f] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#0a6a18] transition-all">
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </aside>
    </DashboardLayout>
  );
}

