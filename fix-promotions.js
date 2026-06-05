const fs = require('fs');

let code = fs.readFileSync('src/services/promotions.service.ts', 'utf8');

const replacements = [
  {
    regex: /async getFlashSales\([^)]*\)\s*\{[\s\S]*?totalBudget: "₹2\.20L",\s*\},?\s*\};\s*\}/,
    replacement: `async getFlashSales(pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }) {
    try {
      const qs = new URLSearchParams({ page: Math.max(0, pagination.page - 1).toString(), size: pagination.pageSize.toString() }).toString();
      const response = await apiClient.get<any>(\`/api/v1/admin/promotions/flash-sales?\${qs}\`);
      if (response?.data) {
        if (response.data.pagination) response.data.pagination.page = pagination.page;
        return response.data;
      }
      return response;
    } catch (error) {
      console.warn("Failed to fetch flash sales from API, falling back to mock:", error);
      await delay(200);
      const filtered = [...mockFlashSales];
      const total = filtered.length;
      const paged = paginate(filtered, pagination.page, pagination.pageSize);
      return {
        flashSales: paged,
        pagination: { page: pagination.page, pageSize: pagination.pageSize, total },
        summary: {
          live: filtered.filter((f) => f.status === "live").length,
          scheduled: filtered.filter((f) => f.status === "scheduled").length,
          completed: filtered.filter((f) => f.status === "completed").length,
          totalBudget: "₹2.20L",
        },
      };
    }
  }`
  },
  {
    regex: /async createFlashSale\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return newFs;\s*\}/,
    replacement: `async createFlashSale(data: Partial<FlashSale>): Promise<FlashSale> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions/flash-sales", data);
      return response.data || response;
    } catch (error) {
      console.warn("Failed to create flash sale, falling back to mock:", error);
      await delay(400);
      const now = new Date().toISOString().replace("T", " ").slice(0, 16);
      const newFs: FlashSale = {
        id: \`FS-\${String(mockFlashSales.length + 1).padStart(3, "0")}\`,
        name: data.name || "",
        description: data.description || "",
        discount: data.discount || \`\${data.discountValue}% Off\`,
        discountType: data.discountType || "percentage",
        discountValue: data.discountValue ?? 0,
        productCount: data.productCount ?? 0,
        products: data.products || [],
        startDate: data.startDate || now,
        endDate: data.endDate || now,
        status: data.status || "scheduled",
        budget: data.budget || "₹0",
        spent: "₹0",
        createdBy: "Admin",
        createdAt: now,
      };
      mockFlashSales.unshift(newFs);
      return newFs;
    }
  }`
  },
  {
    regex: /async updateFlashSale\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return mockFlashSales\[idx\];\s*\}/,
    replacement: `async updateFlashSale(id: string, data: Partial<FlashSale>): Promise<FlashSale | undefined> {
    try {
      const response = await apiClient.put<any>(\`/api/v1/admin/promotions/flash-sales/\${id}\`, data);
      return response.data || response;
    } catch (error) {
      console.warn(\`Failed to update flash sale \${id}, falling back to mock:\`, error);
      await delay(300);
      const idx = mockFlashSales.findIndex((f) => f.id === id);
      if (idx === -1) return undefined;
      mockFlashSales[idx] = { ...mockFlashSales[idx], ...data };
      return mockFlashSales[idx];
    }
  }`
  },
  {
    regex: /async deleteFlashSale\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return true;\s*\}/,
    replacement: `async deleteFlashSale(id: string): Promise<boolean> {
    try {
      await apiClient.delete(\`/api/v1/admin/promotions/flash-sales/\${id}\`);
      return true;
    } catch (error) {
      console.warn(\`Failed to delete flash sale \${id}, falling back to mock:\`, error);
      await delay(200);
      const idx = mockFlashSales.findIndex((f) => f.id === id);
      if (idx === -1) return false;
      mockFlashSales.splice(idx, 1);
      return true;
    }
  }`
  },
  {
    regex: /async getCampaigns\([^)]*\)\s*\{[\s\S]*?summary,\s*\};\s*\}/,
    replacement: `async getCampaigns(pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }) {
    try {
      const qs = new URLSearchParams({ page: Math.max(0, pagination.page - 1).toString(), size: pagination.pageSize.toString() }).toString();
      const response = await apiClient.get<any>(\`/api/v1/admin/promotions/campaigns?\${qs}\`);
      if (response?.data) {
        if (response.data.pagination) response.data.pagination.page = pagination.page;
        return response.data;
      }
      return response;
    } catch (error) {
      console.warn("Failed to fetch campaigns from API, falling back to mock:", error);
      await delay(200);
      const total = mockCampaigns.length;
      const paged = paginate(mockCampaigns, pagination.page, pagination.pageSize);
      const summary = {
        active: mockCampaigns.filter((c) => c.status === "active").length,
        scheduled: mockCampaigns.filter((c) => c.status === "scheduled").length,
        drafts: mockCampaigns.filter((c) => c.status === "draft").length,
        totalReach: mockCampaigns.reduce((s, c) => {
          const num = parseInt(c.sent.replace(/,/g, ""));
          return s + (isNaN(num) ? 0 : num);
        }, 0).toLocaleString(),
      };
      return {
        campaigns: paged,
        pagination: { page: pagination.page, pageSize: pagination.pageSize, total },
        summary,
      };
    }
  }`
  },
  {
    regex: /async createCampaign\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return newCamp;\s*\}/,
    replacement: `async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions/campaigns", data);
      return response.data || response;
    } catch (error) {
      console.warn("Failed to create campaign, falling back to mock:", error);
      await delay(400);
      const now = new Date().toISOString().split("T")[0];
      const newCamp: Campaign = {
        id: \`CAMP-\${String(mockCampaigns.length + 1).padStart(3, "0")}\`,
        name: data.name || "",
        description: data.description || "",
        channels: data.channels || ["push"],
        audience: data.audience || "All Users",
        audienceTarget: data.audienceTarget || "all_users",
        budget: data.budget || "₹0",
        status: data.status || "draft",
        sent: "—",
        opens: "—",
        clicks: "—",
        startDate: data.startDate || now,
        endDate: data.endDate || now,
        createdBy: "Admin",
        createdAt: now,
      };
      mockCampaigns.unshift(newCamp);
      return newCamp;
    }
  }`
  },
  {
    regex: /async updateCampaign\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return mockCampaigns\[idx\];\s*\}/,
    replacement: `async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign | undefined> {
    try {
      const response = await apiClient.put<any>(\`/api/v1/admin/promotions/campaigns/\${id}\`, data);
      return response.data || response;
    } catch (error) {
      console.warn(\`Failed to update campaign \${id}, falling back to mock:\`, error);
      await delay(300);
      const idx = mockCampaigns.findIndex((c) => c.id === id);
      if (idx === -1) return undefined;
      mockCampaigns[idx] = { ...mockCampaigns[idx], ...data };
      return mockCampaigns[idx];
    }
  }`
  },
  {
    regex: /async deleteCampaign\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return true;\s*\}/,
    replacement: `async deleteCampaign(id: string): Promise<boolean> {
    try {
      await apiClient.delete(\`/api/v1/admin/promotions/campaigns/\${id}\`);
      return true;
    } catch (error) {
      console.warn(\`Failed to delete campaign \${id}, falling back to mock:\`, error);
      await delay(200);
      const idx = mockCampaigns.findIndex((c) => c.id === id);
      if (idx === -1) return false;
      mockCampaigns.splice(idx, 1);
      return true;
    }
  }`
  },
  {
    regex: /async getPushNotifications\([^)]*\)\s*\{[\s\S]*?avgOpenRate: "42\.5%",\s*\},?\s*\};\s*\}/,
    replacement: `async getPushNotifications(pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }) {
    try {
      const qs = new URLSearchParams({ page: Math.max(0, pagination.page - 1).toString(), size: pagination.pageSize.toString() }).toString();
      const response = await apiClient.get<any>(\`/api/v1/admin/promotions/push-notifications?\${qs}\`);
      if (response?.data) {
        if (response.data.pagination) response.data.pagination.page = pagination.page;
        return response.data;
      }
      return response;
    } catch (error) {
      console.warn("Failed to fetch push notifications from API, falling back to mock:", error);
      await delay(200);
      const total = mockPushNotifications.length;
      const paged = paginate(mockPushNotifications, pagination.page, pagination.pageSize);
      return {
        notifications: paged,
        pagination: { page: pagination.page, pageSize: pagination.pageSize, total },
        summary: {
          sent: mockPushNotifications.filter((n) => n.status === "sent").length,
          scheduled: mockPushNotifications.filter((n) => n.status === "scheduled").length,
          drafts: mockPushNotifications.filter((n) => n.status === "draft").length,
          avgOpenRate: "42.5%",
        },
      };
    }
  }`
  },
  {
    regex: /async createPushNotification\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return newNotif;\s*\}/,
    replacement: `async createPushNotification(data: Partial<PushNotification>): Promise<PushNotification> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions/push-notifications", data);
      return response.data || response;
    } catch (error) {
      console.warn("Failed to create push notification, falling back to mock:", error);
      await delay(400);
      const now = new Date().toISOString().split("T")[0];
      const newNotif: PushNotification = {
        id: \`PN-\${String(mockPushNotifications.length + 1).padStart(3, "0")}\`,
        title: data.title || "",
        body: data.body || "",
        audience: data.audience || "All Users",
        audienceTarget: data.audienceTarget || "all_users",
        imageUrl: data.imageUrl,
        deepLink: data.deepLink,
        status: data.status || "draft",
        sent: "—",
        opened: "—",
        clicked: "—",
        scheduledAt: data.scheduledAt || "—",
        sentAt: data.sentAt || "—",
        createdBy: "Admin",
        createdAt: now,
      };
      mockPushNotifications.unshift(newNotif);
      return newNotif;
    }
  }`
  },
  {
    regex: /async updatePushNotification\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return mockPushNotifications\[idx\];\s*\}/,
    replacement: `async updatePushNotification(id: string, data: Partial<PushNotification>): Promise<PushNotification | undefined> {
    try {
      const response = await apiClient.put<any>(\`/api/v1/admin/promotions/push-notifications/\${id}\`, data);
      return response.data || response;
    } catch (error) {
      console.warn(\`Failed to update push notification \${id}, falling back to mock:\`, error);
      await delay(300);
      const idx = mockPushNotifications.findIndex((n) => n.id === id);
      if (idx === -1) return undefined;
      mockPushNotifications[idx] = { ...mockPushNotifications[idx], ...data };
      return mockPushNotifications[idx];
    }
  }`
  },
  {
    regex: /async deletePushNotification\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return true;\s*\}/,
    replacement: `async deletePushNotification(id: string): Promise<boolean> {
    try {
      await apiClient.delete(\`/api/v1/admin/promotions/push-notifications/\${id}\`);
      return true;
    } catch (error) {
      console.warn(\`Failed to delete push notification \${id}, falling back to mock:\`, error);
      await delay(200);
      const idx = mockPushNotifications.findIndex((n) => n.id === id);
      if (idx === -1) return false;
      mockPushNotifications.splice(idx, 1);
      return true;
    }
  }`
  },
  {
    regex: /async getABTests\([^)]*\)\s*\{[\s\S]*?totalImpressions[^}]*\},?\s*\};\s*\}/,
    replacement: `async getABTests(
    filters: Partial<ABTestFilters> = {},
    pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }
  ) {
    try {
      const qs = new URLSearchParams({ page: Math.max(0, pagination.page - 1).toString(), size: pagination.pageSize.toString() });
      if (filters.search) qs.append("search", filters.search);
      if (filters.status && filters.status !== "all") qs.append("status", filters.status);
      const response = await apiClient.get<any>(\`/api/v1/admin/promotions/ab-tests?\${qs.toString()}\`);
      if (response?.data) {
        if (response.data.pagination) response.data.pagination.page = pagination.page;
        return response.data;
      }
      return response;
    } catch (error) {
      console.warn("Failed to fetch AB tests from API, falling back to mock:", error);
      await delay(200);
      let filtered = [...mockABTests];
      if (filters.search) filtered = filterBySearch(filtered, filters.search, ["name", "id"]);
      if (filters.status && filters.status !== "all") filtered = filtered.filter((t) => t.status === filters.status);
      const total = filtered.length;
      const paged = paginate(filtered, pagination.page, pagination.pageSize);
      return {
        tests: paged,
        pagination: { page: pagination.page, pageSize: pagination.pageSize, total },
        summary: {
          total: mockABTests.length,
          running: mockABTests.filter((t) => t.status === "running").length,
          completed: mockABTests.filter((t) => t.status === "completed").length,
          totalImpressions: mockABTests.reduce((s, t) => s + t.totalImpressions, 0),
        },
      };
    }
  }`
  },
  {
    regex: /async createABTest\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return newTest;\s*\}/,
    replacement: `async createABTest(data: Partial<ABTest>): Promise<ABTest> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions/ab-tests", data);
      return response.data || response;
    } catch (error) {
      console.warn("Failed to create AB test, falling back to mock:", error);
      await delay(400);
      const now = new Date().toISOString().split("T")[0];
      const newTest: ABTest = {
        id: \`AB-\\$\${String(mockABTests.length + 1).padStart(3, "0")}\`,
        name: data.name || "",
        description: data.description || "",
        variantA: { label: data.variantA?.label || "Variant A", impressions: 0, conversions: 0, revenue: "₹0", conversionRate: "—" },
        variantB: { label: data.variantB?.label || "Variant B", impressions: 0, conversions: 0, revenue: "₹0", conversionRate: "—" },
        audience: data.audience || "50% each",
        totalImpressions: 0,
        winner: null,
        confidence: 0,
        status: data.status || "draft",
        startedAt: now,
        endedAt: null,
        createdBy: "Admin",
        createdAt: now,
      };
      mockABTests.unshift(newTest);
      return newTest;
    }
  }`
  },
  {
    regex: /async updateABTest\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return mockABTests\[idx\];\s*\}/,
    replacement: `async updateABTest(id: string, data: Partial<ABTest>): Promise<ABTest | undefined> {
    try {
      const response = await apiClient.put<any>(\`/api/v1/admin/promotions/ab-tests/\${id}\`, data);
      return response.data || response;
    } catch (error) {
      console.warn(\`Failed to update AB test \${id}, falling back to mock:\`, error);
      await delay(300);
      const idx = mockABTests.findIndex((t) => t.id === id);
      if (idx === -1) return undefined;
      mockABTests[idx] = { ...mockABTests[idx], ...data };
      return mockABTests[idx];
    }
  }`
  },
  {
    regex: /async deleteABTest\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?return true;\s*\}/,
    replacement: `async deleteABTest(id: string): Promise<boolean> {
    try {
      await apiClient.delete(\`/api/v1/admin/promotions/ab-tests/\${id}\`);
      return true;
    } catch (error) {
      console.warn(\`Failed to delete AB test \${id}, falling back to mock:\`, error);
      await delay(200);
      const idx = mockABTests.findIndex((t) => t.id === id);
      if (idx === -1) return false;
      mockABTests.splice(idx, 1);
      return true;
    }
  }`
  },
  {
    regex: /async getCampaignAnalytics\([^)]*\)(?:\s*:\s*Promise<[^>]+>)?\s*\{[\s\S]*?description:\s*"Midnight Snacks flash sale ended"\s*\},?\s*\],\s*\};\s*\}/,
    replacement: `async getCampaignAnalytics(): Promise<CampaignAnalytics> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/promotions/analytics");
      return response.data || response;
    } catch (error) {
      console.warn("Failed to fetch campaign analytics, falling back to mock:", error);
      await delay(200);
      const totalRevenue = mockPromotions.reduce((s, p) => {
        const spentNum = parseInt(p.spent.replace(/[₹,K]/g, "")) * (p.spent.includes("K") ? 1000 : 1);
        return s + spentNum;
      }, 0);
      const activePromos = mockPromotions.filter((p) => p.status === "active").length;
      const scheduledPromos = mockPromotions.filter((p) => p.status === "scheduled").length;
      const totalUsage = mockPromotions.reduce((s, p) => s + p.usageCount, 0);
      const promotionsByType: Record<string, number> = {};
      mockPromotions.forEach((p) => { promotionsByType[p.type] = (promotionsByType[p.type] || 0) + 1; });
      const promotionsByStatus: Record<string, number> = {};
      mockPromotions.forEach((p) => { promotionsByStatus[p.status] = (promotionsByStatus[p.status] || 0) + 1; });
      return {
        totalPromotions: mockPromotions.length,
        activePromotions: activePromos,
        scheduledPromotions: scheduledPromos,
        totalUsage,
        totalRevenue: \`₹\${(totalRevenue / 100000).toFixed(1)}L\`,
        avgConversionRate: "24.7%",
        totalReach: "142,680",
        promotionsByType,
        promotionsByStatus,
        topPromotions: [...mockPromotions].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5).map((p) => ({ id: p.id, name: p.name, usageCount: p.usageCount, revenue: p.spent })),
        recentActivity: [
          { date: "2026-05-25", action: "Created", description: "Monsoon Discount - Beverages" },
          { date: "2026-05-22", action: "Started", description: "Weekend Special flash sale" },
          { date: "2026-05-21", action: "Updated", description: "Summer Sale 40% Off budget increased" },
          { date: "2026-05-20", action: "Scheduled", description: "Flash Sale - Dairy Products" },
          { date: "2026-05-18", action: "Completed", description: "Midnight Snacks flash sale ended" },
        ],
      };
    }
  }`
  }
];

let modified = code;
replacements.forEach(r => {
  modified = modified.replace(r.regex, r.replacement);
});

fs.writeFileSync('src/services/promotions.service.ts', modified, 'utf8');
console.log('Fixed promotions.service.ts');
