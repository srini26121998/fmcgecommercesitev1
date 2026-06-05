// ── Settings Management Types & Zod Schemas ────────────
// Architecture: UI → Component → Hook → Service → Axios → API Gateway → Backend
// These types form the contract between all layers.
// Zod schemas enable runtime validation when swapping mock → real API.

import { z } from "zod";

// ── Enums ─────────────────────────────────────────────────

export type UserStatus = "active" | "inactive" | "suspended";
export type RoleLevel = "super_admin" | "admin" | "manager" | "operator" | "viewer" | "finance";
export type AuditAction = "create" | "update" | "delete" | "login" | "logout" | "export" | "import" | "config_change";
export type AuditEntity =
  | "user"
  | "role"
  | "settings"
  | "payment"
  | "tax"
  | "feature_flag"
  | "api_key"
  | "theme"
  | "system_config"
  | "notification_config"
  | "reports"
  | "products";
export type FeatureFlagEnv = "development" | "staging" | "production";
export type ThemeMode = "light" | "dark" | "system";
export type SystemConfigType = "general" | "security" | "performance" | "integration" | "localization";
export type ApiKeyStatus = "active" | "expired" | "revoked";

// ── User Schema ───────────────────────────────────────────

export const SettingsUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  role: z.enum(["super_admin", "admin", "manager", "operator", "viewer", "finance"]),
  team: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
  mfaEnabled: z.boolean().default(false),
  avatar: z.string().optional(),
  lastLogin: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

export type SettingsUser = z.infer<typeof SettingsUserSchema>;

// ── Role Schema ───────────────────────────────────────────

export const RoleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Role name is required"),
  level: z.enum(["super_admin", "admin", "manager", "operator", "viewer", "finance"]),
  description: z.string().optional(),
  usersCount: z.number().int().nonnegative().default(0),
  isProtected: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  permissions: z.array(
    z.object({
      module: z.string(),
      actions: z.array(z.string()),
    })
  ).default([]),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Role = z.infer<typeof RoleSchema>;

// ── Feature Flag Schema ───────────────────────────────────

export const FeatureFlagSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Flag name is required"),
  key: z.string().min(1, "Flag key is required"),
  description: z.string().optional(),
  enabled: z.boolean().default(false),
  environment: z.enum(["development", "staging", "production"]).default("development"),
  owner: z.string().optional(),
  rolloutPercentage: z.number().int().min(0).max(100).default(100),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  lastToggledBy: z.string().optional(),
  lastToggledAt: z.string().optional(),
});

export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;

// ── Theme Settings Schema ─────────────────────────────────

export const ThemeSettingsSchema = z.object({
  mode: z.enum(["light", "dark", "system"]).default("system"),
  primaryColor: z.string().default("#0c831f"),
  sidebarCollapsed: z.boolean().default(false),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  compactMode: z.boolean().default(false),
  accentColor: z.string().default("#0c831f"),
  borderRadius: z.enum(["sm", "md", "lg"]).default("md"),
  fontFamily: z.enum(["inter", "system", "roboto"]).default("inter"),
  updatedAt: z.string().optional(),
});

export type ThemeSettings = z.infer<typeof ThemeSettingsSchema>;

// ── API Key Schema ────────────────────────────────────────

export const ApiKeySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Key name is required"),
  key: z.string().min(1),
  prefix: z.string().optional(),
  status: z.enum(["active", "expired", "revoked"]).default("active"),
  permissions: z.array(z.string()).default([]),
  rateLimit: z.number().int().nonnegative().default(1000),
  allowedIPs: z.array(z.string()).default([]),
  createdBy: z.string().optional(),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
  lastUsedAt: z.string().optional(),
  usageCount: z.number().int().nonnegative().default(0),
  revokedAt: z.string().optional(),
  revokedBy: z.string().optional(),
});

export type ApiKey = z.infer<typeof ApiKeySchema>;

// ── Audit Log Schema ──────────────────────────────────────

export const AuditLogSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["create", "update", "delete", "login", "logout", "export", "import", "config_change"]),
  entity: z.enum([
    "user", "role", "settings", "payment", "tax", "feature_flag",
    "api_key", "reports", "products", "theme", "system_config", "notification_config",
  ]),
  entityId: z.string().optional(),
  entityName: z.string().optional(),
  performedBy: z.string().min(1),
  performedByEmail: z.string().optional(),
  details: z.string().optional(),
  changes: z
    .array(
      z.object({
        field: z.string(),
        oldValue: z.string().optional(),
        newValue: z.string().optional(),
      })
    )
    .default([])
    .optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  status: z.enum(["success", "failure", "pending"]).default("success"),
  timestamp: z.string(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// ── System Config Schema ──────────────────────────────────

export const SystemConfigSchema = z.object({
  id: z.string().min(1),
  category: z.enum(["general", "security", "performance", "integration", "localization"]),
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean()]),
  type: z.enum(["text", "number", "boolean", "select", "json"]),
  options: z.array(z.string()).optional(),
  description: z.string().optional(),
  isEncrypted: z.boolean().default(false),
  isEditable: z.boolean().default(true),
  updatedBy: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type SystemConfig = z.infer<typeof SystemConfigSchema>;

// ─── Payment Settings ────────────────────────────────────

export const PaymentMethodConfigSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  provider: z.string().optional(),
  fee: z.string().optional(),
  settlement: z.string().optional(),
  limit: z.string().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
});

