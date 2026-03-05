import { z } from 'zod';

export const createFeedbackSchema = z.object({
  type: z.enum(['BUG', 'FEATURE', 'GENERAL']),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be at most 2000 characters'),
});
