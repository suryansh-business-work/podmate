import type { CreateFeatureFlagInput } from './featureFlag.models';

const KEY_PATTERN = /^[a-z][a-z0-9_]*$/;

export function validateCreateFeatureFlag(input: CreateFeatureFlagInput): void {
  if (!input.key || input.key.trim().length === 0) {
    throw new Error('Feature flag key is required');
  }
  if (!KEY_PATTERN.test(input.key)) {
    throw new Error(
      'Key must be lowercase, start with a letter, and contain only letters, digits, and underscores',
    );
  }
  if (input.key.length > 100) {
    throw new Error('Key must be less than 100 characters');
  }
  if (!input.name || input.name.trim().length === 0) {
    throw new Error('Feature flag name is required');
  }
  if (input.name.length > 200) {
    throw new Error('Name must be less than 200 characters');
  }
  if (input.rolloutPercentage !== undefined) {
    if (input.rolloutPercentage < 0 || input.rolloutPercentage > 100) {
      throw new Error('Rollout percentage must be between 0 and 100');
    }
  }
}
