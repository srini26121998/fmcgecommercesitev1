import { apiClient } from "@/lib/api-client";
import { UserProfile } from "@/store/auth-store";
import { Address } from "@/store/address-store";

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  mobile?: string;
  [key: string]: any;
}

export type AddressPayload = Omit<Address, "id">;

class UsersService {
  /**
   * Get current user's profile
   */
  async getProfile(): Promise<{ success: boolean; data?: UserProfile; message?: string }> {
    try {
      const response = await apiClient.get<any>("/api/v1/users/me/profile");
      return {
        success: true,
        data: response.data?.user || response.data || response,
      };
    } catch (error: any) {
      console.warn("Failed to fetch profile:", error);
      return { success: false, message: error.message || "Failed to fetch profile" };
    }
  }

  /**
   * Update current user's profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<{ success: boolean; data?: UserProfile; message?: string }> {
    try {
      const response = await apiClient.patch<any>("/api/v1/users/me/profile", payload);
      return {
        success: true,
        data: response.data?.user || response.data || response,
      };
    } catch (error: any) {
      console.warn("Failed to update profile:", error);
      return { success: false, message: error.message || "Failed to update profile" };
    }
  }

  /**
   * Get user's delivery addresses
   */
  async getAddresses(): Promise<{ success: boolean; data?: Address[]; message?: string }> {
    try {
      const response = await apiClient.get<any>("/api/v1/users/me/addresses");
      const data = response.data?.addresses || response.data || response;
      const mappedData = Array.isArray(data) ? data.map(this.mapToFrontendAddress) : [];
      return {
        success: true,
        data: mappedData,
      };
    } catch (error: any) {
      console.warn("Failed to fetch addresses:", error);
      return { success: false, message: error.message || "Failed to fetch addresses" };
    }
  }

  /**
   * Set a delivery address as default
   */
  async setDefaultAddress(id: string): Promise<{ success: boolean; data?: Address; message?: string }> {
    try {
      const response = await apiClient.patch<any>(`/api/v1/users/me/addresses/${id}/set-default`);
      const data = response.data?.address || response.data || response;
      return {
        success: true,
        data: data ? this.mapToFrontendAddress(data) : undefined,
      };
    } catch (error: any) {
      console.warn("Failed to set default address:", error);
      return { success: false, message: error.message || "Failed to set default address" };
    }
  }

  /**
   * Add a new delivery address
   */
  async addAddress(payload: AddressPayload): Promise<{ success: boolean; data?: Address; message?: string }> {
    try {
      const backendPayload = this.mapToBackendAddress(payload);
      const response = await apiClient.post<any>("/api/v1/users/me/addresses", backendPayload);
      const data = response.data?.address || response.data || response;
      return {
        success: true,
        data: data ? this.mapToFrontendAddress(data) : undefined,
      };
    } catch (error: any) {
      console.warn("Failed to add address:", error);
      return { success: false, message: error.message || "Failed to add address" };
    }
  }

  /**
   * Update an existing delivery address
   */
  async updateAddress(id: string, payload: Partial<AddressPayload>): Promise<{ success: boolean; data?: Address; message?: string }> {
    try {
      const backendPayload = this.mapToBackendAddress(payload);
      const response = await apiClient.put<any>(`/api/v1/users/me/addresses/${id}`, backendPayload);
      const data = response.data?.address || response.data || response;
      return {
        success: true,
        data: data ? this.mapToFrontendAddress(data) : undefined,
      };
    } catch (error: any) {
      console.warn("Failed to update address:", error);
      return { success: false, message: error.message || "Failed to update address" };
    }
  }

  /**
   * Delete a delivery address
   */
  async deleteAddress(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiClient.delete<any>(`/api/v1/users/me/addresses/${id}`);
      return {
        success: true,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("Failed to delete address:", error);
      return { success: false, message: error.message || "Failed to delete address" };
    }
  }

  // Helpers to map between Frontend Address and Backend Address models
  private mapToBackendAddress(addr: Partial<AddressPayload>) {
    return {
      label: addr.type || "Other",
      line1: addr.name ? `${addr.name}::${addr.address}` : addr.address || "",
      line2: addr.phone || "",
      city: addr.city || "",
      state: "State",
      pincode: addr.pincode || "",
      lat: 0,
      lng: 0,
      isDefault: addr.isDefault || false,
    };
  }

  private mapToFrontendAddress(backendAddr: any): Address {
    let name = "User";
    let address = backendAddr.line1 || "";
    if (address.includes("::")) {
      const parts = address.split("::");
      name = parts[0];
      address = parts.slice(1).join("::");
    }
    return {
      id: backendAddr._id || backendAddr.id,
      type: (backendAddr.label as any) || "Other",
      name: name,
      address: address,
      city: backendAddr.city || "",
      pincode: backendAddr.pincode || "",
      phone: backendAddr.line2 || "",
      isDefault: backendAddr.default ?? backendAddr.isDefault ?? false,
    };
  }
}

export const usersService = new UsersService();
