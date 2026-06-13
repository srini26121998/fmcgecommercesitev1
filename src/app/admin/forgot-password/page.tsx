"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { Loader2, Mail, ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function AdminForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your admin email address.");
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSuccess(true);
    } catch (err: any) {
      console.error("[AdminForgotPassword] failed:", err);
      setError(
        err?.message ||
        err?.response?.data?.message ||
        "Failed to send reset instructions."
      );
    } finally {
      setLoading(false);
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
            key="forgot-password"
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
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2 drop-shadow-sm text-center">
                Forgot Password
              </h1>
              <p className="text-sm text-gray-800 font-semibold bg-white/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/50 shadow-sm text-center">
                Enter your email to receive reset instructions.
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
                    className="mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-bold bg-red-50/90 border-red-200 text-red-700 shadow-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-6 flex flex-col items-start gap-2 rounded-xl border px-4 py-4 text-sm font-bold bg-green-50/90 border-green-200 text-green-800 shadow-sm"
                  >
                    <p>Password reset instructions have been sent to your email.</p>
                    <p className="font-medium text-green-700 text-xs">Please check your inbox and follow the link provided.</p>
                  </motion.div>
                )}

                {!success && (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <motion.div variants={itemVariants} className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700 pl-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          id="admin-email"
                          type="email"
                          autoComplete="email"
                          placeholder="admin@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError("");
                          }}
                          className="w-full bg-white/60 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:bg-white/90 transition-all outline-none pl-10 pr-4 py-3 shadow-inner"
                        />
                      </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-2">
                      <button
                        type="submit"
                        disabled={loading || !email}
                        className="group relative flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-white text-sm font-bold transition-all hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 overflow-hidden shadow-md"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending…</span>
                          </>
                        ) : (
                          <>
                            <span>Send Instructions</span>
                            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  </form>
                )}

                {/* Back to Login */}
                <motion.div variants={itemVariants} className="mt-6 text-center border-t border-white/40 pt-6">
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to login
                  </Link>
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
