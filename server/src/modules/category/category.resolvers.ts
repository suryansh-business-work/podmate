import type { GraphQLContext } from '../auth/auth.models';
import { UserRole } from '../user/user.models';
import {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateSubCategoryInput,
  UpdateSubCategoryInput,
  Category,
} from './category.models';
import * as categoryService from './category.services';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateCreateSubCategory,
  validateUpdateSubCategory,
} from './category.validators';

const categoryResolvers = {
  Category: {
    subcategories: async (parent: Category) => {
      return (await categoryService.getSubCategoriesByCategoryId(parent.id)) ?? [];
    },
  },
  Query: {
    categories: async (
      _: unknown,
      args: { page?: number; limit?: number; search?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN))
        throw new Error('Admin access required');
      return categoryService.getCategories(args.page ?? 1, args.limit ?? 100, args.search);
    },
    activeCategories: async () => {
      return categoryService.getActiveCategories();
    },
    category: async (_: unknown, { id }: { id: string }) => {
      return categoryService.getCategoryById(id);
    },
  },
  Mutation: {
    createCategory: async (
      _: unknown,
      { input }: { input: CreateCategoryInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN))
        throw new Error('Admin access required');
      const err = validateCreateCategory(input);
      if (err) throw new Error(err);
      return categoryService.createCategory(input);
    },
    updateCategory: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateCategoryInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN))
        throw new Error('Admin access required');
      const err = validateUpdateCategory(input);
      if (err) throw new Error(err);
      const updated = await categoryService.updateCategory(id, input);
      if (!updated) throw new Error('Category not found');
      return updated;
    },
    deleteCategory: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN))
        throw new Error('Admin access required');
      return categoryService.deleteCategory(id);
    },
    createSubCategory: async (
      _: unknown,
      { input }: { input: CreateSubCategoryInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN))
        throw new Error('Admin access required');
      const err = validateCreateSubCategory(input);
      if (err) throw new Error(err);
      return categoryService.createSubCategory(input);
    },
    updateSubCategory: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateSubCategoryInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN))
        throw new Error('Admin access required');
      const err = validateUpdateSubCategory(input);
      if (err) throw new Error(err);
      const updated = await categoryService.updateSubCategory(id, input);
      if (!updated) throw new Error('SubCategory not found');
      return updated;
    },
    deleteSubCategory: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN))
        throw new Error('Admin access required');
      return categoryService.deleteSubCategory(id);
    },
  },
};

export default categoryResolvers;
