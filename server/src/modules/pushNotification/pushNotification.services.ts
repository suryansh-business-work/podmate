import { PushTokenModel, toPushToken } from './pushNotification.models';
import type { PushToken, PushPlatform } from './pushNotification.models';
import logger from '../../lib/logger';

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sound?: string;
  badge?: number;
  channelId?: string;
}

interface ExpoPushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: Record<string, unknown>;
}

export async function registerPushToken(
  userId: string,
  token: string,
  platform: PushPlatform,
  deviceId: string,
): Promise<PushToken> {
  const now = new Date().toISOString();

  const doc = await PushTokenModel.findOneAndUpdate(
    { userId, deviceId },
    {
      $set: { token, platform, isActive: true, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, new: true, lean: true, setDefaultsOnInsert: true },
  );

  logger.info(`Push token registered for user ${userId} on ${platform}`);
  const raw = doc as unknown as Record<string, unknown>;
  return {
    id: (raw.id as string) ?? (raw._id as string),
    userId: raw.userId as string,
    token: raw.token as string,
    platform: raw.platform as PushPlatform,
    deviceId: raw.deviceId as string,
    isActive: raw.isActive as boolean,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };
}

export async function unregisterPushToken(userId: string, deviceId: string): Promise<boolean> {
  const result = await PushTokenModel.updateOne(
    { userId, deviceId },
    { $set: { isActive: false, updatedAt: new Date().toISOString() } },
  );
  return result.modifiedCount > 0;
}

export async function getActiveTokensForUser(userId: string): Promise<PushToken[]> {
  const docs = await PushTokenModel.find({ userId, isActive: true }).lean({ virtuals: true });
  return docs.map(toPushToken).filter(Boolean) as PushToken[];
}

export async function getActiveTokensForUsers(userIds: string[]): Promise<PushToken[]> {
  const docs = await PushTokenModel.find({
    userId: { $in: userIds },
    isActive: true,
  }).lean({ virtuals: true });
  return docs.map(toPushToken).filter(Boolean) as PushToken[];
}

export async function sendPushNotifications(
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ success: boolean; ticketCount: number }> {
  const tokens = await getActiveTokensForUsers(userIds);
  if (tokens.length === 0) {
    return { success: true, ticketCount: 0 };
  }

  const messages: ExpoPushMessage[] = tokens.map((t) => ({
    to: t.token,
    title,
    body,
    data,
    sound: 'default',
    channelId: 'default',
  }));

  const chunks = chunkArray(messages, 100);
  let totalTickets = 0;

  for (const chunk of chunks) {
    try {
      const response = await fetch(EXPO_PUSH_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        logger.error(`Expo push API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const result = (await response.json()) as { data: ExpoPushTicket[] };
      const tickets = result.data ?? [];
      totalTickets += tickets.length;

      const failedTokens: string[] = [];
      tickets.forEach((ticket, index) => {
        if (ticket.status === 'error') {
          logger.warn(`Push notification failed: ${ticket.message}`);
          if (
            ticket.details &&
            (ticket.details as Record<string, string>).error === 'DeviceNotRegistered'
          ) {
            failedTokens.push(chunk[index].to);
          }
        }
      });

      if (failedTokens.length > 0) {
        await PushTokenModel.updateMany(
          { token: { $in: failedTokens } },
          { $set: { isActive: false, updatedAt: new Date().toISOString() } },
        );
        logger.info(`Deactivated ${failedTokens.length} invalid push tokens`);
      }
    } catch (err) {
      logger.error(`Failed to send push notification chunk: ${String(err)}`);
    }
  }

  logger.info(`Sent ${totalTickets} push notifications to ${tokens.length} devices`);
  return { success: true, ticketCount: totalTickets };
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<{ success: boolean; ticketCount: number }> {
  return sendPushNotifications([userId], title, body, data);
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
