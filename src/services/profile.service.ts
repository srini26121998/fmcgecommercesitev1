// ── Admin Profile Service ─────────────────────────────────

import type {
  AdminProfile,
  LoginSession,
  ActivityLogEntry,
  AdminSecuritySettings,
  AdminNotificationPrefs,
  ProfileStats,
  ProfileUpdatePayload,
  PasswordChangePayload,
  MFASetupPayload,
} from "@/types/admin-profile";

const mockProfile: AdminProfile = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@example.com",
  phone: "+1234567890",
  role: "admin",
  roleLabel: "Administrator",
  team: "Management",
  avatarInitials: "AU",
  status: "active",
  department: "Operations",
  location: "New York, USA",
  timezone: "America/New_York",
  bio: "System administrator.",
  joinedAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  lastLoginAt: new Date().toISOString(),
  mfaEnabled: true,
  mfaMethod: "app",
  emailVerified: true,
  phoneVerified: true,
};

const mockSessions: LoginSession[] = [
  {
    id: "sess-1",
    deviceName: "MacBook Pro",
    deviceType: "desktop",
    browser: "Chrome",
    os: "macOS",
    ip: "192.168.1.1",
    location: "New York, USA",
    isCurrent: true,
    lastActiveAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  }
];

const mockActivityLog: ActivityLogEntry[] = [
  {
    id: "act-1",
    action: "login",
    description: "Logged in successfully",
    status: "success",
    createdAt: new Date().toISOString(),
  }
];

const mockSecurity: AdminSecuritySettings = {
  mfaEnabled: true,
  mfaMethod: "app",
  passwordLastChanged: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  sessionTimeout: 60,
  ipWhitelist: [],
  loginNotifications: true,
};

const mockNotifPrefs: AdminNotificationPrefs = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  orderAlerts: true,
  inventoryAlerts: true,
  systemAlerts: true,
  marketingEmails: false,
  digestFrequency: "daily",
};

const mockStats: ProfileStats = {
  totalOrdersProcessed: 1250,
  totalRevenueManaged: 450000,
  activeSessions: 1,
  daysSinceJoined: 365,
  loginStreak: 12,
  actionsToday: 45,
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const profileService = {
  /**
   * Fetch admin profile.
   */
  async getProfile(): Promise<AdminProfile> {
    await delay(300);
    return { ...mockProfile };
  },

  /**
   * Update profile fields.
   */
  async updateProfile(payload: ProfileUpdatePayload): Promise<AdminProfile> {
    await delay(300);
    return { ...mockProfile, ...payload } as AdminProfile;
  },

  /**
   * Change password.
   */
  async changePassword(payload: PasswordChangePayload): Promise<{ success: boolean }> {
    await delay(300);
    return { success: true };
  },

  /**
   * Get login sessions.
   */
  async getSessions(): Promise<LoginSession[]> {
    await delay(300);
    return [...mockSessions];
  },

  /**
   * Terminate a session.
   */
  async terminateSession(sessionId: string): Promise<void> {
    await delay(300);
  },

  /**
   * Terminate all other sessions.
   */
  async terminateOtherSessions(): Promise<void> {
    await delay(300);
  },

  /**
   * Get activity log (paginated).
   */
  async getActivityLog(
    page = 1,
    pageSize = 10
  ): Promise<{ entries: ActivityLogEntry[]; total: number; page: number; pageSize: number }> {
    await delay(300);
    return { entries: [...mockActivityLog], total: mockActivityLog.length, page, pageSize };
  },

  /**
   * Get security settings.
   */
  async getSecuritySettings(): Promise<AdminSecuritySettings> {
    await delay(300);
    return { ...mockSecurity };
  },

  /**
   * Update MFA settings.
   */
  async updateMFA(payload: MFASetupPayload): Promise<AdminSecuritySettings> {
    await delay(300);
    return { ...mockSecurity, mfaEnabled: payload.enabled, mfaMethod: payload.method };
  },

  /**
   * Rotate API key.
   */
  async rotateApiKey(): Promise<string> {
    await delay(300);
    return "new-api-key-" + Date.now();
  },

  /**
   * Get notification preferences.
   */
  async getNotificationPrefs(): Promise<AdminNotificationPrefs> {
    await delay(300);
    return { ...mockNotifPrefs };
  },

  /**
   * Update notification preferences.
   */
  async updateNotificationPrefs(
    prefs: Partial<AdminNotificationPrefs>
  ): Promise<AdminNotificationPrefs> {
    await delay(300);
    return { ...mockNotifPrefs, ...prefs };
  },

  /**
   * Get profile stats.
   */
  async getProfileStats(): Promise<ProfileStats> {
    await delay(300);
    return { ...mockStats };
  },
};
