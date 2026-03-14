import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Slider {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  category: string;
  locationCity: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSliderInput {
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  ctaLink?: string;
  category?: string;
  locationCity?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateSliderInput {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  category?: string;
  locationCity?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface PaginatedSliders {
  items: Slider[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type SliderMongoDoc = Omit<Slider, 'id'> & { _id: string };

const SliderSchema = new Schema<SliderMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    ctaText: { type: String, default: '' },
    ctaLink: { type: String, default: '' },
    category: { type: String, default: '' },
    locationCity: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const SliderModel =
  (mongoose.models['Slider'] as mongoose.Model<SliderMongoDoc> | undefined) ??
  model<SliderMongoDoc>('Slider', SliderSchema);

export function toSlider(doc: (SliderMongoDoc & { id?: string }) | null): Slider | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    subtitle: doc.subtitle ?? '',
    ctaText: doc.ctaText ?? '',
    ctaLink: doc.ctaLink ?? '',
    category: doc.category ?? '',
    locationCity: doc.locationCity ?? '',
  } as Slider;
}
