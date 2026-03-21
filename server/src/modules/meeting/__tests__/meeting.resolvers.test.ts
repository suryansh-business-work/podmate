import meetingResolvers from '../meeting.resolvers';
import * as meetingService from '../meeting.services';
import { validateMeetingInput, validateRescheduleInput } from '../meeting.validators';
import { findUserById, updateUserEmail } from '../../user/user.services';
import { UserRole } from '../../user/user.models';
import type { User } from '../../user/user.models';
import type { Meeting, MeetingStatus, MeetingPurpose } from '../meeting.models';
import type { GraphQLContext } from '../../auth/auth.models';

jest.mock('../meeting.services');
jest.mock('../meeting.validators');
jest.mock('../../user/user.services');
jest.mock('../../auth/auth.services', () => ({
  requireAuth: (ctx: GraphQLContext) => {
    if (!ctx.user) throw new Error('Authentication required');
    return { userId: ctx.user.userId };
  },
  requireRole: (ctx: GraphQLContext, role: string) => {
    if (!ctx.user) throw new Error('Authentication required');
    if (!ctx.user.roles?.includes(role as UserRole)) throw new Error('Forbidden');
    return { userId: ctx.user.userId };
  },
}));

const mockMeetingService = meetingService as jest.Mocked<typeof meetingService>;
const mockFindUserById = findUserById as jest.MockedFunction<typeof findUserById>;
const mockUpdateUserEmail = updateUserEmail as jest.MockedFunction<typeof updateUserEmail>;
const mockValidateMeetingInput = validateMeetingInput as jest.MockedFunction<
  typeof validateMeetingInput
>;
const mockValidateRescheduleInput = validateRescheduleInput as jest.MockedFunction<
  typeof validateRescheduleInput
>;

const baseMeeting: Meeting = {
  id: 'meeting-1',
  userId: 'user-1',
  userEmail: 'user@example.com',
  meetingDate: '2027-06-15',
  meetingTime: '10:00',
  meetingLink: '',
  googleEventId: '',
  status: 'PENDING' as MeetingStatus,
  purpose: 'GENERAL' as MeetingPurpose,
  adminNote: '',
  cancelReason: '',
  rescheduledFrom: '',
  rescheduledBy: '',
  completedAt: '',
  createdAt: '2027-06-10',
  updatedAt: '2027-06-10',
};

const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'user@example.com',
  phone: '1234567890',
  password: '',
  username: 'testuser',
  age: 25,
  dob: '2000-01-01',
  avatar: '',
  roles: [UserRole.USER],
  activeRole: UserRole.USER,
  isVerifiedHost: false,
  isEmailVerified: true,
  isActive: true,
  disableReason: '',
  savedPodIds: [],
  themePreference: 'system',
  createdAt: '2027-06-01',
};

const authContext: GraphQLContext = {
  user: { userId: 'user-1', phone: '1234567890', roles: [UserRole.USER] },
};
const adminContext: GraphQLContext = {
  user: { userId: 'admin-1', phone: '0000000000', roles: [UserRole.ADMIN] },
};
const unauthContext: GraphQLContext = { user: null };

beforeEach(() => jest.clearAllMocks());

