import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType =
  | 'POD_JOIN'
  | 'POD_LEAVE'
  | 'POD_UPDATE'
  | 'SUPPORT_REPLY'
  | 'GENERAL'
  | 'ADMIN_BROADCAST';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: string;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Mongoose ── */

export type NotificationMongoDoc = Omit<Notification, 'id'> & { _id: string };

const NotificationSchema = new Schema<NotificationMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['POD_JOIN', 'POD_LEAVE', 'POD_UPDATE', 'SUPPORT_REPLY', 'GENERAL', 'ADMIN_BROADCAST'],
      default: 'GENERAL',
    },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    data: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const NotificationModel =
  (mongoose.models['Notification'] as mongoose.Model<NotificationMongoDoc> | undefined) ??
  model<NotificationMongoDoc>('Notification', NotificationSchema);

export function toNotification(
  doc: (NotificationMongoDoc & { id?: string }) | null,
): Notification | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as Notification;
}

/* ── Admin notification log (tracks broadcast history) ── */

export interface AdminNotificationDoc {
  _id: string;
  title: string;
  message: string;
  sentAt: string;
  recipientCount: number;
}

const AdminNotificationSchema = new Schema<AdminNotificationDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    sentAt: { type: String, default: () => new Date().toISOString() },
    recipientCount: { type: Number, default: 0 },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const AdminNotificationModel =
  (mongoose.models['AdminNotification'] as mongoose.Model<AdminNotificationDoc> | undefined) ??
  model<AdminNotificationDoc>('AdminNotification', AdminNotificationSchema);
