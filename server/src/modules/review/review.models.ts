import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type ReviewTargetType = 'POD' | 'PLACE';

export interface Review {
  id: string;
  targetType: ReviewTargetType;
  targetId: string;
  userId: string;
  rating: number;
  comment: string;
  parentId: string;
  isReported: boolean;
  reportReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReviews {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateReviewInput {
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
}

export interface ReplyReviewInput {
  reviewId: string;
  comment: string;
}

export interface ReportReviewInput {
  reviewId: string;
  reason: string;
}

/* ── Mongoose ── */

export type ReviewMongoDoc = Omit<Review, 'id'> & { _id: string };

const ReviewSchema = new Schema<ReviewMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    targetType: { type: String, enum: ['POD', 'PLACE'], required: true },
    targetId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    parentId: { type: String, default: '' },
    isReported: { type: Boolean, default: false },
    reportReason: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

ReviewSchema.index({ targetType: 1, targetId: 1 });

export const ReviewModel =
  (mongoose.models['Review'] as mongoose.Model<ReviewMongoDoc> | undefined) ??
  model<ReviewMongoDoc>('Review', ReviewSchema);

export function toReview(doc: ReviewMongoDoc & { id?: string }): Review {
  return {
    id: doc.id ?? doc._id,
    targetType: doc.targetType,
    targetId: doc.targetId,
    userId: doc.userId,
    rating: doc.rating,
    comment: doc.comment ?? '',
    parentId: doc.parentId ?? '',
    isReported: doc.isReported ?? false,
    reportReason: doc.reportReason ?? '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