describe('Query resolvers', () => {
  describe('myMeetings', () => {
    it('returns meetings for authenticated user', async () => {
      mockMeetingService.getMyMeetings.mockResolvedValue([baseMeeting]);
      const result = await meetingResolvers.Query.myMeetings({}, {}, authContext);
      expect(mockMeetingService.getMyMeetings).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(1);
    });

    it('throws for unauthenticated user', () => {
      expect(() => meetingResolvers.Query.myMeetings({}, {}, unauthContext)).toThrow(
        'Authentication required',
      );
    });
  });

  describe('meeting', () => {
    it('returns a meeting by id', async () => {
      mockMeetingService.getMeetingById.mockResolvedValue(baseMeeting);
      const result = await meetingResolvers.Query.meeting({}, { id: 'meeting-1' }, authContext);
      expect(result).toEqual(baseMeeting);
    });

    it('throws for unauthenticated user', () => {
      expect(() =>
        meetingResolvers.Query.meeting({}, { id: 'meeting-1' }, unauthContext),
      ).toThrow('Authentication required');
    });
  });

  describe('meetings (admin)', () => {
    it('returns paginated meetings for admin', async () => {
      const paginated = {
        items: [baseMeeting],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      mockMeetingService.getPaginatedMeetings.mockResolvedValue(paginated);
      const result = await meetingResolvers.Query.meetings({}, {}, adminContext);
      expect(result).toEqual(paginated);
    });

    it('throws for non-admin', () => {
      expect(() => meetingResolvers.Query.meetings({}, {}, authContext)).toThrow('Forbidden');
    });

    it('passes pagination arguments', async () => {
      mockMeetingService.getPaginatedMeetings.mockResolvedValue({
        items: [],
        total: 0,
        page: 2,
        limit: 5,
        totalPages: 0,
      });
      await meetingResolvers.Query.meetings(
        {},
        { page: 2, limit: 5, search: 'test', status: 'PENDING', sortBy: 'meetingDate', order: 'ASC' },
        adminContext,
      );
      expect(mockMeetingService.getPaginatedMeetings).toHaveBeenCalledWith({
        page: 2,
        limit: 5,
        search: 'test',
        status: 'PENDING',
        sortBy: 'meetingDate',
        order: 'ASC',
      });
    });
  });

  describe('meetingCounts (admin)', () => {
    it('returns counts for admin', async () => {
      const counts = { pending: 3, confirmed: 2, completed: 1, cancelled: 0, total: 6 };
      mockMeetingService.getMeetingCounts.mockResolvedValue(counts);
      const result = await meetingResolvers.Query.meetingCounts({}, {}, adminContext);
      expect(result).toEqual(counts);
    });

    it('throws for non-admin', () => {
      expect(() => meetingResolvers.Query.meetingCounts({}, {}, authContext)).toThrow('Forbidden');
    });
  });

  describe('bookedSlots', () => {
    it('returns booked slots for authenticated user', async () => {
      mockMeetingService.getBookedSlots.mockResolvedValue([{ meetingTime: '10:00' }]);
      const result = await meetingResolvers.Query.bookedSlots(
        {},
        { meetingDate: '2027-06-15' },
        authContext,
      );
      expect(result).toEqual([{ meetingTime: '10:00' }]);
    });
  });

  describe('availableMeetingSlots', () => {
    it('returns available slots for authenticated user', () => {
      mockMeetingService.getAvailableSlots.mockReturnValue(['09:00', '09:30']);
      const result = meetingResolvers.Query.availableMeetingSlots({}, {}, authContext);
      expect(result).toEqual(['09:00', '09:30']);
    });
  });
});

describe('Mutation resolvers', () => {
  describe('requestMeeting', () => {
    beforeEach(() => {
      mockFindUserById.mockResolvedValue(mockUser);
      mockMeetingService.createMeeting.mockResolvedValue(baseMeeting);
    });

    it('creates a meeting for authenticated user', async () => {
      const input = {
        email: 'user@example.com',
        meetingDate: '2027-06-15',
        meetingTime: '10:00',
        updateProfileEmail: false,
        purpose: 'GENERAL' as const,
      };
      const result = await meetingResolvers.Mutation.requestMeeting({}, { input }, authContext);
      expect(mockValidateMeetingInput).toHaveBeenCalledWith(
        'user@example.com',
        '2027-06-15',
        '10:00',
        'GENERAL',
      );
      expect(result).toEqual(baseMeeting);
    });

    it('updates profile email when requested', async () => {
      const input = {
        email: 'new@example.com',
        meetingDate: '2027-06-15',
        meetingTime: '10:00',
        updateProfileEmail: true,
        purpose: 'GENERAL' as const,
      };
      await meetingResolvers.Mutation.requestMeeting({}, { input }, authContext);
      expect(mockUpdateUserEmail).toHaveBeenCalledWith('user-1', 'new@example.com');
    });

    it('throws when user not found', async () => {
      mockFindUserById.mockResolvedValue(null);
      const input = {
        email: 'user@example.com',
        meetingDate: '2027-06-15',
        meetingTime: '10:00',
        updateProfileEmail: false,
        purpose: 'GENERAL' as const,
      };
      await expect(
        meetingResolvers.Mutation.requestMeeting({}, { input }, authContext),
      ).rejects.toThrow('User not found');
    });

    it('throws for unauthenticated user', async () => {
      const input = {
        email: 'user@example.com',
        meetingDate: '2027-06-15',
        meetingTime: '10:00',
        updateProfileEmail: false,
        purpose: 'GENERAL' as const,
      };
      await expect(
        meetingResolvers.Mutation.requestMeeting({}, { input }, unauthContext),
      ).rejects.toThrow('Authentication required');
    });
  });

  describe('updateMeeting', () => {
    it('updates meeting for admin', async () => {
      mockMeetingService.getMeetingById.mockResolvedValue(baseMeeting);
      mockFindUserById.mockResolvedValue(mockUser);
      mockMeetingService.updateMeeting.mockResolvedValue({
        ...baseMeeting,
        status: 'CONFIRMED' as MeetingStatus,
      });

      const result = await meetingResolvers.Mutation.updateMeeting(
        {},
        { id: 'meeting-1', input: { status: 'CONFIRMED' } },
        adminContext,
      );
      expect(result.status).toBe('CONFIRMED');
    });

    it('throws for non-admin', async () => {
      await expect(
        meetingResolvers.Mutation.updateMeeting(
          {},
          { id: 'meeting-1', input: { status: 'CONFIRMED' } },
          authContext,
        ),
      ).rejects.toThrow('Forbidden');
    });

    it('throws when meeting not found', async () => {
      mockMeetingService.getMeetingById.mockResolvedValue(null);
      await expect(
        meetingResolvers.Mutation.updateMeeting(
          {},
          { id: 'bad-id', input: { status: 'CONFIRMED' } },
          adminContext,
        ),
      ).rejects.toThrow('Meeting not found');
    });
  });

  describe('deleteMeeting', () => {
    it('deletes meeting for admin', async () => {
      mockMeetingService.deleteMeeting.mockResolvedValue(true);
      const result = await meetingResolvers.Mutation.deleteMeeting(
        {},
        { id: 'meeting-1' },
        adminContext,
      );
      expect(result).toBe(true);
    });

    it('throws for non-admin', () => {
      expect(() =>
        meetingResolvers.Mutation.deleteMeeting({}, { id: 'meeting-1' }, authContext),
      ).toThrow('Forbidden');
    });
  });

  describe('rescheduleMeeting', () => {
    const rescheduleInput = { meetingDate: '2027-06-20', meetingTime: '14:00' };

    beforeEach(() => {
      mockMeetingService.getMeetingById.mockResolvedValue(baseMeeting);
      mockFindUserById.mockResolvedValue(mockUser);
      mockMeetingService.rescheduleMeeting.mockResolvedValue({
        ...baseMeeting,
        meetingDate: '2027-06-20',
        meetingTime: '14:00',
        rescheduledFrom: '2027-06-15 at 10:00',
        rescheduledBy: 'USER',
      });
    });

    it('allows meeting owner to reschedule', async () => {
      const result = await meetingResolvers.Mutation.rescheduleMeeting(
        {},
        { id: 'meeting-1', input: rescheduleInput },
        authContext,
      );
      expect(mockValidateRescheduleInput).toHaveBeenCalledWith('2027-06-20', '14:00');
      expect(result.rescheduledBy).toBe('USER');
    });

    it('allows admin to reschedule any meeting', async () => {
      const result = await meetingResolvers.Mutation.rescheduleMeeting(
        {},
        { id: 'meeting-1', input: rescheduleInput },
        adminContext,
      );
      expect(mockMeetingService.rescheduleMeeting).toHaveBeenCalledWith(
        'meeting-1',
        rescheduleInput,
        'ADMIN',
        'Test User',
        'user@example.com',
      );
      expect(result).toBeDefined();
    });

    it('throws when non-owner non-admin tries to reschedule', async () => {
      const otherContext: GraphQLContext = {
        user: { userId: 'user-2', phone: '9999999999', roles: [UserRole.USER] },
      };
      await expect(
        meetingResolvers.Mutation.rescheduleMeeting(
          {},
          { id: 'meeting-1', input: rescheduleInput },
          otherContext,
        ),
      ).rejects.toThrow('Not authorized to reschedule this meeting');
    });

    it('throws when meeting not found', async () => {
      mockMeetingService.getMeetingById.mockResolvedValue(null);
      await expect(
        meetingResolvers.Mutation.rescheduleMeeting(
          {},
          { id: 'bad-id', input: rescheduleInput },
          authContext,
        ),
      ).rejects.toThrow('Meeting not found');
    });

    it('throws for unauthenticated user', async () => {
      await expect(
        meetingResolvers.Mutation.rescheduleMeeting(
          {},
          { id: 'meeting-1', input: rescheduleInput },
          unauthContext,
        ),
      ).rejects.toThrow('Authentication required');
    });
  });
});

describe('Meeting field resolver', () => {
  it('resolves user field from userId', async () => {
    mockFindUserById.mockResolvedValue(mockUser);
    const result = await meetingResolvers.Meeting.user({ userId: 'user-1' });
    expect(mockFindUserById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(mockUser);
  });

  it('returns null when user not found', async () => {
    mockFindUserById.mockResolvedValue(null);
    const result = await meetingResolvers.Meeting.user({ userId: 'nonexistent' });
    expect(result).toBeNull();
  });
});
