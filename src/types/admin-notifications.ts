// ── Admin Notification Types ──────────────────────────────
// Zod schemas + TypeScript interfaces for the notification system

import { z } from "zod/v4";

// ── Enum Schemas ──────────────────────────────────────────

export const NotificationCategorySchema = z.enum([
  "order",
  "inventory",
  "promotion",
  "vendor",
  "delivery",
  "customer",
  "system",
  "security",
  "billing",
]);

export const NotificationPrioritySchema = z.enum([
  "low",
  "normal",
  "high",
  "critical",
]);

export const NotificationChannelSchema = z.enum([
  "in_app",
  "email",
  "sms",
  "push",
]);

// ── Entity Schemas ────────────────────────────────────────

export const AdminNotificationSchema = z.object({
  id: z.string().min(1, "Notification ID is required"),
  type: NotificationCategorySchema,
  priority: NotificationPrioritySchema,
  title: z.string().min(1, "Title is required").max(200),
  message: z.string().max(500).default(""),
  channel: NotificationChannelSchema.default("in_app"),
  read: z.boolean().default(false),
  archived: z.boolean().default(false),
  actionUrl: z.string().url().optional().nullable(),
  actionLabel: z.string().max(50).optional().nullable(),
  actor: z
    .object({
      id: z.string(),
      name: z.string(),
      avatar: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  createdAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  updatedAt: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
});

export const NotificationPreferencesSchema = z.object({
  orderUpdates: z.boolean().default(true),
  inventoryAlerts: z.boolean().default(true),
  promotionPerformance: z.boolean().default(true),
  vendorActivity: z.boolean().default(true),
  deliveryExceptions: z.boolean().default(true),
  customerActivity: z.boolean().default(false),
  systemAlerts: z.boolean().default(true),
  securityAlerts: z.boolean().default(true),
  billingAlerts: z.boolean().default(true),
  emailDigest: z.enum(["none", "daily", "weekly"]).default("daily"),
  pushEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  quietHoursEnabled: z.boolean().default(false),
  quietHoursStart: z.string().optional().nullable(),
  quietHoursEnd: z.string().optional().nullable(),
});

export const NotificationGroupSchema = z.object({
  label: z.string(),
  notifications: z.array(AdminNotificationSchema),
  unreadCount: z.number().int().nonnegative(),
});

export const NotificationFeedSchema = z.object({
  groups: z.array(NotificationGroupSchema),
  totalUnread: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
});

// ── Inferred Types ────────────────────────────────────────

export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;
export type NotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;
export type AdminNotification = z.infer<typeof AdminNotificationSchema>;
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
export type NotificationGroup = z.infer<typeof NotificationGroupSchema>;
export type NotificationFeed = z.infer<typeof NotificationFeedSchema>;

// ── Query Params ──────────────────────────────────────────

export interface NotificationQueryParams {
  page?: number;
  pageSize?: number;
  type?: NotificationCategory | "all";
  status?: "all" | "unread" | "read" | "archived" | "active";
  search?: string;
  priority?: NotificationPriority | "all";
  startDate?: string;
  endDate?: string;
}

// ── Notification Stats ────────────────────────────────────

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationCategory, number>;
  byPriority: Record<NotificationPriority, number>;
  trend: number;
}

// ── Action Types ──────────────────────────────────────────

export interface BulkNotificationAction {
  label: string;
  value: "mark_read" | "mark_unread" | "archive" | "delete";
}

export type NotificationFilterTab = "all" | "unread" | "mentions" | "activity" | "system";
