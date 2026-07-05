// ── Admin Toast Utility ──────────────────────────────────
// Centralized notification helpers for admin panel.
// Provides consistent API failure indicators so admins always know
// whether they're seeing real data or mock fallback.
//
// Usage:
//   import { adminToast } from "@/lib/admin-toast";
//   adminToast.apiError("Failed to load orders");
//   adminToast.mockFallback("Orders");
//   adminToast.success("Order updated");
//   adminToast.confirmAction("Delete this product?", onConfirm);

import { toast } from "sonner";

export const adminToast = {
  /**
   * Show a success notification.
   */
  success(message: string, description?: string) {
    toast.success(message, { description, duration: 3000 });
  },

  /**
   * Show a general error notification.
   */
  error(message: string, description?: string) {
    toast.error(message, { description, duration: 4000 });
  },

  /**
   * Show an error notification for API failures.
   */
  apiError(message: string, details?: string) {
    toast.error(message, {
      description: details || "Please try again or contact support.",
      duration: 6000,
    });
  },

  /**
   * Show a warning that the UI is displaying mock/cached data.
   * CRITICAL: This addresses the silent fallback issue.
   */
  mockFallback(moduleName: string) {
    toast.warning(`${moduleName}: Showing offline data`, {
      description: "The API is unavailable. Data shown may be outdated.",
      duration: 8000,
    });
  },

  /**
   * Show a warning notification.
   */
  warning(message: string, description?: string) {
    toast.warning(message, { description, duration: 5000 });
  },

  /**
   * Show an info notification.
   */
  info(message: string, description?: string) {
    toast.info(message, { description, duration: 4000 });
  },

  /**
   * Show validation error with field-level details.
   */
  validationError(errors: Record<string, string>) {
    const firstThree = Object.entries(errors).slice(0, 3);
    const message = firstThree.map(([field, msg]) => `• ${msg}`).join("\n");
    const remaining = Object.keys(errors).length - 3;
    toast.error("Validation Error", {
      description: message + (remaining > 0 ? `\n...and ${remaining} more` : ""),
      duration: 6000,
    });
  },

  /**
   * Show loading toast that can be updated.
   * Returns the toast ID for updating.
   */
  loading(message: string): string | number {
    return toast.loading(message);
  },

  /**
   * Dismiss a toast by ID.
   */
  dismiss(id: string | number) {
    toast.dismiss(id);
  },

  /**
   * Update a loading toast to success.
   */
  loadingSuccess(id: string | number, message: string) {
    toast.success(message, { id, duration: 3000 });
  },

  /**
   * Update a loading toast to error.
   */
  loadingError(id: string | number, message: string) {
    toast.error(message, { id, duration: 5000 });
  },
};
