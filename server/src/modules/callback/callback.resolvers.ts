import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
import { findUserById } from '../user/user.services';
import * as callbackService from './callback.services';
import { validateCallbackInput } from './callback.validators';
import type { CreateCallbackRequestInput, UpdateCallbackRequestInput } from './callback.models';

const callbackResolvers = {
  Query: {
    myCallbackRequests: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return callbackService.getMyCallbackRequests(auth.userId);
    },

    callbackRequest: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireAuth(context);
      return callbackService.getCallbackRequestById(args.id);
    },

    callbackRequests: (
      _: unknown,
      args: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sortBy?: string;
        order?: string;
      },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return callbackService.getPaginatedCallbackRequests({
        page: args.page ?? 1,
        limit: args.limit ?? 20,
        search: args.search,
        status: args.status,
        sortBy: args.sortBy,
        order: (args.order as 'ASC' | 'DESC') ?? 'DESC',
      });
    },

    callbackRequestCounts: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return callbackService.getCallbackCounts();
    },
  },

  Mutation: {
    requestCallback: async (
      _: unknown,
      args: { input: CreateCallbackRequestInput },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      validateCallbackInput(args.input.reason);
      const user = await findUserById(auth.userId);
      if (!user) throw new Error('User not found');
      return callbackService.createCallbackRequest(auth.userId, user.phone, args.input);
    },

    updateCallbackRequest: (
      _: unknown,
      args: { id: string; input: UpdateCallbackRequestInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return callbackService.updateCallbackRequest(args.id, args.input);
    },

    deleteCallbackRequest: (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return callbackService.deleteCallbackRequest(args.id);
    },
  },

  CallbackRequest: {
    user: (req: { userId: string }) => findUserById(req.userId),
  },
};

export default callbackResolvers;
