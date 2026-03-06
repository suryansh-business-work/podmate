import { v4 as uuidv4 } from 'uuid';
import type { Notification, NotificationType, PaginatedNotifications } from './notification.models';
import { NotificationModel, toNotification, AdminNotificationModel } from './notification.models';
import { UserModel } from '../user/user.models';
import { sendPushToUser, sendPushNotifications } from '../pushNotification/pushNotification.services';
import logger from '../../lib/logger';

export interface AdminNotificationRecord {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  recipientCount: number;
}

export interface PaginatedAdminNotifications {
  items: AdminNotificationRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: string,
): Promise<Notification> {
  const doc = await NotificationModel.create({
    _id: uuidv4(),
    userId,
    type,
    title,
    message,
    data: data ?? '',
    isRead: false,
    createdAt: new Date().toISOString(),
  });
  logger.info(`Notification created for user ${userId}: ${title}`);

  sendPushToUser(userId, title, message, data ? { payload: data } : undefined).catch((err) =>
    logger.warn(`Push delivery failed for user ${userId}: ${String(err)}`),
  );

  return toNotification(doc.toObject({ virtuals: true })) as Notification;
}

export async function broadcastNotification(
  title: string,
  message: string,
): Promise<{ success: boolean; recipientCount: number }> {
  const users = await UserModel.find({ isActive: true }, { _id: 1 }).lean();
  const now = new Date().toISOString();
  const docs = users.map((u) => ({
    _id: uuidv4(),
    userId: (u as { _id: string })._id,
    type: 'ADMIN_BROADCAST' as NotificationType,
    title,
    message,
    data: '',
    isRead: false,
    createdAt: now,
  }));

  if (docs.length > 0) {
    await NotificationModel.insertMany(docs);
  }

  await AdminNotificationModel.create({
    _id: uuidv4(),
    title,
    message,
    sentAt: now,
    recipientCount: docs.length,
  });

  const userIds = users.map((u) => (u as { _id: string })._id);
  sendPushNotifications(userIds, title, message).catch((err) =>
    logger.warn(`Broadcast push delivery failed: ${String(err)}`),
  );

  logger.info(`Broadcast notification sent to ${docs.length} users: ${title}`);
  return { success: true, recipientCount: docs.length };
}

export async function getAdminNotifications(
  page: number,
  limit: number,
): Promise<PaginatedAdminNotifications> {
  const total = await AdminNotificationModel.countDocuments();
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await AdminNotificationModel.find()
    .sort({ sentAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map((d) => {
      const raw = d as unknown as Record<string, unknown>;
      return {
        id: (raw.id as string) ?? (raw._id as string),
        title: raw.title as string,
        message: raw.message as string,
        sentAt: raw.sentAt as string,
        recipientCount: raw.recipientCount as number,
      };
    }),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getPaginatedNotifications(
  userId: string,
  page: number,
  limit: number,
): Promise<PaginatedNotifications> {
  const filter = { userId };
  const total = await NotificationModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await NotificationModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toNotification).filter(Boolean) as Notification[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  return NotificationModel.countDocuments({ userId, isRead: false });
}

export async function markAsRead(id: string): Promise<boolean> {
  const result = await NotificationModel.updateOne({ _id: id }, { $set: { isRead: true } });
  return result.modifiedCount > 0;
}

export async function markAllAsRead(userId: string): Promise<boolean> {
  const result = await NotificationModel.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } },
  );
  return result.modifiedCount > 0;
}
