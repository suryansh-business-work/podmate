import type { GraphQLContext } from '../auth/auth.models';
import { UserRole } from '../user/user.models';
import type { CreatePodTemplateInput, UpdatePodTemplateInput } from './podTemplate.models';
import * as podTemplateService from './podTemplate.services';
import { validateCreatePodTemplate, validateUpdatePodTemplate } from './podTemplate.validators';

const podTemplateResolvers = {
  Query: {
    podTemplates: async (
      _: unknown,
      args: { page?: number; limit?: number; search?: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN)) throw new Error('Admin access required');
      return podTemplateService.getPodTemplates(args.page ?? 1, args.limit ?? 20, args.search);
    },
    activePodTemplates: async () => {
      return podTemplateService.getActivePodTemplates();
    },
  },
  Mutation: {
    createPodTemplate: async (
      _: unknown,
      { input }: { input: CreatePodTemplateInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN)) throw new Error('Admin access required');
      const err = validateCreatePodTemplate(input);
      if (err) throw new Error(err);
      return podTemplateService.createPodTemplate(input);
    },
    updatePodTemplate: async (
      _: unknown,
      { id, input }: { id: string; input: UpdatePodTemplateInput },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN)) throw new Error('Admin access required');
      const err = validateUpdatePodTemplate(input);
      if (err) throw new Error(err);
      const updated = await podTemplateService.updatePodTemplate(id, input);
      if (!updated) throw new Error('Template not found');
      return updated;
    },
    deletePodTemplate: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.user || !ctx.user.roles.includes(UserRole.ADMIN)) throw new Error('Admin access required');
      return podTemplateService.deletePodTemplate(id);
    },
  },
};

export default podTemplateResolvers;
