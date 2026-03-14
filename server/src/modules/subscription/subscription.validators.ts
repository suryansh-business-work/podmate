import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  podId: z.string().min(1, 'Pod ID is required'),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
});

export const renewSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
});
