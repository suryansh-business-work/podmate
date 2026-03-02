import type { CreatePolicyInput, UpdatePolicyInput } from './policy.models';

export function validateCreatePolicy(input: CreatePolicyInput): void {
  if (!input.title || input.title.trim().length < 3) {
    throw new Error('Policy title must be at least 3 characters');
  }
  if (!input.content || input.content.trim().length < 10) {
    throw new Error('Policy content must be at least 10 characters');
  }
  const validTypes = ['VENUE', 'USER', 'HOST'];
  if (!validTypes.includes(input.type)) {
    throw new Error(`Invalid policy type. Must be one of: ${validTypes.join(', ')}`);
  }
}

export function validateUpdatePolicy(input: UpdatePolicyInput): void {
  if (input.title !== undefined && input.title.trim().length < 3) {
    throw new Error('Policy title must be at least 3 characters');
  }
  if (input.content !== undefined && input.content.trim().length < 10) {
    throw new Error('Policy content must be at least 10 characters');
  }
}
