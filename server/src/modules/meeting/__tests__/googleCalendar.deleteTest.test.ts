import { deleteGoogleMeetEvent, testGoogleCalendarConnection } from '../googleCalendar.service';

const mockDelete = jest.fn();
const mockCalendarListList = jest.fn();

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: function FakeOAuth2() {
        return { setCredentials: () => undefined };
      },
    },
    calendar: () => ({
      events: {
        insert: () => Promise.resolve({ data: {} }),
        patch: () => Promise.resolve({ data: {} }),
        delete: (...args: unknown[]) => mockDelete(...args),
      },
      calendarList: {
        list: (...args: unknown[]) => mockCalendarListList(...args),
      },
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

describe('deleteGoogleMeetEvent', () => {
  it('returns false when credentials are not configured', async () => {
    setUnconfigured();
    const result = await deleteGoogleMeetEvent('event-123');
    expect(result).toBe(false);
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('deletes event and returns true when configured', async () => {
    setConfigured();
    mockDelete.mockResolvedValue({});
    const result = await deleteGoogleMeetEvent('event-123');
    expect(result).toBe(true);
    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: 'event-123', sendUpdates: 'all' }),
    );
  });

  it('returns false when API call fails', async () => {
    setConfigured();
    mockDelete.mockRejectedValue(new Error('Not found'));
    const result = await deleteGoogleMeetEvent('event-123');
    expect(result).toBe(false);
  });
});

describe('testGoogleCalendarConnection', () => {
  it('returns failure when not configured', async () => {
    setUnconfigured();
    const result = await testGoogleCalendarConnection();
    expect(result.success).toBe(false);
    expect(result.message).toContain('not configured');
  });

  it('returns success when API responds with 200', async () => {
    setConfigured();
    mockCalendarListList.mockResolvedValue({ status: 200 });
    const result = await testGoogleCalendarConnection();
    expect(result.success).toBe(true);
    expect(result.message).toContain('successful');
  });

  it('returns failure for non-200 response', async () => {
    setConfigured();
    mockCalendarListList.mockResolvedValue({ status: 403 });
    const result = await testGoogleCalendarConnection();
    expect(result.success).toBe(false);
    expect(result.message).toContain('403');
  });

  it('returns failure when API throws', async () => {
    setConfigured();
    mockCalendarListList.mockRejectedValue(new Error('Auth failed'));
    const result = await testGoogleCalendarConnection();
    expect(result.success).toBe(false);
    expect(result.message).toContain('Auth failed');
  });
});
