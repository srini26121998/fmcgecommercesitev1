"use client";

import { AlertTriangle, Wifi, WifiOff, X } from "lucide-react";
import { useState } from "react";

interface DataSourceBannerProps {
  /** Whether the data is from a mock/fallback source */
  isMock: boolean;
  /** Module name for display */
  module?: string;
  /** Optional: when was the data last refreshed */
  lastRefreshed?: string;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Show in compact mode (single line) */
  compact?: boolean;
}

/**
 * Banner that indicates whether the admin is viewing real API data
 * or mock/fallback data. Addresses the critical audit finding about
 * silent mock fallback.
 */
export function DataSourceBanner({
  isMock,
  module,
  lastRefreshed,
  dismissible = true,
  compact = false,
}: DataSourceBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !isMock) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
        <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Offline data{module ? ` — ${module}` : ""}</span>
        {dismissible && (
          <button onClick={() => setDismissed(true)} className="ml-auto hover:text-amber-900">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900">
          Viewing Offline Data{module ? ` — ${module}` : ""}
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          The backend API is currently unavailable. The data shown may be outdated or sample data.
          {lastRefreshed && ` Last synced: ${lastRefreshed}`}
        </p>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 p-1 rounded hover:bg-amber-100 text-amber-600 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Small inline badge for data source indication in table headers.
 */
export function DataSourceBadge({ isMock }: { isMock: boolean }) {
  if (!isMock) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Wifi className="w-2.5 h-2.5" />
        Live
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <WifiOff className="w-2.5 h-2.5" />
      Offline
    </span>
  );
}
