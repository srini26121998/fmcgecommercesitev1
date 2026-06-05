"use client";

import { useAuthStore } from "@/store/auth-store";

interface RoleGateProps {
  /** The role required to view the children */
  allowedRole: "admin" | "user" | "vendor" | "guest";
  /** Fallback content to show when access is denied (optional) */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * RoleGate conditionally renders children only if the current user's role
 * matches the allowed role. Shows fallback (or nothing) when access is denied.
 */
export default function RoleGate({
  allowedRole,
  fallback,
  children,
}: RoleGateProps) {
  const { user } = useAuthStore();
  const userRole = user?.role ?? "guest";

  if (userRole !== allowedRole) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
