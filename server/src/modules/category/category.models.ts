import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/* ── Category ── */

export interface Category {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  iconUrl: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  iconUrl?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PaginatedCategories {
  items: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CategoryMongoDoc = Omit<Category, 'id'> & { _id: string };

const CategorySchema = new Schema<CategoryMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    iconUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const CategoryModel =
  (mongoose.models['Category'] as mongoose.Model<CategoryMongoDoc> | undefined) ??
  model<CategoryMongoDoc>('Category', CategorySchema);

export function toCategory(doc: (CategoryMongoDoc & { id?: string }) | null): Category | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    iconUrl: doc.iconUrl ?? '',
    imageUrl: doc.imageUrl ?? '',
    description: doc.description ?? '',
  } as Category;
}

/* ── SubCategory ── */

export interface SubCategory {
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

export interface CreateSubCategoryInput {
  categoryId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateSubCategoryInput {
  name?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export type SubCategoryMongoDoc = Omit<SubCategory, 'id'> & { _id: string };

const SubCategorySchema = new Schema<SubCategoryMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    categoryId: { type: String, required: true, ref: 'Category' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

SubCategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

export const SubCategoryModel =
  (mongoose.models['SubCategory'] as mongoose.Model<SubCategoryMongoDoc> | undefined) ??
  model<SubCategoryMongoDoc>('SubCategory', SubCategorySchema);

export function toSubCategory(
  doc: (SubCategoryMongoDoc & { id?: string }) | null,
): SubCategory | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    description: doc.description ?? '',
    imageUrl: doc.imageUrl ?? '',
  } as SubCategory;
}
