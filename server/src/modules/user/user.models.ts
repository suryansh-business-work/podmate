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
  name: string;
  age: number;
  avatar: string;
  role: UserRole;
  isVerifiedHost: boolean;
  createdAt: string;
}

export interface CreateUserInput {
  phone: string;
  role?: UserRole;
  email?: string;
  password?: string;
  name?: string;
  age?: number;
  avatar?: string;
}

export interface UpdateUserInput {
  name?: string;
  avatar?: string;
  age?: number;
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
    name: { type: String, default: '' },
    age: { type: Number, default: 0 },
    avatar: { type: String, default: '' },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    isVerifiedHost: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const UserModel =
  (mongoose.models['User'] as mongoose.Model<UserMongoDoc> | undefined) ??
  model<UserMongoDoc>('User', UserSchema);

export function toUser(doc: (UserMongoDoc & { id?: string }) | null): User | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as User;
}
