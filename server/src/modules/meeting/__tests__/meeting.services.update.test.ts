import { updateMeeting, deleteMeeting, getMeetingCounts } from '../meeting.services';
import { MeetingModel } from '../meeting.models';

jest.mock('../meeting.models', () => {
  const toMeeting = (doc: Record<string, unknown> | null) => {
    if (!doc) return null;
    return { ...doc, id: (doc.id as string) ?? (doc._id as string) };
  };
  return {
    MeetingModel: {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
      countDocuments: jest.fn(),
    },
    toMeeting,
  };
});

const mockCreateGoogleMeetEvent = jest.fn();
const mockDeleteGoogleMeetEvent = jest.fn();
jest.mock('../googleCalendar.service', () => ({
  createGoogleMeetEvent: (...args: unknown[]) => mockCreateGoogleMeetEvent(...args),
  updateGoogleMeetEvent: () => Promise.resolve(null),
  deleteGoogleMeetEvent: (...args: unknown[]) => mockDeleteGoogleMeetEvent(...args),
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
  mockCreateGoogleMeetEvent.mockResolvedValue(null);
  mockDeleteGoogleMeetEvent.mockResolvedValue(false);
});

describe('updateMeeting', () => {
  it('updates status and returns meeting', async () => {
    (MeetingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc, status: 'CONFIRMED' }),
    });

    const result = await updateMeeting('meeting-1', { status: 'CONFIRMED' });
    expect(result.status).toBe('CONFIRMED');
    expect(MeetingModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'meeting-1',
      expect.objectContaining({
        $set: expect.objectContaining({ status: 'CONFIRMED' }),
      }),
      { returnDocument: 'after' },
    );
  });

  it('sets completedAt when status is COMPLETED', async () => {
    (MeetingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc, status: 'COMPLETED', completedAt: '2027-06-15' }),
    });

    await updateMeeting('meeting-1', { status: 'COMPLETED' });
    expect(MeetingModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'meeting-1',
      expect.objectContaining({
        $set: expect.objectContaining({
          status: 'COMPLETED',
          completedAt: expect.any(String),
        }),
      }),
      { returnDocument: 'after' },
    );
  });

  it('auto-creates Google Meet event when confirming with email', async () => {
    // getMeetingById is called internally
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc }),
    });
    mockCreateGoogleMeetEvent.mockResolvedValue({
      meetLink: 'https://meet.google.com/abc',
      eventId: 'gcal-123',
    });
    (MeetingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({
        ...baseDoc,
        status: 'CONFIRMED',
        meetingLink: 'https://meet.google.com/abc',
        googleEventId: 'gcal-123',
      }),
    });

    const result = await updateMeeting('meeting-1', { status: 'CONFIRMED' }, 'Test User', 'user@example.com');
    expect(mockCreateGoogleMeetEvent).toHaveBeenCalled();
    expect(result.meetingLink).toBe('https://meet.google.com/abc');
    expect(result.googleEventId).toBe('gcal-123');
  });

  it('does not create Google Meet when meeting already has eventId', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc, googleEventId: 'existing-event' }),
    });
    (MeetingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc, status: 'CONFIRMED', googleEventId: 'existing-event' }),
    });

    await updateMeeting('meeting-1', { status: 'CONFIRMED' }, 'Test User', 'user@example.com');
    expect(mockCreateGoogleMeetEvent).not.toHaveBeenCalled();
  });

  it('deletes Google Calendar event when cancelling', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc, googleEventId: 'gcal-123' }),
    });
    mockDeleteGoogleMeetEvent.mockResolvedValue(true);
    (MeetingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc, status: 'CANCELLED' }),
    });

    await updateMeeting('meeting-1', { status: 'CANCELLED' });
    expect(mockDeleteGoogleMeetEvent).toHaveBeenCalledWith('gcal-123');
  });

  it('updates adminNote', async () => {
    (MeetingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc, adminNote: 'Follow up required' }),
    });

    const result = await updateMeeting('meeting-1', { adminNote: 'Follow up required' });
    expect(result.adminNote).toBe('Follow up required');
  });

  it('updates cancelReason', async () => {
    (MeetingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseDoc, cancelReason: 'User unavailable' }),
    });

    const result = await updateMeeting('meeting-1', { cancelReason: 'User unavailable' });
    expect(result.cancelReason).toBe('User unavailable');
  });

  it('throws when meeting not found', async () => {
    (MeetingModel.findByIdAndUpdate as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue(null),
    });

    await expect(updateMeeting('bad-id', { status: 'CONFIRMED' })).rejects.toThrow('Meeting not found');
  });
});

describe('deleteMeeting', () => {
  it('returns true when meeting is deleted', async () => {
    (MeetingModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });
    const result = await deleteMeeting('meeting-1');
    expect(result).toBe(true);
  });

  it('returns false when meeting is not found', async () => {
    (MeetingModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });
    const result = await deleteMeeting('nonexistent');
    expect(result).toBe(false);
  });
});

describe('getMeetingCounts', () => {
  it('returns counts for all statuses', async () => {
    (MeetingModel.countDocuments as jest.Mock)
      .mockResolvedValueOnce(3)  // pending
      .mockResolvedValueOnce(5)  // confirmed
      .mockResolvedValueOnce(10) // completed
      .mockResolvedValueOnce(2)  // cancelled
      .mockResolvedValueOnce(20); // total

    const result = await getMeetingCounts();
    expect(result).toEqual({
      pending: 3,
      confirmed: 5,
      completed: 10,
      cancelled: 2,
      total: 20,
    });
  });

  it('returns zeros when no meetings exist', async () => {
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);

    const result = await getMeetingCounts();
    expect(result).toEqual({
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      total: 0,
    });
  });
});
