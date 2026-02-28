import type { GraphQLContext } from '../auth/auth.models';
import type { CreatePodInput, UpdatePodInput } from './pod.models';
import { UserRole } from '../user/user.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import * as podService from './pod.services';

const podResolvers = {
  Query: {
    pods: (
      _: unknown,
      args: { category?: string; page?: number; limit?: number; search?: string; sortBy?: string; order?: string },
    ) => {
      return podService.getPaginatedPods({
        page: args.page ?? 1,
        limit: args.limit ?? 20,
        category: args.category,
        search: args.search,
        sortBy: args.sortBy,
        order: (args.order as 'ASC' | 'DESC') ?? 'DESC',
      });
    },

    pod: (_: unknown, args: { id: string }) => {
      return podService.getPodById(args.id) ?? null;
    },

    myPods: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireRole(context, UserRole.PLACE_OWNER, UserRole.ADMIN);
      return podService.getMyPods(auth.userId);
    },
  },

  Mutation: {
    createPod: (_: unknown, args: { input: CreatePodInput }, context: GraphQLContext) => {
      const auth = requireRole(context, UserRole.PLACE_OWNER, UserRole.ADMIN);
      return podService.createPod(args.input, auth.userId);
    },

    updatePod: (_: unknown, args: { id: string; input: UpdatePodInput }, context: GraphQLContext) => {
      const auth = requireRole(context, UserRole.PLACE_OWNER, UserRole.ADMIN);
      return podService.updatePod(args.id, auth.userId, args.input);
    },

    deletePod: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return podService.deletePod(args.id);
    },

    joinPod: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podService.joinPod(args.podId, auth.userId);
    },

    leavePod: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podService.leavePod(args.podId, auth.userId);
    },
  },

  Pod: {
    host: (pod: { hostId: string }) => podService.resolveHost(pod.hostId),
    attendees: (pod: { attendeeIds: string[] }) => podService.resolveAttendees(pod.attendeeIds),
  },
};

export default podResolvers;
