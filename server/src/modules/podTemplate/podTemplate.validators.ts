import { z } from 'zod';

const CATEGORIES = ['Social', 'Learning', 'Outdoor'];

export const createPodTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  imageUrl: z.string().url().optional().or(z.literal('')),
  defaultTitle: z.string().max(200).optional(),
  defaultDescription: z.string().max(2000).optional(),
  defaultFee: z.number().min(0).optional(),
  defaultMaxSeats: z.number().int().min(1).optional(),
  defaultRefundPolicy: z.string().max(500).optional(),
  sortOrder: z.number().int().optional(),
});

export function validateCreatePodTemplate(input: unknown): string | null {
  const result = createPodTemplateSchema.safeParse(input);
  if (!result.success) return result.error.issues[0].message;
  return null;
}

export const updatePodTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.enum(CATEGORIES as [string, ...string[]]).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  defaultTitle: z.string().max(200).optional(),
  defaultDescription: z.string().max(2000).optional(),
  defaultFee: z.number().min(0).optional(),
  defaultMaxSeats: z.number().int().min(1).optional(),
  defaultRefundPolicy: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export function validateUpdatePodTemplate(input: unknown): string | null {
  const result = updatePodTemplateSchema.safeParse(input);
  if (!result.success) return result.error.issues[0].message;
  return null;
}
