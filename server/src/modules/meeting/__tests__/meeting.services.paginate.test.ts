import { getBookedSlots, getAvailableSlots, getPaginatedMeetings } from '../meeting.services';
import { MeetingModel } from '../meeting.models';

jest.mock('../meeting.models', () => {
  const toMeeting = (doc: Record<string, unknown> | null) => {
    if (!doc) return null;
    return { ...doc, id: (doc.id as string) ?? (doc._id as string) };
  };
  return {
    MeetingModel: {
      find: jest.fn(),
      countDocuments: jest.fn(),
    },
    toMeeting,
  };
});

jest.mock('../googleCalendar.service', () => ({
  createGoogleMeetEvent: () => Promise.resolve(null),
  updateGoogleMeetEvent: () => Promise.resolve(null),
  deleteGoogleMeetEvent: () => Promise.resolve(false),
}));

jest.mock('../../../lib/email', () => ({
  sendEmail: () => Promise.resolve(),
}));

jest.mock('../../../lib/emailTemplates', () => {
  const tpl = () =>
    Promise.resolve({ subject: 'Test', text: 'text', html: '<p>html</p>' });
  return {
    meetingConfirmationTemplate: tpl,
    meetingAdminNotificationTemplate: tpl,
    meetingInviteTemplate: tpl,
    meetingRescheduleTemplate: tpl,
  };
});

jest.mock('../../../lib/logger', () => ({
  __esModule: true,
  default: { info: () => undefined, warn: () => undefined, error: () => undefined },
}));

beforeEach(() => jest.clearAllMocks());

describe('getBookedSlots', () => {
  it('returns booked slots for a given date', async () => {
    (MeetingModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue([
          { meetingTime: '10:00' },
          { meetingTime: '14:00' },
        ]),
      }),
    });

    const result = await getBookedSlots('2027-06-15');
    expect(result).toEqual([{ meetingTime: '10:00' }, { meetingTime: '14:00' }]);
  });

  it('returns empty when no slots are booked', async () => {
    (MeetingModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({ lean: jest.fn().mockReturnValue([]) }),
    });

    const result = await getBookedSlots('2027-06-20');
    expect(result).toEqual([]);
  });

  it('only returns slots that have reached max bookings', async () => {
    (MeetingModel.find as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue([
          { meetingTime: '10:00' },
        ]),
      }),
    });

    const result = await getBookedSlots('2027-06-15');
    expect(result).toEqual([{ meetingTime: '10:00' }]);
  });
});

describe('getAvailableSlots', () => {
  it('returns all 16 meeting time slots', () => {
    const slots = getAvailableSlots();
    expect(slots).toHaveLength(16);
    expect(slots[0]).toBe('09:00');
    expect(slots[slots.length - 1]).toBe('17:30');
  });
});

describe('getPaginatedMeetings', () => {
  const mockDocs = [
    {
      _id: 'm1',
      userId: 'u1',
      userEmail: 'a@b.com',
      meetingDate: '2027-06-15',
      meetingTime: '10:00',
      status: 'PENDING',
      purpose: 'GENERAL',
      meetingLink: '',
      googleEventId: '',
      adminNote: '',
      cancelReason: '',
      rescheduledFrom: '',
      rescheduledBy: '',
      completedAt: '',
      createdAt: '2027-06-10T00:00:00.000Z',
      updatedAt: '2027-06-10T00:00:00.000Z',
    },
  ];

  const setupChain = (docs: Record<string, unknown>[], total: number) => {
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(total);
    (MeetingModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue(docs),
          }),
        }),
      }),
    });
  };

  it('returns paginated results with defaults', async () => {
    setupChain(mockDocs, 1);
    const result = await getPaginatedMeetings({ page: 1, limit: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it('applies status filter', async () => {
    setupChain(mockDocs, 1);
    await getPaginatedMeetings({ page: 1, limit: 10, status: 'PENDING' });
    expect(MeetingModel.countDocuments).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDING' }),
    );
  });

  it('applies search filter with regex', async () => {
    setupChain([], 0);
    await getPaginatedMeetings({ page: 1, limit: 10, search: 'test@' });
    expect(MeetingModel.countDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          { userEmail: { $regex: 'test@', $options: 'i' } },
          { meetingDate: { $regex: 'test@', $options: 'i' } },
        ],
      }),
    );
  });

  it('sorts ascending when order is ASC', async () => {
    setupChain(mockDocs, 1);
    await getPaginatedMeetings({ page: 1, limit: 10, sortBy: 'meetingDate', order: 'ASC' });
    const findMock = MeetingModel.find as jest.Mock;
    const sortFn = findMock.mock.results[0].value.sort;
    expect(sortFn).toHaveBeenCalledWith({ meetingDate: 1 });
  });

  it('sorts descending by default', async () => {
    setupChain(mockDocs, 1);
    await getPaginatedMeetings({ page: 1, limit: 10 });
    const findMock = MeetingModel.find as jest.Mock;
    const sortFn = findMock.mock.results[0].value.sort;
    expect(sortFn).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it('calculates totalPages correctly', async () => {
    setupChain(mockDocs, 25);
    const result = await getPaginatedMeetings({ page: 1, limit: 10 });
    expect(result.totalPages).toBe(3);
  });

  it('returns empty items for out of range page', async () => {
    setupChain([], 5);
    const result = await getPaginatedMeetings({ page: 10, limit: 5 });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(5);
  });
});
