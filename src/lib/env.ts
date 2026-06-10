// ── Centralized Environment Configuration ───────────────
// All env vars are read from process.env and exported as a
// single config object so the rest of the app never accesses
// process.env directly.  Missing vars with no fallback will
// throw at runtime so failures are loud and early.

export const env = {
  /** Base URL for the API backend. */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://ecommerce-backend-1-zdlm.onrender.com",

  /** Current environment. */
  nodeEnv: process.env.NODE_ENV as "development" | "production" | "test",

  /** Optional: your site URL (used for OG images, sitemaps, etc.). */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ecommerce-backend-1-zdlm.onrender.com",
} as const;

// ── Helpers ────────────────────────────────────────────

/** True when running in development mode. */
export const isDev = env.nodeEnv === "development";

/** True when running in production mode. */
export const isProd = env.nodeEnv === "production";
