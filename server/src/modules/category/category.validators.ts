import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSubCategoryInput,
  UpdateSubCategoryInput,
} from './category.models';

export function validateCreateCategory(input: CreateCategoryInput): string | null {
  if (!input.name || input.name.trim().length < 2) {
    return 'Category name must be at least 2 characters.';
  }
  if (!input.iconUrl || input.iconUrl.trim().length === 0) {
    return 'Category icon is required.';
  }
  return null;
}

export function validateUpdateCategory(input: UpdateCategoryInput): string | null {
  if (input.name !== undefined && input.name.trim().length < 2) {
    return 'Category name must be at least 2 characters.';
  }
  if (input.iconUrl !== undefined && input.iconUrl.trim().length === 0) {
    return 'Category icon cannot be empty.';
  }
  return null;
}

export function validateCreateSubCategory(input: CreateSubCategoryInput): string | null {
  if (!input.categoryId || input.categoryId.trim().length === 0) {
    return 'Parent category is required.';
  }
  if (!input.name || input.name.trim().length < 2) {
    return 'Subcategory name must be at least 2 characters.';
  }
  return null;
}

export function validateUpdateSubCategory(input: UpdateSubCategoryInput): string | null {
  if (input.name !== undefined && input.name.trim().length < 2) {
    return 'Subcategory name must be at least 2 characters.';
  }
  return null;
}
