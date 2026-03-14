export interface SubCategoryItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  subcategories: SubCategoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCategoriesData {
  categories: {
    items: CategoryItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ActiveCategoriesData {
  activeCategories: CategoryItem[];
}

export interface CategoryFormData {
  name: string;
  description: string;
  iconUrl: string;
  imageUrl: string;
  isActive: boolean;
}

export interface SubCategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}
