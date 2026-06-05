"use client";

import { useState } from "react";
import DashboardLayout from "../../dashboard-layout";
import { Bell, Mail, Smartphone, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

const notificationChannels = [
  { name: "Push Notifications", icon: Bell, enabled: true, providers: "Firebase, Web Push" },
  { name: "Email", icon: Mail, enabled: true, providers: "SendGrid, AWS SES" },
  { name: "SMS", icon: Smartphone, enabled: true, providers: "Twilio, MSG91" },
  { name: "In-App", icon: MessageSquare, enabled: true, providers: "WebSocket" },
];

const notificationEvents = [
  { event: "Order Confirmation", push: true, email: true, sms: true, inApp: true },
  { event: "Order Status Update", push: true, email: true, sms: true, inApp: true },
  { event: "Delivery Updates", push: true, email: false, sms: true, inApp: true },
  { event: "Payment Confirmation", push: true, email: true, sms: false, inApp: true },
  { event: "Promotional Offers", push: true, email: true, sms: false, inApp: true },
  { event: "Low Stock Alerts", push: true, email: true, sms: false, inApp: false },
  { event: "Vendor Settlements", push: false, email: true, sms: false, inApp: true },
  { event: "System Alerts", push: true, email: true, sms: true, inApp: true },
];

export default function NotificationSettingsPage() {
  const [channels, setChannels] = useState(notificationChannels);

  const toggleChannel = (name: string) => {
    setChannels(channels.map(c => c.name === name ? { ...c, enabled: !c.enabled } : c));
    toast.success(`${name} ${channels.find(c => c.name === name)?.enabled ? "disabled" : "enabled"}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 p-2 sm:p-4">
        <section className="rounded-2xl border border-[#e8e8e8] bg-white p-5 shadow-sm sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#0c831f]">Settings</p>
          <h1 className="mt-1 text-xl font-bold text-[#1a1a1a] sm:text-2xl">Notification Settings</h1>
          <p className="mt-1.5 text-xs text-[#666]">Configure notification channels, delivery providers, and event preferences.</p>
        </section>

        {/* Channels */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {channels.map((c) => (
            <div key={c.name} className="rounded-xl border border-[#e8e8e8] bg-white p-4 transition-all hover:shadow-sm">
              <div className="flex items-center justify-between">
                <c.icon className={`h-5 w-5 ${c.enabled ? "text-[#0c831f]" : "text-[#999]"}`} />
                <button
                  onClick={() => toggleChannel(c.name)}
                  className={`relative h-5 w-9 rounded-full transition-all ${c.enabled ? "bg-[#0c831f]" : "bg-[#e8e8e8]"}`}
                >
                  <div className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-all ${c.enabled ? "translate-x-4" : ""}`} />
                </button>
              </div>
              <p className="mt-2 text-sm font-bold text-[#1a1a1a]">{c.name}</p>
              <p className="mt-0.5 text-[10px] text-[#999]">{c.providers}</p>
            </div>
          ))}
        </div>

        {/* Event Mapping */}
        <div className="overflow-x-auto rounded-2xl border border-[#e8e8e8] bg-white shadow-sm">
          <div className="border-b border-[#e8e8e8] px-5 py-3">
            <h3 className="text-sm font-black text-[#1a1a1a]">Event Notification Mapping</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-[#f9fafb] text-left text-[10px] font-black uppercase tracking-wide text-[#666]">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3 text-center">Push</th>
                <th className="px-4 py-3 text-center">Email</th>
                <th className="px-4 py-3 text-center">SMS</th>
                <th className="px-4 py-3 text-center">In-App</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              {notificationEvents.map((e) => (
                <tr key={e.event} className="text-sm hover:bg-[#f9fafb]">
                  <td className="px-4 py-3 font-bold text-[#1a1a1a]">{e.event}</td>
                  {["push", "email", "sms", "inApp"].map((key) => (
                    <td key={key} className="px-4 py-3 text-center">
                      {e[key as keyof typeof e] ? (
                        <CheckCircle className="mx-auto h-4 w-4 text-[#0c831f]" />
                      ) : (
                        <XCircle className="mx-auto h-4 w-4 text-[#ccc]" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

