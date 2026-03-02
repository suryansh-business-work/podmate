import type { GraphQLContext } from '../auth/auth.models';
import { UserRole } from '../user/user.models';
import { requireRole, requireAuth } from '../auth/auth.services';
import type { CreateFeatureFlagInput, UpdateFeatureFlagInput } from './featureFlag.models';
import * as featureFlagService from './featureFlag.services';

const featureFlagResolvers = {
  Query: {
    featureFlags: (
      _: unknown,
      args: { page?: number; limit?: number; search?: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return featureFlagService.getFeatureFlags(
        args.page ?? 1,
        args.limit ?? 20,
        args.search,
      );
    },

    featureFlag: (_: unknown, args: { key: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return featureFlagService.getFeatureFlagByKey(args.key);
    },

    isFeatureEnabled: (_: unknown, args: { key: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return featureFlagService.isFeatureEnabled(args.key, auth.userId);
    },
  },

  Mutation: {
    createFeatureFlag: (
      _: unknown,
      args: { input: CreateFeatureFlagInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return featureFlagService.createFeatureFlag(args.input);
    },

    updateFeatureFlag: (
      _: unknown,
      args: { id: string; input: UpdateFeatureFlagInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return featureFlagService.updateFeatureFlag(args.id, args.input);
    },

    deleteFeatureFlag: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return featureFlagService.deleteFeatureFlag(args.id);
    },

    toggleFeatureFlag: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return featureFlagService.toggleFeatureFlag(args.id);
    },
  },
};

export default featureFlagResolvers;
