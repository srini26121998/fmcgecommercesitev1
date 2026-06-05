"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { getAdminToken } from "@/services/auth.service";
import { AnimatedLoader } from "@/components/ui/animated-loader";

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * AdminGuard wraps admin pages and ensures the user has a valid admin
 * session before rendering children.
 *
 * Auth check priority:
 *  1. sessionStorage `admin_token` — set by authService.adminLogin()
 *     This carries a backend-issued ADMIN-role JWT.
 *  2. Zustand auth-store — legacy customer auth with role === "admin".
 *
 * If neither check passes → redirect to /admin/login.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to finish hydrating from localStorage
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return () => unsub();
  }, []);

  // Once hydrated, check admin status
  useEffect(() => {
    if (!hydrated) return;

    // Primary check: dedicated admin token in sessionStorage
    const adminToken = getAdminToken();
    if (adminToken) {
      setChecked(true);
      return;
    }

    // Secondary check: Zustand store (legacy — role must be "admin")
    const { isLoggedIn, user } = useAuthStore.getState();
    const isAdmin = isLoggedIn && user?.role === "admin";

    if (!isAdmin) {
      router.replace("/admin/login");
    } else {
      setChecked(true);
    }
  }, [hydrated, router]);

  if (!checked) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
        <AnimatedLoader text="Verifying access..." />
      </div>
    );
  }

  return <>{children}</>;
}
