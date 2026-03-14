import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Moment {
  id: string;
  userId: string;
  caption: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface MomentComment {
  id: string;
  momentId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface MomentLike {
  id: string;
  momentId: string;
  userId: string;
  createdAt: string;
}

export interface CreateMomentInput {
  caption: string;
  mediaUrls: string[];
}

export interface PaginatedMoments {
  items: Moment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Mongoose Schemas ── */

export type MomentMongoDoc = Omit<Moment, 'id'> & { _id: string };
export type MomentCommentMongoDoc = Omit<MomentComment, 'id'> & { _id: string };
export type MomentLikeMongoDoc = Omit<MomentLike, 'id'> & { _id: string };

const MomentSchema = new Schema<MomentMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    caption: { type: String, default: '' },
    mediaUrls: { type: [String], default: [] },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const MomentCommentSchema = new Schema<MomentCommentMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    momentId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

const MomentLikeSchema = new Schema<MomentLikeMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    momentId: { type: String, required: true, index: true },
    userId: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
MomentLikeSchema.index({ momentId: 1, userId: 1 }, { unique: true });

export const MomentModel =
  (mongoose.models['Moment'] as mongoose.Model<MomentMongoDoc> | undefined) ??
  model<MomentMongoDoc>('Moment', MomentSchema);

export const MomentCommentModel =
  (mongoose.models['MomentComment'] as mongoose.Model<MomentCommentMongoDoc> | undefined) ??
  model<MomentCommentMongoDoc>('MomentComment', MomentCommentSchema);

export const MomentLikeModel =
  (mongoose.models['MomentLike'] as mongoose.Model<MomentLikeMongoDoc> | undefined) ??
  model<MomentLikeMongoDoc>('MomentLike', MomentLikeSchema);

export function toMoment(doc: (MomentMongoDoc & { id?: string }) | null): Moment | null {
  if (!doc) return null;
  return {
    id: doc.id ?? doc._id,
    userId: doc.userId,
    caption: doc.caption ?? '',
    mediaUrls: doc.mediaUrls ?? [],
    likeCount: doc.likeCount ?? 0,
    commentCount: doc.commentCount ?? 0,
    isActive: doc.isActive ?? true,
    createdAt: doc.createdAt,
  };
}

export function toMomentComment(
  doc: (MomentCommentMongoDoc & { id?: string }) | null,
): MomentComment | null {
  if (!doc) return null;
  return {
    id: doc.id ?? doc._id,
    momentId: doc.momentId,
    userId: doc.userId,
    content: doc.content,
    createdAt: doc.createdAt,
  };
}
