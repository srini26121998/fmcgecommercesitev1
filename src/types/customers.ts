// ── Customer Management Zod Schemas & Types ─────────────
// Architecture: UI → Component → Hook → Service → API Gateway → Backend

import { z } from "zod";

// ── Enums ────────────────────────────────────────────────

export type CustomerStatus = "active" | "inactive" | "blocked" | "suspended";
export type CustomerSegment = "vip" | "premium" | "regular" | "new" | "at_risk" | "churned";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type FraudStatus = "monitoring" | "flagged" | "investigating" | "blocked" | "cleared";
export type CustomerAction = "created" | "updated" | "blocked" | "suspended" | "note_added" | "segment_changed" | "login" | "order_placed" | "email_sent";
export type ExportFormat = "csv" | "xlsx" | "pdf";
export type ExportStatus = "pending" | "processing" | "completed" | "failed";

// ── Customer Profile ─────────────────────────────────────

export const CustomerAddressSchema = z.object({
  id: z.string(),
  label: z.string().default("Home"),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  pincode: z.string().min(6),
  isDefault: z.boolean().default(false),
});
export type CustomerAddress = z.infer<typeof CustomerAddressSchema>;

export const CustomerNoteSchema = z.object({
  id: z.string(),
  content: z.string().min(1),
  performedBy: z.string(),
  createdAt: z.string(),
});
export type CustomerNote = z.infer<typeof CustomerNoteSchema>;

export const CustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10),
  avatar: z.string().optional(),
  addresses: z.array(CustomerAddressSchema).default([]),
  totalOrders: z.number().int().nonnegative(),
  totalSpent: z.number().nonnegative(),
  avgOrderValue: z.number().nonnegative().default(0),
  segment: z.enum(["vip", "premium", "regular", "new", "at_risk", "churned"]),
  status: z.enum(["active", "inactive", "blocked", "suspended"]),
  tags: z.array(z.string()).default([]),
  lifetimeValue: z.string().optional(),
  acquisitionChannel: z.string().optional(),
  lastOrderDate: z.string().optional(),
  registeredAt: z.string(),
  updatedAt: z.string(),
  notes: z.array(CustomerNoteSchema).default([]),
  city: z.string().default(""),
  state: z.string().default(""),
  pincode: z.string().optional(),
});
export type Customer = z.infer<typeof CustomerSchema>;

// ── Customer Activity / Timeline ─────────────────────────

export const CustomerActivitySchema = z.object({
  id: z.string(),
  customerId: z.string(),
  action: z.enum(["created", "updated", "blocked", "suspended", "note_added", "segment_changed", "login", "order_placed", "email_sent"]),
  description: z.string(),
  performedBy: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  timestamp: z.string(),
});
export type CustomerActivity = z.infer<typeof CustomerActivitySchema>;

// ── Segmentation ─────────────────────────────────────────

export const SegmentSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string().min(1),
  description: z.string().default(""),
  color: z.string().default("#0c831f"),
  icon: z.string().default("Users"),
  customerCount: z.number().int().nonnegative().optional().default(0),
  avgOrderValue: z.number().nonnegative().optional().default(0),
  totalRevenue: z.number().nonnegative().optional().default(0),
  avgLifetimeValue: z.string().default("₹0"),
  retentionRate: z.number().min(0).max(100).optional().default(0),
  criteria: z.union([
    z.string(),
    z.object({
      minOrders: z.number().int().nonnegative().optional(),
      minSpent: z.number().nonnegative().optional(),
      maxInactiveDays: z.number().int().nonnegative().optional(),
      acquisitionChannel: z.string().optional(),
    })
  ]).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Segment = z.infer<typeof SegmentSchema>;

// ── Customer Analytics ───────────────────────────────────

export const AnalyticsMetricSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  change: z.string().optional(),
  trend: z.enum(["up", "down", "stable"]).optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
});
export type AnalyticsMetric = z.infer<typeof AnalyticsMetricSchema>;

