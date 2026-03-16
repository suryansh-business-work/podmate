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

    googleSignIn: (_: unknown, args: { idToken: string }) => {
      return authService.googleSignIn(args.idToken);
    },

    adminLogin: (_: unknown, args: { email: string; password: string }) => {
      return authService.adminLogin(args.email, args.password);
    },

    sendAdminCredentials: (_: unknown, args: { email: string }) => {
      return authService.sendAdminCredentialsEmail(args.email);
    },

    completeProfile: (
      _: unknown,
      args: { username: string; name: string; dob: string },
      context: GraphQLContext,
    ) => {
      const auth = authService.requireAuth(context);
      return authService.completeProfile(auth.userId, args.username, args.name, args.dob);
    },

    getImageKitAuth: (_: unknown, __: unknown, context: GraphQLContext) => {
      authService.requireAuth(context);
      return getImageKitAuthParams();
    },
  },
};

export default authResolvers;
