// ── Customer Management Service Layer ───────────────────
// Architecture: UI → Component → Hook → Service → API Gateway → Backend

import { apiClient } from "@/lib/api-client";
import type {
  Customer,
  CustomerActivity,
  CustomerAction,
  CustomerFilters,
  CustomersListResponse,
  Segment,
  SupportTicket,
  TicketFilters,
  TicketsListResponse,
  FraudAlert,
  SuspiciousActivity,
  FraudFilters,
  FraudListResponse,
  ExportRequest,
} from "@/types/customers";
import type { PaginationState } from "@/types/products";

// ── Helpers ──────────────────────────────────────────────

function computeCustomersSummary(customers: Customer[]) {
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const validOrdersCount = safeCustomers.filter((c) => c.totalOrders > 0).length;

  return {
    total: safeCustomers.length,
    active: safeCustomers.filter((c) => c.status === "active").length,
    vip: safeCustomers.filter((c) => c.segment === "vip").length,
    new: safeCustomers.filter((c) => c.segment === "new").length,
    atRisk: safeCustomers.filter((c) => c.segment === "at_risk").length,
    churned: safeCustomers.filter((c) => c.segment === "churned").length,
    totalRevenue: safeCustomers.reduce((s, c) => s + (c.totalSpent || 0), 0),
    avgOrderValue: safeCustomers.length > 0 && validOrdersCount > 0
      ? Math.round(safeCustomers.reduce((s, c) => s + (c.avgOrderValue || 0), 0) / validOrdersCount)
      : 0,
  };
}

// ── Customer Service ─────────────────────────────────────

