import { v4 as uuidv4 } from 'uuid';
import type { Notification, NotificationType, PaginatedNotifications } from './notification.models';
import { NotificationModel, toNotification } from './notification.models';
import logger from '../../lib/logger';

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
  return toNotification(doc.toObject({ virtuals: true })) as Notification;
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
