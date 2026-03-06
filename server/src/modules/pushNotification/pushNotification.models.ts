import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type PushPlatform = 'ANDROID' | 'IOS' | 'WEB';

export interface PushToken {
  id: string;
  userId: string;
  token: string;
  platform: PushPlatform;
  deviceId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PushTokenMongoDoc = Omit<PushToken, 'id'> & { _id: string };

const PushTokenSchema = new Schema<PushTokenMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    token: { type: String, required: true },
    platform: {
      type: String,
      enum: ['ANDROID', 'IOS', 'WEB'],
      required: true,
    },
    deviceId: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

PushTokenSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
PushTokenSchema.index({ token: 1 }, { unique: true });

export const PushTokenModel =
  (mongoose.models['PushToken'] as mongoose.Model<PushTokenMongoDoc> | undefined) ??
  model<PushTokenMongoDoc>('PushToken', PushTokenSchema);

export function toPushToken(doc: (PushTokenMongoDoc & { id?: string }) | null): PushToken | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as PushToken;
}
