import { useQuery } from "@tanstack/react-query";
import { categoriesService } from "@/services/categories.service";
import { queryKeys } from "@/lib/query-keys";
import type { ApiCategory, ApiCategoryTree } from "@/types/api-categories";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.products.categories.list(),
    queryFn: async () => {
      const response = await categoriesService.getCategories();
      return response.categories;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: [...queryKeys.products.categories.all, "tree"],
    queryFn: async () => {
      const response = await categoriesService.getCategoryTree();
      return response.categories;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryDetail(id: string) {
  return useQuery({
    queryKey: [...queryKeys.products.categories.all, "detail", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await categoriesService.getCategoryById(id);
      return response.category;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
