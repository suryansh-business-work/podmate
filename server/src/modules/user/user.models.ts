import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  USER = 'USER',
  PLACE_OWNER = 'PLACE_OWNER',
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
  role: UserRole;
  isVerifiedHost: boolean;
  isActive: boolean;
  disableReason: string;
  createdAt: string;
}

export interface CreateUserInput {
  phone: string;
  role?: UserRole;
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

export type UserMongoDoc = Omit<User, 'id'> & { _id: string };

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
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isVerifiedHost: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    disableReason: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const UserModel =
  (mongoose.models['User'] as mongoose.Model<UserMongoDoc> | undefined) ??
  model<UserMongoDoc>('User', UserSchema);

export function toUser(doc: (UserMongoDoc & { id?: string }) | null): User | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    isActive: doc.isActive ?? true,
    disableReason: doc.disableReason ?? '',
    email: doc.email ?? '',
    avatar: doc.avatar ?? '',
    name: doc.name ?? '',
    username: doc.username ?? '',
    age: doc.age ?? 0,
    dob: doc.dob ?? '',
  } as User;
}
