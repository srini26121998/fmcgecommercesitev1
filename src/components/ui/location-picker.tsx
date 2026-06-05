"use client";

import { useState } from "react";
import { MapPin, ChevronDown, Home, Building2, MapPinned, Plus, CheckCircle, X, ChevronRight, Zap } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useAddressStore, type Address } from "@/store/address-store";
import Link from "next/link";
import { toast } from "sonner";

interface LocationPickerProps {
  className?: string;
  showOnMobile?: boolean;
}

export default function LocationPicker({ className, showOnMobile = false }: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const { addresses, setDefaultAddress } = useAddressStore();
  const defaultAddress = addresses.find((a) => a.isDefault);

  const handleSelectAddress = (id: string) => {
    setDefaultAddress(id);
    setOpen(false);
    toast.success("Delivery location updated!");
  };

  const getAddressIcon = (type: string) => {
    if (type === "Home") return <Home className="w-4 h-4" />;
    if (type === "Work") return <Building2 className="w-4 h-4" />;
    return <MapPinned className="w-4 h-4" />;
  };

  const getAddressTypeColor = (type: string) => {
    if (type === "Home") return "bg-[#e8f5e9] text-[#0c831f]";
    if (type === "Work") return "bg-[#e3f2fd] text-[#1565c0]";
    return "bg-[#f3e5f5] text-[#7b1fa2]";
  };

  const getShortArea = (address: Address) => {
    const parts = address.address.split(",");
    return parts[0]?.trim() || address.city;
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className={`flex items-center gap-1.5 flex-shrink-0 hover:opacity-80 transition-opacity ${
            showOnMobile ? "" : "hidden md:"
          }flex ${className || ""}`}
          aria-label="Select delivery location"
        >
          <div className="flex items-center gap-2 sm:gap-3 pr-3 sm:pr-4 border-r border-[#e8e8e8]">
            <div className="relative bg-[#f8f9fa] p-1.5 sm:p-2 rounded-xl border border-[#e8e8e8] hidden sm:block">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#0c831f] flex-shrink-0" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#0c831f] rounded-full animate-pulse border-2 border-white" />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-[#666] leading-none mb-1">Delivering to</p>
              <div className="flex items-center gap-1.5 leading-none">
                <p className="text-xs sm:text-sm font-black text-[#1a1a1a] truncate max-w-[100px] sm:max-w-[160px]">
                  {defaultAddress ? (
                    getShortArea(defaultAddress)
                  ) : (
                    "Set delivery location"
                  )}
                </p>
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#e8f5e9] rounded-full flex-shrink-0">
                  <Zap className="w-3 h-3 text-[#0c831f]" />
                  <span className="text-[10px] font-black text-[#0c831f]">10 mins</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#666] flex-shrink-0" />
              </div>
            </div>
          </div>
        </button>
      </SheetTrigger>

      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="max-h-[60vh] rounded-t-3xl border-t-0 bg-white shadow-2xl"
      >
        <SheetTitle className="sr-only">Delivery Location</SheetTitle>
        <SheetDescription className="sr-only">Select your delivery address</SheetDescription>

        {/* Grab handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-[#e8e8e8]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#e8f5e9] flex items-center justify-center">
              <MapPin className="w-4 h-4 text-[#0c831f]" />
            </div>
            <h2 className="text-sm font-black text-[#1a1a1a]">Delivery Location</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full bg-[#f2f2f2] flex items-center justify-center hover:bg-[#e8e8e8] transition-colors"
          >
            <X className="w-4 h-4 text-[#666]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 space-y-2">
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-[#f2f2f2] flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-[#ccc]" />
              </div>
              <h3 className="text-sm font-bold text-[#1a1a1a] mb-1">No saved addresses</h3>
              <p className="text-xs text-[#666] mb-4">Add a delivery address to get started</p>
              <Link
                href="/account/addresses"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Address
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold text-[#666] uppercase tracking-wide">
                Saved Addresses ({addresses.length})
              </p>
              {addresses.map((address) => (
                <button
                  key={address.id}
                  onClick={() => handleSelectAddress(address.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    address.isDefault
                      ? "border-[#0c831f] bg-[#e8f5e9]/30"
                      : "border-[#e8e8e8] bg-white hover:border-[#ccc] hover:bg-[#fafafa]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${getAddressTypeColor(
                        address.type
                      )}`}
                    >
                      {getAddressIcon(address.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#1a1a1a]">{address.type}</span>
                        {address.isDefault && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#0c831f] text-white text-[9px] font-bold rounded-full">
                            <CheckCircle className="w-2.5 h-2.5" />
                            Delivering here
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#666] leading-relaxed">
                        {address.address}, {address.city} - {address.pincode}
                      </p>
                      <p className="text-[10px] text-[#999] mt-0.5">
                        {address.name} · {address.phone}
                      </p>
                    </div>
                    {!address.isDefault && (
                      <ChevronRight className="w-4 h-4 text-[#ccc] flex-shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 pb-4 px-4 border-t border-[#e8e8e8] mt-2">
          <Link
            href="/account/addresses"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-1.5 w-full h-11 rounded-xl bg-[#ff4f8b] text-white text-xs font-bold hover:bg-[#e63872] transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Address
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