export const customerService = {
  // ── Customers ─────────────────────────────────────────

  async getCustomers(
    filters?: Partial<CustomerFilters>,
    pagination?: Partial<PaginationState>,
  ): Promise<CustomersListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.segment && filters.segment !== "all") params.set("segment", filters.segment);
      if (filters?.status && filters.status !== "all") params.set("status", filters.status);
      if (filters?.city) params.set("city", filters.city);
      if (filters?.minOrders !== undefined) params.set("minOrders", String(filters.minOrders));
      if (filters?.minSpent !== undefined) params.set("minSpent", String(filters.minSpent));
      if (filters?.sortBy) params.set("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);
      if (pagination?.page) {
        const page0 = Math.max(0, pagination.page - 1);
        params.set("page", String(page0));
      }
      if (pagination?.pageSize) params.set("limit", String(pagination.pageSize));

      const qs = params.toString();
      const url = qs ? `/api/v1/admin/customers?${qs}` : `/api/v1/admin/customers`;
      const response = await apiClient.get<any>(url);
      
      let customers = [];
      if (Array.isArray(response)) {
        customers = response;
      } else if (Array.isArray(response?.data?.content)) { // Added this check for PagedResponse!
        customers = response.data.content;
      } else if (Array.isArray(response?.data?.customers)) {
        customers = response.data.customers;
      } else if (Array.isArray(response?.customers)) {
        customers = response.customers;
      } else if (Array.isArray(response?.data)) {
        customers = response.data;
      }
      
      const total = response?.data?.totalElements || response?.data?.total || response?.total || customers.length;
      
      return {
        customers,
        pagination: { page: pagination?.page || 1, pageSize: pagination?.pageSize || 10, total },
        summary: response.data?.summary || response.summary || computeCustomersSummary(customers),
      };
    } catch (error) {
      console.error("[CustomerService] getCustomers failed:", error);
      throw error;
    }
  },

  async getCustomerStats(): Promise<any> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/customers/stats");
      return response.data || response;
    } catch (error) {
      console.error("[CustomerService] getCustomerStats failed:", error);
      throw error;
    }
  },

  async getCustomerById(id: string): Promise<Customer | undefined> {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/customers/${id}`);
      return response.data?.customer || response.customer || response.data;
    } catch (error) {
      console.error(`[CustomerService] getCustomerById failed for ${id}:`, error);
      throw error;
    }
  },

  async updateCustomerStatus(id: string, status: string): Promise<Customer | undefined> {
    try {
      const response = await apiClient.patch<any>(`/api/v1/admin/customers/${id}/status`, { status });
      return response.data?.customer || response.customer || response.data;
    } catch (error) {
      console.error(`[CustomerService] updateCustomerStatus failed:`, error);
      throw error;
    }
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | undefined> {
    try {
      const response = await apiClient.patch<any>(`/api/v1/admin/customers/${id}`, data);
      return response.data?.customer || response.customer || response.data;
    } catch (error) {
      console.error(`[CustomerService] updateCustomer failed:`, error);
      throw error;
    }
  },

  async getCustomerNotes(id: string): Promise<any[]> {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/customers/${id}/notes`);
      return response.data?.notes || response.notes || response.data || [];
    } catch (error) {
      console.error(`[CustomerService] getCustomerNotes failed:`, error);
      throw error;
    }
  },

  async addCustomerNote(id: string, content: string, performedBy: string): Promise<boolean> {
    try {
      await apiClient.post<any>(`/api/v1/admin/customers/${id}/notes`, { content, performedBy });
      return true;
    } catch (error) {
      console.error(`[CustomerService] addCustomerNote failed:`, error);
      throw error;
    }
  },

  async deleteCustomerNote(noteId: string): Promise<boolean> {
    try {
      await apiClient.delete<any>(`/api/v1/admin/customers/notes/${noteId}`);
      return true;
    } catch (error) {
      console.error(`[CustomerService] deleteCustomerNote failed:`, error);
      throw error;
    }
  },

  // ── Activities ────────────────────────────────────────

  async getCustomerActivities(customerId: string): Promise<CustomerActivity[]> {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/customers/${customerId}/activities`);
      return response.data || response;
    } catch (error) {
      console.error(`[CustomerService] getCustomerActivities failed for ${customerId}:`, error);
      throw error;
    }
  },

  async addCustomerActivity(customerId: string, action: CustomerAction, description: string, performedBy?: string): Promise<boolean> {
    try {
      await apiClient.post<any>(`/api/v1/admin/customers/${customerId}/activities`, { action, description, performedBy });
      return true;
    } catch (error) {
      console.error(`[CustomerService] addCustomerActivity failed for ${customerId}:`, error);
      throw error;
    }
  },

  // ── Segments ──────────────────────────────────────────

  async getSegments(): Promise<Segment[]> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/customers/segments");
      return response.data || response;
    } catch (error) {
      console.error("[CustomerService] getSegments failed:", error);
      throw error;
    }
  },

  async createSegment(data: { name: string; criteria: string; description: string }): Promise<any> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/customers/segments", data);
      return response.data || response;
    } catch (error) {
      console.error("[CustomerService] createSegment failed:", error);
      throw error;
    }
  },

  async updateSegment(id: string | number, data: { name: string; criteria: string; description: string }): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/api/v1/admin/customers/segments/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`[CustomerService] updateSegment failed for ${id}:`, error);
      throw error;
    }
  },

  // ── Analytics ─────────────────────────────────────────

  async getPurchaseBehavior(): Promise<any> {
    try {
      const response = await apiClient.get<any>("/api/v1/admin/customers/analytics");
      return response.data || response;
    } catch (error) {
      console.error("[CustomerService] getPurchaseBehavior failed:", error);
      throw error;
    }
  },



  // ── Support Tickets ───────────────────────────────────

  async getTickets(
    filters?: Partial<TicketFilters>,
    pagination?: Partial<PaginationState>,
  ): Promise<TicketsListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.status && filters.status !== "all") params.set("status", filters.status);
      if (filters?.priority && filters.priority !== "all") params.set("priority", filters.priority);
      if (filters?.assignedTo) params.set("assignedTo", filters.assignedTo);
      if (pagination?.page) params.set("page", String(pagination.page));
      if (pagination?.pageSize) params.set("limit", String(pagination.pageSize));

      const response = await apiClient.get<any>(`/api/v1/admin/customers/tickets?${params.toString()}`);
      
      let tickets = [];
      if (Array.isArray(response)) {
        tickets = response;
      } else if (response?.data?.tickets) {
        tickets = response.data.tickets;
      } else if (response?.tickets) {
        tickets = response.tickets;
      } else if (Array.isArray(response?.data)) {
        tickets = response.data;
      }

      const total = response?.data?.total || response?.total || response?.data?.pagination?.total || response?.pagination?.total || tickets.length;

      return {
        tickets,
        pagination: response?.data?.pagination || response?.pagination || { page: pagination?.page || 1, pageSize: pagination?.pageSize || 10, total },
        summary: response?.data?.summary || response?.summary || { total: tickets.length, open: 0, inProgress: 0, resolved: 0, urgent: 0 }
      };
    } catch (error) {
      console.error("[CustomerService] getTickets failed:", error);
      throw error;
    }
  },

  async getTicketById(id: string): Promise<SupportTicket | undefined> {
    try {
      const response = await apiClient.get<any>(`/api/v1/admin/customers/tickets/${id}`);
      return response.data?.ticket || response.ticket || response.data;
    } catch (error) {
      console.error(`[CustomerService] getTicketById failed for ${id}:`, error);
      throw error;
    }
  },

  async createTicket(data: any): Promise<any> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/customers/tickets", data);
      return response.data || response;
    } catch (error) {
      console.error("[CustomerService] createTicket failed:", error);
      throw error;
    }
  },

  async updateTicket(id: string, data: any): Promise<any> {
    try {
      const response = await apiClient.put<any>(`/api/v1/admin/customers/tickets/${id}`, data);
      return response.data || response;
    } catch (error) {
      console.error(`[CustomerService] updateTicket failed for ${id}:`, error);
      throw error;
    }
  },

  async updateTicketStatus(id: string, status: string, assignedTo?: string): Promise<SupportTicket | undefined> {
    try {
      const response = await apiClient.patch<any>(`/api/v1/admin/customers/tickets/${id}/status`, { status, assignedTo });
      return response.data?.ticket || response.ticket || response.data;
    } catch (error) {
      console.error(`[CustomerService] updateTicketStatus failed for ${id}:`, error);
      throw error;
    }
  },

  async addTicketMessage(id: string, message: { sender: string; senderRole: "customer" | "agent" | "system"; content: string }): Promise<boolean> {
    try {
      await apiClient.post<any>(`/api/v1/admin/customers/tickets/${id}/messages`, message);
      return true;
    } catch (error) {
      console.error(`[CustomerService] addTicketMessage failed for ${id}:`, error);
      throw error;
    }
  },

  // ── Fraud Detection ───────────────────────────────────

  async getFraudAlerts(
    filters?: Partial<FraudFilters>,
    pagination?: Partial<PaginationState>,
  ): Promise<FraudListResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.set("search", filters.search);
      if (filters?.status && filters.status !== "all") params.set("status", filters.status);
      if (filters?.riskLevel && filters.riskLevel !== "all") params.set("riskLevel", filters.riskLevel);
      if (filters?.minScore !== undefined) params.set("minScore", String(filters.minScore));
      if (pagination?.page) params.set("page", String(pagination.page));
      if (pagination?.pageSize) params.set("limit", String(pagination.pageSize));

      const response = await apiClient.get<any>(`/api/v1/admin/customers/fraud-alerts`);
      
      let alerts = [];
      if (Array.isArray(response)) {
        alerts = response;
      } else if (response?.data?.alerts) {
        alerts = response.data.alerts;
      } else if (response?.alerts) {
        alerts = response.alerts;
      } else if (Array.isArray(response?.data)) {
        alerts = response.data;
      }

      const total = response?.data?.total || response?.total || response?.data?.pagination?.total || response?.pagination?.total || alerts.length;

      const computedSummary = {
        total: alerts.length,
        blocked: alerts.filter((a: any) => a.status === "blocked").length,
        flagged: alerts.filter((a: any) => a.status === "flagged").length,
        monitoring: alerts.filter((a: any) => a.status === "monitoring").length,
        critical: alerts.filter((a: any) => a.riskLevel === "critical" || (a.riskScore || a.score) >= 90).length,
        high: alerts.filter((a: any) => a.riskLevel === "high" || ((a.riskScore || a.score) >= 70 && (a.riskScore || a.score) < 90)).length,
      };

      return {
        alerts,
        pagination: response?.data?.pagination || response?.pagination || { page: pagination?.page || 1, pageSize: pagination?.pageSize || 10, total },
        summary: response?.data?.summary || response?.summary || computedSummary
      };
    } catch (error) {
      console.error("[CustomerService] getFraudAlerts failed:", error);
      throw error;
    }
  },

  async updateFraudAlertStatus(id: string, status: string): Promise<FraudAlert | undefined> {
    try {
      const response = await apiClient.patch<any>(`/api/v1/admin/customers/fraud/alerts/${id}/status`, { status });
      return response.data?.alert || response.alert || response.data;
    } catch (error) {
      console.error(`[CustomerService] updateFraudAlertStatus failed for ${id}:`, error);
      throw error;
    }
  },

  async resetFraudScore(customerId: string | number): Promise<boolean> {
    try {
      await apiClient.post<any>(`/api/v1/admin/customers/${customerId}/reset-fraud`, {});
      return true;
    } catch (error) {
      console.error(`[CustomerService] resetFraudScore failed for ${customerId}:`, error);
      throw error;
    }
  },


  // ── Export / GDPR Requests ────────────────────────────

  async getExportRequests(
    customerId?: string,
    pagination?: Partial<PaginationState>,
  ): Promise<{ requests: ExportRequest[]; pagination: PaginationState }> {
    try {
      const params = new URLSearchParams();
      if (customerId) params.set("customerId", customerId);
      if (pagination?.page) params.set("page", String(pagination.page));
      if (pagination?.pageSize) params.set("limit", String(pagination.pageSize));

      const response = await apiClient.get<any>(`/api/v1/admin/customers/exports?${params.toString()}`);
      if (response?.data) {
        return response.data;
      }
      return response;
    } catch (error) {
      console.error("[CustomerService] getExportRequests failed:", error);
      throw error;
    }
  },

  async requestDataExport(customerId: string, customerName: string, type: string): Promise<ExportRequest> {
    try {
      const response = await apiClient.post<any>("/api/v1/admin/customers/exports", { customerId, customerName, type });
      return response.data || response;
    } catch (error) {
      console.error("[CustomerService] requestDataExport failed:", error);
      throw error;
    }
  },
};


// ── Export singleton ─────────────────────────────────────
export default customerService;
