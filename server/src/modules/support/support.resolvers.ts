import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
import { findUserById } from '../user/user.services';
import * as supportService from './support.services';
import { validateSupportTicketInput } from './support.validators';
import type { CreateSupportTicketInput, UpdateSupportTicketInput, TicketReply } from './support.models';

const supportResolvers = {
  Query: {
    mySupportTickets: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return supportService.getMyTickets(auth.userId);
    },

    supportTicket: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireAuth(context);
      return supportService.getTicketById(args.id);
    },

    supportTickets: (
      _: unknown,
      args: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        priority?: string;
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
        priority: args.priority,
        sortBy: args.sortBy,
        order: (args.order as 'ASC' | 'DESC') ?? 'DESC',
      });
    },
    supportTicketCounts: (
      _: unknown,
      __: unknown,
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return supportService.getTicketCounts();
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

    adminCreateSupportTicket: (
      _: unknown,
      args: { userId: string; input: CreateSupportTicketInput },
      context: GraphQLContext,
    ) => {
      const auth = requireRole(context, UserRole.ADMIN);
      validateSupportTicketInput(args.input.subject, args.input.message);
      return supportService.adminCreateSupportTicket(auth.userId, args.userId, args.input);
    },

    replySupportTicket: (
      _: unknown,
      args: { id: string; content: string },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      const content = args.content.trim();
      if (!content || content.length < 1) {
        throw new Error('Reply content cannot be empty');
      }
      if (content.length > 5000) {
        throw new Error('Reply content must not exceed 5000 characters');
      }
      const senderRole = auth.role === UserRole.ADMIN ? 'ADMIN' : 'USER';
      return supportService.replySupportTicket(args.id, auth.userId, senderRole, content);
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

  TicketReply: {
    sender: (reply: TicketReply) => findUserById(reply.senderId),
  },
};

export default supportResolvers;
