import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type PodIdeaStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PodIdea {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  estimatedBudget: string;
  status: PodIdeaStatus;
  adminNotes: string;
  upvoteCount: number;
  upvoterIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPodIdeas {
  items: PodIdea[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatePodIdeaInput {
  title: string;
  description: string;
  category: string;
  location?: string;
  estimatedBudget?: string;
}

/* ── Mongoose ── */

export type PodIdeaMongoDoc = Omit<PodIdea, 'id'> & { _id: string };

const PodIdeaSchema = new Schema<PodIdeaMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, default: '' },
    estimatedBudget: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    adminNotes: { type: String, default: '' },
    upvoteCount: { type: Number, default: 0 },
    upvoterIds: { type: [String], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const PodIdeaModel =
  (mongoose.models['PodIdea'] as mongoose.Model<PodIdeaMongoDoc> | undefined) ??
  model<PodIdeaMongoDoc>('PodIdea', PodIdeaSchema);

export function toPodIdea(doc: PodIdeaMongoDoc & { id?: string }): PodIdea {
  return {
    id: doc.id ?? doc._id,
    userId: doc.userId,
    title: doc.title,
    description: doc.description,
    category: doc.category,
    location: doc.location ?? '',
    estimatedBudget: doc.estimatedBudget ?? '',
    status: doc.status,
    adminNotes: doc.adminNotes ?? '',
    upvoteCount: doc.upvoteCount ?? 0,
    upvoterIds: doc.upvoterIds ?? [],
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
