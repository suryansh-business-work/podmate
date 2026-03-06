import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  platform: FeatureFlagPlatform;
  createdAt: string;
  updatedAt: string;
}

export type FeatureFlagPlatform = 'ALL' | 'APP' | 'ADMIN' | 'WEBSITE';

export interface CreateFeatureFlagInput {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
  platform?: FeatureFlagPlatform;
}

export interface UpdateFeatureFlagInput {
  name?: string;
  description?: string;
  enabled?: boolean;
  rolloutPercentage?: number;
  platform?: FeatureFlagPlatform;
}

export interface PaginatedFeatureFlags {
  items: FeatureFlag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Mongoose ── */

export type FeatureFlagMongoDoc = Omit<FeatureFlag, 'id'> & { _id: string };

const FeatureFlagSchema = new Schema<FeatureFlagMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    enabled: { type: Boolean, default: false },
    rolloutPercentage: { type: Number, default: 100, min: 0, max: 100 },
    platform: { type: String, enum: ['ALL', 'APP', 'ADMIN', 'WEBSITE'], default: 'ALL' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const FeatureFlagModel =
  (mongoose.models['FeatureFlag'] as mongoose.Model<FeatureFlagMongoDoc> | undefined) ??
  model<FeatureFlagMongoDoc>('FeatureFlag', FeatureFlagSchema);

export function toFeatureFlag(
  doc: (FeatureFlagMongoDoc & { id?: string }) | null,
): FeatureFlag | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    description: doc.description ?? '',
    rolloutPercentage: doc.rolloutPercentage ?? 100,
    platform: doc.platform ?? 'ALL',
  } as FeatureFlag;
}
