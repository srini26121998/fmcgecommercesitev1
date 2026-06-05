"use client";

import { Truck, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";

interface ScheduledDeliveryProps {
  scheduledDate: string;
  scheduledTime: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const TIME_SLOTS = [
  { value: "08:00", label: "8:00 AM - 10:00 AM" },
  { value: "10:00", label: "10:00 AM - 12:00 PM" },
  { value: "12:00", label: "12:00 PM - 2:00 PM" },
  { value: "14:00", label: "2:00 PM - 4:00 PM" },
  { value: "16:00", label: "4:00 PM - 6:00 PM" },
  { value: "18:00", label: "6:00 PM - 8:00 PM" },
];

export default function ScheduledDelivery({
  scheduledDate,
  scheduledTime,
  onDateChange,
  onTimeChange,
}: ScheduledDeliveryProps) {
  return (
    <section className="rounded-xl border border-[#e8e8e8] bg-white relative z-20">
      <div className="flex items-center gap-2 border-b border-[#e8e8e8] px-4 py-3">
        <Calendar className="h-4 w-4 text-[#ff4f8b]" />
        <h2 className="text-sm font-black text-[#1a1a1a]">Schedule Delivery</h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-[#fff0f6] p-3">
          <Truck className="w-5 h-5 text-[#ff4f8b] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-[#1a1a1a]">Choose your preferred time</p>
            <p className="text-xs text-[#666] mt-0.5">
              Pick a date and time slot that works best for you
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#666] mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Delivery Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => onDateChange(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full h-11 rounded-xl border border-[#e8e8e8] px-4 text-sm font-medium outline-none transition-all hover:bg-white focus:bg-white focus:border-[#ff4f8b] focus:ring-4 focus:ring-[#ff4f8b]/10 bg-[#f9f9f9] text-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#666] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Time Slot
            </label>
            <CustomSelect
              value={scheduledTime}
              onChange={onTimeChange}
              options={TIME_SLOTS}
              placeholder="Select time slot"
            />
          </div>
        </div>

        {scheduledDate && (
          <div className="flex items-center gap-2 rounded-lg bg-[#e8f5e9] p-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#0c831f] flex-shrink-0" />
            <p className="text-xs font-semibold text-[#0c831f]">
              Delivery scheduled for{" "}
              {new Date(scheduledDate + "T" + (scheduledTime || "10:00")).toLocaleDateString("en-IN", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
              at {TIME_SLOTS.find((s) => s.value === scheduledTime)?.label || scheduledTime}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
