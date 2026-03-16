import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  USER = 'USER',
  VENUE_OWNER = 'VENUE_OWNER',
  HOST = 'HOST',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  phone: string;
  email: string;
  password: string;
  username: string;
  name: string;
  age: number;
  dob: string;
  avatar: string;
  roles: UserRole[];
  activeRole: UserRole;
  isVerifiedHost: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  disableReason: string;
  savedPodIds: string[];
  themePreference: string;
  createdAt: string;
}

export interface CreateUserInput {
  phone: string;
  roles?: UserRole[];
  email?: string;
  password?: string;
  name?: string;
  username?: string;
  age?: number;
  dob?: string;
  avatar?: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  age?: number;
  email?: string;
}

export interface PaginationInput {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Mongoose ── */

export type UserMongoDoc = Omit<User, 'id'> & {
  _id: string;
  role?: string; // legacy field for backward compat
};

const UserSchema = new Schema<UserMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    username: { type: String, default: '', index: true },
    name: { type: String, default: '' },
    age: { type: Number, default: 0 },
    dob: { type: String, default: '' },
    avatar: { type: String, default: '' },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.USER],
    },
    activeRole: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isVerifiedHost: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    disableReason: { type: String, default: '' },
    savedPodIds: { type: [String], default: [] },
    themePreference: { type: String, default: 'light' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const UserModel =
  (mongoose.models['User'] as mongoose.Model<UserMongoDoc> | undefined) ??
  model<UserMongoDoc>('User', UserSchema);

/** Convert legacy single `role` to `roles` array for backward compat */
function migrateRoles(doc: UserMongoDoc): UserRole[] {
  if (doc.roles && doc.roles.length > 0) return doc.roles;
  const legacyRole = (doc as unknown as { role?: string }).role;
  if (legacyRole) {
    // Map old PLACE_OWNER to VENUE_OWNER
    const mapped = legacyRole === 'PLACE_OWNER' ? UserRole.VENUE_OWNER : (legacyRole as UserRole);
    return [mapped];
  }
  return [UserRole.USER];
}

export function toUser(doc: (UserMongoDoc & { id?: string }) | null): User | null {
  if (!doc) return null;
  const roles = migrateRoles(doc);
  return {
    ...doc,
    id: doc.id ?? doc._id,
    roles,
    activeRole: doc.activeRole ?? roles[0] ?? UserRole.USER,
    isActive: doc.isActive ?? true,
    disableReason: doc.disableReason ?? '',
    email: doc.email ?? '',
    avatar: doc.avatar ?? '',
    name: doc.name ?? '',
    username: doc.username ?? '',
    age: doc.age ?? 0,
    dob: doc.dob ?? '',
    savedPodIds: doc.savedPodIds ?? [],
    themePreference: doc.themePreference ?? 'light',
  } as User;
}
