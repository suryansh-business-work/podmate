import { z } from 'zod';

export const startLiveSchema = z.object({
  podId: z.string().min(1, 'Pod ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(1000).optional(),
});
