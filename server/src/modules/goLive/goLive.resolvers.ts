import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth } from '../auth/auth.services';
import * as goLiveService from './goLive.services';
import type { StartLiveInput } from './goLive.models';

const goLiveResolvers = {
  Query: {
    activeLiveSessions: (
      _: unknown,
      args: { page?: number; limit?: number },
    ) => {
      return goLiveService.getActiveSessions(args.page ?? 1, args.limit ?? 20);
    },

    liveSessionForPod: (
      _: unknown,
      args: { podId: string },
    ) => {
      return goLiveService.getLiveSessionForPod(args.podId);
    },
  },

  Mutation: {
    startLiveSession: (
      _: unknown,
      args: { input: StartLiveInput },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return goLiveService.startLiveSession(auth.userId, args.input);
    },

    endLiveSession: (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return goLiveService.endLiveSession(args.id, auth.userId);
    },

    joinLiveSession: (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return goLiveService.joinLiveSession(args.id, auth.userId);
    },

    leaveLiveSession: (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return goLiveService.leaveLiveSession(args.id, auth.userId);
    },
  },

  LiveSession: {
    host: async (parent: { hostId: string }) => {
      const { UserModel, toUser } = await import('../user/user.models');
      const doc = await UserModel.findById(parent.hostId).lean({ virtuals: true });
      return toUser(doc as never);
    },
    pod: async (parent: { podId: string }) => {
      const { PodModel } = await import('../pod/pod.models');
      const doc = await PodModel.findById(parent.podId).lean({ virtuals: true });
      if (!doc) return null;
      const raw = doc as unknown as Record<string, unknown>;
      return { ...(raw as Record<string, unknown>), id: (raw.id as string) ?? (raw._id as string) };
    },
    isViewing: (parent: { viewerIds: string[] }, _: unknown, context: GraphQLContext) => {
      const userId = context.user?.userId;
      if (!userId) return false;
      return parent.viewerIds.includes(userId);
    },
  },
};

export default goLiveResolvers;
