import { createMeeting, getMyMeetings, getMeetingById } from '../meeting.services';
import { MeetingModel } from '../meeting.models';
import type { CreateMeetingInput } from '../meeting.models';

jest.mock('../meeting.models', () => {
  const toMeeting = (doc: Record<string, unknown> | null) => {
    if (!doc) return null;
    return { ...doc, id: (doc.id as string) ?? (doc._id as string) };
  };
  return {
    MeetingModel: {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
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

const mockSendEmail = jest.fn();
jest.mock('../../../lib/email', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

jest.mock('../../../lib/emailTemplates', () => {
  const tpl = () =>
    Promise.resolve({ subject: 'Test Subject', text: 'text body', html: '<p>html</p>' });
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

const baseInput: CreateMeetingInput = {
  email: 'user@example.com',
  meetingDate: '2027-06-15',
  meetingTime: '10:00',
  updateProfileEmail: false,
  purpose: 'GENERAL',
};

const baseDoc = {
  _id: 'meeting-1',
  userId: 'user-1',
  userEmail: 'user@example.com',
  meetingDate: '2027-06-15',
  meetingTime: '10:00',
  meetingLink: '',
  googleEventId: '',
  status: 'PENDING',
  purpose: 'GENERAL',
  adminNote: '',
  cancelReason: '',
  rescheduledFrom: '',
  rescheduledBy: '',
  completedAt: '',
  createdAt: '2027-06-10T00:00:00.000Z',
  updatedAt: '2027-06-10T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSendEmail.mockResolvedValue(undefined);
});

describe('createMeeting', () => {
  it('creates a meeting successfully', async () => {
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);
    (MeetingModel.create as jest.Mock).mockResolvedValue({
      toObject: () => ({ ...baseDoc, id: 'meeting-1' }),
    });

    const result = await createMeeting('user-1', 'Test User', baseInput);
    expect(result.id).toBe('meeting-1');
    expect(result.userEmail).toBe('user@example.com');
    expect(result.status).toBe('PENDING');
  });

  it('throws when slot is already booked', async () => {
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(1);
    await expect(createMeeting('user-1', 'Test User', baseInput)).rejects.toThrow(
      'This time slot is already booked',
    );
  });

  it('sends confirmation email to user', async () => {
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);
    (MeetingModel.create as jest.Mock).mockResolvedValue({
      toObject: () => ({ ...baseDoc, id: 'meeting-1' }),
    });

    await createMeeting('user-1', 'Test User', baseInput);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com' }),
    );
  });

  it('sends admin notification when ADMIN_EMAIL is set', async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com';
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);
    (MeetingModel.create as jest.Mock).mockResolvedValue({
      toObject: () => ({ ...baseDoc, id: 'meeting-1' }),
    });

    await createMeeting('user-1', 'Test User', baseInput);
    expect(mockSendEmail).toHaveBeenCalledTimes(2);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'admin@example.com' }),
    );
    delete process.env.ADMIN_EMAIL;
  });

  it('trims email and date fields', async () => {
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);
    (MeetingModel.create as jest.Mock).mockResolvedValue({
      toObject: () => ({ ...baseDoc, id: 'meeting-1' }),
    });

    await createMeeting('user-1', 'Test', {
      ...baseInput,
      email: '  user@example.com  ',
      meetingDate: ' 2027-06-15 ',
      meetingTime: ' 10:00 ',
    });

    expect(MeetingModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userEmail: 'user@example.com',
        meetingDate: '2027-06-15',
        meetingTime: '10:00',
      }),
    );
  });

  it('sets purpose from input or defaults to GENERAL', async () => {
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);
    (MeetingModel.create as jest.Mock).mockResolvedValue({
      toObject: () => ({ ...baseDoc, id: 'meeting-1', purpose: 'POD_OWNER' }),
    });

    await createMeeting('user-1', 'Test', { ...baseInput, purpose: 'POD_OWNER' });
    expect(MeetingModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: 'POD_OWNER' }),
    );
  });

  it('does not throw when email send fails', async () => {
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);
    (MeetingModel.create as jest.Mock).mockResolvedValue({
      toObject: () => ({ ...baseDoc, id: 'meeting-1' }),
    });
    mockSendEmail.mockRejectedValue(new Error('SMTP failure'));

    const result = await createMeeting('user-1', 'Test User', baseInput);
    expect(result.id).toBe('meeting-1');
  });
});

describe('getMyMeetings', () => {
  it('returns meetings for a user sorted by createdAt desc', async () => {
    const chainMock = {
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue([
          { ...baseDoc, _id: 'm1' },
          { ...baseDoc, _id: 'm2' },
        ]),
      }),
    };
    (MeetingModel.find as jest.Mock).mockReturnValue(chainMock);

    const result = await getMyMeetings('user-1');
    expect(MeetingModel.find).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(chainMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('m1');
  });

  it('returns empty array when no meetings', async () => {
    (MeetingModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue([]),
      }),
    });

    const result = await getMyMeetings('user-99');
    expect(result).toHaveLength(0);
  });
});

describe('getMeetingById', () => {
  it('returns meeting when found', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc, _id: 'meeting-1' }),
    });

    const result = await getMeetingById('meeting-1');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('meeting-1');
  });

  it('returns null when not found', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue(null),
    });

    const result = await getMeetingById('nonexistent');
    expect(result).toBeNull();
  });
});
