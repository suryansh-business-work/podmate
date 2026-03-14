import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export enum PlaceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl: string;
  mediaUrls: string[];
  ownerId: string;
  category: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  status: PlaceStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlaceInput {
  name: string;
  description: string;
  address: string;
  city: string;
  imageUrl?: string;
  mediaUrls?: string[];
  category: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdatePlaceInput {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  imageUrl?: string;
  mediaUrls?: string[];
  category?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

export interface PlacePaginationInput {
  page: number;
  limit: number;
  search?: string;
  status?: PlaceStatus;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/* ── Mongoose ── */

export type PlaceMongoDoc = Omit<Place, 'id'> & { _id: string };

const PlaceSchema = new Schema<PlaceMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    address: { type: String, required: true },
    city: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    mediaUrls: { type: [String], default: [] },
    ownerId: { type: String, required: true },
    category: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    status: { type: String, enum: Object.values(PlaceStatus), default: PlaceStatus.PENDING },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const PlaceModel =
  (mongoose.models['Place'] as mongoose.Model<PlaceMongoDoc> | undefined) ??
  model<PlaceMongoDoc>('Place', PlaceSchema);

export function toPlace(doc: (PlaceMongoDoc & { id?: string }) | null): Place | null {
  if (!doc) return null;
  return {
    ...doc,
    id: doc.id ?? doc._id,
    description: doc.description ?? '',
    imageUrl: doc.imageUrl ?? '',
    phone: doc.phone ?? '',
    email: doc.email ?? '',
    mediaUrls: doc.mediaUrls ?? [],
  } as Place;
}
