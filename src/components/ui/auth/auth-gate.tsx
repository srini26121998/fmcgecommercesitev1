"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, MapPin, Smartphone, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

export default function AuthGate() {
  const pathname = usePathname();
  const { isLoggedIn, login } = useAuthStore();
  const [open, setOpen] = useState(true);
  
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpFields, setOtpFields] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Close gate if user is already logged in (handles Zustand rehydration)
  useEffect(() => {
    if (isLoggedIn) {
      setOpen(false);
    }
  }, [isLoggedIn]);

  // Timer for Resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Auto Verify OTP when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && step === "otp") {
      handleVerifyOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step]);

  // Don't show the gate on admin routes — the admin panel has its own auth context.
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSendOtp = async () => {
    if (phoneNumber.length === 10) {
      setLoading(true);
      try {
        await authService.sendOtp({ identifier: phoneNumber, channel: "sms" });
        setStep("otp");
        setTimer(60);
        setOtpFields(Array(6).fill(""));
        setOtp("");
        
        toast.success("OTP sent successfully!", {
          description: `We've sent a 6-digit code to +91 ${phoneNumber}`,
          duration: 3000,
          position: "top-center",
        });
        
        // Auto-focus first input when step changes
        setTimeout(() => {
          if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
          }
        }, 100);
        
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to send OTP", {
          position: "top-center",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length === 6) {
      setLoading(true);
      try {
        const res = await authService.verifyOtp({ identifier: phoneNumber, otp, name: "User" });
        
        login({
          id: res.user?.id || "user_" + phoneNumber,
          name: res.user?.name || "User",
          email: res.user?.email || `${phoneNumber}@fmcgcommerce.com`,
          role: (res.user?.role || "user") as any,
          token: res.token || "mock_jwt_" + Date.now(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }, phoneNumber);
        
        setOpen(false);
        toast.success(res.message || "Welcome to FMCG Commerce! 🎉", {
          description: "Start shopping for fresh groceries!",
          duration: 3000,
          position: "top-center",
          className: "bg-gradient-to-r from-[#0c831f] to-[#10b981] text-white border-none",
        });
      } catch (err: any) {
        toast.error(err?.response?.data?.message || err?.message || "Invalid OTP. Please try again.", { position: "top-center" });
        setOtp("");
        setOtpFields(Array(6).fill(""));
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } finally {
        setLoading(false);
      }
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 backdrop-blur-sm sm:items-center">
      <div className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-md sm:rounded-3xl relative">
        {step === "otp" && (
          <button
            onClick={() => { setStep("phone"); setOtp(""); setOtpFields(Array(6).fill("")); setTimer(0); }}
            className="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        
        <button
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 text-xs font-black text-white/80 transition hover:text-white"
        >
          SKIP
        </button>

        <div className="relative bg-gradient-to-br from-[#0c831f] via-[#128f2b] to-[#ff4f8b] px-6 pb-8 pt-10 text-white">
          {step === "phone" ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <span className="text-xl font-black">F</span>
              </div>
              <h2 className="mt-5 text-3xl font-black leading-tight">
                Fresh groceries in minutes
              </h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-white/85">
                Sign in to see nearby stores, quick delivery slots, and member-only offers.
              </p>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-xs font-bold w-fit">
                <MapPin className="h-4 w-4" />
                Delivery in 10 minutes near you
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center text-center pt-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-black leading-tight">
                Verify Mobile
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/85 max-w-[250px]">
                Enter the 6-digit verification code sent to <br/>
                <span className="font-bold text-white">+91 {phoneNumber}</span>
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-6 bg-white">
          {step === "phone" ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="text-xs font-black uppercase tracking-wide text-[#666]">
                Mobile number
              </label>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-[#e8e8e8] bg-[#f6f7f6] text-sm font-black text-[#1a1a1a]">
                  +91
                </div>
                <div className="group flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f6f7f6] px-3 focus-within:border-[#0c831f] focus-within:bg-white transition-colors">
                  <Smartphone className="h-4 w-4 flex-shrink-0 text-[#ff4f8b] group-focus-within:text-[#0c831f]" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && phoneNumber.length === 10) {
                        handleSendOtp();
                      }
                    }}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm font-bold text-[#1a1a1a] outline-none placeholder:text-[#999] placeholder:font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={phoneNumber.length !== 10 || loading}
                className="mt-4 relative flex h-12 w-full items-center justify-center rounded-xl bg-[#0c831f] px-4 text-sm font-black text-white transition hover:bg-[#0a6e1a] disabled:opacity-50 overflow-hidden"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span>Continue</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="text-xs font-black uppercase tracking-wide text-[#666] text-center block">
                Enter Verification Code
              </label>
              
              <div className="mt-3 flex justify-center gap-2 sm:gap-3">
                {otpFields.map((field, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="tel"
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={field}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/[^0-9]/.test(value)) return;
                      
                      const newOtpFields = [...otpFields];
                      // Use the last character in case they type multiple quickly
                      newOtpFields[index] = value.slice(-1);
                      setOtpFields(newOtpFields);
                      
                      const combinedOtp = newOtpFields.join("");
                      setOtp(combinedOtp);

                      if (value && index < 5) {
                        inputRefs.current[index + 1]?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpFields[index] && index > 0) {
                        inputRefs.current[index - 1]?.focus();
                        const newOtpFields = [...otpFields];
                        newOtpFields[index - 1] = "";
                        setOtpFields(newOtpFields);
                        setOtp(newOtpFields.join(""));
                      } else if (e.key === "Enter" && otp.length === 6) {
                        handleVerifyOtp();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "").slice(0, 6);
                      if (pastedData) {
                        const newOtpFields = [...otpFields];
                        for (let i = 0; i < pastedData.length; i++) {
                          newOtpFields[i] = pastedData[i];
                        }
                        setOtpFields(newOtpFields);
                        setOtp(newOtpFields.join(""));
                        if (pastedData.length < 6) {
                          inputRefs.current[pastedData.length]?.focus();
                        } else {
                          inputRefs.current[5]?.focus();
                        }
                      }
                    }}
                    className={`h-12 w-10 sm:h-14 sm:w-12 rounded-xl border-2 text-center text-xl font-black text-[#1a1a1a] outline-none transition-colors ${
                      field 
                        ? "border-[#0c831f] bg-white" 
                        : "border-[#e8e8e8] bg-[#f6f7f6] focus:border-[#0c831f] focus:bg-white"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length !== 6 || loading}
                className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff4f8b] to-[#e63872] px-4 text-sm font-black text-white transition hover:shadow-lg hover:shadow-pink-500/25 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Login"}
              </button>

              <div className="mt-5 text-center">
                {timer > 0 ? (
                  <p className="text-xs font-semibold text-[#666]">
                    Resend code in <span className="text-[#0c831f] font-bold">00:{timer.toString().padStart(2, '0')}</span>
                  </p>
                ) : (
                  <p className="text-xs font-semibold text-[#666]">
                    Didn't receive the code?{" "}
                    <button 
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-[#ff4f8b] hover:underline disabled:opacity-50 disabled:no-underline font-bold"
                    >
                      Resend OTP
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="mt-5 text-center text-[10px] leading-5 text-[#999]">
            By continuing, you agree to FMCG Commerce{" "}
            <span className="font-bold text-[#666]">terms</span> and{" "}
            <span className="font-bold text-[#666]">privacy policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
