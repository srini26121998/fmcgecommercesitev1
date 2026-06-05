"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Globe, Apple, Users, Loader2, Sparkles, Mail, Lock, Phone, User as UserIcon } from "lucide-react";
import { useAuthStore, type SocialProvider } from "@/store/auth-store";
import Link from "next/link";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";

const SOCIAL_PROVIDERS: { provider: SocialProvider; icon: typeof Globe; label: string; color: string }[] = [
  { provider: "google", icon: Globe, label: "Google", color: "text-[#ea4335]" },
  { provider: "apple", icon: Apple, label: "Apple", color: "text-[#000]" },
  { provider: "facebook", icon: Users, label: "Facebook", color: "text-[#1877f2]" },
];

export default function AuthModal() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration states
  const [isLoginView, setIsLoginView] = useState(true);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const { isLoggedIn, isGuest, login, socialLogin, guestLogin } = useAuthStore();

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!identifier || identifier.length < 3) {
      setError("Please enter a valid email or phone number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await authService.login({ identifier, password });
      
      const userData = {
        id: res.user?.id || `user_${Date.now()}`,
        name: res.user?.name || identifier.split("@")[0],
        email: res.user?.email || identifier,
        role: (res.user?.role || "user") as any,
        token: res.token || "mock_token",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      login(userData, identifier);
      
      // Reset form & close modal
      setIdentifier("");
      setPassword("");
      setOpen(false);
      
      toast.success(`Welcome back, ${userData.name}! 🎉`, {
        description: "You have successfully logged in.",
        duration: 3000,
        position: "top-center",
      });
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err?.response?.data?.message || err?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!regName || regName.trim().length < 2) {
      setError("Please enter a valid name.");
      return;
    }
    if (!regEmail || !/^\S+@\S+\.\S+$/.test(regEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!regMobile || regMobile.length < 10) {
      setError("Please enter a valid mobile number.");
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await authService.register({ 
        name: regName, 
        email: regEmail, 
        mobile: regMobile, 
        password: regPassword 
      });
      
      // Switch to login view instead of automatically logging in
      setIdentifier(regEmail); // Prefill email for login
      
      // Reset registration form
      setRegName("");
      setRegEmail("");
      setRegMobile("");
      setRegPassword("");
      
      setIsLoginView(true);
      
      toast.success(res.message || "Registration successful! Welcome aboard.", {
        description: "Please sign in with your new account.",
        duration: 4000,
        position: "top-center",
      });
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    setSocialLoading(provider);
    // Simulate OAuth redirect / popup delay
    setTimeout(() => {
      socialLogin(provider);
      setSocialLoading(null);
      setOpen(false);
      toast.success(`Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}! 🎉`, {
        description: "Your social account is now linked.",
        duration: 3000,
        position: "top-center",
        className: "bg-gradient-to-r from-[#0c831f] to-[#10b981] text-white border-none",
      });
    }, 800);
  };

  const handleGuestLogin = () => {
    setGuestLoading(true);
    setTimeout(() => {
      guestLogin();
      setGuestLoading(false);
      setOpen(false);
      toast.success("You're browsing as a guest! 🛒", {
        description: "Sign in anytime to save your cart and addresses.",
        duration: 4000,
        position: "top-center",
        className: "bg-gradient-to-r from-[#ff4f8b] to-[#ff6b9d] text-white border-none",
      });
    }, 500);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setError("");
    }
  };

  // If logged in, show account link with indicator
  if (isMounted && isLoggedIn) {
    return (
      <Link href="/account" className="flex min-h-[44px] h-11 items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f8f9fa] px-4 text-sm font-semibold text-[#1a1a1a] transition-all duration-200 btn-press hover-border-pink hover-bg-pink-light hover:shadow-sm">
        <User className="w-5 h-5 text-[#ff4f8b]" />
        <span className="hidden sm:block">{isGuest ? "Guest" : "My Account"}</span>
        {isGuest && (
          <span className="px-1.5 py-0.5 bg-[#fff3e0] text-[#e65100] text-[8px] font-bold rounded-full uppercase">
            Guest
          </span>
        )}
      </Link>
    );
  }

  if (!isMounted) {
    return (
      <button className="flex min-h-[44px] h-11 items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f8f9fa] px-4 text-sm font-semibold text-[#1a1a1a] transition-all duration-200 btn-press hover-border-pink hover-bg-pink-light hover:shadow-sm">
        <User className="w-5 h-5 text-[#ff4f8b]" />
        <span className="hidden sm:block">Login</span>
      </button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex min-h-[44px] h-11 items-center gap-2 rounded-xl border border-[#e8e8e8] bg-[#f8f9fa] px-4 text-sm font-semibold text-[#1a1a1a] transition-all duration-200 btn-press hover-border-pink hover-bg-pink-light hover:shadow-sm">
          <User className="w-5 h-5 text-[#ff4f8b]" />
          <span className="hidden sm:block">Login</span>
        </button>
      </DialogTrigger>

      <DialogContent className="mx-auto max-w-[520px] w-[95vw] overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-0 text-[#1a1a1a] shadow-2xl">
        <DialogTitle className="hidden">Authentication Modal</DialogTitle>
        <DialogDescription className="hidden">
          Login securely using your email or phone number.
        </DialogDescription>

        <div className="relative overflow-hidden bg-white px-8 pt-8 pb-4">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0c831f] via-[#128f2b] to-[#ff4f8b]" />
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#0c831f] to-[#ff4f8b] p-[2px] shadow-lg">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
              <span className="text-2xl font-black bg-gradient-to-br from-[#0c831f] to-[#ff4f8b] bg-clip-text text-transparent">F</span>
            </div>
          </div>
          <h2 className="text-center text-2xl font-black tracking-tight text-[#1a1a1a]">
            {isLoginView ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="mt-2 text-center text-[13px] font-medium text-gray-500">
            {isLoginView 
              ? "Sign in to access your saved addresses and offers." 
              : "Join us for exclusive offers and faster checkout."}
          </p>
        </div>

        <div className="px-8 pb-2">
          <div className="flex rounded-xl bg-gray-100/80 p-1">
            <button 
              type="button" 
              onClick={() => { setIsLoginView(true); setError(""); }} 
              className={`flex-1 rounded-lg py-2.5 text-[13px] font-bold transition-all duration-300 ${isLoginView ? 'bg-white text-[#1a1a1a] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
            >
              Login
            </button>
            <button 
              type="button" 
              onClick={() => { setIsLoginView(false); setError(""); }} 
              className={`flex-1 rounded-lg py-2.5 text-[13px] font-bold transition-all duration-300 ${!isLoginView ? 'bg-white text-[#1a1a1a] shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
            >
              Register
            </button>
          </div>
        </div>

        <div className="space-y-5 px-8 pb-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {error && (
            <div className="bg-red-50/50 border border-red-200 p-3.5 rounded-xl flex items-start gap-2.5">
              <div className="mt-0.5 rounded-full bg-red-100 p-1 hidden"><Mail className="w-3 h-3 text-red-600 hidden" /></div>
              <p className="text-[13px] font-semibold text-red-600 leading-tight">{error}</p>
            </div>
          )}

          {isLoginView ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">
                  Email or Phone
                </label>
                <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus-within:border-[#ff4f8b] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff4f8b]/10 h-12 transition-all shadow-sm">
                  <Mail className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-focus-within:text-[#ff4f8b]" />
                  <input
                    type="text"
                    placeholder="Enter email or mobile number"
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(""); }}
                    className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#1a1a1a] outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">
                  Password
                </label>
                <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus-within:border-[#ff4f8b] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff4f8b]/10 h-12 transition-all shadow-sm">
                  <Lock className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-focus-within:text-[#ff4f8b]" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#1a1a1a] outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
                <div className="flex justify-end pt-1">
                  <button type="button" className="text-[12px] font-bold text-[#ff4f8b] hover:text-[#e63872] transition-colors">
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !identifier || !password}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4f8b] to-[#e63872] px-4 text-[15px] font-bold text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] overflow-hidden mt-2"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {loading ? <Loader2 className="w-5 h-5 animate-spin relative z-10" /> : <span className="relative z-10">Sign In</span>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">
                  Full Name
                </label>
                <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus-within:border-[#ff4f8b] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff4f8b]/10 h-12 transition-all shadow-sm">
                  <UserIcon className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-focus-within:text-[#ff4f8b]" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={regName}
                    onChange={(e) => { setRegName(e.target.value); setError(""); }}
                    className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#1a1a1a] outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>
              
              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">
                  Email Address
                </label>
                <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus-within:border-[#ff4f8b] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff4f8b]/10 h-12 transition-all shadow-sm">
                  <Mail className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-focus-within:text-[#ff4f8b]" />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={regEmail}
                    onChange={(e) => { setRegEmail(e.target.value); setError(""); }}
                    className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#1a1a1a] outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">
                  Mobile Number
                </label>
                <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus-within:border-[#ff4f8b] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff4f8b]/10 h-12 transition-all shadow-sm">
                  <Phone className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-focus-within:text-[#ff4f8b]" />
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={regMobile}
                    onChange={(e) => { setRegMobile(e.target.value); setError(""); }}
                    className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#1a1a1a] outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">
                  Password
                </label>
                <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 focus-within:border-[#ff4f8b] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#ff4f8b]/10 h-12 transition-all shadow-sm">
                  <Lock className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-focus-within:text-[#ff4f8b]" />
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={(e) => { setRegPassword(e.target.value); setError(""); }}
                    className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium text-[#1a1a1a] outline-none placeholder:text-gray-400 placeholder:font-normal"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !regName || !regEmail || !regMobile || !regPassword}
                className="group relative flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4f8b] to-[#e63872] px-4 text-[15px] font-bold text-white shadow-md shadow-pink-500/20 transition-all hover:shadow-lg hover:shadow-pink-500/30 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] overflow-hidden mt-4"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {loading ? <Loader2 className="w-5 h-5 animate-spin relative z-10" /> : <span className="relative z-10">Create Account</span>}
              </button>
            </form>
          )}

          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] font-bold tracking-wider text-gray-400 flex-shrink-0">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {SOCIAL_PROVIDERS.map(({ provider, icon: Icon, label, color }) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleSocialLogin(provider)}
                disabled={socialLoading !== null}
                className="flex flex-col items-center justify-center gap-2 py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all group disabled:opacity-60 shadow-sm hover:shadow-md"
              >
                {socialLoading === provider ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  <Icon className={`w-5 h-5 ${color} group-hover:scale-110 transition-transform duration-300`} />
                )}
                <span className="text-[11px] font-bold text-gray-500 group-hover:text-gray-700">{label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={guestLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 text-[14px] font-bold text-gray-500 hover:border-[#0c831f] hover:text-[#0c831f] hover:bg-emerald-50/50 transition-all disabled:opacity-50 group mt-2"
          >
            {guestLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-[#0c831f] transition-colors" />
            )}
            {guestLoading ? "Starting session..." : "Continue as Guest"}
          </button>

          <p className="text-center text-[12px] leading-relaxed text-gray-500 mt-4">
            By continuing, you agree to our{" "}
            <span className="cursor-pointer font-bold text-[#ff4f8b] hover:text-[#e63872] transition-colors">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="cursor-pointer font-bold text-[#ff4f8b] hover:text-[#e63872] transition-colors">
              Privacy Policy
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
