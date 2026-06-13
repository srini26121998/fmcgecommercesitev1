"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService, getAdminToken } from "@/services/auth.service";
import { Loader2, Lock, Mail, ShieldCheck, Eye, EyeOff, User, Phone, ChevronDown, Car, MapPin, Hash, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

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

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.08,
        when: "beforeChildren"
      }
    },
    exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.3 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center selection:bg-blue-500/30 selection:text-blue-900 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans"
      style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
    >
      {/* Light overlay to ensure the image isn't too distracting and text stays readable */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />

      <div className="relative w-full max-w-[420px] mx-auto z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegistering ? "register" : "login"}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
              <div className="relative w-14 h-14 rounded-2xl bg-white/70 border border-white/80 flex items-center justify-center mb-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] overflow-hidden backdrop-blur-xl">
                <ShieldCheck className="w-7 h-7 text-blue-600 relative z-10" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2 drop-shadow-sm">
                {isRegistering ? "Create an account" : "Welcome back"}
              </h1>
              <p className="text-sm text-gray-800 font-semibold bg-white/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/50 shadow-sm">
                {isRegistering ? "Enter your details to create an admin account." : "Sign in to access the administrator dashboard."}
              </p>
            </motion.div>

            {/* Form Card */}
            <motion.div variants={itemVariants} className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] relative overflow-hidden">
              {/* Subtle inner highlight for the glass card */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none rounded-[2rem]" />

              <div className="relative z-10">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-bold ${error.includes("successful") ? "bg-green-50/90 border-green-200 text-green-700" : "bg-red-50/90 border-red-200 text-red-700"}  shadow-sm`}
                  >
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isRegistering && (
                    <>
                      <motion.div variants={itemVariants} className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 pl-1">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setError(""); }}
                            className="w-full bg-white/60  rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white/90 transition-all pl-10 pr-4 py-3 shadow-inner"
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 pl-1">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="email"
                            placeholder="admin@example.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            className="w-full bg-white/60 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white/90 transition-all pl-10 pr-4 py-3 shadow-inner"
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 pl-1">Mobile Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="+1 234 567 8900"
                            value={mobile}
                            onChange={(e) => { setMobile(e.target.value); setError(""); }}
                            className="w-full bg-white/60  rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white/90 transition-all outline-none pl-10 pr-4 py-3 shadow-inner "
                          />
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants} className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-700 pl-1">Role</label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                          <select
                            value={role}
                            onChange={(e) => { setRole(e.target.value); setError(""); }}
                            className="w-full bg-white/60  rounded-xl text-sm text-gray-900 focus:bg-white/90 transition-all outline-none pl-10 pr-10 py-3 appearance-none cursor-pointer shadow-inner "
                          >
                            <option value="Admin">Admin</option>
                            <option value="super Admin">Super Admin</option>
                            <option value="manager">Manager</option>
                            <option value="delivery_boy">Delivery Boy</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        </div>
                      </motion.div>

                      {role === "delivery_boy" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-4 pt-4 border-t border-white/40 mt-4"
                        >
                          <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 pl-1">Vehicle Type</label>
                            <div className="relative">
                              <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input
                                type="text"
                                placeholder="e.g. Van, Bike"
                                value={vehicleType}
                                onChange={(e) => { setVehicleType(e.target.value); setError(""); }}
                                className="w-full bg-white/60  rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white/90 transition-all outline-none pl-10 pr-4 py-3 shadow-inner "
                              />
                            </div>
                          </motion.div>
                          <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 pl-1">Vehicle Number</label>
                            <div className="relative">
                              <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input
                                type="text"
                                placeholder="e.g. ABC-1234"
                                value={vehicleNumber}
                                onChange={(e) => { setVehicleNumber(e.target.value); setError(""); }}
                                className="w-full bg-white/60  rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white/90 transition-all outline-none pl-10 pr-4 py-3 shadow-inner "
                              />
                            </div>
                          </motion.div>
                          <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 pl-1">Zone</label>
                            <div className="relative">
                              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input
                                type="text"
                                placeholder="e.g. Downtown"
                                value={zone}
                                onChange={(e) => { setZone(e.target.value); setError(""); }}
                                className="w-full bg-white/60  rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white/90 transition-all outline-none pl-10 pr-4 py-3 shadow-inner "
                              />
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </>
                  )}

                  {/* Login fields */}
                  {!isRegistering && (
                    <motion.div variants={itemVariants} className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700 pl-1">Email or Username</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
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
                          className="w-full bg-white/60  rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white/90 transition-all outline-none pl-10 pr-4 py-3 shadow-inner "
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Password Field */}
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <div className="flex items-center justify-between pl-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Password</label>
                      {!isRegistering && (
                        <Link href="/admin/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">Forgot password?</Link>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
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
                        className="w-full bg-white/60  rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white/90 transition-all outline-none pl-10 pr-10 py-3 shadow-inner "
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants} className="pt-3">
                    <button
                      id="admin-login-submit"
                      type="submit"
                      disabled={loading || (!isRegistering && (!identifier || !password)) || (isRegistering && (!name || !email || !mobile || !password))}
                      className="group relative flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-white text-sm font-bold transition-all hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden shadow-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{isRegistering ? "Creating account…" : "Signing in…"}</span>
                        </>
                      ) : (
                        <>
                          <span>{isRegistering ? "Create account" : "Sign In"}</span>
                          <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </motion.div>
                </form>

                {/* Toggle */}
                <motion.div variants={itemVariants} className="mt-6 text-center border-t border-white/40 pt-6">
                  <p className="text-sm font-bold text-gray-700">
                    {isRegistering ? "Already have an account? " : "Don't have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError("");
                      }}
                      className="text-blue-600 hover:text-blue-800 font-extrabold transition-colors underline decoration-blue-300 underline-offset-4 hover:decoration-blue-600"
                    >
                      {isRegistering ? "Sign in" : "Request access"}
                    </button>
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-900/60 flex items-center justify-center gap-2 drop-shadow-md">
                <span>FMCG Commerce</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-900/40"></span>
                <span>Enterprise Portal</span>
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
