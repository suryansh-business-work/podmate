import { google } from 'googleapis';
import type { calendar_v3 } from 'googleapis';
import { getConfigValue } from '../settings/settings.services';
import logger from '../../lib/logger';

interface GoogleCalendarCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
}

export interface GoogleMeetEventResult {
  eventId: string;
  meetLink: string;
  htmlLink: string;
}

async function getCredentials(): Promise<GoogleCalendarCredentials> {
  const [clientId, clientSecret, refreshToken, calendarId] = await Promise.all([
    getConfigValue('google_calendar_client_id', 'GOOGLE_CALENDAR_CLIENT_ID'),
    getConfigValue('google_calendar_client_secret', 'GOOGLE_CALENDAR_CLIENT_SECRET'),
    getConfigValue('google_calendar_refresh_token', 'GOOGLE_CALENDAR_REFRESH_TOKEN'),
    getConfigValue('google_calendar_calendar_id', 'GOOGLE_CALENDAR_CALENDAR_ID'),
  ]);

  return {
    clientId: clientId ?? '',
    clientSecret: clientSecret ?? '',
    refreshToken: refreshToken ?? '',
    calendarId: calendarId || 'primary',
  };
}

function createOAuth2Client(creds: GoogleCalendarCredentials) {
  const oauth2Client = new google.auth.OAuth2(creds.clientId, creds.clientSecret);
  oauth2Client.setCredentials({ refresh_token: creds.refreshToken });
  return oauth2Client;
}

function isConfigured(creds: GoogleCalendarCredentials): boolean {
  return Boolean(creds.clientId && creds.clientSecret && creds.refreshToken);
}

export async function createGoogleMeetEvent(
  summary: string,
  description: string,
  meetingDate: string,
  meetingTime: string,
  attendeeEmail: string,
  durationMinutes: number = 30,
): Promise<GoogleMeetEventResult | null> {
  const creds = await getCredentials();
  if (!isConfigured(creds)) {
    logger.warn('Google Calendar not configured. Skipping Google Meet event creation.');
    return null;
  }

  try {
    const auth = createOAuth2Client(creds);
    const calendar = google.calendar({ version: 'v3', auth });

    const startDateTime = new Date(`${meetingDate}T${meetingTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    const event: calendar_v3.Schema$Event = {
      summary,
      description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: [{ email: attendeeEmail }],
      conferenceData: {
        createRequest: {
          requestId: `partywings-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    };

    const response = await calendar.events.insert({
      calendarId: creds.calendarId,
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    });

    const meetLink =
      response.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri ??
      '';

    logger.info(`Google Meet event created: ${response.data.id}, link: ${meetLink}`);

    return {
      eventId: response.data.id ?? '',
      meetLink,
      htmlLink: response.data.htmlLink ?? '',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error(`Failed to create Google Meet event: ${message}`);
    return null;
  }
}

export async function updateGoogleMeetEvent(
  eventId: string,
  meetingDate: string,
  meetingTime: string,
  durationMinutes: number = 30,
): Promise<GoogleMeetEventResult | null> {
  const creds = await getCredentials();
  if (!isConfigured(creds)) {
    logger.warn('Google Calendar not configured. Skipping Google Meet event update.');
    return null;
  }

  try {
    const auth = createOAuth2Client(creds);
    const calendar = google.calendar({ version: 'v3', auth });

    const startDateTime = new Date(`${meetingDate}T${meetingTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    const response = await calendar.events.patch({
      calendarId: creds.calendarId,
      eventId,
      requestBody: {
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'UTC',
        },
      },
      sendUpdates: 'all',
    });

    const meetLink =
      response.data.conferenceData?.entryPoints?.find((ep) => ep.entryPointType === 'video')?.uri ??
      '';

    logger.info(`Google Meet event updated: ${eventId}`);

    return {
      eventId: response.data.id ?? '',
      meetLink,
      htmlLink: response.data.htmlLink ?? '',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error(`Failed to update Google Meet event: ${message}`);
    return null;
  }
}

export async function deleteGoogleMeetEvent(eventId: string): Promise<boolean> {
  const creds = await getCredentials();
  if (!isConfigured(creds)) {
    return false;
  }

  try {
    const auth = createOAuth2Client(creds);
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId: creds.calendarId,
      eventId,
      sendUpdates: 'all',
    });

    logger.info(`Google Meet event deleted: ${eventId}`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error(`Failed to delete Google Meet event: ${message}`);
    return false;
  }
}

export async function testGoogleCalendarConnection(): Promise<{
  success: boolean;
  message: string;
}> {
  const creds = await getCredentials();
  if (!isConfigured(creds)) {
    return { success: false, message: 'Google Calendar credentials not configured' };
  }

  try {
    const auth = createOAuth2Client(creds);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.calendarList.list({ maxResults: 1 });
    if (response.status === 200) {
      return { success: true, message: 'Google Calendar connection successful' };
    }
    return {
      success: false,
      message: `Google Calendar API returned status ${response.status}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Google Calendar test failed:', message);
    return { success: false, message: `Google Calendar connection failed: ${message}` };
  }
}
