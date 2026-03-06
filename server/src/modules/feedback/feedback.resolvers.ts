import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
import * as feedbackService from './feedback.services';
import type { CreateFeedbackInput, FeedbackStatus } from './feedback.models';

const feedbackResolvers = {
  Query: {
    myFeedback: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return feedbackService.getMyFeedback(auth.userId);
    },

    allFeedback: (
      _: unknown,
      args: { page?: number; limit?: number; search?: string; status?: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return feedbackService.getAllFeedback(
        args.page ?? 1,
        args.limit ?? 20,
        args.search,
        args.status,
      );
    },
  },

  Mutation: {
    submitFeedback: (_: unknown, args: { input: CreateFeedbackInput }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return feedbackService.createFeedback(auth.userId, args.input);
    },

    updateFeedbackStatus: (
      _: unknown,
      args: { id: string; input: { status?: FeedbackStatus; adminNotes?: string } },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return feedbackService.updateFeedback(args.id, args.input.status, args.input.adminNotes);
    },

    deleteFeedback: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return feedbackService.deleteFeedback(args.id);
    },
  },

  Feedback: {
    user: async (parent: { userId: string }) => {
      const { UserModel, toUser } = await import('../user/user.models');
      const doc = await UserModel.findById(parent.userId).lean({ virtuals: true });
      return toUser(doc as never);
    },
  },
};

export default feedbackResolvers;
