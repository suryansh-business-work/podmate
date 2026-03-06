import type { GraphQLContext } from '../auth/auth.models';
import { UserRole } from '../user/user.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import type { CreatePaymentInput, ProcessRefundInput } from './payment.models';
import * as paymentService from './payment.services';

const paymentResolvers = {
  Query: {
    payments: (
      _: unknown,
      args: {
        page?: number;
        limit?: number;
        search?: string;
        type?: string;
        status?: string;
        userId?: string;
        podId?: string;
        sortBy?: string;
        order?: string;
      },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return paymentService.getPaginatedPayments({
        page: args.page ?? 1,
        limit: args.limit ?? 20,
        search: args.search,
        type: args.type,
        status: args.status,
        userId: args.userId,
        podId: args.podId,
        sortBy: args.sortBy,
        order: (args.order as 'ASC' | 'DESC') ?? 'DESC',
      });
    },

    payment: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return paymentService.getPaymentById(args.id);
    },

    paymentStats: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return paymentService.getPaymentStats();
    },

    myPayments: (_: unknown, args: { page?: number; limit?: number }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return paymentService.getMyPayments(user.userId, args.page ?? 1, args.limit ?? 20);
    },
  },

  Mutation: {
    createPayment: (_: unknown, args: { input: CreatePaymentInput }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return paymentService.createPayment(args.input);
    },

    processRefund: (_: unknown, args: { input: ProcessRefundInput }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return paymentService.processRefund(args.input);
    },

    completePayment: (
      _: unknown,
      args: { id: string; transactionId?: string },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);
      return paymentService.completePayment(args.id, args.transactionId);
    },
  },

  Payment: {
    user: (payment: { userId: string }) => paymentService.resolvePaymentUser(payment.userId),
  },
};

export default paymentResolvers;
