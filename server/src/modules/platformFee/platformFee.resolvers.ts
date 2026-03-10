import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
import type { EntityOverrideType } from './platformFee.models';
import * as platformFeeService from './platformFee.services';

const platformFeeResolvers = {
  Query: {
    platformFees: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return platformFeeService.getGlobalConfig();
    },

    platformFeeOverrides: (
      _: unknown,
      args: { page?: number; limit?: number },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return platformFeeService.getOverrides(args.page ?? 1, args.limit ?? 50);
    },

    entityFeeOverrides: (
      _: unknown,
      args: { entityType?: EntityOverrideType; page?: number; limit?: number },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return platformFeeService.getEntityFeeOverrides(
        args.entityType,
        args.page ?? 1,
        args.limit ?? 50,
      );
    },

    entityFeeOverride: (
      _: unknown,
      args: { entityType: EntityOverrideType; entityId: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return platformFeeService.getEntityFeeOverride(args.entityType, args.entityId);
    },

    effectiveFee: (
      _: unknown,
      args: { entityType: EntityOverrideType; entityId: string },
      context: GraphQLContext,
    ) => {
      requireAuth(context);
      return platformFeeService.getEffectiveFee(args.entityType, args.entityId);
    },
  },

  Mutation: {
    upsertPlatformFee: (
      _: unknown,
      args: { globalFeePercent: number },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return platformFeeService.upsertGlobalFee(args.globalFeePercent);
    },

    upsertPlatformFeeOverride: (
      _: unknown,
      args: { input: { id?: string; pincode: string; feePercent: number; label?: string } },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return platformFeeService.upsertOverride(args.input);
    },

    deletePlatformFeeOverride: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return platformFeeService.deleteOverride(args.id);
    },

    upsertEntityFeeOverride: (
      _: unknown,
      args: {
        input: {
          entityType: EntityOverrideType;
          entityId: string;
          feePercent: number;
          enabled: boolean;
        };
      },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return platformFeeService.upsertEntityFeeOverride(args.input);
    },

    deleteEntityFeeOverride: (
      _: unknown,
      args: { entityType: EntityOverrideType; entityId: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return platformFeeService.deleteEntityFeeOverride(args.entityType, args.entityId);
    },
  },
};

export default platformFeeResolvers;
