import type { GraphQLContext } from '../auth/auth.models';
import { UserRole } from './user.models';
import type { AdminUpdateUserInput } from './user.services';
import { requireAuth, requireRole } from '../auth/auth.services';
import * as userService from './user.services';
import { sendSMS } from '../../lib/email';

const userResolvers = {
  Query: {
    me: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return userService.findUserById(auth.userId) ?? null;
    },

    user: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return userService.findUserById(args.id);
    },

    userProfile: (_: unknown, args: { userId: string }, context: GraphQLContext) => {
      requireAuth(context);
      return userService.findUserById(args.userId);
    },

    users: (
      _: unknown,
      args: { page?: number; limit?: number; search?: string; sortBy?: string; order?: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return userService.getPaginatedUsers({
        page: args.page ?? 1,
        limit: args.limit ?? 20,
        search: args.search,
        sortBy: args.sortBy,
        order: (args.order as 'ASC' | 'DESC') ?? 'DESC',
      });
    },
  },

  Mutation: {
    updateProfile: async (
      _: unknown,
      args: { name?: string; avatar?: string; email?: string },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      const updated = await userService.updateUser(auth.userId, args);
      userService.notifyProfileUpdate(updated);
      return updated;
    },

    sendEmailOtp: async (_: unknown, args: { email: string }, context: GraphQLContext) => {
      requireAuth(context);
      return userService.sendEmailOtp(args.email);
    },

    verifyEmailOtp: async (
      _: unknown,
      args: { email: string; otp: string },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return userService.verifyEmailOtp(auth.userId, args.email, args.otp);
    },

    updateUserRoles: (
      _: unknown,
      args: { userId: string; roles: UserRole[] },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return userService.updateUserRoles(args.userId, args.roles);
    },

    adminCreateUser: async (
      _: unknown,
      args: { phone: string; name: string; roles: UserRole[] },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      const existing = await userService.findUserByPhone(args.phone);
      if (existing) throw new Error('User with this phone already exists');
      return userService.createUser({ phone: args.phone, name: args.name, roles: args.roles });
    },

    deleteUser: async (_: unknown, args: { userId: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return userService.deleteUser(args.userId);
    },

    bulkDeleteUsers: async (_: unknown, args: { ids: string[] }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return userService.bulkDeleteUsers(args.ids);
    },

    toggleUserActive: async (
      _: unknown,
      args: { userId: string; isActive: boolean; reason?: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      const user = await userService.toggleUserActive(
        args.userId,
        args.isActive,
        args.reason ?? '',
      );
      const smsMessage = args.isActive
        ? 'Your PartyWings account has been re-enabled. You can now access the app.'
        : `Your PartyWings account has been disabled. Reason: ${args.reason || 'Policy violation'}. Contact support for help.`;
      await sendSMS(user.phone, smsMessage);
      return user;
    },

    savePod: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return userService.savePod(auth.userId, args.podId);
    },

    unsavePod: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return userService.unsavePod(auth.userId, args.podId);
    },

    updateThemePreference: (
      _: unknown,
      args: { themePreference: string },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return userService.updateThemePreference(auth.userId, args.themePreference);
    },

    switchActiveRole: (_: unknown, args: { role: UserRole }, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return userService.switchActiveRole(auth.userId, args.role);
    },

    adminUpdateUser: (
      _: unknown,
      args: { userId: string; input: AdminUpdateUserInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return userService.adminUpdateUser(args.userId, args.input);
    },
  },

  User: {
    podCount: async (parent: { id: string }) => {
      const { PodModel } = await import('../pod/pod.models');
      return PodModel.countDocuments({
        $or: [{ hostId: parent.id }, { attendees: parent.id }],
      });
    },
  },
};

export default userResolvers;
