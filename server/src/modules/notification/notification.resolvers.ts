import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth } from '../auth/auth.services';
import * as notificationService from './notification.services';

const notificationResolvers = {
  Query: {
    notifications: (
      _: unknown,
      args: { page?: number; limit?: number },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return notificationService.getPaginatedNotifications(
        auth.userId,
        args.page ?? 1,
        args.limit ?? 20,
      );
    },

    unreadNotificationCount: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return notificationService.getUnreadCount(auth.userId);
    },
  },

  Mutation: {
    markNotificationRead: (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireAuth(context);
      return notificationService.markAsRead(args.id);
    },

    markAllNotificationsRead: (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return notificationService.markAllAsRead(auth.userId);
    },
  },
};

export default notificationResolvers;
