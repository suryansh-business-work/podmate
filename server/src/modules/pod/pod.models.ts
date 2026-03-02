import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Pod {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  mediaUrls: string[];
  hostId: string;
  feePerPerson: number;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  location: string;
  locationDetail: string;
  rating: number;
  reviewCount: number;
  status: PodStatus;
  closeReason: string;
  viewCount: number;
  refundPolicy: string;
  attendeeIds: string[];
  createdAt: string;
}

export type PodStatus = 'NEW' | 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'OPEN' | 'CLOSED';

export interface CreatePodInput {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  mediaUrls?: string[];
  feePerPerson: number;
  maxSeats: number;
  dateTime: string;
  location: string;
  locationDetail: string;
  refundPolicy?: string;
}

export interface UpdatePodInput {
  title?: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  mediaUrls?: string[];
  feePerPerson?: number;
  maxSeats?: number;
  dateTime?: string;
  location?: string;
  locationDetail?: string;
  status?: PodStatus;
  closeReason?: string;
}

export interface PodPaginationInput {
  page: number;
  limit: number;
  category?: string;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedPods {
  items: Pod[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Mongoose ── */

export type PodMongoDoc = Omit<Pod, 'id'> & { _id: string };

const PodSchema = new Schema<PodMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    mediaUrls: { type: [String], default: [] },
    hostId: { type: String, required: true },
    feePerPerson: { type: Number, default: 0 },
    maxSeats: { type: Number, default: 1 },
    currentSeats: { type: Number, default: 0 },
    dateTime: { type: String, required: true },
    location: { type: String, default: '' },
    locationDetail: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    status: { type: String, enum: ['NEW', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'OPEN', 'CLOSED'], default: 'NEW' },
    closeReason: { type: String, default: '' },
    viewCount: { type: Number, default: 0 },
    refundPolicy: { type: String, default: '24h Refund' },
    attendeeIds: { type: [String], default: [] },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const PodModel =
  (mongoose.models['Pod'] as mongoose.Model<PodMongoDoc> | undefined) ??
  model<PodMongoDoc>('Pod', PodSchema);

export function toPod(doc: (PodMongoDoc & { id?: string }) | null): Pod | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    mediaUrls: doc.mediaUrls ?? [],
    attendeeIds: doc.attendeeIds ?? [],
    imageUrl: doc.imageUrl ?? '',
    status: doc.status ?? 'NEW',
    closeReason: doc.closeReason ?? '',
    viewCount: doc.viewCount ?? 0,
    refundPolicy: doc.refundPolicy ?? '24h Refund',
  } as Pod;
}
