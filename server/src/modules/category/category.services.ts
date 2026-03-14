import {
  CategoryModel,
  toCategory,
  Category,
  PaginatedCategories,
  CreateCategoryInput,
  UpdateCategoryInput,
  SubCategoryModel,
  toSubCategory,
  SubCategory,
  CreateSubCategoryInput,
  UpdateSubCategoryInput,
} from './category.models';

/* ── Category services ── */

export async function getCategories(
  page: number,
  limit: number,
  search?: string,
): Promise<PaginatedCategories> {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  const total = await CategoryModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit) || 1;
  const docs = await CategoryModel.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return {
    items: docs.map((d) => toCategory(d)!),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getActiveCategories(): Promise<Category[]> {
  const docs = await CategoryModel.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return docs.map((d) => toCategory(d)!);
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const doc = await CategoryModel.findById(id).lean();
  return toCategory(doc);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  const doc = await CategoryModel.create({
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    iconUrl: input.iconUrl.trim(),
    imageUrl: input.imageUrl?.trim() ?? '',
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });
  return toCategory(doc.toObject())!;
}

export async function updateCategory(
  id: string,
  input: UpdateCategoryInput,
): Promise<Category | null> {
  const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.description !== undefined) updateData.description = input.description.trim();
  if (input.iconUrl !== undefined) updateData.iconUrl = input.iconUrl.trim();
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl.trim();
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

  const doc = await CategoryModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  return toCategory(doc);
}

export async function deleteCategory(id: string): Promise<boolean> {
  await SubCategoryModel.deleteMany({ categoryId: id });
  const result = await CategoryModel.findByIdAndDelete(id);
  return !!result;
}

/* ── SubCategory services ── */

export async function getSubCategoriesByCategoryId(categoryId: string): Promise<SubCategory[]> {
  const docs = await SubCategoryModel.find({ categoryId })
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return docs.map((d) => toSubCategory(d)!);
}

export async function createSubCategory(input: CreateSubCategoryInput): Promise<SubCategory> {
  const category = await CategoryModel.findById(input.categoryId).lean();
  if (!category) throw new Error('Parent category not found');

  const doc = await SubCategoryModel.create({
    categoryId: input.categoryId,
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    imageUrl: input.imageUrl?.trim() ?? '',
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
  });
  return toSubCategory(doc.toObject())!;
}

export async function updateSubCategory(
  id: string,
  input: UpdateSubCategoryInput,
): Promise<SubCategory | null> {
  const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.name !== undefined) updateData.name = input.name.trim();
  if (input.description !== undefined) updateData.description = input.description.trim();
  if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl.trim();
  if (input.isActive !== undefined) updateData.isActive = input.isActive;
  if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

  const doc = await SubCategoryModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
  return toSubCategory(doc);
}

export async function deleteSubCategory(id: string): Promise<boolean> {
  const result = await SubCategoryModel.findByIdAndDelete(id);
  return !!result;
}
