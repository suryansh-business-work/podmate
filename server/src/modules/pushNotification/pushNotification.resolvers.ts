import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth } from '../auth/auth.services';
import { validatePushTokenInput } from './pushNotification.validators';
import * as pushService from './pushNotification.services';
import type { PushPlatform } from './pushNotification.models';

interface RegisterPushTokenInput {
  token: string;
  platform: PushPlatform;
  deviceId: string;
}

const pushNotificationResolvers = {
  Mutation: {
    registerPushToken: (
      _: unknown,
      args: { input: RegisterPushTokenInput },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      validatePushTokenInput(args.input);
      return pushService.registerPushToken(
        auth.userId,
        args.input.token,
        args.input.platform,
        args.input.deviceId,
      );
    },

    unregisterPushToken: (
      _: unknown,
      args: { deviceId: string },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      if (!args.deviceId) throw new Error('Device ID is required');
      return pushService.unregisterPushToken(auth.userId, args.deviceId);
    },
  },
};

export default pushNotificationResolvers;
