import type { GraphQLContext } from '../auth/auth.models';
import { requireAuth, requireRole } from '../auth/auth.services';
import { UserRole } from '../user/user.models';
import { findUserById, updateUserEmail } from '../user/user.services';
import * as meetingService from './meeting.services';
import { validateMeetingInput } from './meeting.validators';
import type { CreateMeetingInput, UpdateMeetingInput } from './meeting.models';

const meetingResolvers = {
  Query: {
    myMeetings: (_: unknown, __: unknown, context: GraphQLContext) => {
      const auth = requireAuth(context);
      return meetingService.getMyMeetings(auth.userId);
    },

    meeting: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireAuth(context);
      return meetingService.getMeetingById(args.id);
    },

    meetings: (
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
      return meetingService.getPaginatedMeetings({
        page: args.page ?? 1,
        limit: args.limit ?? 20,
        search: args.search,
        status: args.status,
        sortBy: args.sortBy,
        order: (args.order as 'ASC' | 'DESC') ?? 'DESC',
      });
    },

    meetingCounts: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return meetingService.getMeetingCounts();
    },

    bookedSlots: (_: unknown, args: { meetingDate: string }, context: GraphQLContext) => {
      requireAuth(context);
      return meetingService.getBookedSlots(args.meetingDate);
    },

    availableMeetingSlots: (_: unknown, __: unknown, context: GraphQLContext) => {
      requireAuth(context);
      return meetingService.getAvailableSlots();
    },
  },

  Mutation: {
    requestMeeting: async (
      _: unknown,
      args: { input: CreateMeetingInput },
      context: GraphQLContext,
    ) => {
      const auth = requireAuth(context);
      validateMeetingInput(args.input.email, args.input.meetingDate, args.input.meetingTime, args.input.purpose);

      const user = await findUserById(auth.userId);
      if (!user) throw new Error('User not found');

      // Optionally update profie email
      if (args.input.updateProfileEmail) {
        await updateUserEmail(auth.userId, args.input.email.trim());
      }

      return meetingService.createMeeting(auth.userId, user.name, args.input);
    },

    updateMeeting: async (
      _: unknown,
      args: { id: string; input: UpdateMeetingInput },
      context: GraphQLContext,
    ) => {
      requireRole(context, UserRole.ADMIN);

      const meeting = await meetingService.getMeetingById(args.id);
      if (!meeting) throw new Error('Meeting not found');

      const user = await findUserById(meeting.userId);

      return meetingService.updateMeeting(args.id, args.input, user?.name, meeting.userEmail);
    },

    deleteMeeting: (_: unknown, args: { id: string }, context: GraphQLContext) => {
      requireRole(context, UserRole.ADMIN);
      return meetingService.deleteMeeting(args.id);
    },
  },

  Meeting: {
    user: (meeting: { userId: string }) => findUserById(meeting.userId),
  },
};

export default meetingResolvers;
