import type { GraphQLContext } from '../auth/auth.models';
import { UserRole } from '../user/user.models';
import { requireRole } from '../auth/auth.services';
import * as policyService from './policy.services';
import type { CreatePolicyInput, UpdatePolicyInput } from './policy.models';
import { getAllUsers } from '../user/user.services';
import { getPaginatedPods } from '../pod/pod.services';

const policyResolvers = {
  Query: {
    policies: (_: unknown, args: { type?: string }) => {
      return policyService.getPolicies(args.type);
    },

    dashboardStats: async (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      const users = await getAllUsers();
      const podsData = await getPaginatedPods({ page: 1, limit: 10000 });
      const activePods = podsData.items.filter(
        (p) => p.status === 'CONFIRMED' || p.status === 'PENDING',
      ).length;
      const totalRevenue = podsData.items.reduce(
        (sum, p) => sum + p.feePerPerson * p.currentSeats,
        0,
      );
      return {
        totalUsers: users.length,
        totalPods: podsData.total,
        activePods,
        totalRevenue,
      };
    },
  },

  Mutation: {
    createPolicy: (
      _: unknown,
      args: { input: CreatePolicyInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return policyService.createPolicy(args.input);
    },

    updatePolicy: (
      _: unknown,
      args: { id: string; input: UpdatePolicyInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return policyService.updatePolicy(args.id, args.input);
    },

    deletePolicy: (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return policyService.deletePolicy(args.id);
    },
  },
};

export default policyResolvers;
