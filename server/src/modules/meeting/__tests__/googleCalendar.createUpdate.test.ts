import { createGoogleMeetEvent, updateGoogleMeetEvent } from '../googleCalendar.service';

const mockInsert = jest.fn();
const mockPatch = jest.fn();

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: function FakeOAuth2() {
        return { setCredentials: () => undefined };
      },
    },
    calendar: () => ({
      events: {
        insert: (...args: unknown[]) => mockInsert(...args),
        patch: (...args: unknown[]) => mockPatch(...args),
        delete: () => Promise.resolve({}),
      },
      calendarList: { list: () => Promise.resolve({ status: 200 }) },
    }),
  },
}));

const mockGetConfigValue = jest.fn();
jest.mock('../../settings/settings.services', () => ({
  getConfigValue: (...args: unknown[]) => mockGetConfigValue(...args),
}));

jest.mock('../../../lib/logger', () => ({
  __esModule: true,
  default: { info: () => undefined, warn: () => undefined, error: () => undefined },
}));

function setConfigured() {
  mockGetConfigValue.mockImplementation((key: string) => {
    const values: Record<string, string> = {
      google_calendar_client_id: 'test-client-id',
      google_calendar_client_secret: 'test-client-secret',
      google_calendar_refresh_token: 'test-refresh-token',
      google_calendar_calendar_id: 'test-calendar-id',
    };
    return Promise.resolve(values[key] ?? '');
  });
}

function setUnconfigured() {
  mockGetConfigValue.mockResolvedValue('');
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('createGoogleMeetEvent', () => {
  it('returns null when credentials are not configured', async () => {
    setUnconfigured();
    const result = await createGoogleMeetEvent(
      'Test Meeting',
      'Description',
      '2027-06-15',
      '10:00',
      'user@example.com',
    );
    expect(result).toBeNull();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('creates event and returns meet link when configured', async () => {
    setConfigured();
    mockInsert.mockResolvedValue({
      data: {
        id: 'event-123',
        htmlLink: 'https://calendar.google.com/event/123',
        conferenceData: {
          entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/abc-def-ghi' }],
        },
      },
    });

    const result = await createGoogleMeetEvent(
      'Test Meeting',
      'Description',
      '2027-06-15',
      '10:00',
      'user@example.com',
    );

    expect(result).not.toBeNull();
    expect(result?.eventId).toBe('event-123');
    expect(result?.meetLink).toBe('https://meet.google.com/abc-def-ghi');
    expect(result?.htmlLink).toBe('https://calendar.google.com/event/123');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ conferenceDataVersion: 1, sendUpdates: 'all' }),
    );
  });

  it('returns empty meetLink when no video entry point exists', async () => {
    setConfigured();
    mockInsert.mockResolvedValue({
      data: {
        id: 'event-456',
        htmlLink: 'https://calendar.google.com/event/456',
        conferenceData: { entryPoints: [] },
      },
    });
    const result = await createGoogleMeetEvent(
      'Test',
      'Desc',
      '2027-06-15',
      '10:00',
      'user@example.com',
    );
    expect(result?.meetLink).toBe('');
  });

  it('returns null when API call fails', async () => {
    setConfigured();
    mockInsert.mockRejectedValue(new Error('API quota exceeded'));
    const result = await createGoogleMeetEvent(
      'Test',
      'Desc',
      '2027-06-15',
      '10:00',
      'user@example.com',
    );
    expect(result).toBeNull();
  });

  it('uses custom duration when provided', async () => {
    setConfigured();
    mockInsert.mockResolvedValue({
      data: { id: 'e1', htmlLink: '', conferenceData: { entryPoints: [] } },
    });
    await createGoogleMeetEvent('Test', 'Desc', '2027-06-15', '10:00', 'user@example.com', 60);
    const requestBody = mockInsert.mock.calls[0][0].requestBody;
    const start = new Date(requestBody.start.dateTime).getTime();
    const end = new Date(requestBody.end.dateTime).getTime();
    expect(end - start).toBe(60 * 60 * 1000);
  });
});

describe('updateGoogleMeetEvent', () => {
  it('returns null when credentials are not configured', async () => {
    setUnconfigured();
    const result = await updateGoogleMeetEvent('event-123', '2027-06-16', '11:00');
    expect(result).toBeNull();
    expect(mockPatch).not.toHaveBeenCalled();
  });

  it('updates event and returns new data when configured', async () => {
    setConfigured();
    mockPatch.mockResolvedValue({
      data: {
        id: 'event-123',
        htmlLink: 'https://calendar.google.com/event/123',
        conferenceData: {
          entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/xyz' }],
        },
      },
    });
    const result = await updateGoogleMeetEvent('event-123', '2027-06-16', '11:00');
    expect(result?.eventId).toBe('event-123');
    expect(result?.meetLink).toBe('https://meet.google.com/xyz');
    expect(mockPatch).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'event-123', sendUpdates: 'all' }),
    );
  });

  it('returns null when API call fails', async () => {
    setConfigured();
    mockPatch.mockRejectedValue(new Error('Not found'));
    const result = await updateGoogleMeetEvent('event-123', '2027-06-16', '11:00');
    expect(result).toBeNull();
  });
});
