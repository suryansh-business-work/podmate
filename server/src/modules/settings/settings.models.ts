import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface AppSettings {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export type AppSettingsMongoDoc = Omit<AppSettings, 'id'> & { _id: string };

const AppSettingsSchema = new Schema<AppSettingsMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    key: { type: String, required: true, unique: true },
    value: { type: String, default: '' },
    category: { type: String, default: 'general' },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const AppSettingsModel =
  (mongoose.models['AppSettings'] as mongoose.Model<AppSettingsMongoDoc> | undefined) ??
  model<AppSettingsMongoDoc>('AppSettings', AppSettingsSchema);

export function toAppSettings(
  doc: (AppSettingsMongoDoc & { id?: string }) | null,
): AppSettings | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as AppSettings;
}
