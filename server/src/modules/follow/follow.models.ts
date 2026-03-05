import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export interface PaginatedFollows {
  items: Follow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Mongoose ── */

export type FollowMongoDoc = Omit<Follow, 'id'> & { _id: string };

const FollowSchema = new Schema<FollowMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    followerId: { type: String, required: true, index: true },
    followingId: { type: String, required: true, index: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const FollowModel =
  (mongoose.models['Follow'] as mongoose.Model<FollowMongoDoc> | undefined) ??
  model<FollowMongoDoc>('Follow', FollowSchema);

export function toFollow(doc: FollowMongoDoc & { id?: string }): Follow {
  return {
    id: doc.id ?? doc._id,
    followerId: doc.followerId,
    followingId: doc.followingId,
    createdAt: doc.createdAt,
  };
}
