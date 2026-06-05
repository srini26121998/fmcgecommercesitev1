"use client";

import { useState, useCallback } from "react";

// ── Types ────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  /** Optional impact analysis text (e.g., "This product is in 3 active orders") */
  impact?: string;
  loading?: boolean;
}

// ── Component ────────────────────────────────────────────

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  impact,
  loading = false,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const isLoading = loading || isProcessing;

  if (!open) return null;

  const variantStyles = {
    danger: {
      icon: "🗑️",
      bg: "bg-red-50",
      border: "border-red-200",
      button: "bg-red-600 hover:bg-red-700 text-white",
      iconBg: "bg-red-100",
    },
    warning: {
      icon: "⚠️",
      bg: "bg-amber-50",
      border: "border-amber-200",
      button: "bg-amber-600 hover:bg-amber-700 text-white",
      iconBg: "bg-amber-100",
    },
    info: {
      icon: "ℹ️",
      bg: "bg-blue-50",
      border: "border-blue-200",
      button: "bg-blue-600 hover:bg-blue-700 text-white",
      iconBg: "bg-blue-100",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Dialog */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-xl border ${styles.border} ${styles.bg} shadow-2xl animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="p-6">
          {/* Icon + Title */}
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center text-lg`}
            >
              {styles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
          </div>

          {/* Impact Warning */}
          {impact && (
            <div className="mt-4 p-3 rounded-lg bg-white/60 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Impact Analysis
              </p>
              <p className="text-sm text-gray-700">{impact}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${styles.button}`}
            >
              {isLoading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hook ─────────────────────────────────────────────────

interface UseConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  variant?: "danger" | "warning" | "info";
  impact?: string;
}

/**
 * Hook for easy confirmation dialog usage.
 *
 * @example
 * const { confirm, ConfirmDialogElement } = useConfirm({
 *   title: "Delete Product?",
 *   description: "This action cannot be undone.",
 *   variant: "danger",
 * });
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm();
 *   if (confirmed) { ... }
 * };
 *
 * return <>{ConfirmDialogElement}</>;
 */
export function useConfirm(defaults: UseConfirmOptions) {
  const [state, setState] = useState<{
    open: boolean;
    resolve: ((value: boolean) => void) | null;
    options: UseConfirmOptions;
  }>({
    open: false,
    resolve: null,
    options: defaults,
  });

  const confirm = useCallback(
    (overrides?: Partial<UseConfirmOptions>): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          open: true,
          resolve,
          options: { ...defaults, ...overrides },
        });
      });
    },
    [defaults]
  );

  const handleClose = useCallback(() => {
    state.resolve?.(false);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  }, [state.resolve]);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((prev) => ({ ...prev, open: false, resolve: null }));
  }, [state.resolve]);

  const ConfirmDialogElement = (
    <ConfirmDialog
      open={state.open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={state.options.title}
      description={state.options.description}
      confirmLabel={state.options.confirmLabel}
      variant={state.options.variant}
      impact={state.options.impact}
    />
  );

  return { confirm, ConfirmDialogElement };
}
