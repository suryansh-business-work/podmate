import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
import { findUserById } from '../user/user.services';
import * as supportService from './support.services';
import { validateSupportTicketInput } from './support.validators';
import type { CreateSupportTicketInput, UpdateSupportTicketInput } from './support.models';

const supportResolvers = {
  Query: {
    mySupportTickets: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return supportService.getMyTickets(auth.userId);
    },

    supportTickets: (
      _: unknown,
      args: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        sortBy?: string;
        order?: string;
      },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return supportService.getPaginatedTickets({
        page: args.page ?? 1,
        limit: args.limit ?? 20,
        search: args.search,
        status: args.status,
        sortBy: args.sortBy,
        order: (args.order as 'ASC' | 'DESC') ?? 'DESC',
      });
    },
  },

  Mutation: {
    createSupportTicket: (
      _: unknown,
      args: { input: CreateSupportTicketInput },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      validateSupportTicketInput(args.input.subject, args.input.message);
      return supportService.createSupportTicket(auth.userId, args.input);
    },

    updateSupportTicket: (
      _: unknown,
      args: { id: string; input: UpdateSupportTicketInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return supportService.updateSupportTicket(args.id, args.input);
    },

    deleteSupportTicket: (
      _: unknown,
      args: { id: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return supportService.deleteSupportTicket(args.id);
    },
  },

  SupportTicket: {
    user: (ticket: { userId: string }) => findUserById(ticket.userId),
  },
};

export default supportResolvers;
