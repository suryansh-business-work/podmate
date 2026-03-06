import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth } from '../auth/auth.services';
import * as followService from './follow.services';

const followResolvers = {
  Query: {
    followers: (_: unknown, args: { userId: string; page?: number; limit?: number }) => {
      return followService.getFollowers(args.userId, args.page ?? 1, args.limit ?? 20);
    },

    following: (_: unknown, args: { userId: string; page?: number; limit?: number }) => {
      return followService.getFollowing(args.userId, args.page ?? 1, args.limit ?? 20);
    },

    followStats: (_: unknown, args: { userId: string }, context: GraphQLContext) => {
      const viewerId = context.user?.userId;
      return followService.getFollowStats(args.userId, viewerId);
    },
  },

  Mutation: {
    followUser: (_: unknown, args: { userId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return followService.followUser(auth.userId, args.userId);
    },

    unfollowUser: (_: unknown, args: { userId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return followService.unfollowUser(auth.userId, args.userId);
    },
  },

  Follow: {
    follower: async (parent: { followerId: string }) => {
      const { UserModel, toUser } = await import('../user/user.models');
      const doc = await UserModel.findById(parent.followerId).lean({ virtuals: true });
      return toUser(doc as never);
    },
    following: async (parent: { followingId: string }) => {
      const { UserModel, toUser } = await import('../user/user.models');
      const doc = await UserModel.findById(parent.followingId).lean({ virtuals: true });
      return toUser(doc as never);
    },
  },
};

export default followResolvers;
