import type { GraphQLContext } from '../auth/auth.models';
import { UserRole } from '../user/user.models';
import { requireRole } from '../auth/auth.services';
import * as settingsService from './settings.services';

const settingsResolvers = {
  Query: {
    appSettings: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return settingsService.getAllSettings();
    },

    appSettingsByCategory: (
      _: unknown,
      args: { category: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return settingsService.getSettingsByCategory(args.category);
    },

    maintenanceMode: () => {
      return settingsService.isMaintenanceMode();
    },
  },

  Mutation: {
    upsertSetting: (
      _: unknown,
      args: { input: { key: string; value: string; category: string } },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return settingsService.upsertSetting(args.input.key, args.input.value, args.input.category);
    },

    deleteSetting: (
      _: unknown,
      args: { key: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return settingsService.deleteSetting(args.key);
    },
  },
};

export default settingsResolvers;
