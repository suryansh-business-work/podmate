import type { GraphQLContext } from '../auth/auth.models';
import * as momentService from './moment.services';
import { validateCreateMoment, validateAddMomentComment } from './moment.validators';
import { findUserById } from '../user/user.services';

const momentResolvers = {
  Query: {
    moments: async (
      _: unknown,
      args: { page?: number; limit?: number },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      return momentService.getMomentsFeed(args.page ?? 1, args.limit ?? 20);
    },
    userMoments: async (
      _: unknown,
      args: { userId: string; page?: number; limit?: number },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      return momentService.getUserMoments(args.userId, args.page ?? 1, args.limit ?? 20);
    },
    momentComments: async (
      _: unknown,
      args: { momentId: string; page?: number; limit?: number },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      return momentService.getComments(args.momentId, args.page ?? 1, args.limit ?? 50);
    },
  },
  Mutation: {
    createMoment: async (
      _: unknown,
      { input }: { input: { caption: string; mediaUrls: string[] } },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      const validated = validateCreateMoment(input);
      return momentService.createMoment(validated, ctx.user.userId);
    },
    deleteMoment: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      return momentService.deleteMoment(id, ctx.user.userId);
    },
    likeMoment: async (
      _: unknown,
      { momentId }: { momentId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      return momentService.likeMoment(momentId, ctx.user.userId);
    },
    unlikeMoment: async (
      _: unknown,
      { momentId }: { momentId: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      return momentService.unlikeMoment(momentId, ctx.user.userId);
    },
    addMomentComment: async (
      _: unknown,
      { momentId, content }: { momentId: string; content: string },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.user) throw new Error('Authentication required');
      validateAddMomentComment({ momentId, content });
      return momentService.addComment(momentId, ctx.user.userId, content);
    },
  },
  Moment: {
    user: async (parent: { userId: string }) => {
      const u = await findUserById(parent.userId);
      if (!u) throw new Error('User not found');
      return u;
    },
    isLiked: async (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
      if (!ctx.user) return false;
      return momentService.isLikedByUser(parent.id, ctx.user.userId);
    },
  },
  MomentComment: {
    user: async (parent: { userId: string }) => {
      const u = await findUserById(parent.userId);
      if (!u) throw new Error('User not found');
      return u;
    },
  },
};

export default momentResolvers;
