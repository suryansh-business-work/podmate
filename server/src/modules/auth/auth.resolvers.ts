import type { GraphQLContext } from './auth.models';
import * as authService from './auth.services';
import { getImageKitAuthParams } from '../../lib/imagekit';

const authResolvers = {
  Mutation: {
    sendOtp: (_: unknown, args: { phone: string }) => {
      return authService.sendOtp(args.phone);
    },

    verifyOtp: (_: unknown, args: { phone: string; otp: string }) => {
      return authService.verifyOtp(args.phone, args.otp);
    },

    getImageKitAuth: (_: unknown, __: unknown, context: GraphQLContext) => {
      authService.requireAuth(context);
      return getImageKitAuthParams();
    },
  },
};

export default authResolvers;
