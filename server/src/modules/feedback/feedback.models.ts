import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type FeedbackType = 'BUG' | 'FEATURE' | 'GENERAL';
export type FeedbackStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED';

export interface Feedback {
  id: string;
  userId: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedFeedback {
  items: Feedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateFeedbackInput {
  type: FeedbackType;
  title: string;
  description: string;
}

/* ── Mongoose ── */

export type FeedbackMongoDoc = Omit<Feedback, 'id'> & { _id: string };

const FeedbackSchema = new Schema<FeedbackMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['BUG', 'FEATURE', 'GENERAL'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'REVIEWED', 'RESOLVED'], default: 'PENDING' },
    adminNotes: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const FeedbackModel =
  (mongoose.models['Feedback'] as mongoose.Model<FeedbackMongoDoc> | undefined) ??
  model<FeedbackMongoDoc>('Feedback', FeedbackSchema);

export function toFeedback(doc: FeedbackMongoDoc & { id?: string }): Feedback {
  return {
    id: doc.id ?? doc._id,
    userId: doc.userId,
    type: doc.type,
    title: doc.title,
    description: doc.description,
    status: doc.status,
    adminNotes: doc.adminNotes ?? '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
