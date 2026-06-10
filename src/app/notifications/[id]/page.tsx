"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useNotificationStore } from "@/store/notification-store";
import { ArrowLeft, Bell } from "lucide-react";

export default function NotificationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  
  const selectedData = useNotificationStore((s) => s.selectedNotificationData);

  useEffect(() => {
    // If no data and we are on the client, you could potentially fetch by id here
    // but the store already has it from the click if they navigated from the panel
  }, [id, selectedData]);

  if (!selectedData) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#e8e8e8] max-w-md w-full text-center">
          <Bell className="w-12 h-12 text-[#ccc] mx-auto mb-4" />
          <h2 className="text-xl font-black text-[#1a1a1a] mb-2">No Data Available</h2>
          <p className="text-sm text-[#666] mb-6">Please go back and select a notification again.</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-[#333] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) return <span className="text-gray-400">N/A</span>;
    if (typeof value === 'boolean') return <span className="text-gray-600">{value ? "Yes" : "No"}</span>;
    if (typeof value === 'object') {
      return (
        <div className="bg-[#f8f9fa] p-3 rounded-xl border border-[#e8e8e8] mt-1 space-y-2">
          {Object.entries(value).map(([k, v]) => (
            <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
              <span className="text-xs font-bold text-[#666] uppercase tracking-wide min-w-[120px]">{k}</span>
              <div className="text-sm text-[#1a1a1a] break-all">{renderValue(v)}</div>
            </div>
          ))}
        </div>
      );
    }
    return <span className="text-sm font-semibold text-[#1a1a1a]">{String(value)}</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-white border border-[#e8e8e8] rounded-xl flex items-center justify-center hover:border-[#ff4f8b] hover:text-[#ff4f8b] transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-[#ff4f8b] mb-1">
              Notification Details
            </p>
            <h1 className="text-2xl font-black text-[#1a1a1a]">
              Notification #{id}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-black text-[#1a1a1a] border-b border-[#e8e8e8] pb-4">
              Payload Response Data
            </h2>
            
            <div className="space-y-4">
              {Object.entries(selectedData).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 border-b border-[#f2f2f2] pb-4 last:border-0 last:pb-0">
                  <span className="text-sm font-bold text-[#666] capitalize w-1/3">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <div className="w-2/3">
                    {renderValue(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
