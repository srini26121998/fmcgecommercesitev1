// ── Promotions & Campaign Management Zod Schemas & Types ─
// Architecture: UI → Component → Hook → Service → API Gateway → Backend

import { z } from "zod";

// ── Enums ────────────────────────────────────────────────

export type PromotionType = "coupon" | "discount" | "flash_sale" | "buy_x_get_y" | "bogo";
export type DiscountType = "percentage" | "fixed" | "bogo";
export type PromotionStatus = "active" | "scheduled" | "expired" | "paused" | "draft";
export type CouponType = "public" | "new_user" | "vip" | "loyalty" | "referral" | "free_delivery";
export type CampaignStatus = "active" | "scheduled" | "draft" | "completed";
export type CampaignChannel = "push" | "email" | "sms" | "in_app" | "whatsapp";
export type NotificationStatus = "sent" | "scheduled" | "draft" | "failed";
export type ABTestStatus = "running" | "completed" | "draft" | "paused";
export type FlashSaleStatus = "live" | "scheduled" | "completed" | "cancelled";
export type AudienceTarget = "all_users" | "new_users" | "active_users" | "vip" | "at_risk" | "segment" | "abandoned_cart";

// ── Promotion ────────────────────────────────────────────

export const PromotionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  type: z.enum(["coupon", "discount", "flash_sale", "buy_x_get_y", "bogo"]),
  discountType: z.enum(["percentage", "fixed", "bogo"]),
  discountValue: z.number().nonnegative(),
  minOrder: z.number().nonnegative().optional(),
  maxDiscount: z.number().nonnegative().optional(),
  usageLimit: z.number().int().nonnegative(),
  usageCount: z.number().int().nonnegative(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["active", "scheduled", "expired", "paused", "draft"]),
  applicableCategories: z.array(z.string()).default([]),
  applicableProducts: z.array(z.string()).default([]),
  budget: z.string().default("₹0"),
  spent: z.string().default("₹0"),
  createdBy: z.string().default("Admin"),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Promotion = z.infer<typeof PromotionSchema>;

// ── Coupon ───────────────────────────────────────────────

export const CouponSchema = z.object({
  id: z.string(),
  code: z.string().min(1, "Coupon code is required"),
  type: z.enum(["public", "new_user", "vip", "loyalty", "referral", "free_delivery"]),
  discount: z.string(),
  discountType: z.enum(["percentage", "fixed", "bogo", "free_delivery"]),
  discountValue: z.number().nonnegative(),
  minOrder: z.number().nonnegative().default(0),
  maxDiscount: z.number().nonnegative().optional(),
  totalIssued: z.number().int().nonnegative(),
  totalUsed: z.number().int().nonnegative(),
  perUserLimit: z.number().int().nonnegative().default(1),
  status: z.enum(["active", "scheduled", "expired", "paused"]),
  startDate: z.string(),
  endDate: z.string(),
  createdBy: z.string().default("Admin"),
  createdAt: z.string(),
});
export type Coupon = z.infer<typeof CouponSchema>;

// ── Flash Sale ───────────────────────────────────────────

export const FlashSaleSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().default(""),
  discount: z.string(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().nonnegative(),
  productCount: z.number().int().nonnegative(),
  products: z.array(z.string()).default([]),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(["live", "scheduled", "completed", "cancelled"]),
  budget: z.string(),
  spent: z.string().default("₹0"),
  createdBy: z.string().default("Admin"),
  createdAt: z.string(),
});
export type FlashSale = z.infer<typeof FlashSaleSchema>;

// ── Campaign ─────────────────────────────────────────────

export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().default(""),
  channels: z.array(z.enum(["push", "email", "sms", "in_app", "whatsapp"])),
  audience: z.string(),
  audienceTarget: z.enum(["all_users", "new_users", "active_users", "vip", "at_risk", "segment", "abandoned_cart"]).default("all_users"),
  budget: z.string(),
  status: z.enum(["active", "scheduled", "draft", "completed"]),
  sent: z.string().default("—"),
  opens: z.string().default("—"),
  clicks: z.string().default("—"),
  conversionRate: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  createdBy: z.string().default("Admin"),
  createdAt: z.string(),
});
export type Campaign = z.infer<typeof CampaignSchema>;

