import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Percent,
  BarChart3,
  Store,
  Truck,
  Settings,
  Tags,
  DollarSign,
  Image,
  Hash,
  Upload,
  History,
  Warehouse,
  MoveHorizontal,
  ShieldAlert,
  Clock,
  TrendingUp,
  UserCheck,
  Headphones,
  Ticket,
  Zap,
  Megaphone,
  Bell,
  FlaskConical,
  FileText,
  FileSearch,
  Banknote,
  UserPlus,
  Sliders,
  Key,
  Palette,
  MapPin,
  Navigation,
  CreditCard,
  Landmark,
  Flag,
  Layers,
  RefreshCw,
  Activity,
  User,
  ShoppingBag,
  Receipt,
  Group,
  type LucideIcon,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────

export interface SubMenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
  caption?: string;
  submenu?: SubMenuItem[];
}

// ── Shared Navigation Configuration ───────────────────────
// Single source of truth for both desktop and mobile sidebars

export const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/admin",
    caption: "Overview & KPIs",
  },
  {
    icon: Package,
    label: "Products",
    href: "/admin/products",
    caption: "Catalog & inventory",
    submenu: [
      { icon: Package, label: "Product Management", href: "/admin/products" },
      { icon: Tags, label: "Category Management", href: "/admin/products/categories" },
      { icon: DollarSign, label: "Pricing Management", href: "/admin/products/pricing" },
      { icon: Image, label: "Product Media", href: "/admin/products/media" },
      { icon: Hash, label: "SEO Management", href: "/admin/products/seo" },
      { icon: Upload, label: "Bulk Import", href: "/admin/products/bulk-import" },
      { icon: History, label: "Audit Logs", href: "/admin/products/audit-logs" },
    ],
  },
  {
    icon: Boxes,
    label: "Inventory",
    href: "/admin/inventory",
    caption: "Stock & warehouses",
    submenu: [
      { icon: Boxes, label: "Stock Management", href: "/admin/inventory" },
      { icon: Warehouse, label: "Warehouses", href: "/admin/inventory/warehouses" },
      { icon: MoveHorizontal, label: "Stock Transfers", href: "/admin/inventory/stock-transfers" },
      // { icon: Clock, label: "FEFO Dashboard", href: "/admin/inventory/fefo" },
      // { icon: TrendingUp, label: "Forecast Dashboard", href: "/admin/inventory/forecast" },
    ],
  },
  {
    icon: ShoppingCart,
    label: "Orders",
    href: "/admin/orders",
    caption: "Order management",
    submenu: [
      { icon: ShoppingCart, label: "Order Management", href: "/admin/orders" },
      { icon: Clock, label: "Timeline", href: "/admin/orders/timeline" },
      { icon: Activity, label: "Status Management", href: "/admin/orders/status-management" },
      { icon: UserPlus, label: "Assign Partner", href: "/admin/orders/assign-partner" },
      { icon: RefreshCw, label: "Substitutions", href: "/admin/orders/substitutions" },
      { icon: Layers, label: "Bulk Processing", href: "/admin/orders/bulk-processing" },
    ],
  },
  {
    icon: Users,
    label: "Customers",
    href: "/admin/customers",
    caption: "Customer profiles",
    submenu: [
      { icon: Users, label: "Customer Profiles", href: "/admin/customers" },
      { icon: UserCheck, label: "Segmentation", href: "/admin/customers/segmentation" },
      { icon: TrendingUp, label: "Analytics", href: "/admin/customers/analytics" },
      { icon: Headphones, label: "Support Tickets", href: "/admin/customers/support-tickets" },
      { icon: ShieldAlert, label: "Fraud Detection", href: "/admin/customers/fraud-detection" },
    ],
  },
  {
    icon: Percent,
    label: "Promotions",
    href: "/admin/promotions",
    caption: "Offers & coupons",
    submenu: [
      { icon: Percent, label: "Promotions", href: "/admin/promotions" },
      { icon: Ticket, label: "Coupons", href: "/admin/promotions/coupons" },
      { icon: Zap, label: "Flash Sales", href: "/admin/promotions/flash-sales" },
      { icon: Megaphone, label: "Campaign Builder", href: "/admin/promotions/campaign-builder" },
      // { icon: Bell, label: "Push Notifications", href: "/admin/promotions/push-notifications" },
      { icon: FlaskConical, label: "A/B Testing", href: "/admin/promotions/ab-testing" },
    ],
  },
  {
    icon: BarChart3,
    label: "Reports",
    href: "/admin/reports",
    caption: "Analytics & insights",
    submenu: [
      { icon: BarChart3, label: "Reports Overview", href: "/admin/reports" },
      { icon: TrendingUp, label: "Sales Reports", href: "/admin/reports/sales" },
      { icon: Boxes, label: "Inventory Reports", href: "/admin/reports/inventory" },
      { icon: Store, label: "Vendor Reports", href: "/admin/reports/vendor" },
      { icon: FileSearch, label: "Tax Reports", href: "/admin/reports/tax" },
      { icon: Users, label: "Customer Reports", href: "/admin/reports/customer" },
      { icon: Receipt, label: "GST Reports", href: "/admin/reports/gst" },
      { icon: Group, label: "Cohort Analysis", href: "/admin/reports/cohort" },
      { icon: ShoppingBag, label: "Revenue Analytics", href: "/admin/reports/revenue-analytics" },
      { icon: ShoppingCart, label: "Abandoned Cart", href: "/admin/reports/abandoned-cart" },
      { icon: Percent, label: "Promotion ROI", href: "/admin/reports/promotion-roi" },
    ],
  },
  {
    icon: Store,
    label: "Vendors",
    href: "/admin/vendors",
    caption: "Supplier network",
    submenu: [
      { icon: Store, label: "Vendors", href: "/admin/vendors" },
      // { icon: UserPlus, label: "Vendor Onboarding", href: "/admin/vendors/onboarding" },
      { icon: Package, label: "Vendor Products", href: "/admin/vendors/products" },
      { icon: Banknote, label: "Settlements", href: "/admin/vendors/settlements" },
      { icon: Activity, label: "Analytics", href: "/admin/vendors/analytics" },
    ],
  },
  {
    icon: Truck,
    label: "Delivery",
    href: "/admin/delivery",
    caption: "Logistics & zones",
    submenu: [
      { icon: Truck, label: "Delivery Dashboard", href: "/admin/delivery" },
      { icon: Users, label: "Delivery Partners", href: "/admin/delivery/partners" },
      { icon: UserPlus, label: "Partner Profile", href: "/admin/delivery/profile" },
      { icon: MapPin, label: "Live Tracking", href: "/admin/delivery/live-tracking" },
      { icon: Truck, label: "Fleet Dashboard", href: "/admin/delivery/fleet" },
      { icon: Navigation, label: "Route Optimization", href: "/admin/delivery/route-optimization" },
      { icon: Activity, label: "Delivery Status", href: "/admin/delivery/status" },
      { icon: TrendingUp, label: "Partner Performance", href: "/admin/delivery/performance" },
      { icon: BarChart3, label: "Delivery Analytics", href: "/admin/delivery/analytics" },
      { icon: Clock, label: "SLA Dashboard", href: "/admin/delivery/sla" },
    ],
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/admin/notifications",
    caption: "Alerts & updates",
  },
  {
    icon: User,
    label: "Profile",
    href: "/admin/profile",
    caption: "Account & security",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/admin/settings",
    caption: "Configuration",
    submenu: [
      { icon: Settings, label: "Settings", href: "/admin/settings" },
      { icon: Users, label: "User Management", href: "/admin/settings/users" },
      { icon: ShieldAlert, label: "Roles & Permissions", href: "/admin/settings/roles" },
      { icon: CreditCard, label: "Payment Settings", href: "/admin/settings/payment" },
      { icon: Landmark, label: "GST Settings", href: "/admin/settings/gst" },
      { icon: Bell, label: "Notification Settings", href: "/admin/settings/notifications" },
      { icon: Flag, label: "Feature Flags", href: "/admin/settings/feature-flags" },
      { icon: Sliders, label: "System Configurations", href: "/admin/settings/configurations" },
      { icon: Key, label: "API Keys", href: "/admin/settings/api-keys" },
      { icon: Palette, label: "Theme Settings", href: "/admin/settings/theme" },
      { icon: History, label: "Audit Logs", href: "/admin/settings/audit-logs" },
    ],
  },
];
