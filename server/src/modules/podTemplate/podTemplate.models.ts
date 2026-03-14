import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface PodTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultFee: number;
  defaultMaxSeats: number;
  defaultRefundPolicy: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CreatePodTemplateInput {
  name: string;
  description: string;
  category: string;
  imageUrl?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultFee?: number;
  defaultMaxSeats?: number;
  defaultRefundPolicy?: string;
  sortOrder?: number;
}

export interface UpdatePodTemplateInput {
  name?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  defaultFee?: number;
  defaultMaxSeats?: number;
  defaultRefundPolicy?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PaginatedPodTemplates {
  items: PodTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Mongoose ── */

export type PodTemplateMongoDoc = Omit<PodTemplate, 'id'> & { _id: string };

const PodTemplateSchema = new Schema<PodTemplateMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    defaultTitle: { type: String, default: '' },
    defaultDescription: { type: String, default: '' },
    defaultFee: { type: Number, default: 0 },
    defaultMaxSeats: { type: Number, default: 10 },
    defaultRefundPolicy: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const PodTemplateModel =
  (mongoose.models['PodTemplate'] as mongoose.Model<PodTemplateMongoDoc> | undefined) ??
  model<PodTemplateMongoDoc>('PodTemplate', PodTemplateSchema);

export function toPodTemplate(
  doc: (PodTemplateMongoDoc & { id?: string }) | null,
): PodTemplate | null {
  if (!doc) return null;
  return {
    id: doc.id ?? doc._id,
    name: doc.name,
    description: doc.description ?? '',
    category: doc.category,
    imageUrl: doc.imageUrl ?? '',
    defaultTitle: doc.defaultTitle ?? '',
    defaultDescription: doc.defaultDescription ?? '',
    defaultFee: doc.defaultFee ?? 0,
    defaultMaxSeats: doc.defaultMaxSeats ?? 10,
    defaultRefundPolicy: doc.defaultRefundPolicy ?? '',
    isActive: doc.isActive ?? true,
    sortOrder: doc.sortOrder ?? 0,
    createdAt: doc.createdAt,
  };
}
