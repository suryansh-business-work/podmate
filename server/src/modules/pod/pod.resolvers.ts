import type { GraphQLContext } from '../auth/auth.models';
import type { CreatePodInput, UpdatePodInput } from './pod.models';
import type { AdminUpdatePodInput } from './pod.services';
import { UserRole } from '../user/user.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import * as podService from './pod.services';
import { getPlaceById } from '../place/place.services';

const podResolvers = {
  Query: {
    pods: (
      _: unknown,
      args: {
        category?: string;
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        order?: string;
      },
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
      const auth = requireAuth(context);
      return podService.getJoinedPods(auth.userId);
    },

    userPods: (_: unknown, args: { userId: string }, context: GraphQLContext) => {
      requireAuth(context);
      return podService.getMyPods(args.userId);
    },

    userHostedPods: (_: unknown, args: { userId: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return podService.getMyPods(args.userId);
    },

    userJoinedPods: (_: unknown, args: { userId: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return podService.getJoinedPods(args.userId);
    },
  },

  Mutation: {
    createPod: (_: unknown, args: { input: CreatePodInput }, context: GraphQLContext) => {
      const auth = requireRole(context, UserRole.HOST, UserRole.VENUE_OWNER, UserRole.ADMIN);
      return podService.createPod(args.input, auth.userId);
    },

    updatePod: (
      _: unknown,
      args: { id: string; input: UpdatePodInput },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return podService.updatePod(args.id, auth.userId, args.input);
    },

    deletePod: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      if (auth.roles.includes(UserRole.ADMIN)) {
        return podService.deletePod(args.id);
      }
      return podService.hostDeletePod(args.id, auth.userId);
    },

    joinPod: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podService.joinPod(args.podId, auth.userId);
    },

    checkoutPod: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podService.checkoutPod(args.podId, auth.userId);
    },

    leavePod: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podService.leavePod(args.podId, auth.userId);
    },

    closePod: (_: unknown, args: { id: string; reason: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return podService.closePod(args.id, args.reason);
    },

    openPod: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return podService.openPod(args.id);
    },

    reopenPod: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podService.reopenPod(args.id, auth.userId);
    },

    trackPodView: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return podService.trackPodView(args.podId, auth.userId);
    },

    removeAttendee: (
      _: unknown,
      args: { podId: string; userId: string; issueRefund: boolean },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return podService.removeAttendee(args.podId, args.userId, args.issueRefund);
    },

    forceDeletePod: (
      _: unknown,
      args: { id: string; issueRefunds: boolean },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return podService.forceDeletePod(args.id, args.issueRefunds);
    },

    bulkDeletePods: (
      _: unknown,
      args: { ids: string[]; issueRefunds: boolean },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return podService.bulkDeletePods(args.ids, args.issueRefunds);
    },

    adminUpdatePod: (
      _: unknown,
      args: { id: string; input: AdminUpdatePodInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return podService.adminUpdatePod(args.id, args.input);
    },
  },

  Pod: {
    host: async (pod: { hostId: string }) => {
      const user = await podService.resolveHost(pod.hostId);
      if (!user) throw new Error('Host user not found');
      return user;
    },
    attendees: (pod: { attendeeIds: string[] }) =>
      podService.resolveAttendees(pod.attendeeIds ?? []),
    place: (pod: { placeId: string }) => (pod.placeId ? getPlaceById(pod.placeId) : null),
  },
};

export default podResolvers;
