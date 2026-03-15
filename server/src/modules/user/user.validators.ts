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

export function validateUserRoles(roles: string[]): void {
  if (!roles.length) {
    throw new Error('At least one role is required');
  }
  const validRoles = Object.values(UserRole);
  for (const role of roles) {
    if (!validRoles.includes(role as UserRole)) {
      throw new Error(`Invalid role '${role}'. Must be one of: ${validRoles.join(', ')}`);
    }
  }
  // ADMIN is exclusive — cannot be combined with other roles
  if (roles.includes(UserRole.ADMIN) && roles.length > 1) {
    throw new Error('ADMIN role cannot be combined with other roles');
  }
}
