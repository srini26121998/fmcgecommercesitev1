"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService, getAdminToken } from "@/services/auth.service";
import { Loader2, Lock, Mail, ShieldCheck, Eye, EyeOff, User, Phone, ChevronDown, Car, MapPin, Hash } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Admin");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [zone, setZone] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already authenticated → skip to dashboard
  useEffect(() => {
    if (getAdminToken()) {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      if (!name.trim()) return setError("Please enter your name.");
      if (!email.trim()) return setError("Please enter your email.");
      if (!mobile.trim()) return setError("Please enter your mobile number.");
      if (!password) return setError("Please enter your password.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");

      setLoading(true);
      try {
        await authService.register({
          name: name.trim(),
          email: email.trim(),
          mobile: mobile.trim(),
          password,
          role,
          ...(role === "delivery_boy" ? { vehicleType, vehicleNumber, zone } : {})
        });
        // After registration, depending on backend behavior, it might auto-login
        // We'll redirect to dashboard, or they can switch back to login if no token.
        if (getAdminToken() || sessionStorage.getItem("admin_token")) {
           router.replace("/admin/dashboard");
        } else {
           setIsRegistering(false);
           setIdentifier(email);
           setError("Registration successful! Please login.");
        }
      } catch (err: any) {
        console.error("[AdminRegister] failed:", err);
        setError(
          err?.message ||
            err?.response?.data?.message ||
            "Registration failed."
        );
      } finally {
        setLoading(false);
      }
    } else {
      if (!identifier.trim()) {
        setError("Please enter your admin email or username.");
        return;
      }
      if (!password) {
        setError("Please enter your password.");
        return;
      }

      setLoading(true);
      try {
        await authService.adminLogin(identifier.trim(), password);
        router.replace("/admin/dashboard");
      } catch (err: any) {
        console.error("[AdminLogin] failed:", err);
        setError(
          err?.message ||
            err?.response?.data?.message ||
            "Invalid credentials or insufficient permissions."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2044] to-[#0a1628] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#0c831f]/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#ff4f8b]/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-[90%] sm:max-w-md mx-auto my-8">
        {/* Card */}
        <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Top accent bar */}
          <div className="absolute top-0 left-6 sm:left-8 right-6 sm:right-8 h-[2px] rounded-full bg-gradient-to-r from-[#0c831f] via-[#10b981] to-[#ff4f8b]" />

          {/* Logo / Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0c831f] to-[#10b981] flex items-center justify-center shadow-lg shadow-green-500/30">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ff4f8b] border-2 border-[#0a1628] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {isRegistering ? "Register User" : "Admin Portal"}
            </h1>
            <p className="mt-1 text-sm text-white/50 font-medium text-center">
              {isRegistering ? "Create a new portal account" : "Sign in with your administrator credentials"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 ${error.includes("successful") ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${error.includes("successful") ? "bg-green-400" : "bg-red-400"}`} />
              <p className={`text-sm font-medium leading-snug ${error.includes("successful") ? "text-green-400" : "text-red-400"}`}>
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegistering && (
              <>
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Name</label>
                  <div className="group relative flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 h-12 focus-within:border-[#0c831f]/50 focus-within:bg-white/8 transition-all">
                    <User className="w-4 h-4 text-white/30 flex-shrink-0 group-focus-within:text-[#0c831f] transition-colors" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(""); }}
                      className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/25"
                    />
                  </div>
                </div>

                {/* Email for Registration */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Email</label>
                  <div className="group relative flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 h-12 focus-within:border-[#0c831f]/50 focus-within:bg-white/8 transition-all">
                    <Mail className="w-4 h-4 text-white/30 flex-shrink-0 group-focus-within:text-[#0c831f] transition-colors" />
                    <input
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/25"
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Mobile</label>
                  <div className="group relative flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 h-12 focus-within:border-[#0c831f]/50 focus-within:bg-white/8 transition-all">
                    <Phone className="w-4 h-4 text-white/30 flex-shrink-0 group-focus-within:text-[#0c831f] transition-colors" />
                    <input
                      type="text"
                      placeholder="+1 234 567 8900"
                      value={mobile}
                      onChange={(e) => { setMobile(e.target.value); setError(""); }}
                      className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/25"
                    />
                  </div>
                </div>
                
                {/* Role */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Role</label>
                  <div className="group relative flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 h-12 focus-within:border-[#0c831f]/50 focus-within:bg-white/8 transition-all">
                    <ShieldCheck className="w-4 h-4 text-white/30 flex-shrink-0 group-focus-within:text-[#0c831f] transition-colors" />
                    <select
                      value={role}
                      onChange={(e) => { setRole(e.target.value); setError(""); }}
                      className="flex-1 bg-transparent text-white text-sm font-medium outline-none appearance-none cursor-pointer"
                    >
                      <option value="Admin" className="bg-[#0f2044] text-white">Admin</option>
                      <option value="super Admin" className="bg-[#0f2044] text-white">Super Admin</option>
                      <option value="manager" className="bg-[#0f2044] text-white">Manager</option>
                      <option value="delivery_boy" className="bg-[#0f2044] text-white">Delivery Boy</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-white/30 pointer-events-none" />
                  </div>
                </div>

                {/* Delivery Boy Dynamic Fields */}
                {role === "delivery_boy" && (
                  <div className="space-y-4 pt-2 pb-1 border-t border-white/10 mt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Vehicle Type</label>
                      <div className="group relative flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 h-12 focus-within:border-[#0c831f]/50 focus-within:bg-white/8 transition-all">
                        <Car className="w-4 h-4 text-white/30 flex-shrink-0 group-focus-within:text-[#0c831f] transition-colors" />
                        <input
                          type="text"
                          placeholder="e.g. Van, Bike"
                          value={vehicleType}
                          onChange={(e) => { setVehicleType(e.target.value); setError(""); }}
                          className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/25"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Vehicle Number</label>
                      <div className="group relative flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 h-12 focus-within:border-[#0c831f]/50 focus-within:bg-white/8 transition-all">
                        <Hash className="w-4 h-4 text-white/30 flex-shrink-0 group-focus-within:text-[#0c831f] transition-colors" />
                        <input
                          type="text"
                          placeholder="e.g. ABC-1234"
                          value={vehicleNumber}
                          onChange={(e) => { setVehicleNumber(e.target.value); setError(""); }}
                          className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/25"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">Zone</label>
                      <div className="group relative flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 h-12 focus-within:border-[#0c831f]/50 focus-within:bg-white/8 transition-all">
                        <MapPin className="w-4 h-4 text-white/30 flex-shrink-0 group-focus-within:text-[#0c831f] transition-colors" />
                        <input
                          type="text"
                          placeholder="e.g. Downtown"
                          value={zone}
                          onChange={(e) => { setZone(e.target.value); setError(""); }}
                          className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/25"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {!isRegistering && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                  Email or Username
                </label>
                <div className="group relative flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 h-12 focus-within:border-[#0c831f]/50 focus-within:bg-white/8 transition-all">
                  <Mail className="w-4 h-4 text-white/30 flex-shrink-0 group-focus-within:text-[#0c831f] transition-colors" />
                  <input
                    id="admin-identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="admin@example.com"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      setError("");
                    }}
                    className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/25"
                  />
                </div>
              </div>
            )}

            {/* Password - Shared */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                Password
              </label>
              <div className="group relative flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 px-4 h-12 focus-within:border-[#0c831f]/50 focus-within:bg-white/8 transition-all">
                <Lock className="w-4 h-4 text-white/30 flex-shrink-0 group-focus-within:text-[#0c831f] transition-colors" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  className="flex-1 bg-transparent text-white text-sm font-medium outline-none placeholder:text-white/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="admin-login-submit"
              type="submit"
              disabled={loading || (!isRegistering && (!identifier || !password)) || (isRegistering && (!name || !email || !mobile || !password))}
              className="relative mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0c831f] to-[#10b981] text-sm font-bold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-300" />
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                  <span className="relative z-10">{isRegistering ? "Registering…" : "Signing in…"}</span>
                </>
              ) : (
                <span className="relative z-10">{isRegistering ? "Register Account" : "Sign In to Admin Panel"}</span>
              )}
            </button>
          </form>

          {/* Toggle Register/Login */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="text-sm font-medium text-white/50 hover:text-white transition-colors"
            >
              {isRegistering ? "Already have an account? Sign In" : "Don't have an account? Register"}
            </button>
          </div>

          {/* Footer note */}
          {!isRegistering && (
            <p className="mt-4 text-center text-[11px] text-white/25 font-medium">
              This area is restricted to authorized administrators only.
            </p>
          )}
        </div>

        {/* Brand mark */}
        <p className="mt-6 text-center text-[11px] text-white/20 font-medium">
          FMCG Commerce · Admin Portal
        </p>
      </div>
    </div>
  );
}
