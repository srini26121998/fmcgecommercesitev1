// ── Delivery Management Service Layer ───────────────────
// Architecture: UI → Component → Hook → Service → Axios → API Gateway → Backend
//
// This service is the single source of truth for all delivery-related data.

import type {
  DeliveryPartner,
  PartnerProfile,
  LiveDelivery,
  DeliveryRoute,
  DeliveryStatusEntry,
  PerformanceOverview,
  DeliveryAnalytics,
  SLADashboard,
  DeliveryApiResponse,
  PaginatedResponse,
  DeliveryQueryParams,
  AnalyticsQueryParams,
  AssignDeliveryFormData,
  UpdateDeliveryStatusFormData,
} from "@/types/delivery";
import { apiClient } from "@/lib/api-client";

// ── Delivery Service ──────────────────────────────────────

export const deliveryService = {
  // ═══════════════════════════════════════════════════════
  // PARTNER MANAGEMENT
  // ═══════════════════════════════════════════════════════

  /**
   * Get paginated list of delivery partners with search/filter.
   */
  async getPartners(
    params?: Partial<DeliveryQueryParams>
  ): Promise<DeliveryApiResponse<PaginatedResponse<DeliveryPartner>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/delivery/riders", { params });
      
      const riders = Array.isArray(response.data) ? response.data : (response.data?.data || []);

      const items = riders.map((r: any) => {
        let status = "offline";
        const avail = (r.availabilityStatus || "").toUpperCase();
        if (avail === "FREE") status = "online";
        else if (avail === "BUSY") status = "busy";
        
        return {
          id: String(r.id || r.publicId),
          name: r.name || "Unknown",
          phone: r.phone || "",
          email: r.email || "",
          vehicleType: r.vehicleType?.toLowerCase() || "bike",
          vehicleNumber: r.vehicleNumber || "",
          partnerType: r.partnerType || "IN_HOUSE",
          status,
          currentOrders: 0,
          totalDeliveries: 0,
          rating: 5,
          earnings: 0,
          zone: "Chennai",
          lastLocation: {
            lat: r.currentLat || null,
            lng: r.currentLng || null,
            updatedAt: r.lastLocationUpdate || null,
          }
        };
      });

      return {
        success: true,
        data: {
          items,
          pagination: {
            page: 1,
            pageSize: items.length || 10,
            total: items.length
          }
        },
      };
    } catch (error: any) {
      console.error("[deliveryService] Failed to fetch partners from API", error);
      throw error;
    }
  },

  /**
   * Add a new delivery partner/rider
   */
  async createPartner(
    data: any
  ): Promise<DeliveryApiResponse<DeliveryPartner>> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/delivery/fleet", data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("[deliveryService] Failed to create partner", error);
      throw error;
    }
  },

  /**
   * Get full partner profile by ID.
   */
  async getPartnerProfile(
    partnerId: string
  ): Promise<DeliveryApiResponse<PartnerProfile | null>> {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/delivery/fleet/${partnerId}`);
      return { success: true, data: response.data || response };
    } catch (error: any) {
      console.error(`[deliveryService] Failed to fetch partner profile for ${partnerId}`, error);
      throw error;
    }
  },

  /**
   * Update partner status (online/offline/busy/available).
   */
  async updatePartnerStatus(
    partnerId: string,
    status: string
  ): Promise<DeliveryApiResponse<boolean>> {
    try {
      await apiClient.patch(`/api/v1/admin/delivery/fleet/${partnerId}/status`, { status });
      return { success: true, data: true };
    } catch (error: any) {
      console.error(`[deliveryService] Failed to update partner status for ${partnerId}`, error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // LIVE TRACKING
  // ═══════════════════════════════════════════════════════

  /**
   * Get active deliveries with real-time tracking info.
   */
  async getLiveDeliveries(
    params?: Partial<DeliveryQueryParams>
  ): Promise<DeliveryApiResponse<PaginatedResponse<LiveDelivery>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/delivery/live", { params });
      return { success: true, data: response.data || response };
    } catch (error: any) {
      console.error("[deliveryService] Failed to fetch live deliveries", error);
      throw error;
    }
  },

  /**
   * Simulate a real-time location update from socket.
   */
  async updateDeliveryLocation(
    deliveryId: string,
    lat: number,
    lng: number
  ): Promise<DeliveryApiResponse<boolean>> {
    try {
      await apiClient.post(`/api/v1/admin/delivery/live/${deliveryId}/location`, { lat, lng });
      return { success: true, data: true };
    } catch (error: any) {
      console.error(`[deliveryService] Failed to send live location update for ${deliveryId}`, error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // ROUTE MANAGEMENT
  // ═══════════════════════════════════════════════════════

  /**
   * Get delivery routes with optimization status.
   */
  async getRoutes(
    params?: Partial<DeliveryQueryParams>
  ): Promise<DeliveryApiResponse<PaginatedResponse<DeliveryRoute>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/delivery/routes", { params });
      return { success: true, data: response.data || response };
    } catch (error: any) {
      console.error("[deliveryService] Failed to fetch delivery routes", error);
      throw error;
    }
  },

  /**
   * Trigger route optimization for a zone.
   */
  async optimizeRoute(
    zone: string
  ): Promise<DeliveryApiResponse<DeliveryRoute | null>> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/delivery/routes/optimize", { zone });
      return { success: true, data: response.data || response };
    } catch (error: any) {
      console.error(`[deliveryService] Failed to optimize route for zone ${zone}`, error);
      throw error;
    }
  },

  /**
   * Optimize all pending routes.
   */
  async optimizeAllRoutes(): Promise<DeliveryApiResponse<number>> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/delivery/routes/optimize-all", {});
      return { success: true, data: response.data?.optimizedCount || response.data || 0 };
    } catch (error: any) {
      console.error("[deliveryService] Failed to optimize all routes", error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // DELIVERY STATUS
  // ═══════════════════════════════════════════════════════

  /**
   * Get all delivery status entries with filtering.
   */
  async getDeliveryStatuses(
    params?: Partial<DeliveryQueryParams>
  ): Promise<DeliveryApiResponse<PaginatedResponse<DeliveryStatusEntry>>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/delivery/status", { params });
      return { success: true, data: response.data || response };
    } catch (error: any) {
      console.error("[deliveryService] Failed to fetch delivery status entries", error);
      throw error;
    }
  },

  /**
   * Update delivery status (e.g. assign, picked_up, delivered, failed).
   */
  async updateDeliveryStatus(
    data: UpdateDeliveryStatusFormData
  ): Promise<DeliveryApiResponse<boolean>> {
    try {
      await apiClient.patch(`/api/v1/admin/delivery/status/${data.deliveryId}`, data);
      return { success: true, data: true };
    } catch (error: any) {
      console.error(`[deliveryService] Failed to update delivery status for ${data.deliveryId}`, error);
      throw error;
    }
  },

  /**
   * Assign delivery to a partner.
   */
  async assignDelivery(
    data: AssignDeliveryFormData
  ): Promise<DeliveryApiResponse<boolean>> {
    try {
      await apiClient.post("/api/v1/admin/delivery/assign", data);
      return { success: true, data: true };
    } catch (error: any) {
      console.error(`[deliveryService] Failed to assign delivery for order ${data.orderId}`, error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // PARTNER PERFORMANCE
  // ═══════════════════════════════════════════════════════

  /**
   * Get performance overview for a specific partner.
   */
  async getPartnerPerformance(
    partnerId: string,
    params?: Partial<AnalyticsQueryParams>
  ): Promise<DeliveryApiResponse<PerformanceOverview | null>> {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/delivery/fleet/${partnerId}/performance`, { params });
      return { success: true, data: response.data || response };
    } catch (error: any) {
      console.error(`[deliveryService] Failed to fetch performance for partner ${partnerId}`, error);
      throw error;
    }
  },

  /**
   * Get performance overview for all partners.
   */
  async getAllPartnerPerformance(
    params?: Partial<AnalyticsQueryParams>
  ): Promise<DeliveryApiResponse<PerformanceOverview[]>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/delivery/fleet/performance", { params });
      return { success: true, data: response.data || response };
    } catch (error: any) {
      console.error("[deliveryService] Failed to fetch performance for all partners", error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // DELIVERY ANALYTICS
  // ═══════════════════════════════════════════════════════

  /**
   * Get comprehensive delivery analytics.
   */
  async getAnalytics(
    params?: Partial<AnalyticsQueryParams>
  ): Promise<DeliveryApiResponse<DeliveryAnalytics>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/delivery/analytics", { params });
      return { success: true, data: response.data || response };
    } catch (error: any) {
      console.error("[deliveryService] Failed to fetch delivery analytics", error);
      throw error;
    }
  },

  // ═══════════════════════════════════════════════════════
  // SLA DASHBOARD
  // ═══════════════════════════════════════════════════════

  /**
   * Get SLA compliance dashboard data.
   */
  async getSLADashboard(): Promise<DeliveryApiResponse<SLADashboard>> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/delivery/sla");
      return { success: true, data: response.data || response };
    } catch (error: any) {
      console.error("[deliveryService] Failed to fetch SLA dashboard", error);
      throw error;
    }
  },
};

export type DeliveryService = typeof deliveryService;
