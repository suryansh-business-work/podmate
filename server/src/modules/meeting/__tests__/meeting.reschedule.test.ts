import { rescheduleMeeting, getAvailableSlots } from '../meeting.services';
import { MeetingModel } from '../meeting.models';
import type { Meeting } from '../meeting.models';

jest.mock('../meeting.models', () => {
  const toMeeting = (doc: Record<string, unknown> | null) => {
    if (!doc) return null;
    return { ...doc, id: (doc.id as string) ?? (doc._id as string) };
  };
  return {
    MeetingModel: {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
    },
    toMeeting,
  };
});

const mockUpdateGoogleMeetEvent = jest.fn();
jest.mock('../googleCalendar.service', () => ({
  createGoogleMeetEvent: () => Promise.resolve(null),
  updateGoogleMeetEvent: (...args: unknown[]) => mockUpdateGoogleMeetEvent(...args),
  deleteGoogleMeetEvent: () => Promise.resolve(false),
}));
const mockSendEmail = jest.fn();
jest.mock('../../../lib/email', () => ({
  sendEmail: (...args: unknown[]) => mockSendEmail(...args),
}));

jest.mock('../../../lib/emailTemplates', () => {
  const tpl = () => ({ subject: 's', text: 't', html: '<p>h</p>' });
  return {
    meetingConfirmationTemplate: tpl,
    meetingAdminNotificationTemplate: tpl,
    meetingInviteTemplate: tpl,
    meetingRescheduleTemplate: tpl,
  };
});

jest.mock('../../../lib/logger', () => ({
  __esModule: true, default: { info: () => undefined, warn: () => undefined, error: () => undefined },
}));

const baseMeeting: Meeting = {
  id: 'meeting-1', userId: 'user-1', userEmail: 'user@example.com',
  meetingDate: '2027-06-15', meetingTime: '10:00', meetingLink: '',
  status: 'PENDING', purpose: 'GENERAL', adminNote: '', cancelReason: '',
  completedAt: '', googleEventId: '', rescheduledFrom: '', rescheduledBy: '',
  createdAt: '2027-06-10T00:00:00.000Z', updatedAt: '2027-06-10T00:00:00.000Z',
};
beforeEach(() => {
  jest.clearAllMocks();
  mockSendEmail.mockResolvedValue(undefined);
});
describe('rescheduleMeeting', () => {
  const leanMock = { lean: jest.fn() };
  beforeEach(() => {
    (MeetingModel.findByIdAndUpdate as jest.Mock).mockReturnValue(leanMock);
  });

  it('throws when meeting is not found', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue(null),
    });
    await expect(
      rescheduleMeeting(
        'nonexistent',
        { meetingDate: '2027-06-16', meetingTime: '11:00' },
        'ADMIN',
      ),
    ).rejects.toThrow('Meeting not found');
  });

  it('throws when meeting is COMPLETED', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseMeeting, _id: 'meeting-1', status: 'COMPLETED' }),
    });
    await expect(
      rescheduleMeeting(
        'meeting-1',
        { meetingDate: '2027-06-16', meetingTime: '11:00' },
        'ADMIN',
      ),
    ).rejects.toThrow('Cannot reschedule a completed or cancelled meeting');
  });

  it('throws when meeting is CANCELLED', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseMeeting, _id: 'meeting-1', status: 'CANCELLED' }),
    });
    await expect(
      rescheduleMeeting(
        'meeting-1',
        { meetingDate: '2027-06-16', meetingTime: '11:00' },
        'ADMIN',
      ),
    ).rejects.toThrow('Cannot reschedule a completed or cancelled meeting');
  });

  it('throws when slot is already booked', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseMeeting, _id: 'meeting-1' }),
    });
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(1);
    await expect(
      rescheduleMeeting(
        'meeting-1',
        { meetingDate: '2027-06-16', meetingTime: '11:00' },
        'ADMIN',
      ),
    ).rejects.toThrow('This time slot is already booked');
  });

  it('reschedules without Google Calendar when no googleEventId', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseMeeting, _id: 'meeting-1' }),
    });
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);
    leanMock.lean.mockReturnValue({
      ...baseMeeting,
      _id: 'meeting-1',
      meetingDate: '2027-06-16',
      meetingTime: '11:00',
      rescheduledFrom: '2027-06-15 at 10:00',
      rescheduledBy: 'ADMIN',
    });

    const result = await rescheduleMeeting(
      'meeting-1',
      { meetingDate: '2027-06-16', meetingTime: '11:00' },
      'ADMIN',
      'Admin User',
      'admin@example.com',
    );
    expect(result.meetingDate).toBe('2027-06-16');
    expect(result.rescheduledFrom).toBe('2027-06-15 at 10:00');
    expect(result.rescheduledBy).toBe('ADMIN');
    expect(mockUpdateGoogleMeetEvent).not.toHaveBeenCalled();
  });

  it('updates Google Calendar when googleEventId exists', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest
        .fn()
        .mockReturnValue({ ...baseMeeting, _id: 'meeting-1', googleEventId: 'gcal-1' }),
    });
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);
    mockUpdateGoogleMeetEvent.mockResolvedValue({
      eventId: 'gcal-1',
      meetLink: 'https://meet.google.com/updated',
      htmlLink: '',
    });
    leanMock.lean.mockReturnValue({
      ...baseMeeting,
      _id: 'meeting-1',
      meetingDate: '2027-06-16',
      meetingTime: '11:00',
      meetingLink: 'https://meet.google.com/updated',
      googleEventId: 'gcal-1',
      rescheduledBy: 'USER',
    });

    const result = await rescheduleMeeting(
      'meeting-1',
      { meetingDate: '2027-06-16', meetingTime: '11:00' },
      'USER',
      'Test User',
      'user@example.com',
    );
    expect(mockUpdateGoogleMeetEvent).toHaveBeenCalledWith('gcal-1', '2027-06-16', '11:00');
    expect(result.meetingLink).toBe('https://meet.google.com/updated');
  });

  it('excludes current meeting from slot availability check', async () => {
    (MeetingModel.findById as jest.Mock).mockReturnValue({
      lean: jest.fn().mockReturnValue({ ...baseMeeting, _id: 'meeting-1' }),
    });
    (MeetingModel.countDocuments as jest.Mock).mockResolvedValue(0);
    leanMock.lean.mockReturnValue({ ...baseMeeting, _id: 'meeting-1' });

    await rescheduleMeeting(
      'meeting-1',
      { meetingDate: '2027-06-16', meetingTime: '11:00' },
      'ADMIN',
    );
    expect(MeetingModel.countDocuments).toHaveBeenCalledWith(
      expect.objectContaining({ _id: { $ne: 'meeting-1' } }),
    );
  });
});

describe('getAvailableSlots', () => {
  it('returns 16 time slots starting at 09:00 and ending at 17:30', () => {
    const slots = getAvailableSlots();
    expect(slots).toHaveLength(16);
    expect(slots[0]).toBe('09:00');
    expect(slots[slots.length - 1]).toBe('17:30');
  });
});
