// ── Admin Panel Validation Schemas ───────────────────────
// Comprehensive Zod schemas for all admin forms.
// Covers: Inventory, Orders, Promotions, Vendors, Delivery, Settings
// Usage: import { inventorySchemas } from "@/validation/admin";

import { z } from "zod";

// ── Inventory ────────────────────────────────────────────

export const inventorySchemas = {
  /** Stock adjustment form */
  adjustStock: z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z
      .number({ message: "Quantity must be a number" })
      .int("Quantity must be a whole number")
      .refine((val) => val !== 0, "Quantity cannot be zero"),
    type: z.enum(["IN", "OUT", "ADJUSTMENT"], {
      message: "Select a valid adjustment type",
    }),
    reason: z.string().max(500, "Reason must be under 500 characters").optional(),
    warehouseId: z.string().optional(),
    batchNumber: z.string().max(50).optional(),
    expiryDate: z.string().optional(),
  }),

  /** Stock transfer between warehouses */
  stockTransfer: z
    .object({
      fromWarehouseId: z.string().min(1, "Source warehouse is required"),
      toWarehouseId: z.string().min(1, "Destination warehouse is required"),
      productId: z.string().min(1, "Product is required"),
      quantity: z
        .number()
        .int("Quantity must be a whole number")
        .positive("Quantity must be positive"),
      notes: z.string().max(500).optional(),
    })
    .refine((data) => data.fromWarehouseId !== data.toWarehouseId, {
      message: "Source and destination warehouse cannot be the same",
      path: ["toWarehouseId"],
    }),

  /** Safety stock rule */
  safetyStock: z.object({
    productId: z.string().min(1, "Product is required"),
    threshold: z
      .number()
      .int()
      .nonnegative("Threshold cannot be negative"),
    reorderPoint: z
      .number()
      .int()
      .nonnegative("Reorder point cannot be negative")
      .optional(),
    reorderQuantity: z
      .number()
      .int()
      .positive("Reorder quantity must be positive")
      .optional(),
  }),

  /** FEFO batch */
  fefoBatch: z.object({
    productId: z.string().min(1, "Product is required"),
    batchNumber: z.string().min(1, "Batch number is required"),
    quantity: z.number().int().positive("Quantity must be positive"),
    expiryDate: z.string().min(1, "Expiry date is required").refine(
      (val) => new Date(val) > new Date(),
      "Expiry date must be in the future"
    ),
    warehouseId: z.string().optional(),
  }),
};

// ── Orders ───────────────────────────────────────────────

export const orderSchemas = {
  /** Update order status */
  updateStatus: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    status: z.enum(
      ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled", "returned"],
      { message: "Select a valid status" }
    ),
    note: z.string().max(500, "Note must be under 500 characters").optional(),
  }),

  /** Assign delivery partner */
  assignPartner: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    partnerId: z.string().min(1, "Delivery partner is required"),
    notes: z.string().max(500).optional(),
  }),

  /** Bulk action */
  bulkAction: z.object({
    actionType: z.string().min(1, "Action type is required"),
    orderIds: z
      .array(z.string())
      .min(1, "Select at least one order"),
    targetStatus: z.string().optional(),
  }),

  /** Substitution decision */
  substitutionDecision: z.object({
    substitutionId: z.string().min(1, "Substitution ID is required"),
    status: z.enum(["approved", "rejected"], {
      message: "Select approve or reject",
    }),
    decidedBy: z.string().min(1, "Decided by is required"),
  }),

  /** Order note */
  addNote: z.object({
    orderId: z.string().min(1, "Order ID is required"),
    note: z.string().min(1, "Note cannot be empty").max(1000, "Note must be under 1000 characters"),
    performedBy: z.string().min(1, "Author is required"),
  }),
};

// ── Promotions ───────────────────────────────────────────

export const promotionSchemas = {
  /** Create/update promotion */
  promotion: z
    .object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(200, "Name must be under 200 characters"),
      description: z.string().max(1000).optional(),
      type: z.enum(["discount", "bogo", "bundle", "cashback", "freebie"], {
        message: "Select a valid promotion type",
      }),
      discountType: z.enum(["percentage", "fixed"]).default("percentage"),
      discountValue: z
        .number()
        .positive("Discount must be positive"),
      minOrder: z.number().nonnegative("Minimum order cannot be negative").optional(),
      maxDiscount: z.number().positive("Max discount must be positive").optional(),
      usageLimit: z.number().int().nonnegative().optional(),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().min(1, "End date is required"),
      status: z.enum(["draft", "active", "scheduled", "paused", "expired"]).default("draft"),
    })
    .refine(
      (data) => new Date(data.endDate) > new Date(data.startDate),
      { message: "End date must be after start date", path: ["endDate"] }
    )
    .refine(
      (data) => data.discountType !== "percentage" || data.discountValue <= 100,
      { message: "Percentage discount cannot exceed 100%", path: ["discountValue"] }
    ),

  /** Create/update coupon */
  coupon: z.object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code must be under 20 characters")
      .regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores"),
    type: z.enum(["public", "private", "one_time"]).default("public"),
    discountType: z.enum(["percentage", "fixed"]).default("percentage"),
    discountValue: z.number().positive("Discount must be positive"),
    minOrder: z.number().nonnegative().optional(),
    maxDiscount: z.number().positive().optional(),
    totalIssued: z.number().int().positive("Total issued must be positive").optional(),
    perUserLimit: z.number().int().positive("Per-user limit must be positive").optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),

  /** Flash sale */
  flashSale: z
    .object({
      name: z.string().min(2, "Name is required").max(200),
      description: z.string().max(500).optional(),
      discountValue: z.number().positive("Discount must be positive"),
      discountType: z.enum(["percentage", "fixed"]).default("percentage"),
      productCount: z.number().int().nonnegative().optional(),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().min(1, "End date is required"),
    })
    .refine(
      (data) => new Date(data.endDate) > new Date(data.startDate),
      { message: "End date must be after start date", path: ["endDate"] }
    ),

  /** Push notification */
  pushNotification: z.object({
    title: z.string().min(1, "Title is required").max(100, "Title must be under 100 characters"),
    body: z.string().min(1, "Body is required").max(500, "Body must be under 500 characters"),
    audience: z.string().min(1, "Audience is required"),
    imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
    deepLink: z.string().optional(),
  }),

  /** A/B test */
  abTest: z.object({
    name: z.string().min(2, "Name is required").max(200),
    description: z.string().max(500).optional(),
    variantA: z.object({ label: z.string().min(1, "Variant A label is required") }),
    variantB: z.object({ label: z.string().min(1, "Variant B label is required") }),
    audience: z.string().optional(),
  }),
};

