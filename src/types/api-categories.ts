export interface ApiCategory {
  _id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  parent?: string | ApiCategory;
  isActive: boolean;
  active?: boolean;
  order: number;
  subcategories?: ApiCategory[];
  createdAt: string;
  updatedAt: string;
  id: string; // virtual or mapped
}

export interface ApiCategoryTree extends ApiCategory {
  children?: ApiCategoryTree[];
}

export interface CategoriesResponse {
  success: boolean;
  categories: ApiCategory[];
  count: number;
  message?: string;
}

export interface CategoryTreeResponse {
  success: boolean;
  categories: ApiCategoryTree[];
  message?: string;
}

export interface CategoryDetailResponse {
  success: boolean;
  category: ApiCategory;
  message?: string;
}
