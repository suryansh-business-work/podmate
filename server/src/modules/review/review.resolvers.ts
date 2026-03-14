import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
import * as reviewService from './review.services';
import type {
  CreateReviewInput,
  ReplyReviewInput,
  ReportReviewInput,
  ReviewTargetType,
} from './review.models';

const reviewResolvers = {
  Query: {
    reviews: (
      _: unknown,
      args: { targetType: ReviewTargetType; targetId: string; page?: number; limit?: number },
    ) => {
      return reviewService.getReviewsForTarget(
        args.targetType,
        args.targetId,
        args.page ?? 1,
        args.limit ?? 20,
      );
    },

    reviewStats: (_: unknown, args: { targetType: ReviewTargetType; targetId: string }) => {
      return reviewService.getReviewStats(args.targetType, args.targetId);
    },
  },

  Mutation: {
    createReview: (_: unknown, args: { input: CreateReviewInput }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return reviewService.createReview(auth.userId, args.input);
    },

    replyToReview: (_: unknown, args: { input: ReplyReviewInput }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return reviewService.replyToReview(auth.userId, args.input.reviewId, args.input.comment);
    },

    reportReview: (_: unknown, args: { input: ReportReviewInput }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return reviewService.reportReview(auth.userId, args.input.reviewId, args.input.reason);
    },

    deleteReview: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return reviewService.deleteReview(args.id);
    },
  },

  Review: {
    user: async (parent: { userId: string }) => {
      const { UserModel, toUser } = await import('../user/user.models');
      const doc = await UserModel.findById(parent.userId).lean({ virtuals: true });
      const user = toUser(doc as never);
      if (!user) throw new Error('User not found');
      return user;
    },
    replies: (parent: { id: string }) => {
      return reviewService.getReplies(parent.id);
    },
  },
};

export default reviewResolvers;
