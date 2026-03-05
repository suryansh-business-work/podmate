import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

/* ── Global config (single document) ── */

export interface PlatformFeeConfig {
  id: string;
  globalFeePercent: number;
  updatedAt: string;
}

export type PlatformFeeConfigDoc = Omit<PlatformFeeConfig, 'id'> & { _id: string };

const PlatformFeeConfigSchema = new Schema<PlatformFeeConfigDoc>(
  {
    _id: { type: String, default: 'global' },
    globalFeePercent: { type: Number, required: true, min: 2, max: 15 },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const PlatformFeeConfigModel =
  (mongoose.models['PlatformFeeConfig'] as mongoose.Model<PlatformFeeConfigDoc> | undefined) ??
  model<PlatformFeeConfigDoc>('PlatformFeeConfig', PlatformFeeConfigSchema);

/* ── Per-pincode overrides ── */

export interface PlatformFeeOverride {
  id: string;
  pincode: string;
  feePercent: number;
  label: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPlatformFeeOverrides {
  items: PlatformFeeOverride[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PlatformFeeOverrideDoc = Omit<PlatformFeeOverride, 'id'> & { _id: string };

const PlatformFeeOverrideSchema = new Schema<PlatformFeeOverrideDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    pincode: { type: String, required: true, unique: true, index: true },
    feePercent: { type: Number, required: true, min: 2, max: 15 },
    label: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const PlatformFeeOverrideModel =
  (mongoose.models['PlatformFeeOverride'] as mongoose.Model<PlatformFeeOverrideDoc> | undefined) ??
  model<PlatformFeeOverrideDoc>('PlatformFeeOverride', PlatformFeeOverrideSchema);
