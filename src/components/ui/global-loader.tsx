"use client";

import { useGlobalLoaderStore } from "@/store/global-loader-store";
import { AnimatedLoader } from "@/components/ui/animated-loader";

export function GlobalLoader() {
  const activeRequests = useGlobalLoaderStore((state) => state.activeRequests);

  if (activeRequests === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50 backdrop-blur-sm transition-all duration-300">
      <AnimatedLoader />
    </div>
  );
}
