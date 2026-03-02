import type { GraphQLContext } from '../auth/auth.models';
import { UserRole } from './user.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import * as userService from './user.services';

const userResolvers = {
  Query: {
    me: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return userService.findUserById(auth.userId) ?? null;
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
    updateProfile: (
      _: unknown,
      args: { name?: string; avatar?: string },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      return userService.updateUser(auth.userId, args);
    },

    updateUserRole: (
      _: unknown,
      args: { userId: string; role: UserRole },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return userService.updateUserRole(args.userId, args.role);
    },

    adminCreateUser: async (
      _: unknown,
      args: { phone: string; name: string; role: UserRole },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      const existing = await userService.findUserByPhone(args.phone);
      if (existing) throw new Error('User with this phone already exists');
      return userService.createUser({ phone: args.phone, name: args.name, role: args.role });
    },
  },
};

export default userResolvers;
