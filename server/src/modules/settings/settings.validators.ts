export interface UpsertSettingInput {
  key: string;
  value: string;
  category: string;
}

export function validateUpsertSetting(input: UpsertSettingInput): void {
  if (!input.key || input.key.length < 1 || input.key.length > 100) {
    throw new Error('Key must be between 1 and 100 characters');
  }
  if (input.value === undefined || input.value === null || input.value.length > 5000) {
    throw new Error('Value is required and must be at most 5000 characters');
  }
  if (!input.category || input.category.length < 1 || input.category.length > 50) {
    throw new Error('Category must be between 1 and 50 characters');
  }
}
