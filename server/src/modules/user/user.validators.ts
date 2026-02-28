import { UserRole } from './user.models';

export function validateUpdateProfile(input: { name?: string; avatar?: string }): void {
  if (input.name !== undefined && input.name.trim().length === 0) {
    throw new Error('Name cannot be empty');
  }
  if (input.name !== undefined && input.name.length > 100) {
    throw new Error('Name must be less than 100 characters');
  }
  if (input.avatar !== undefined && input.avatar.trim().length === 0) {
    throw new Error('Avatar URL cannot be empty');
  }
}

export function validateUserRole(role: string): void {
  if (!Object.values(UserRole).includes(role as UserRole)) {
    throw new Error(`Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`);
  }
}
