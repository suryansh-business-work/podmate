import { z } from 'zod';

export const createPlaceSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(2000),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  imageUrl: z.string().optional(),
  mediaUrls: z.array(z.string()).optional(),
  category: z.string().min(1).max(50),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updatePlaceSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  address: z.string().min(5).max(500).optional(),
  city: z.string().min(2).max(100).optional(),
  imageUrl: z.string().optional(),
  category: z.string().min(1).max(50).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});