export type PaymentMethodConfig = z.infer<typeof PaymentMethodConfigSchema>;

export const PaymentSettingsSchema = z.object({
  gateway: z.string().default("Razorpay"),
  gatewayKey: z.string().optional(),
  gatewaySecret: z.string().optional(),
  commission: z.number().nonnegative().default(2.0),
  minCodAmount: z.number().nonnegative().default(500),
  maxCodAmount: z.number().nonnegative().default(5000),
  autoRefundEnabled: z.boolean().default(true),
  refundDays: z.number().int().nonnegative().default(7),
  methods: z.array(PaymentMethodConfigSchema).default([]),
});

export type PaymentSettings = z.infer<typeof PaymentSettingsSchema>;

// ── GST / Tax Settings ────────────────────────────────────

export const TaxRateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rate: z.string().min(1),
  category: z.string().optional(),
  hsn: z.string().optional(),
  type: z.enum(["exempt", "standard", "luxury", "reduced"]).default("standard"),
  applicableOn: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type TaxRate = z.infer<typeof TaxRateSchema>;

export const GstReturnSchema = z.object({
  period: z.string().min(1),
  status: z.enum(["filed", "pending", "overdue"]).default("pending"),
  dueDate: z.string(),
  filedOn: z.string().optional(),
  amount: z.string().optional(),
  notes: z.string().optional(),
});

export type GstReturn = z.infer<typeof GstReturnSchema>;

// ── Notification Config Schema ────────────────────────────

export const NotificationChannelSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().default(true),
  providers: z.string().optional(),
  config: z.record(z.string(), z.unknown()).default({}),
});

export type NotificationChannel = z.infer<typeof NotificationChannelSchema>;

export const NotificationEventMappingSchema = z.object({
  event: z.string().min(1),
  push: z.boolean().default(false),
  email: z.boolean().default(false),
  sms: z.boolean().default(false),
  inApp: z.boolean().default(false),
});

export type NotificationEventMapping = z.infer<typeof NotificationEventMappingSchema>;

// ── Global Settings ───────────────────────────────────────

export const GlobalSettingsSchema = z.object({
  storeName: z.string().min(1),
  supportEmail: z.string().email(),
  supportPhone: z.string(),
  currency: z.string(),
  timezone: z.string(),
  deliveryRadiusKm: z.number().nonnegative(),
});

export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

// ── API Response Types ────────────────────────────────────

export interface SettingsApiResponse<T> {
  success: boolean;
  data: T;
  error?: string | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    cachedAt?: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

// ── Query Params ─────────────────────────────────────────

export interface SettingsQueryParams {
  search?: string;
  status?: string;
  role?: string;
  action?: string;
  entity?: string;
  environment?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

// ── Form Types ────────────────────────────────────────────

export interface CreateUserFormData {
  name: string;
  email: string;
  role: string;
  team?: string;
  mfaRequired?: boolean;
}

export interface CreateRoleFormData {
  name: string;
  description?: string;
  permissions: { module: string; actions: string[] }[];
  isDefault?: boolean;
}

export interface CreateApiKeyFormData {
  name: string;
  permissions: string[];
  rateLimit?: number;
  allowedIPs?: string[];
  expiresAt?: string;
}

export interface UpdateConfigFormData {
  key: string;
  value: string | number | boolean;
}

// ── Role Permission Module ────────────────────────────────

export type PermissionModule =
  | "Dashboard"
  | "Products"
  | "Inventory"
  | "Orders"
  | "Customers"
  | "Promotions"
  | "Reports"
  | "Vendors"
  | "Delivery"
  | "Settings"
  | "Finance"
  | "User Management"
  | "Audit Logs";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export" | "approve";

export const ALL_PERMISSION_MODULES: PermissionModule[] = [
  "Dashboard",
  "Products",
  "Inventory",
  "Orders",
  "Customers",
  "Promotions",
  "Reports",
  "Vendors",
  "Delivery",
  "Settings",
  "Finance",
  "User Management",
  "Audit Logs",
];

export const ALL_PERMISSION_ACTIONS: PermissionAction[] = [
  "view",
  "create",
  "edit",
  "delete",
  "export",
  "approve",
];
