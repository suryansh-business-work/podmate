import type { GraphQLContext } from '../auth/auth.models';
import { UserRole } from '../user/user.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import * as subscriptionService from './subscription.services';
import { createSubscriptionSchema, cancelSubscriptionSchema, renewSubscriptionSchema } from './subscription.validators';

const subscriptionResolvers = {
  Query: {
    mySubscriptions: (
      _: unknown,
      args: { page?: number; limit?: number },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return subscriptionService.getMySubscriptions(user.userId, args.page ?? 1, args.limit ?? 20);
    },

    subscriptionForPod: (
      _: unknown,
      args: { podId: string },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      return subscriptionService.getSubscriptionForPod(args.podId, user.userId);
    },

    subscriptions: (
      _: unknown,
      args: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        userId?: string;
        podId?: string;
        sortBy?: string;
        order?: string;
      },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return subscriptionService.getPaginatedSubscriptions({
        page: args.page ?? 1,
        limit: args.limit ?? 20,
        search: args.search,
        status: args.status,
        userId: args.userId,
        podId: args.podId,
        sortBy: args.sortBy,
        order: (args.order as 'ASC' | 'DESC') ?? 'DESC',
      });
    },
  },

  Mutation: {
    checkoutOccurrencePod: (
      _: unknown,
      args: { podId: string },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      createSubscriptionSchema.parse({ podId: args.podId });
      return subscriptionService.checkoutOccurrencePod(args.podId, user.userId);
    },

    cancelSubscription: (
      _: unknown,
      args: { subscriptionId: string },
      context: GraphQLContext,
    ) => {
      const user = requireAuth(context);
      cancelSubscriptionSchema.parse({ subscriptionId: args.subscriptionId });
      return subscriptionService.cancelSubscription(args.subscriptionId, user.userId);
    },

    renewSubscription: (
      _: unknown,
      args: { subscriptionId: string },
      context: GraphQLContext,
    ) => {
      requireAuth(context);
      renewSubscriptionSchema.parse({ subscriptionId: args.subscriptionId });
      return subscriptionService.renewSubscription(args.subscriptionId);
    },
  },

  PodSubscription: {
    user: (sub: { userId: string }) => subscriptionService.resolveSubscriptionUser(sub.userId),
    pod: (sub: { podId: string }) => subscriptionService.resolveSubscriptionPod(sub.podId),
  },
};

export default subscriptionResolvers;
