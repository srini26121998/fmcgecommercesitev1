"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Mail, Phone, Loader2, Save } from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile, isLoading: isProfileLoading } = useUserProfile(true);
  const { phoneNumber: storePhone } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form data when user is loaded
  useEffect(() => {
    if (user && !isInitialized) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: storePhone || "", // Fallback to auth store phone if not in user profile
      });
      setIsInitialized(true);
    }
  }, [user, storePhone, isInitialized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const result = await updateProfile({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
      });

      if (result.success) {
        toast.success("Profile updated successfully!");
        // Update the auth store's phoneNumber if mobile was updated
        if (formData.mobile) {
           useAuthStore.setState({ phoneNumber: formData.mobile });
        }
        router.push("/account/profile");
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error("An error occurred while updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isInitialized && isProfileLoading) {
    return (
      <main className="min-h-screen bg-[#f2f2f2] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff4f8b]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2f2f2] pb-24">
      {/* ── Sticky Header ── */}
      <div className="bg-white border-b border-[#e8e8e8] px-4 py-3 sticky top-0 z-10">
        <div className="max-w-[900px] mx-auto flex items-center gap-3">
          <Link href="/account/profile" className="p-2 hover:bg-[#f2f2f2] rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-[#1a1a1a]" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#1a1a1a]">Edit Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] overflow-hidden p-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-[#999]" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl py-3 pl-11 pr-4 text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4f8b]/20 focus:border-[#ff4f8b] transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-[#999]" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl py-3 pl-11 pr-4 text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4f8b]/20 focus:border-[#ff4f8b] transition-all"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-[#999]" />
                </div>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full bg-[#f8f9fa] border border-[#e8e8e8] rounded-xl py-3 pl-11 pr-4 text-[#1a1a1a] text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4f8b]/20 focus:border-[#ff4f8b] transition-all"
                  placeholder="Enter your mobile number"
                />
              </div>
              <p className="mt-1.5 text-xs text-[#666]">
                Used for order updates and communication.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-[#ff4f8b] to-[#ff6b9d] text-white rounded-2xl py-4 font-bold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] btn-press flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
