import { apiClient } from "@/lib/api-client";
import type {
  CategoriesResponse,
  CategoryTreeResponse,
  CategoryDetailResponse,
  ApiCategory,
  ApiCategoryTree
} from "@/types/api-categories";

class CategoriesService {
  private readonly basePath = "/api/v1/categories";
  private readonly adminBasePath = "/api/v1/admin/categories";

  /**
   * GET /api/v1/categories
   * Get all active categories (flat list), or all categories if isAdmin is true
   */
  async getCategories(isAdmin: boolean = false): Promise<CategoriesResponse> {
    try {
      const endpoint = isAdmin ? this.adminBasePath : this.basePath;
      const response = await apiClient.get<any>(endpoint);
      
      const categories: ApiCategory[] = 
        response.categories || 
        response.data?.categories || 
        (Array.isArray(response.data) ? response.data : []);

      return {
        success: true,
        categories,
        count: response.count || categories.length,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("[CategoriesService] Failed to fetch categories:", error);
      throw error;
    }
  }

  /**
   * GET /api/v1/categories/tree
   * Get categories as a tree (parent -> children)
   */
  async getCategoryTree(): Promise<CategoryTreeResponse> {
    try {
      const response = await apiClient.get<any>(`${this.basePath}/tree`);
      
      const categories: ApiCategoryTree[] = 
        response.categories || 
        response.data?.categories || 
        (Array.isArray(response.data) ? response.data : []);

      return {
        success: true,
        categories,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn("[CategoriesService] Failed to fetch category tree:", error);
      throw error;
    }
  }

  /**
   * GET /api/v1/categories/{id}
   * Get category by ID with subcategories
   */
  async getCategoryById(id: string): Promise<CategoryDetailResponse> {
    try {
      const response = await apiClient.get<any>(`${this.basePath}/${id}`);
      
      const category: ApiCategory = 
        response.category || 
        response.data?.category || 
        response.data;

      return {
        success: true,
        category,
        message: response.message || response.data?.message,
      };
    } catch (error: any) {
      console.warn(`[CategoriesService] Failed to fetch category ${id}:`, error);
      throw error;
    }
  }

  /**
   * POST /api/v1/admin/categories
   * Create a new category
   */
  async createCategory(data: Partial<ApiCategory>): Promise<CategoryDetailResponse> {
    try {
      const response = await apiClient.post<any>(this.adminBasePath, data);
      
      const category: ApiCategory = 
        response.category || 
        response.data?.category || 
        response.data;

      return {
        success: true,
        category,
        message: response.message || response.data?.message || "Category created successfully",
      };
    } catch (error: any) {
      console.warn("[CategoriesService] Failed to create category:", error);
      throw error;
    }
  }

  /**
   * PUT /api/v1/admin/categories/{id}
   * Update an existing category
   */
  async updateCategory(id: string, data: Partial<ApiCategory>): Promise<CategoryDetailResponse> {
    try {
      const response = await apiClient.put<any>(`${this.adminBasePath}/${id}`, data);
      
      const category: ApiCategory = 
        response.category || 
        response.data?.category || 
        response.data;

      return {
        success: true,
        category,
        message: response.message || response.data?.message || "Category updated successfully",
      };
    } catch (error: any) {
      console.warn(`[CategoriesService] Failed to update category ${id}:`, error);
      throw error;
    }
  }

  /**
   * DELETE /api/v1/admin/categories/{id}
   * Delete a category
   */
  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<any>(`${this.adminBasePath}/${id}`);
      
      return {
        success: true,
        message: response.message || response.data?.message || "Category deleted successfully",
      };
    } catch (error: any) {
      console.warn(`[CategoriesService] Failed to delete category ${id}:`, error);
      throw error;
    }
  }
}

export const categoriesService = new CategoriesService();
