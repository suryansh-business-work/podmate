import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
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

    adminNotifications: (
      _: unknown,
      args: { page?: number; limit?: number },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return notificationService.getAdminNotifications(args.page ?? 1, args.limit ?? 20);
    },
  },

  Mutation: {
    markNotificationRead: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireAuth(context);
      return notificationService.markAsRead(args.id);
    },

    markAllNotificationsRead: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return notificationService.markAllAsRead(auth.userId);
    },

    sendBroadcastNotification: (
      _: unknown,
      args: { input: { title: string; message: string } },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return notificationService.broadcastNotification(args.input.title, args.input.message);
    },
  },
};

export default notificationResolvers;
