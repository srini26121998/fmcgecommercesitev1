"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { useEffect, useState } from "react";

export default function AmazonWelcomeStrip() {
  const { isLoggedIn, isGuest, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoggedIn && !isGuest && user) {
    return null;
  }

  return (
    <div className="w-full bg-white py-8 border-t border-b border-[#e8e8e8] my-4 flex flex-col items-center justify-center">
      <h3 className="text-sm font-semibold text-[#1a1a1a] mb-1">
        See personalized recommendations
      </h3>
      <Link
        href="/account"
        className="bg-[#f0c14b] border border-[#a88734] hover:bg-[#e4b542] text-[#111] font-bold py-1.5 px-16 rounded shadow-sm transition-colors text-sm"
      >
        Sign in
      </Link>
      <div className="mt-2 text-xs text-[#1a1a1a]">
        New customer?{" "}
        <Link href="/account" className="text-[#007185] hover:text-[#c40000] hover:underline">
          Start here.
        </Link>
      </div>
    </div>
  );
}
