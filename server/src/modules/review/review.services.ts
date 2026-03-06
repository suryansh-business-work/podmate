import { v4 as uuidv4 } from 'uuid';
import { ReviewModel, toReview } from './review.models';
import type {
  Review,
  PaginatedReviews,
  CreateReviewInput,
  ReviewTargetType,
} from './review.models';
import { PodModel } from '../pod/pod.models';
import logger from '../../lib/logger';

export async function createReview(userId: string, input: CreateReviewInput): Promise<Review> {
  const existing = await ReviewModel.findOne({
    targetType: input.targetType,
    targetId: input.targetId,
    userId,
    parentId: '',
  }).lean();
  if (existing) {
    throw new Error('You have already reviewed this item');
  }

  const now = new Date().toISOString();
  const doc = await ReviewModel.create({
    _id: uuidv4(),
    targetType: input.targetType,
    targetId: input.targetId,
    userId,
    rating: input.rating,
    comment: input.comment,
    parentId: '',
    createdAt: now,
    updatedAt: now,
  });

  await updateTargetStats(input.targetType, input.targetId);
  logger.info(`Review created for ${input.targetType} ${input.targetId} by user ${userId}`);
  return toReview(doc.toObject({ virtuals: true }));
}

export async function replyToReview(
  userId: string,
  reviewId: string,
  comment: string,
): Promise<Review> {
  const parent = await ReviewModel.findById(reviewId).lean();
  if (!parent) throw new Error('Review not found');

  const now = new Date().toISOString();
  const doc = await ReviewModel.create({
    _id: uuidv4(),
    targetType: parent.targetType,
    targetId: parent.targetId,
    userId,
    rating: 0,
    comment,
    parentId: reviewId,
    createdAt: now,
    updatedAt: now,
  });

  logger.info(`Reply to review ${reviewId} by user ${userId}`);
  return toReview(doc.toObject({ virtuals: true }));
}

export async function reportReview(
  userId: string,
  reviewId: string,
  reason: string,
): Promise<Review> {
  const doc = await ReviewModel.findByIdAndUpdate(
    reviewId,
    { $set: { isReported: true, reportReason: reason, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  );
  if (!doc) throw new Error('Review not found');
  logger.info(`Review ${reviewId} reported by user ${userId}: ${reason}`);
  return toReview(doc.toObject({ virtuals: true }));
}

export async function getReviewsForTarget(
  targetType: ReviewTargetType,
  targetId: string,
  page: number,
  limit: number,
): Promise<PaginatedReviews> {
  const filter = { targetType, targetId, parentId: '' };
  const total = await ReviewModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await ReviewModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map((d) => toReview(d as never)),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getReplies(parentId: string): Promise<Review[]> {
  const docs = await ReviewModel.find({ parentId }).sort({ createdAt: 1 }).lean({ virtuals: true });
  return docs.map((d) => toReview(d as never));
}

export async function getReviewStats(
  targetType: ReviewTargetType,
  targetId: string,
): Promise<{ averageRating: number; totalReviews: number; distribution: number[] }> {
  const reviews = await ReviewModel.find({ targetType, targetId, parentId: '' })
    .select('rating')
    .lean();

  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    return { averageRating: 0, totalReviews: 0, distribution: [0, 0, 0, 0, 0] };
  }

  const distribution = [0, 0, 0, 0, 0];
  let sum = 0;
  for (const r of reviews) {
    const raw = r as unknown as Record<string, unknown>;
    const rating = raw.rating as number;
    sum += rating;
    if (rating >= 1 && rating <= 5) {
      distribution[rating - 1]++;
    }
  }

  return {
    averageRating: Math.round((sum / totalReviews) * 10) / 10,
    totalReviews,
    distribution,
  };
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const review = await ReviewModel.findById(reviewId).lean();
  if (!review) return false;

  // Delete replies too
  await ReviewModel.deleteMany({ parentId: reviewId });
  await ReviewModel.deleteOne({ _id: reviewId });

  if (review.parentId === '') {
    await updateTargetStats(review.targetType, review.targetId);
  }
  return true;
}

async function updateTargetStats(targetType: ReviewTargetType, targetId: string): Promise<void> {
  const stats = await getReviewStats(targetType, targetId);

  if (targetType === 'POD') {
    await PodModel.findByIdAndUpdate(targetId, {
      $set: { rating: stats.averageRating, reviewCount: stats.totalReviews },
    });
  }
  // Place rating update can be added when model supports it
}
