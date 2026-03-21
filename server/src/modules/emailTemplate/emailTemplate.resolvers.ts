import type { GraphQLContext } from '../auth/auth.models';
import { requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
import * as service from './emailTemplate.services';
import {
  validateCreateEmailTemplate,
  validateUpdateEmailTemplate,
} from './emailTemplate.validators';
import type {
  CreateEmailTemplateInput,
  UpdateEmailTemplateInput,
} from './emailTemplate.validators';

const resolvers = {
  Query: {
    emailTemplates: async (
      _: unknown,
      args: { page?: number; limit?: number; search?: string; category?: string },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx, UserRole.ADMIN);
      return service.getEmailTemplates(args.page, args.limit, args.search, args.category);
    },
    emailTemplate: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireRole(ctx, UserRole.ADMIN);
      return service.getEmailTemplateById(args.id);
    },
    emailTemplateBySlug: async (_: unknown, args: { slug: string }, ctx: GraphQLContext) => {
      requireRole(ctx, UserRole.ADMIN);
      return service.getEmailTemplateBySlug(args.slug);
    },
  },
  Mutation: {
    createEmailTemplate: async (
      _: unknown,
      args: { input: CreateEmailTemplateInput },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx, UserRole.ADMIN);
      validateCreateEmailTemplate(args.input);
      return service.createEmailTemplate(args.input);
    },
    updateEmailTemplate: async (
      _: unknown,
      args: { id: string; input: UpdateEmailTemplateInput },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx, UserRole.ADMIN);
      validateUpdateEmailTemplate(args.input);
      return service.updateEmailTemplate(args.id, args.input);
    },
    deleteEmailTemplate: async (_: unknown, args: { id: string }, ctx: GraphQLContext) => {
      requireRole(ctx, UserRole.ADMIN);
      return service.deleteEmailTemplate(args.id);
    },
    validateMjml: async (_: unknown, args: { mjmlBody: string }, ctx: GraphQLContext) => {
      requireRole(ctx, UserRole.ADMIN);
      return service.validateMjml(args.mjmlBody);
    },
    previewEmailTemplate: async (
      _: unknown,
      args: { mjmlBody: string; variables: string },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx, UserRole.ADMIN);
      const vars = JSON.parse(args.variables) as Record<string, string>;
      return service.previewTemplate(args.mjmlBody, vars);
    },
    renderEmailTemplate: async (
      _: unknown,
      args: { slug: string; variables: string },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx, UserRole.ADMIN);
      const template = await service.getEmailTemplateBySlug(args.slug);
      if (!template) throw new Error(`Template "${args.slug}" not found`);
      const vars = JSON.parse(args.variables) as Record<string, string>;
      return service.renderTemplate(template.mjmlBody, vars);
    },
  },
};

export default resolvers;
