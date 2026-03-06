import type { GraphQLContext } from '../auth/auth.models';
import { requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
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
  },
};

export default platformFeeResolvers;
