"use client";

import { QueryProvider } from "@/lib/query-provider";
import PageTransition from "@/components/ui/page-transition";
import CursorGlow from "@/components/ui/cursor-glow";
import dynamic from "next/dynamic";

const AuthGate = dynamic(() => import("@/components/ui/auth/auth-gate"), { ssr: false });
const OfflineIndicator = dynamic(() => import("@/components/ui/mobile/offline-indicator"), { ssr: false });
import AnimatedBackground from "@/components/ui/animated-background";
import GlobalComparison from "@/components/ui/products/global-comparison";

export default function LayoutClient({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <QueryProvider>
      <AnimatedBackground />
      <AuthGate />
      <OfflineIndicator />
      <PageTransition>
        <CursorGlow />
        {children}
        <GlobalComparison />
      </PageTransition>
    </QueryProvider>
  );
}
