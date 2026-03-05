import { z } from 'zod';

export const upsertGlobalFeeSchema = z.object({
  globalFeePercent: z.number().min(2, 'Min 2%').max(15, 'Max 15%'),
});

export const upsertOverrideSchema = z.object({
  id: z.string().optional(),
  pincode: z
    .string()
    .min(4, 'Pincode must be at least 4 characters')
    .max(10, 'Pincode must be at most 10 characters'),
  feePercent: z.number().min(2, 'Min 2%').max(15, 'Max 15%'),
  label: z.string().max(100).optional(),
});
