import { toMeeting } from '../meeting.models';
import type { MeetingMongoDoc } from '../meeting.models';

describe('toMeeting', () => {
  const baseMeetingDoc: MeetingMongoDoc & { id?: string } = {
    _id: 'meeting-123',
    userId: 'user-456',
    userEmail: 'test@example.com',
    meetingDate: '2027-06-15',
    meetingTime: '10:00',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'PENDING',
    purpose: 'POD_OWNER',
    adminNote: '',
    cancelReason: '',
    completedAt: '',
    googleEventId: '',
    rescheduledFrom: '',
    rescheduledBy: '',
    createdAt: '2027-06-10T10:00:00.000Z',
    updatedAt: '2027-06-10T10:00:00.000Z',
  };

  it('returns null when doc is null', () => {
    expect(toMeeting(null)).toBeNull();
  });

  it('converts a mongo doc to Meeting with id from _id', () => {
    const result = toMeeting(baseMeetingDoc);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('meeting-123');
    expect(result?.userId).toBe('user-456');
    expect(result?.userEmail).toBe('test@example.com');
    expect(result?.purpose).toBe('POD_OWNER');
    expect(result?.status).toBe('PENDING');
  });

  it('uses virtual id when available', () => {
    const docWithVirtualId = { ...baseMeetingDoc, id: 'virtual-id' };
    const result = toMeeting(docWithVirtualId);
    expect(result?.id).toBe('virtual-id');
  });

  it('preserves VENUE_OWNER purpose', () => {
    const doc = { ...baseMeetingDoc, purpose: 'VENUE_OWNER' as const };
    const result = toMeeting(doc);
    expect(result?.purpose).toBe('VENUE_OWNER');
  });

  it('preserves GENERAL purpose', () => {
    const doc = { ...baseMeetingDoc, purpose: 'GENERAL' as const };
    const result = toMeeting(doc);
    expect(result?.purpose).toBe('GENERAL');
  });

  it('preserves all meeting fields', () => {
    const doc = {
      ...baseMeetingDoc,
      meetingLink: 'https://meet.google.com/abc',
      adminNote: 'Approved',
      cancelReason: '',
      completedAt: '2027-06-15T11:00:00.000Z',
    };
    const result = toMeeting(doc);
    expect(result?.meetingLink).toBe('https://meet.google.com/abc');
    expect(result?.adminNote).toBe('Approved');
    expect(result?.completedAt).toBe('2027-06-15T11:00:00.000Z');
  });
});