// ── Push Notification ────────────────────────────────────

export const PushNotificationSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  body: z.string().default(""),
  audience: z.string(),
  audienceTarget: z.enum(["all_users", "new_users", "active_users", "vip", "at_risk", "segment", "abandoned_cart"]).default("all_users"),
  imageUrl: z.string().optional(),
  deepLink: z.string().optional(),
  status: z.enum(["sent", "scheduled", "draft", "failed"]),
  sent: z.string().default("—"),
  opened: z.string().default("—"),
  clicked: z.string().default("—"),
  scheduledAt: z.string().default("—"),
  sentAt: z.string().default("—"),
  createdBy: z.string().default("Admin"),
  createdAt: z.string(),
});
export type PushNotification = z.infer<typeof PushNotificationSchema>;

// ── A/B Test ─────────────────────────────────────────────

export const ABTestSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().default(""),
  variantA: z.object({ label: z.string(), description: z.string().optional(), impressions: z.number().int().nonnegative().default(0), conversions: z.number().int().nonnegative().default(0), revenue: z.string().default("₹0"), conversionRate: z.string().default("—") }),
  variantB: z.object({ label: z.string(), description: z.string().optional(), impressions: z.number().int().nonnegative().default(0), conversions: z.number().int().nonnegative().default(0), revenue: z.string().default("₹0"), conversionRate: z.string().default("—") }),
  audience: z.string().default("50% each"),
  totalImpressions: z.number().int().nonnegative().default(0),
  winner: z.string().nullable().default(null),
  confidence: z.number().min(0).max(100).default(0),
  status: z.enum(["running", "completed", "draft", "paused"]),
  startedAt: z.string(),
  endedAt: z.string().nullable().default(null),
  createdBy: z.string().default("Admin"),
  createdAt: z.string(),
});
export type ABTest = z.infer<typeof ABTestSchema>;

// ── Campaign Analytics ───────────────────────────────────

export const CampaignAnalyticsSchema = z.object({
  totalPromotions: z.number().int().nonnegative(),
  activePromotions: z.number().int().nonnegative(),
  scheduledPromotions: z.number().int().nonnegative(),
  totalUsage: z.number().int().nonnegative(),
  totalRevenue: z.string(),
  avgConversionRate: z.string(),
  totalReach: z.string(),
  promotionsByType: z.record(z.string(), z.number().int().nonnegative()),
  promotionsByStatus: z.record(z.string(), z.number().int().nonnegative()),
  topPromotions: z.array(z.object({ id: z.string(), name: z.string(), usageCount: z.number().int().nonnegative(), revenue: z.string() })),
  recentActivity: z.array(z.object({ date: z.string(), action: z.string(), description: z.string() })),
});
export type CampaignAnalytics = z.infer<typeof CampaignAnalyticsSchema>;

// ── Filters ──────────────────────────────────────────────

export const PromotionFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  dateRange: z.string().optional(),
});
export type PromotionFilters = z.infer<typeof PromotionFiltersSchema>;

export const CouponFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});
export type CouponFilters = z.infer<typeof CouponFiltersSchema>;

export const ABTestFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
});
export type ABTestFilters = z.infer<typeof ABTestFiltersSchema>;

// ── Response Types ───────────────────────────────────────

export interface PromotionsListResponse {
  promotions: Promotion[];
  pagination: { page: number; pageSize: number; total: number };
  summary: {
    total: number;
    active: number;
    scheduled: number;
    expired: number;
    totalUsage: number;
    totalBudget: string;
  };
}

export interface CouponsListResponse {
  coupons: Coupon[];
  pagination: { page: number; pageSize: number; total: number };
  summary: {
    total: number;
    active: number;
    scheduled: number;
    expired: number;
    totalUsed: number;
    totalIssued: number;
  };
}
