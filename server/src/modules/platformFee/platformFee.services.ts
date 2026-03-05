import { v4 as uuidv4 } from 'uuid';
import type {
  PlatformFeeConfig,
  PlatformFeeOverride,
  PaginatedPlatformFeeOverrides,
} from './platformFee.models';
import {
  PlatformFeeConfigModel,
  PlatformFeeOverrideModel,
} from './platformFee.models';
import logger from '../../lib/logger';

const DEFAULT_FEE_PERCENT = 5;

export async function getGlobalConfig(): Promise<PlatformFeeConfig> {
  const doc = await PlatformFeeConfigModel.findById('global').lean({ virtuals: true });
  if (doc) {
    const raw = doc as unknown as Record<string, unknown>;
    return {
      id: (raw.id as string) ?? (raw._id as string),
      globalFeePercent: raw.globalFeePercent as number,
      updatedAt: raw.updatedAt as string,
    };
  }
  // Return default if not yet configured
  return { id: 'global', globalFeePercent: DEFAULT_FEE_PERCENT, updatedAt: new Date().toISOString() };
}

export async function upsertGlobalFee(globalFeePercent: number): Promise<PlatformFeeConfig> {
  if (globalFeePercent < 2 || globalFeePercent > 15) {
    throw new Error('Platform fee must be between 2% and 15%');
  }
  const now = new Date().toISOString();
  const doc = await PlatformFeeConfigModel.findByIdAndUpdate(
    'global',
    { $set: { globalFeePercent, updatedAt: now } },
    { upsert: true, returnDocument: 'after', lean: true },
  );
  logger.info(`Platform global fee updated to ${globalFeePercent}%`);
  const raw = doc as unknown as Record<string, unknown>;
  return {
    id: 'global',
    globalFeePercent: raw.globalFeePercent as number,
    updatedAt: raw.updatedAt as string,
  };
}

function toOverride(doc: Record<string, unknown>): PlatformFeeOverride {
  return {
    id: (doc.id as string) ?? (doc._id as string),
    pincode: doc.pincode as string,
    feePercent: doc.feePercent as number,
    label: (doc.label as string) ?? '',
    createdAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  };
}

export async function getOverrides(
  page: number,
  limit: number,
): Promise<PaginatedPlatformFeeOverrides> {
  const total = await PlatformFeeOverrideModel.countDocuments();
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await PlatformFeeOverrideModel.find()
    .sort({ pincode: 1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map((d) => toOverride(d as unknown as Record<string, unknown>)),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function upsertOverride(input: {
  id?: string;
  pincode: string;
  feePercent: number;
  label?: string;
}): Promise<PlatformFeeOverride> {
  if (input.feePercent < 2 || input.feePercent > 15) {
    throw new Error('Platform fee must be between 2% and 15%');
  }
  const now = new Date().toISOString();

  if (input.id) {
    const doc = await PlatformFeeOverrideModel.findByIdAndUpdate(
      input.id,
      { $set: { pincode: input.pincode, feePercent: input.feePercent, label: input.label ?? '', updatedAt: now } },
      { returnDocument: 'after', lean: true },
    );
    if (!doc) throw new Error('Override not found');
    return toOverride(doc as unknown as Record<string, unknown>);
  }

  const existing = await PlatformFeeOverrideModel.findOne({ pincode: input.pincode }).lean();
  if (existing) {
    throw new Error(`Override for pincode ${input.pincode} already exists`);
  }

  const doc = await PlatformFeeOverrideModel.create({
    _id: uuidv4(),
    pincode: input.pincode,
    feePercent: input.feePercent,
    label: input.label ?? '',
    createdAt: now,
    updatedAt: now,
  });
  logger.info(`Platform fee override created for pincode ${input.pincode}: ${input.feePercent}%`);
  return toOverride(doc.toObject({ virtuals: true }) as unknown as Record<string, unknown>);
}

export async function deleteOverride(id: string): Promise<boolean> {
  const result = await PlatformFeeOverrideModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}
