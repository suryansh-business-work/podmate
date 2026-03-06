import { z } from 'zod';

export const createReviewSchema = z.object({
  targetType: z.enum(['POD', 'PLACE']),
  targetId: z.string().min(1, 'Target ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(1000, 'Comment must be at most 1000 characters'),
});

export const replyReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  comment: z.string().min(1, 'Reply is required').max(500, 'Reply must be at most 500 characters'),
});

export const reportReviewSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be at most 500 characters'),
});
