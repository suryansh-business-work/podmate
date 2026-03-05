import { z } from 'zod';

export const createPodIdeaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be at most 2000 characters'),
  category: z.string().min(1, 'Category is required').max(100),
  location: z.string().max(200).optional(),
  estimatedBudget: z.string().max(100).optional(),
});
