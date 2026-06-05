"use client";

import Link from "next/link";
import { ChevronLeft, User, Mail, Phone, MapPin, Calendar, Edit2, Shield, Key, Star, CheckCircle, Users as UsersIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useLanguageStore, SUPPORTED_LANGUAGES } from "@/store/language-store";
import { useAddressStore } from "@/store/address-store";
import { toast } from "sonner";

export default function ProfilePage() {
  const { linkedSocials } = useAuthStore();
  const { user, isLoading } = useUserProfile(true);
  const { language } = useLanguageStore();
  const { getDefaultAddress } = useAddressStore();

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language)!;
  const defaultAddress = getDefaultAddress();
  const { phoneNumber: storePhone } = useAuthStore();
  const displayPhone = user?.role === "guest"
    ? "Guest session"
    : storePhone
      ? `+91 ${storePhone}`
      : user?.id?.startsWith("google_") || user?.id?.startsWith("apple_") || user?.id?.startsWith("facebook_")
        ? "Via social login"
        : "Not set";

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto flex items-center gap-3">
          <Link href="/account" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Your Profile</h1>
          </div>
          <Link href="/account/profile/edit" className="px-4 py-2 bg-[#ff4f8b] text-white text-sm font-semibold rounded-full hover:bg-[#e63872] transition-colors flex items-center gap-1.5">
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6 space-y-5">

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#ff4f8b] to-[#ff6b9d] rounded-full flex items-center justify-center ring-2 ring-[#ff4f8b]/20">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-[#0c831f] rounded-full p-1.5 ring-2 ring-white">
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-bold text-[#1a1a1a]">{user?.name || "User"}</h2>
                {user?.role === "guest" ? (
                  <span className="px-2.5 py-0.5 bg-[#fff3e0] text-[#e65100] text-[10px] font-bold rounded-full">
                    Guest
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 bg-[#fff3e0] text-[#e65100] text-[10px] font-bold rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-[#e65100]" />
                    Premium
                  </span>
                )}
              </div>
              <p className="text-sm text-[#666]">Customer since {new Date().getFullYear()}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-[#666]">
                  <span className="w-2 h-2 rounded-full bg-[#0c831f]" />
                  {user?.role !== "guest" ? "Email Verified" : "Guest Account"}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#666]">
                  <span className="w-2 h-2 rounded-full bg-[#0c831f]" />
                  {user?.role !== "guest" ? "Phone Verified" : "Limited Access"}
                </div>
                {linkedSocials.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[#666]">
                    <UsersIcon className="w-3 h-3" />
                    {linkedSocials.length} social linked
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Contact Details ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e8e8e8]">
            <h3 className="font-bold text-[#1a1a1a] text-sm">Contact Details</h3>
          </div>
          <div className="divide-y divide-[#e8e8e8]">
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-[#e3f2fd] flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#1565c0]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#666] font-medium">Email Address</p>
                <p className="font-semibold text-[#1a1a1a] text-sm">{user?.email || "user@example.com"}</p>
              </div>
              <Link href="/account/profile/edit" className="text-xs font-semibold text-[#ff4f8b] hover:underline flex-shrink-0">Change</Link>
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-[#0c831f]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#666] font-medium">Phone Number</p>
                <p className="font-semibold text-[#1a1a1a] text-sm">{displayPhone}</p>
              </div>
              <Link href="/account/profile/edit" className="text-xs font-semibold text-[#ff4f8b] hover:underline flex-shrink-0">Change</Link>
            </div>
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-xl bg-[#f3e5f5] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#7b1fa2]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#666] font-medium">Default Address</p>
                <p className="font-semibold text-[#1a1a1a] text-sm">
                  {defaultAddress ? `${defaultAddress.address}, ${defaultAddress.city} - ${defaultAddress.pincode}` : "No address saved"}
                </p>
              </div>
              <Link href="/account/addresses" className="text-xs font-semibold text-[#ff4f8b] hover:underline flex-shrink-0">
                {defaultAddress ? "Edit" : "Add"}
              </Link>
            </div>
          </div>
        </div>

        {/* ── Account Preferences ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e8e8e8]">
            <h3 className="font-bold text-[#1a1a1a] text-sm">Account Preferences</h3>
          </div>
          <div className="divide-y divide-[#e8e8e8]">
            <Link href="/account/settings" className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[#eceff1] flex items-center justify-center flex-shrink-0">
                <Key className="w-5 h-5 text-[#546e7a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1a1a1a] text-sm">Change Password</p>
                <p className="text-xs text-[#666]">Last changed recently</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#ccc] rotate-180 flex-shrink-0" />
            </Link>
            <Link href="/account/settings" className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[#fff3e0] flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-[#e65100]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1a1a1a] text-sm">Two-Factor Authentication</p>
                <p className="text-xs text-[#666]">Add extra security to your account</p>
              </div>
              <span className="px-2.5 py-0.5 bg-[#e8f5e9] text-[#0c831f] text-[10px] font-bold rounded-full flex-shrink-0">Off</span>
              <ChevronLeft className="w-4 h-4 text-[#ccc] rotate-180 flex-shrink-0" />
            </Link>
            <Link href="/account/settings" className="flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-[#e0f7fa] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#00838f]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#1a1a1a] text-sm">Language & Preferences</p>
                <p className="text-xs text-[#666]">{currentLang.nativeName} ({currentLang.name})</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-[#ccc] rotate-180 flex-shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