export const CohortDataSchema = z.object({
  month: z.string(),
  acquired: z.number().int().nonnegative(),
  retentionRates: z.array(z.number().min(0).max(100)),
});
export type CohortData = z.infer<typeof CohortDataSchema>;

// ── Support Tickets ──────────────────────────────────────

export const TicketMessageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  senderRole: z.enum(["customer", "agent", "system"]),
  content: z.string(),
  attachments: z.array(z.string()).default([]),
  createdAt: z.string(),
});
export type TicketMessage = z.infer<typeof TicketMessageSchema>;

export const SupportTicketSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customer: z.string(),
  email: z.string().email(),
  subject: z.string().min(1),
  description: z.string().default(""),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  category: z.string().optional(),
  assignedTo: z.string().nullable().default(null),
  messages: z.array(TicketMessageSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
  resolvedAt: z.string().nullable().default(null),
});
export type SupportTicket = z.infer<typeof SupportTicketSchema>;

// ── Fraud Detection ──────────────────────────────────────

export const SuspiciousActivitySchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  activity: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  timestamp: z.string(),
  ipAddress: z.string(),
  device: z.string(),
  details: z.string(),
  status: z.enum(["new", "investigating", "resolved"]),
});
export type SuspiciousActivity = z.infer<typeof SuspiciousActivitySchema>;

export const FraudAlertSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  email: z.string().email(),
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(["low", "medium", "high", "critical"]),
  reason: z.string(),
  status: z.enum(["monitoring", "flagged", "investigating", "blocked", "cleared"]),
  ipAddress: z.string().optional(),
  device: z.string().optional(),
  lastFlagged: z.string(),
  totalFlags: z.number().int().nonnegative(),
  actionTaken: z.string().optional(),
  flaggedBy: z.string().default("System"),
  resolvedAt: z.string().nullable().default(null),
});
export type FraudAlert = z.infer<typeof FraudAlertSchema>;

// ── Data Export / Delete Requests ────────────────────────

export const ExportRequestSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  type: z.enum(["csv", "xlsx", "pdf"]),
  scope: z.string().default("all"),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  fileUrl: z.string().nullable().default(null),
  requestedBy: z.string(),
  requestedAt: z.string(),
  completedAt: z.string().nullable().default(null),
});
export type ExportRequest = z.infer<typeof ExportRequestSchema>;

// ── Filters & Pagination ─────────────────────────────────

export const CustomerFiltersSchema = z.object({
  search: z.string().optional(),
  segment: z.string().optional(),
  status: z.string().optional(),
  city: z.string().optional(),
  acquisitionChannel: z.string().optional(),
  minOrders: z.number().int().nonnegative().optional(),
  minSpent: z.number().nonnegative().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
export type CustomerFilters = z.infer<typeof CustomerFiltersSchema>;

export const TicketFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
});
export type TicketFilters = z.infer<typeof TicketFiltersSchema>;

export const FraudFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  riskLevel: z.string().optional(),
  minScore: z.number().min(0).max(100).optional(),
});
export type FraudFilters = z.infer<typeof FraudFiltersSchema>;

// ── Response Types ───────────────────────────────────────

export interface CustomersListResponse {
  customers: Customer[];
  pagination: { page: number; pageSize: number; total: number };
  summary: {
    total: number;
    active: number;
    vip: number;
    new: number;
    atRisk: number;
    churned: number;
    totalRevenue: number;
    avgOrderValue: number;
  };
}

export interface TicketsListResponse {
  tickets: SupportTicket[];
  pagination: { page: number; pageSize: number; total: number };
  summary: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    urgent: number;
  };
}

export interface FraudListResponse {
  alerts: FraudAlert[];
  pagination: { page: number; pageSize: number; total: number };
  summary: {
    total: number;
    blocked: number;
    flagged: number;
    monitoring: number;
    critical: number;
    high: number;
  };
}
