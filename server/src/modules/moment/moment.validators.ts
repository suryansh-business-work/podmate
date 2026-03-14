import { z } from 'zod';

export const createMomentSchema = z.object({
  caption: z.string().min(1, 'Caption is required').max(500, 'Caption too long'),
  mediaUrls: z.array(z.string().url()).min(1, 'At least one image is required'),
});

export function validateCreateMoment(input: unknown): z.infer<typeof createMomentSchema> {
  return createMomentSchema.parse(input);
}

export const addMomentCommentSchema = z.object({
  momentId: z.string().min(1),
  content: z.string().min(1, 'Comment is required').max(500, 'Comment too long'),
});

export function validateAddMomentComment(
  input: unknown,
): z.infer<typeof addMomentCommentSchema> {
  return addMomentCommentSchema.parse(input);
}
