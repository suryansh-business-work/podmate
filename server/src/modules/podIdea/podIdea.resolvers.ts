import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
import * as podIdeaService from './podIdea.services';
import type { CreatePodIdeaInput, PodIdeaStatus } from './podIdea.models';

const podIdeaResolvers = {
  Query: {
    podIdeas: (_: unknown, args: { page?: number; limit?: number; category?: string }) => {
      return podIdeaService.getPodIdeas(args.page ?? 1, args.limit ?? 20, args.category);
    },

    myPodIdeas: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podIdeaService.getMyPodIdeas(auth.userId);
    },
  },

  Mutation: {
    submitPodIdea: (_: unknown, args: { input: CreatePodIdeaInput }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podIdeaService.createPodIdea(auth.userId, args.input);
    },

    upvotePodIdea: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podIdeaService.upvotePodIdea(auth.userId, args.id);
    },

    removeUpvote: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podIdeaService.removeUpvote(auth.userId, args.id);
    },

    updatePodIdea: (
      _: unknown,
      args: { id: string; input: { status?: PodIdeaStatus; adminNotes?: string } },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return podIdeaService.updatePodIdea(args.id, args.input.status, args.input.adminNotes);
    },

    deletePodIdea: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return podIdeaService.deletePodIdea(args.id);
    },
  },

  PodIdea: {
    user: async (parent: { userId: string }) => {
      const { UserModel, toUser } = await import('../user/user.models');
      const doc = await UserModel.findById(parent.userId).lean({ virtuals: true });
      const user = toUser(doc as never);
      if (!user) throw new Error('User not found');
      return user;
    },
    hasUpvoted: (parent: { upvoterIds: string[] }, _: unknown, context: GraphQLContext) => {
      const userId = context.user?.userId;
      if (!userId) return false;
      return parent.upvoterIds.includes(userId);
    },
  },
};

export default podIdeaResolvers;
