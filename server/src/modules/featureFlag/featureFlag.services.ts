import { v4 as uuidv4 } from 'uuid';
import type {
  FeatureFlag,
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
  PaginatedFeatureFlags,
} from './featureFlag.models';
import { FeatureFlagModel, toFeatureFlag } from './featureFlag.models';

export async function getFeatureFlags(
  page: number,
  limit: number,
  search?: string,
): Promise<PaginatedFeatureFlags> {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { key: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await FeatureFlagModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await FeatureFlagModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toFeatureFlag).filter(Boolean) as FeatureFlag[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getFeatureFlagByKey(key: string): Promise<FeatureFlag | null> {
  const doc = await FeatureFlagModel.findOne({ key }).lean({ virtuals: true });
  return toFeatureFlag(doc);
}

export async function getFeatureFlagById(id: string): Promise<FeatureFlag | null> {
  const doc = await FeatureFlagModel.findById(id).lean({ virtuals: true });
  return toFeatureFlag(doc);
}

export async function createFeatureFlag(input: CreateFeatureFlagInput): Promise<FeatureFlag> {
  const existing = await FeatureFlagModel.findOne({ key: input.key });
  if (existing) throw new Error(`Feature flag with key "${input.key}" already exists`);

  const doc = await FeatureFlagModel.create({
    _id: uuidv4(),
    key: input.key,
    name: input.name,
    description: input.description ?? '',
    enabled: input.enabled ?? false,
    rolloutPercentage: input.rolloutPercentage ?? 100,
    platform: input.platform ?? 'ALL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  return toFeatureFlag(doc.toObject({ virtuals: true })) as FeatureFlag;
}

export async function updateFeatureFlag(
  id: string,
  input: UpdateFeatureFlagInput,
): Promise<FeatureFlag> {
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.name !== undefined) update.name = input.name;
  if (input.description !== undefined) update.description = input.description;
  if (input.enabled !== undefined) update.enabled = input.enabled;
  if (input.rolloutPercentage !== undefined) update.rolloutPercentage = input.rolloutPercentage;
  if (input.platform !== undefined) update.platform = input.platform;

  const updated = await FeatureFlagModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toFeatureFlag(updated);
  if (!result) throw new Error('Feature flag not found');
  return result;
}

export async function deleteFeatureFlag(id: string): Promise<boolean> {
  const result = await FeatureFlagModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

export async function toggleFeatureFlag(id: string): Promise<FeatureFlag> {
  const flag = await FeatureFlagModel.findById(id);
  if (!flag) throw new Error('Feature flag not found');

  const updated = await FeatureFlagModel.findByIdAndUpdate(
    id,
    { $set: { enabled: !flag.enabled, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  ).lean({ virtuals: true });
  const result = toFeatureFlag(updated);
  if (!result) throw new Error('Feature flag not found');
  return result;
}

/** Check if a feature is enabled for a given user (A/B testing via hash) */
export async function isFeatureEnabled(key: string, userId?: string): Promise<boolean> {
  const flag = await getFeatureFlagByKey(key);
  if (!flag || !flag.enabled) return false;
  if (flag.rolloutPercentage >= 100) return true;
  if (flag.rolloutPercentage <= 0) return false;

  if (!userId) return false;

  /* Simple hash-based bucketing for A/B testing */
  let hash = 0;
  const seed = `${key}:${userId}`;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const bucket = Math.abs(hash) % 100;
  return bucket < flag.rolloutPercentage;
}
