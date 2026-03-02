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

    maintenanceStatus: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return {
        app: settingsService.isAppMaintenanceMode(),
        website: settingsService.isWebsiteMaintenanceMode(),
      };
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

    upsertBulkSettings: (
      _: unknown,
      args: { inputs: Array<{ key: string; value: string; category: string }> },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return settingsService.upsertBulkSettings(args.inputs);
    },

    deleteSetting: (
      _: unknown,
      args: { key: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return settingsService.deleteSetting(args.key);
    },

    testSmtpConnection: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return settingsService.testSmtpConnection();
    },

    testOpenAiConnection: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return settingsService.testOpenAiConnection();
    },

    testImageKitConnection: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return settingsService.testImageKitConnection();
    },
  },
};

export default settingsResolvers;
