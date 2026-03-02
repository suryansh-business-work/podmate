import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth } from '../auth/auth.services';
import * as inviteService from './invite.services';
import { validateInviteContacts } from './invite.validators';

interface InviteInput {
  phone: string;
  name: string;
}

const inviteResolvers = {
  Query: {
    podInvites: (_: unknown, args: { podId: string }, context: GraphQLContext) => {
      requireAuth(context);
      return inviteService.getInvitesForPod(args.podId);
    },
  },

  Mutation: {
    sendInvites: (
      _: unknown,
      args: { podId: string; contacts: InviteInput[] },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      const validated = validateInviteContacts(args.contacts);
      const { invites, smsMessages } = inviteService.createInvites(
        args.podId,
        auth.userId,
        validated,
      );

      return {
        success: true,
        totalInvited: invites.length,
        invites,
        smsMessages,
      };
    },
  },
};

export default inviteResolvers;
