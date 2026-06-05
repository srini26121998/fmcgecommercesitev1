// ── Promotions & Campaign Management Service Layer ──────
// Architecture: UI → Component → Hook → Service → API Gateway → Backend

import type {
  Promotion,
  Coupon,
  FlashSale,
  Campaign,
  PushNotification,
  ABTest,
  PromotionFilters,
  CouponFilters,
  ABTestFilters,
  PromotionsListResponse,
  CouponsListResponse,
  CampaignAnalytics,
} from "@/types/promotions";
import { apiClient } from "@/lib/api-client";

export interface ValidateCouponPayload {
  code: string;
  cartTotal: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  message: string;
  data?: {
    discountType: "percentage" | "fixed" | "bogo";
    discountValue: number;
    couponId?: string;
    code?: string;
  };
}

// ── Promotion Service ────────────────────────────────────

export const promotionService = {
  // ── Promotions ─────────────────────────────────────────



  async validateCoupon(payload: ValidateCouponPayload): Promise<ValidateCouponResponse> {
    try {
      const response = await apiClient.post<any>("/api/v1/promotions/validate", payload);
      return response.data || response;
    } catch (error) {
      console.error("[promotionService] validateCoupon failed:", error);
      throw error;
    }
  },

  async getPromotions(
    filters: Partial<PromotionFilters> = {},
    pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }
  ): Promise<PromotionsListResponse> {
    try {
      const apiPagination = { ...pagination, page: Math.max(0, pagination.page - 1) };
      const response = await apiClient.get<any>("/api/v1/admin/promotions", {
        params: { ...filters, ...apiPagination },
      });
      const data = response.data || response;
      if (data && data.content !== undefined) {
        const mappedPromotions = data.content.map((item: any) => ({
          id: String(item.id),
          name: item.name || `Promo-${item.id}`,
          description: item.description || "",
          type: item.type?.toLowerCase() || "discount",
          discountType: item.discountType?.toLowerCase() || "percentage",
          discountValue: item.discountValue || 0,
          minOrder: item.minOrder || 0,
          maxDiscount: item.maxDiscount,
          usageLimit: item.maxUses === null ? 999999 : (item.maxUses || 0), // Use high number for unlimited if needed by UI
          usageCount: item.usageCount || 0,
          startDate: item.startDate?.split('T')[0] || "",
          endDate: item.endDate?.split('T')[0] || "",
          status: item.status?.toLowerCase() || "expired",
          applicableCategories: [],
          applicableProducts: [],
          budget: "₹0",
          spent: "₹0",
          createdBy: "Admin",
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));

        return {
          promotions: mappedPromotions,
          pagination: {
            page: (data.page || 0) + 1,
            pageSize: data.size || 20,
            total: data.totalElements || 0
          },
          summary: {
            total: data.totalElements || 0,
            active: mappedPromotions.filter((p: any) => p.status === "active").length,
            scheduled: mappedPromotions.filter((p: any) => p.status === "scheduled").length,
            expired: mappedPromotions.filter((p: any) => p.status === "expired").length,
            totalUsage: mappedPromotions.reduce((sum: number, p: any) => sum + (p.usageCount || 0), 0),
            totalBudget: "₹0"
          }
        };
      }

      if (data?.pagination?.page !== undefined) {
        data.pagination.page += 1;
      }
      return data;
    } catch (error) {
      console.error("[promotionService] getPromotions failed:", error);
      throw error;
    }
  },

  async getPromotionById(id: string): Promise<Promotion | undefined> {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/promotions/${id}`);
      return response.data || response;
    } catch (error) {
      console.error(`[promotionService] getPromotionById ${id} failed:`, error);
      throw error;
    }
  },

  async createPromotion(data: Partial<Promotion>): Promise<Promotion> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions", data);
      return response.data || response;
    } catch (error) {
      console.error("[promotionService] createPromotion failed:", error);
      throw error;
    }
  },

  async updatePromotion(id: string, data: Partial<Promotion>): Promise<Promotion | undefined> {
    try {
      const response = await apiClient.put<any>(`/api/v1/admin/promotions/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`[promotionService] updatePromotion ${id} failed:`, error);
      throw error;
    }
  },

  async deletePromotion(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/admin/promotions/${id}`);
      return true;
    } catch (error) {
      console.error(`[promotionService] deletePromotion ${id} failed:`, error);
      throw error;
    }
  },

  // ── Coupons ────────────────────────────────────────────

  async getCoupons(
    filters: Partial<CouponFilters> = {},
    pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }
  ): Promise<CouponsListResponse> {
    try {
      const apiPagination = { ...pagination, page: Math.max(0, pagination.page - 1) };
      const response = await apiClient.get<any>("/api/v1/admin/promotions/coupons", {
        params: { ...filters, ...apiPagination },
      });
      const data = response.data || response;
      
      if (data && data.content !== undefined) {
        const mappedCoupons = data.content.map((item: any) => {
          let status = item.status?.toLowerCase() || "expired";
          
          const discountTypeStr = item.discountType?.toLowerCase() === "fixed" ? "fixed" : item.discountType?.toLowerCase() === "free_delivery" ? "free_delivery" : "percentage";
          const discountStr = discountTypeStr === "fixed" ? `₹${item.discountValue}` : discountTypeStr === "free_delivery" ? "Free Delivery" : `${item.discountValue}%`;

          return {
            id: String(item.id),
            code: item.name || item.code || `PROMO-${item.id}`,
            type: item.type?.toLowerCase() || "public",
            discount: discountStr,
            discountType: discountTypeStr,
            discountValue: item.discountValue || 0,
            minOrder: item.minOrder || 0,
            maxDiscount: item.maxDiscount,
            totalIssued: item.maxUses === null ? -1 : (item.maxUses || 0),
            totalUsed: item.usageCount || item.usedCount || 0,
            perUserLimit: 1, // Default or fetch if available
            status: status,
            startDate: item.startDate?.split('T')[0] || item.validFrom?.split('T')[0] || "",
            endDate: item.endDate?.split('T')[0] || item.validUntil?.split('T')[0] || "",
            createdAt: item.createdAt,
            createdBy: "Admin"
          };
        });

        return {
          coupons: mappedCoupons,
          pagination: {
            page: (data.page || 0) + 1,
            pageSize: data.size || 20,
            total: data.totalElements || 0
          },
          summary: {
            total: data.totalElements || 0,
            active: mappedCoupons.filter((c: any) => c.status === "active").length,
            scheduled: mappedCoupons.filter((c: any) => c.status === "scheduled").length,
            expired: mappedCoupons.filter((c: any) => c.status === "expired").length,
            totalUsed: mappedCoupons.reduce((sum: number, c: any) => sum + (c.totalUsed || 0), 0),
            totalIssued: mappedCoupons.reduce((sum: number, c: any) => sum + (c.totalIssued > 0 ? c.totalIssued : 0), 0)
          }
        };
      }

      if (data?.pagination?.page !== undefined) {
        data.pagination.page += 1;
      }
      return data;
    } catch (error) {
      console.error("[promotionService] getCoupons failed:", error);
      throw error;
    }
  },

  async generateCoupon(data: Partial<Coupon>): Promise<Coupon> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions/coupons", data);
      return response.data || response;
    } catch (error) {
      console.error("[promotionService] generateCoupon failed:", error);
      throw error;
    }
  },

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon | undefined> {
    try {
      const response = await apiClient.put<any>(`/api/v1/admin/promotions/coupons/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`[promotionService] updateCoupon ${id} failed:`, error);
      throw error;
    }
  },

  async deleteCoupon(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/admin/promotions/coupons/${id}`);
      return true;
    } catch (error) {
      console.error(`[promotionService] deleteCoupon ${id} failed:`, error);
      throw error;
    }
  },

  // ── Flash Sales ────────────────────────────────────────

  async getFlashSales(pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }) {
    try {
      const apiPagination = { ...pagination, page: Math.max(0, pagination.page - 1) };
      const response = await apiClient.get<any>("/api/v1/admin/promotions/flash-sales", {
        params: apiPagination,
      });
      const data = response.data || response;
      if (data?.pagination?.page !== undefined) {
        data.pagination.page += 1;
      }
      return data;
    } catch (error) {
      console.error("[promotionService] getFlashSales failed:", error);
      throw error;
    }
  },

  async createFlashSale(data: Partial<FlashSale>): Promise<FlashSale> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions/flash-sales", data);
      return response.data || response;
    } catch (error) {
      console.error("[promotionService] createFlashSale failed:", error);
      throw error;
    }
  },

  async updateFlashSale(id: string, data: Partial<FlashSale>): Promise<FlashSale | undefined> {
    try {
      const response = await apiClient.put<any>(`/api/v1/admin/promotions/flash-sales/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`[promotionService] updateFlashSale ${id} failed:`, error);
      throw error;
    }
  },

  async deleteFlashSale(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/admin/promotions/flash-sales/${id}`);
      return true;
    } catch (error) {
      console.error(`[promotionService] deleteFlashSale ${id} failed:`, error);
      throw error;
    }
  },

  // ── Campaigns ──────────────────────────────────────────

  async getCampaigns(pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }) {
    try {
      const apiPagination = { ...pagination, page: Math.max(0, pagination.page - 1) };
      const response = await apiClient.get<any>("/api/v1/admin/promotions/campaigns", {
        params: apiPagination,
      });
      const data = response.data || response;
      if (data?.pagination?.page !== undefined) {
        data.pagination.page += 1;
      }
      return data;
    } catch (error) {
      console.error("[promotionService] getCampaigns failed:", error);
      throw error;
    }
  },

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions/campaigns", data);
      return response.data || response;
    } catch (error) {
      console.error("[promotionService] createCampaign failed:", error);
      throw error;
    }
  },

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign | undefined> {
    try {
      const response = await apiClient.put<any>(`/api/v1/admin/promotions/campaigns/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`[promotionService] updateCampaign ${id} failed:`, error);
      throw error;
    }
  },

  async deleteCampaign(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/admin/promotions/campaigns/${id}`);
      return true;
    } catch (error) {
      console.error(`[promotionService] deleteCampaign ${id} failed:`, error);
      throw error;
    }
  },

  // ── Push Notifications ─────────────────────────────────

  async getPushNotifications(pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }) {
    try {
      const apiPagination = { ...pagination, page: Math.max(0, pagination.page - 1) };
      const response = await apiClient.get<any>("/api/v1/admin/promotions/push-notifications", {
        params: apiPagination,
      });
      const data = response.data || response;
      if (data?.pagination?.page !== undefined) {
        data.pagination.page += 1;
      }
      return data;
    } catch (error) {
      console.error("[promotionService] getPushNotifications failed:", error);
      throw error;
    }
  },

  async createPushNotification(data: Partial<PushNotification>): Promise<PushNotification> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions/push-notifications", data);
      return response.data || response;
    } catch (error) {
      console.error("[promotionService] createPushNotification failed:", error);
      throw error;
    }
  },

  async updatePushNotification(id: string, data: Partial<PushNotification>): Promise<PushNotification | undefined> {
    try {
      const response = await apiClient.put<any>(`/api/v1/admin/promotions/push-notifications/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`[promotionService] updatePushNotification ${id} failed:`, error);
      throw error;
    }
  },

  async deletePushNotification(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/admin/promotions/push-notifications/${id}`);
      return true;
    } catch (error) {
      console.error(`[promotionService] deletePushNotification ${id} failed:`, error);
      throw error;
    }
  },

  // ── A/B Tests ──────────────────────────────────────────

  async getABTests(
    filters: Partial<ABTestFilters> = {},
    pagination: { page: number; pageSize: number } = { page: 1, pageSize: 10 }
  ) {
    try {
      const apiPagination = { ...pagination, page: Math.max(0, pagination.page - 1) };
      const response = await apiClient.get<any>("/api/v1/admin/promotions/ab-tests", {
        params: { ...filters, ...apiPagination },
      });
      const data = response.data || response;
      if (data?.pagination?.page !== undefined) {
        data.pagination.page += 1;
      }
      return data;
    } catch (error) {
      console.error("[promotionService] getABTests failed:", error);
      throw error;
    }
  },

  async createABTest(data: Partial<ABTest>): Promise<ABTest> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/promotions/ab-tests", data);
      return response.data || response;
    } catch (error) {
      console.error("[promotionService] createABTest failed:", error);
      throw error;
    }
  },

  async updateABTest(id: string, data: Partial<ABTest>): Promise<ABTest | undefined> {
    try {
      const response = await apiClient.put<any>(`/api/v1/admin/promotions/ab-tests/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`[promotionService] updateABTest ${id} failed:`, error);
      throw error;
    }
  },

  async deleteABTest(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/api/v1/admin/promotions/ab-tests/${id}`);
      return true;
    } catch (error) {
      console.error(`[promotionService] deleteABTest ${id} failed:`, error);
      throw error;
    }
  },

  // ── Campaign Analytics ─────────────────────────────────

  async getCampaignAnalytics(): Promise<CampaignAnalytics> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/promotions/analytics");
      return response.data || response;
    } catch (error) {
      console.error("[promotionService] getCampaignAnalytics failed:", error);
      throw error;
    }
  },
};