// ── Vendors ──────────────────────────────────────────────

export const vendorSchemas = {
  /** Create/update vendor */
  vendor: z.object({
    name: z.string().min(2, "Vendor name is required").max(200),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .min(10, "Phone must be at least 10 digits")
      .max(15, "Phone must be under 15 digits"),
    category: z.string().min(1, "Category is required"),
    commissionRate: z
      .number()
      .min(0, "Commission rate cannot be negative")
      .max(100, "Commission rate cannot exceed 100%"),
    gstin: z
      .string()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format")
      .optional()
      .or(z.literal("")),
    pan: z
      .string()
      .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
      .optional()
      .or(z.literal("")),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    pincode: z.string().max(10).optional(),
    bankAccount: z.string().max(20).optional(),
    ifsc: z.string().max(11).optional(),
    contactPerson: z.string().max(200).optional(),
  }),
};

// ── Customers ────────────────────────────────────────────

export const customerSchemas = {
  /** Add customer note */
  addNote: z.object({
    content: z.string().min(1, "Note cannot be empty").max(1000, "Note must be under 1000 characters"),
    performedBy: z.string().min(1, "Author is required"),
  }),

  /** Update customer status */
  updateStatus: z.object({
    status: z.enum(["active", "inactive", "blocked", "churned"], {
      message: "Select a valid status",
    }),
  }),

  /** Support ticket message */
  ticketMessage: z.object({
    content: z.string().min(1, "Message cannot be empty").max(2000, "Message must be under 2000 characters"),
    sender: z.string().min(1, "Sender is required"),
    senderRole: z.enum(["customer", "agent", "system"]),
  }),
};

// ── Settings ─────────────────────────────────────────────

export const settingsSchemas = {
  /** Create user */
  createUser: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    role: z.string().min(1, "Role is required"),
    team: z.string().optional(),
    mfaRequired: z.boolean().optional(),
  }),

  /** Create role */
  createRole: z.object({
    name: z.string().min(2, "Role name must be at least 2 characters").max(50),
    description: z.string().max(500).optional(),
    permissions: z
      .array(z.string())
      .min(1, "At least one permission is required"),
  }),

  /** Create API key */
  createApiKey: z.object({
    name: z.string().min(2, "Key name is required").max(100),
    permissions: z
      .array(z.string())
      .min(1, "At least one permission is required"),
    rateLimit: z
      .number()
      .int()
      .positive("Rate limit must be positive")
      .max(100000, "Rate limit too high")
      .optional(),
    expiresAt: z.string().optional(),
    allowedIPs: z.array(z.string()).optional(),
  }),

  /** Password change */
  changePassword: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Must contain at least one uppercase letter")
        .regex(/[a-z]/, "Must contain at least one lowercase letter")
        .regex(/[0-9]/, "Must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
      confirmPassword: z.string().min(1, "Confirm your password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }),
};

// ── Media / File Upload ──────────────────────────────────

export const mediaSchemas = {
  /** File upload validation */
  fileUpload: z.object({
    files: z
      .array(
        z.object({
          name: z.string(),
          size: z.number().max(5 * 1024 * 1024, "File size must be under 5MB"),
          type: z.string().refine(
            (type) => ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4"].includes(type),
            "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, MP4"
          ),
        })
      )
      .min(1, "Select at least one file")
      .max(10, "Maximum 10 files allowed"),
  }),

  /** CSV upload for bulk import */
  csvUpload: z.object({
    file: z.object({
      name: z.string().refine(
        (name) => name.endsWith(".csv") || name.endsWith(".xlsx"),
        "Only CSV and XLSX files are allowed"
      ),
      size: z.number().max(10 * 1024 * 1024, "File size must be under 10MB"),
    }),
  }),
};

// ── Delivery ─────────────────────────────────────────────

export const deliverySchemas = {
  /** Assign delivery */
  assignDelivery: z.object({
    orderId: z.string().min(1, "Order is required"),
    partnerId: z.string().min(1, "Delivery partner is required"),
    priority: z.enum(["normal", "express", "urgent"]).default("normal"),
    notes: z.string().max(500).optional(),
  }),

  /** Update delivery status */
  updateStatus: z.object({
    deliveryId: z.string().min(1, "Delivery ID is required"),
    status: z.enum(["assigned", "picked_up", "in_transit", "out_for_delivery", "delivered", "failed", "returned"], {
      message: "Select a valid delivery status",
    }),
    note: z.string().max(500).optional(),
  }),
};

// ── Helper: validate and return errors ───────────────────

/**
 * Validate data against a schema and return structured errors.
 * @returns null if valid, or an object mapping field paths to error messages.
 */
export function validateForm<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (!errors[path]) {
      errors[path] = issue.message;
    }
  }
  return { success: false, errors };
}
